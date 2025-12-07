import React, { useRef, useState,useEffect} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity,Animated, PanResponder ,Dimensions} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { useRouter } from 'expo-router';
import { FlatList, ScrollView } from 'react-native';
import pants from '../assets/LEPANTS.png';
import shirt from '../assets/LESHIRT.png';
import { createContext } from "react";
import { supabase } from '../database/supabase';
import { useLocalSearchParams } from 'expo-router';
import { TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


// import { center } from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');


const router = useRouter();
const photos = [{id:1,source:pants},{id:2,source:shirt},{id:3,source:pluslogo},{id:4,source:calendarlogo},{id:5,source:pluslogo}]

function DraggableThumb({source, onDropTop }) {
  
  
    const pan = useRef(new Animated.ValueXY()).current;
  
    const responder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pan.setOffset({ x: pan.x.__getValue(), y: pan.y.__getValue() });
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_e, gesture) => {
          pan.flattenOffset();
  
          // ask parent if we dropped inside the first rectangle
          const accepted = onDropTop?.(source, gesture);
  
          // Always snap back to original place (simple)
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        },
      })
    ).current;
  
    return (
        
      <Animated.View style={[styles.thumbWrap, { transform: pan.getTranslateTransform() }]} {...responder.panHandlers}>
        <Image source={source} style={styles.thumb} />
      </Animated.View>
    );
  }




function Sections({ onDropTop,section }) {
  const [userImg, setUserImg] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const { section: sectionFromRoute } = useLocalSearchParams();
  const [showOne, setshowOne] = useState(false);
  const [clicked ,setClicked] = useState('');
  const activeSection = section ?? sectionFromRoute;
  const [newName, setNewName] = useState("");

  const addfav = async()=>{
    const {data: userData, error: usererror} = await supabase.auth.getUser();
    const {data: closetData,error: closetError} = await supabase.from("Closet").select("*").eq("userid", userData.user.id).single()
    const { error: favError } = await supabase
    .from("Favorites")
    .insert([
      {
        link: clicked.link,
        name: clicked.name,
        closetid: closetData.id,
      }
    ]);




  }
  const handleDelete = async () => {
    try {
      const fileName = clicked.link.split("/").pop(); // extract filename
      
      // 1. Delete from storage
      const { error: storageError } = await supabase
        .storage
        .from(activeSection)
        .remove([`${clicked.name}/${fileName}`]);
  
      if (storageError) {
        console.log("Storage delete error:", storageError);
      }
  
      // 2. Delete from database
      const { error: dbError } = await supabase
        .from(activeSection)
        .delete()
        .eq("link", clicked.link);
  
      if (dbError) {
        alert("Failed to delete item.");
        return;
      }
  
      alert("Deleted successfully.");
      setshowOne(false);
      // refresh grid
      setUserImg(prev => prev.filter(item => item.link !== clicked.link));
  
    } catch (e) {
      console.log("Delete error:", e);
    }
  };
  const handleEdit = async () => {
    try {
      // 1. Pick + crop new image
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });
  
      if (result.canceled) return;
  
      const newImg = result.assets[0];
  
      // 2. Convert to base64
      const base64 = await FileSystem.readAsStringAsync(newImg.uri, {
        encoding: "base64",
      });
  
      // Create NEW file path
      const finalName = newName?.length > 0 ? newName : clicked.name;
      const newFilePath = `${finalName}/${Date.now()}.jpg`;
  
      // 3. Upload new image
      const { error: uploadError } = await supabase.storage
        .from(activeSection)
        .upload(newFilePath, decode(base64), { contentType: "image/jpeg" });
  
      if (uploadError) {
        alert("Failed to upload.");
        return;
      }
  
      // 4. Get new public URL
      const { data: publicData } = supabase.storage
        .from(activeSection)
        .getPublicUrl(newFilePath);
  
      const newUrl = publicData.publicUrl;
  
      // 5. Delete OLD storage file
      const oldFileName = clicked.link.split("/").pop();
      const oldFolderName = clicked.name;
      await supabase.storage
        .from(activeSection)
        .remove([`${oldFolderName}/${oldFileName}`]);
  
      // 6. Update database row
      const { error: updateError } = await supabase
        .from(activeSection)
        .update({
          link: newUrl,
          name: finalName,
        })
        .eq("link", clicked.link);
  
      if (updateError) {
        alert("Failed to update.");
        return;
      }
  
      alert("Updated successfully!");
  
      // 7. Update UI
      setClicked({
        link: newUrl,
        name: finalName,
      });
  
      setUserImg(prev =>
        prev.map(item =>
          item.link === clicked.link
            ? { ...item, link: newUrl, name: finalName }
            : item
        )
      );
  
    } catch (err) {
      console.log("Edit error:", err);
    }
  };
  
  
  const renderSliderItem = ({ item, index }) => (
    <TouchableOpacity 
      onPress={() => setSelectedImage(item.link)}
      style={[
        styles.sliderItem,
        selectedImage === item.link && styles.sliderItemSelected
      ]}
    >
      <Image
        source={{ uri: item.link }}
        style={styles.sliderImage}
      />
    </TouchableOpacity>
  );

  React.useEffect(() => {
    const fetchImgs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: userCloset } = await supabase
        .from('Closet')
        .select('id')
        .eq('userid', user.id)
        .single();

      const { data: imgs, error } = await supabase
        .from(activeSection)
        .select('link , name')
        .eq('closetid', userCloset.id);

      

      if (error) console.error(error);
      else setUserImg(imgs);
    };

    fetchImgs();
  }, []);
    
    return (
      <>
      {onDropTop ? (
        <View style={{ top: 540, flexDirection: "row", justifyContent: "space-around", gap: 5 }}>
          {userImg?.map((p, index) => (
            <DraggableThumb key={index} source={{ uri: p.link }} onDropTop={onDropTop} />
          ))}
        </View>
      ) : (
        <LinearGradient
        colors={['#2A003F', '#1A0029', '#0D0014']} 
        locations={[0.1, 0.5, 1]}
        start={{ x: 0.8, y: 0 }}
          end={{ x: 1, y: 1 }}
        style={styles.container}>
      {/* Full screen view */}
      <View style={styles.container}>
      <Text style={styles.title}>Klozet</Text>
      <Text style={{position:"absolute",alignSelf:"center",fontSize: 25, top:103,          
      fontWeight: 'medium',
      color: 'white'}}>Tops</Text>

      {/* Top Nav view */}
      <View style={{position: 'absolute',
  left: 10,
  right: 10,
  top: 15,flexDirection:"column" }}>
    
     {/* Fits */}
          <TouchableOpacity onPress={()=>router.push('/Fits')}>
        <Text style={styles.fits}>Outfits</Text>
        </TouchableOpacity>
         
         {/* Favorites */}
         <TouchableOpacity onPress={()=>router.push('/Favorites')}>
        <Image source={heartlogo} style={styles.favorites}/>
        <Text style={{position:"absolute",right:1,fontSize: 14, top:63,          
      fontWeight: 'medium',
      color: 'white'}}>Favorites</Text>
      </TouchableOpacity>
        </View>
        
        {/* Top Border */}
        <View style={{borderBottomColor:"grey",borderBottomWidth:1, marginVertical: 15}}></View>

          {/* Tops images Grid */}
      {!(showOne)? (
        <ScrollView style={{
         
        marginBottom: 120  
      }} contentContainerStyle={{ flexGrow:1 ,flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",  paddingHorizontal: 20 , paddingVertical:20, paddingBottom: 250}} showsVerticalScrollIndicator={false} >
          {userImg?.map((photo, i) => (
            <TouchableOpacity key={i} onPress={() => { setClicked({
              link: photo.link,
              name: photo.name
            } ); setshowOne(true); }}>
              <Image
                source={{ uri: photo.link }}
                style={{
                  width: 200,
                  height:200,
                  marginBottom:12,
                  aspectRatio: 1,
                  borderWidth: 1,
                  borderColor: "black",
                }}
              />
            </TouchableOpacity>

          ))}
        </ScrollView>
 ):(
  <View style={{ paddingTop: 20, paddingBottom: 40, alignItems: "center", justifyContent: "center" }}>
    <Text style={{ color:"white", fontSize:18, marginBottom:10 }}>
  {clicked.name}
</Text>

    <Image
      source={{ uri: clicked.link }}
      style={{
        width: width - 40,
        height: width - 40,
        borderRadius: 12,
        alignSelf: "center",
      }}
      resizeMode="contain"
    />
<View style={{flexDirection: "row", justifyContent:"space-around", marginTop:20, gap: 10}}>
  <TouchableOpacity onPress={() => setshowOne(false)}>
      <View style={styles.plusSectionButtons}>
      <Text style={{ color: "white", textAlign: "center" }}>
        Back
      </Text>
      </View>
    </TouchableOpacity>

    <TouchableOpacity onPress={handleEdit}>
  <View style={styles.plusSectionButtons}>
    <Text style={{ color:"white" }}>Edit</Text>
  </View>
</TouchableOpacity>

<TouchableOpacity onPress={()=>addfav(clicked)}>
  <View style={styles.plusSectionButtons}>
    <Text style={{ color:"white" }}>Favorite</Text>
  </View>
</TouchableOpacity>



    <TouchableOpacity onPress={() =>{handleDelete(); setshowOne(false);}}>
      <View style={styles.plusSectionButtons}>
      <Text style={{ color: "white", textAlign: "center" }}>
        Delete
      </Text>
      </View>
    </TouchableOpacity>
  </View> 
  
  <TextInput
  placeholder="Rename..."
  placeholderTextColor="white"
  style={{
    width: 200,
    backgroundColor: "#0004",
    color: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  }}
  onChangeText={setNewName}
/>

  </View>)
  


        }
          {/* Bottom Border */}
        {/* <View style={{borderBottomColor:"grey",borderBottomWidth:1,marginVertical:670}}></View> */}

{/* Bottom Nav view */}
<View style={{position: 'absolute',
paddingTop:20,
paddingBottom:50,
left: 10,
right: 10,
top:880,
height:150,
flexDirection:"column", color:"white"}}>
 
 {/* Calendar */}
 <TouchableOpacity onPress={()=>router.push('/Calendar')}>
<Image source={calendarlogo} style={styles.calendar}/>
<Text style={{position:"absolute",left:1,fontSize: 14, top:38,          
fontWeight: 'medium', color: 'white'}}>Calendar</Text>
</TouchableOpacity>

{/* Add */}
<TouchableOpacity onPress={()=>router.push('/Add')}>
<Image source={pluslogo} style={styles.plus}/>
</TouchableOpacity>

{/* Style */} 
<TouchableOpacity onPress={()=>router.push('/Style')}>
<Text style={{position:"absolute",right:12,fontSize: 14, top:32,          
fontWeight: 'medium',
color: 'white'}}>Style</Text>
<Image source={stlyelogo} style={styles.style}/>
</TouchableOpacity>
</View>
        </View>
        </LinearGradient>
      )}
      
      </>

);


}

export default Sections;

const styles = StyleSheet.create({container:{flex:1},
    thumbWrap: {
      width: 90,
      height: 90,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 6,
    },
    thumb: { width: 70, height: 70, borderRadius: 8 },

    
      title: {fontSize: 30,          
        fontWeight: 'bold',
        color: 'white',
        marginTop: 50,
        alignSelf: "center",},
      
      favorites:{height:30, width:35 ,position:"absolute",right:13,top:35},
      style:{height:40, width:40 ,position:"absolute",right:10},
      calendar:{height:40, width:40,position:"absolute", left:10, top:0},
      plus:{height:40, width:40 ,position:"absolute", alignSelf: "center"},
      fits:{position:"absolute",left:7,fontSize: 18, top:55,          
        fontWeight: 'medium',
        color: 'white',},
        scrollContainer: {
          position: 'absolute',
          top: 540,
          left: 0,
          right: 0,
          height: 110,
          
        },
        scrollContent: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          gap: 5,
        },
        plusSectionButtons:{height:35, backgroundColor:"black", width:75,justifyContent:"center",alignItems:"center", borderRadius:10, borderColor:"grey",borderWidth:1}

  
  })
  ;
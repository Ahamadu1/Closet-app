import React, { useRef, useState,useEffect} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity,Animated, PanResponder } from 'react-native'
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




function Tops({ onDropTop }) {
  const [userImg, setUserImg] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [clicked ,setClicked] = useState('');


  React.useEffect(() => {
    const fetchImgs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userCloset } = await supabase
        .from('Closet')
        .select('id')
        .eq('userid', user.id)
        .single();

      const { data: imgs, error } = await supabase
        .from('Tops')
        .select('link')
        .eq('closetid', userCloset.id);

      if (error) console.error(error);
      else setUserImg(imgs);
    };

    fetchImgs();
  }, []);
    
    return (
      <>

      {onDropTop ? (

        <ScrollView 
  horizontal 
  showsHorizontalScrollIndicator={true}
  style={styles.scrollContainer}
  contentContainerStyle={styles.scrollContent}
  indicatorStyle="default"
>
          {userImg?.map((p, index) => (
            <DraggableThumb key={index} source={{ uri: p.link }} onDropTop={onDropTop} />
          ))}
        </ScrollView>
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
        <View style={{borderBottomColor:"grey",borderBottomWidth:1, marginVertical: 15, flex: 1,}}></View>

          {/* Tops images Grid */}
        <ScrollView style={{
         
        marginBottom: 120  
      }} contentContainerStyle={{ flexGrow:1 ,flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",  paddingHorizontal: 20 , paddingVertical:20, paddingBottom: 250}} showsVerticalScrollIndicator={false} >
          {userImg?.map((photo, i) => (
            <TouchableOpacity key={i} onPress={() => { setClicked({ uri: photo.link }); setshowOne(true); }}>
              <Image
                source={{ uri: photo.link }}
                style={{
                  width: 200,
                  height:200,
                  marginBottom:12,
                  aspectRatio: 1,
                  borderWidth: 1,
                  height: 200,
                  borderColor: "black",
                }}
              />
            </TouchableOpacity>

          ))}
        </ScrollView>



          {/* Bottom Border */}
        {/* <View style={{borderBottomColor:"grey",borderBottomWidth:1,marginVertical:670}}></View> */}

{/* Bottom Nav view */}
<View style={{position: 'absolute',
paddingTop:20,
paddingBottom:50,
left: 10,
right: 10,
top:880,
backgroundColor: '#0D0014',
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

export default Tops;

const styles = StyleSheet.create({
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
  
  })
  ;
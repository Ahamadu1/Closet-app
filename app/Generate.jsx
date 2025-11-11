import { StyleSheet, Text, View, Image, TouchableOpacity,TextInput } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { useRouter,useLocalSearchParams } from 'expo-router';
import { Alert, Platform } from 'react-native';
import React, {useState,useEffect} from 'react';
import ViewShot from "react-native-view-shot";
import { useRef } from 'react';
import { supabase } from '../database/supabase';
import * as FileSystem from 'expo-file-system/legacy'







const Generate = () => {
  const viewRef = useRef();
  const router = useRouter();
  const {topImg, bottomImg, shoeImg, otherImg} = useLocalSearchParams();
  const [processedTopImg, setProcessedTopImg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savefit, setsavefit] = useState('');
  const [next,setNext] = useState(false);
  const [loaded, setLoaded] = useState({
    top: false,
    bottom: false,
    shoe: false,
    other: false
  });
  
  const allImagesLoaded = Object.values(loaded).every(v => v);
  
 

async function uploadImage(localUri, userId) {
  const fileExt = localUri.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const fileType = 'image/jpeg'

  // Convert file to base64
  const base64 = await FileSystem.readAsStringAsync(localUri, { encoding: 'base64' })
  const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0))

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('outfits')
    .upload(fileName, arrayBuffer, {
      contentType: fileType,
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  // Get public URL
  const { data: publicData } = supabase.storage
    .from('outfits')
    .getPublicUrl(fileName)

  return publicData.publicUrl
}

  const capture = async()=>{
    if (!allImagesLoaded) {
      console.log("Waiting for images to load...");
      return;
    }
    try{
    await new Promise(r => setTimeout(r, 200));
    console.log("gere")
    const capturedUri = await viewRef.current.capture();
    setsavefit(capturedUri)
    console.log("gere",savefit)
    
    let {data:{user},error } = await supabase.auth.getUser();
    const publicUrl = await uploadImage(capturedUri, user.id)
    const { data: closetData, error: insertError } = await supabase.from("Closet").select("id").eq("userid", user.id).single()
    
    const { data: insertDat, error: insertErr } = await supabase.from("outfits").insert([{link : publicUrl, closetid: closetData.id }])
    if (insertErr) {
      console.error("Supabase insert error:", insertErr);
      Alert.alert("Error", insertErr.message);
    } else {
      console.log("Insert result:", insertDat);
      Alert.alert("Success", "Outfit saved!");
    }
    }catch(err){
      console.error("Capture failed:", err);

    }
  }
  const uploadLocalFileToBgRemover = async (imageUri) => {
    if (!imageUri) return null;
    
    setIsProcessing(true);
    
    try {
      
    //   const formData = new FormData();
    //   formData.append('image', {
    //     uri: imageUri,
    //     type: 'image/jpeg', 
    //     name: 'topimage.jpg',
    //   });
    let formData = new FormData();
    if (Platform.OS === 'web') {
      // For web, convert the URI to a blob first
      const response = await fetch(imageUri);
      const blob = await response.blob();
      formData.append('image', blob, 'LESHIRT.png');
    } else {
      // For native React Native
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'LESHIRT.png',
      });
    }

      
      const response = await fetch(Platform.OS === 'android'
             ? 'http://10.0.2.2:3000/remove-background' 
             : 'http://localhost:3000/remove-background', 
            {
        method: 'POST',
        body: formData,
        
      });
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await response.json();

      if (response.ok && result.result) {
        setProcessedTopImg(result.result);
        return result.result;
      } else {
        throw new Error(result.error || 'Failed to remove background');
      }
  } catch (error) {
      console.error('Error removing background:', error);
      
      return imageUri; // Return original image if processing fails
    } finally {
      setIsProcessing(false);
    }
  };

  // Process the top image when component mounts
  useEffect(() => {
    if (topImg && !processedTopImg) {
      uploadLocalFileToBgRemover(topImg);
    }
  }, [topImg]);
  console.log("here", processedTopImg)
    return (
      
      
      
      
        <LinearGradient
        colors={['#2A003F', '#1A0029', '#0D0014']} 
        locations={[0.1, 0.5, 1]}
        start={{ x: 0.8, y: 0 }}
          end={{ x: 1, y: 1 }}
        style={styles.container}>
      {/* Full screen view */}
      {next &&
          <Fits photos={savefit}/>
      }
      
      <View style={styles.container}>
      <Text style={styles.title}>Klozet</Text>
    

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
        <View style={{borderBottomColor:"grey",borderBottomWidth:1, marginVertical: 15 }}></View>
        
        {/* Styling Board */}
        <TouchableOpacity onPress={()=>{console.log("gere");capture()}}>
          <View style={{justifyContent:"center",alignItems:"center",alignSelf:"center"}}>
        <Text style={{ top:20,height:35, backgroundColor:"black", width:50,justifyContent:"center",alignItems:"center", borderRadius:10, borderColor:"grey",borderWidth:1, color:"white"}}>Save</Text>
        </View>
        </TouchableOpacity>
       
        <ViewShot ref={viewRef}  options={{ format: "png", quality: 0.9,result: "tmpfile" }}>
        <View style={{backgroundColor: "white",height:550,width:300, borderColor:"black", borderWidth:10, alignSelf:"center", alignItems:"center"}}>
          <Image source={{uri :processedTopImg || topImg}} style={{height:200,width:200, top:0}} resizeMode="contain" onLoadEnd={() => setLoaded(l => ({ ...l, top: true }))}></Image>
          <Image source={{uri :bottomImg || bottomImg}} style={{height:200,width:200 , height:200 , backgroundColor:"grey", top:10}} resizeMode="contain" onLoadEnd={() => setLoaded(l => ({ ...l, bottom: true }))}></Image>
          <Image source={{uri :shoeImg}} style={{height:50,width:100, backgroundColor:"green", top:26}} resizeMode="contain" onLoadEnd={() => setLoaded(l => ({ ...l, shoe: true }))}></Image>
          <Image source={{uri :otherImg}} style={{height:80,width:80, left:170,bottom:300, backgroundColor:"blue"}} resizeMode="contain" onLoadEnd={() => setLoaded(l => ({ ...l, other: true }))}></Image>
          

        </View>
        </ViewShot>
        {/* Bottom Border */}
        <View style={{borderBottomColor:"grey",borderBottomWidth:1,marginVertical:670}}></View>

        {/* Bottom Nav view */}
        <View style={{position: 'absolute',
  left: 10,
  right: 10,
  bottom: 70,flexDirection:"column", color:"white"}}>
         
         {/* Calendar */}
         <TouchableOpacity onPress={()=>router.push('/Schedule')}>
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
      
    )
  }
  

export default Generate;

const styles = StyleSheet.create({container:{flex:1},
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
      color: 'white',}

})

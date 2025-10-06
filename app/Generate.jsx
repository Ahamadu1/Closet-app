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






const Generate = () => {
  const viewRef = useRef();
  const router = useRouter();
  const {topImg, bottomImg, shoeImg, otherImg} = useLocalSearchParams();
  const [processedTopImg, setProcessedTopImg] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savefit, setsavefit] = useState('');
  const [next,setNext] = useState(false);
  
  
  const capture = async()=>{
    const capturedUri = await viewRef.current.capture();
    setsavefit(capturedUri)
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
        <Text style={{position:"absolute",right:1,fontSize: 14, top:33,          
      fontWeight: 'medium',
      color: 'white'}}>Favorites</Text>
      </TouchableOpacity>
        </View>
        
        {/* Top Border */}
        <View style={{borderBottomColor:"grey",borderBottomWidth:1, marginVertical: 15 }}></View>
        
        {/* Styling Board */}
        <TouchableOpacity onPress={capture}>
          <View style={{justifyContent:"center",alignItems:"center",alignself:"center"}}>
        <Text style={{right:30 ,top:20, position:"absolute",height:35, backgroundColor:"black", width:50,justifyContent:"center",alignItems:"center", borderRadius:10, borderColor:"grey",borderWidth:1, color:"white"}}>Save</Text>
        </View>
        </TouchableOpacity>
       
        <ViewShot ref={viewRef}  options={{ format: "jpg", quality: 0.9 }}>
        <View style={{height:550,width:500, borderColor:"black", borderWidth:10, alignSelf:"center", alignItems:"center"}}>
          <Image source={{uri :processedTopImg || topImg}} style={{height:200,width:200, top:0}} resizeMode="contain"></Image>
          <Image source={{uri :bottomImg}} style={{height:200,width:200 , height:200 , backgroundColor:"grey", top:10}}></Image>
          <Image source={{uri :shoeImg}} style={{height:50,width:100, backgroundColor:"orange", top:26}}></Image>
          <Image source={{uri :otherImg}} style={{height:80,width:80, left:170,bottom:300, backgroundColor:"blue"}}></Image>
          

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
    title: {fontSize: 40,          
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    alignSelf: "center",},
    
    favorites:{height:30, width:35 ,position:"absolute",right:13,top:2},
    style:{height:40, width:40 ,position:"absolute",right:10},
    calendar:{height:40, width:40,position:"absolute", left:10, top:0},
    plus:{height:40, width:40 ,position:"absolute", alignSelf: "center"},
    fits:{position:"absolute",left:7,fontSize: 18, top:9,          
      fontWeight: 'medium',
      color: 'white',}

})

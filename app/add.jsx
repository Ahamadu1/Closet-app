import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native'
import {React, useState} from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../database/supabase';
const router = useRouter();


const Add = ()=>{
  const [showImg,setshowImg] = useState(false);
  const [photo,setphoto] = useState();
  const [name,setname]= useState();
  const addImg = async ()=>{
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled){
        setphoto(result);
        setshowImg(true);
        // router.push('/Plus')
      }else{
        alert("You didnt add any image")
      }
    }
  const saveImg = async ()=>{
    const data = await supabase.auth.getUser();
    const {error} = await supabase
    .from('Tops')
    .insert([{link:photo.assets[0].uri, name : name}])
    if (error) console.log(error)
    router.replace('/');
  }
  const openCam = async()=>{
    const { status } = await ImagePicker.requestCameraPermissionsAsync({ allowsEditing: true,
      quality: 1});
  if (status !== 'granted') {
    alert('Camera permission required');
    return;
  }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    })
    if (!result.canceled){
      setphoto(result);
      console.log(result)
      setshowImg(true);
    }else{
          alert("You didnt add any image")
        }
  }


    
      return (
        
        
        
        <LinearGradient
        colors={['#2A003F', '#1A0029', '#0D0014']} 
        locations={[0.1, 0.5, 1]}
        start={{ x: 0.8, y: 0 }}
          end={{ x: 1, y: 1 }}
        style={styles.container}>
      {/* Full screen view */}
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

        {showImg && 
        
        
          <View>
            
            <View><TextInput style={{backgroundColor:"black", color:'white',width:200, height:50, borderRadius:8, alignSelf:'center'}} placeholder="Enter a name.." placeholderTextColor="white" onChangeText={(text)=>{setname(text)}}></TextInput></View>
          <TouchableOpacity onPress={saveImg}>
            <View style={[styles.plusSectionButtons,{right:10}]}><Text style={{ color:'white', fontSize:16, alignSelf:"center"}}>Save</Text></View>
            </TouchableOpacity>
          <Image source={{uri: photo.assets[0].uri}} style={{height:150, width:300,alignSelf:"center", top:50}}></Image>
          
          <View style>
          <View style={[styles.plusSectionButtons,{position:"absolute",left:100,top:70}]}><Text style={{ color:'white'}} >Edit</Text></View>
          <View style={[styles.plusSectionButtons,{position:"absolute",alignSelf:"center",top:70}]}><Text style={{ color:'white'}} >Favorite</Text></View>
          <View style={[styles.plusSectionButtons,{position:"absolute",right:100,top:70}]}><Text style={{ color:'white'}}>Delete</Text></View>
          </View>
          </View>

        }
       
       {/* Adding photo pop up */}
       {!showImg &&
       <View style={{flex:'col',height:150, width:300 , backgroundColor:"black", alignSelf: "center", justifyContent:"center",alignItems:"center" ,borderRadius:20,position:"absolute",top:330}}>
        <View style={{position:"absolute",top:15}}>
        <Text style={{color:"white", fontWeight:"bold", fontSize:20}}>Add Photo</Text>
        </View> 

        {/* Adding Photo by Opening Camera */}
        <TouchableOpacity onPress={openCam}>
        <View style={{top:24,borderColor:"grey",borderWidth:1,paddingLeft:119,paddingRight:119,paddingTop:15,paddingBottom:13}}>
        <Text style={{color:"white",fontSize:17 }}>Camera</Text>
        </View> 
        </TouchableOpacity>
        
        {/* Adding Photo from Photos */}
        <TouchableOpacity onPress={addImg}>
        <View style={{top:23,borderColor:"grey",borderWidth:1,paddingLeft:97,paddingRight:97,paddingTop:15,paddingBottom:17,borderBottomLeftRadius:10,borderBottomRightRadius:10}}> 
        <Text style={{color:"white", fontSize:17}}>Photo Library</Text>
        </View> 
        </TouchableOpacity>

       </View>
}




        {/* Bottom Border */}
        <View style={{borderBottomColor:"grey",borderBottomWidth:1,marginVertical:670}}></View>

        {/* Bottom Nav view */}
        <View style={{position: 'absolute',
  left: 10,
  right: 10,
  bottom: 70,flexDirection:"column", color:"white"}}>
         
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
      
    )
  }
  

export default Add;

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
      color: 'white'},
      plusSectionButtons:{position:"absolute",height:35, backgroundColor:"black", width:50,justifyContent:"center",alignItems:"center", borderRadius:10, borderColor:"grey",borderWidth:1}

})

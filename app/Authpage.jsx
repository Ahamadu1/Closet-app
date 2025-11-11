import { StyleSheet, Text, View, Image, TouchableOpacity,TextInput } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { useRouter } from 'expo-router';
// import { center } from '@shopify/react-native-skia';
import { supabase } from '../database/supabase';
import Index from './index';

import React, {useState,useEffect} from 'react';
const router = useRouter();

const AuthPage = () => {
    const [signedUp,setsignedUp] = useState(false);
    const [access,setAcess] = useState(false);
    const [name,setName] = useState('');
    const [pass,setPass] = useState('');

    

    async function addUser(){
    let { data, error } = await supabase.auth.signUp({
    email: name,
    password: pass,

}); 
if (data?.user){
 const {clostData , err} = await supabase.from("Closet").insert([{userid: data.user.id }])}
if(error){
  console.log("Full error object:", JSON.stringify(error, null, 2));
  console.log("Error code:", error.code);
  console.log("Error message:", error.message);
  console.log("Error status:", error.status);
  alert(`Error: ${error.message}`);
  return;}
if(error){
      console.log("Error signing up user",error.code)

}else{
  console.log("Successfull")
}
    // if (data?.user){
    //   await supabase.from('Profiles').insert([{ user_id : data.user.id, username: data.user.email}])
    // }
    setName('');
    setsignedUp(true)
}
  
  async function signIn(){
    
    const{ data, error } = await supabase.auth.signInWithPassword({email: name,    
      password: pass})

      if (error) {
        console.log("Login failed:", error.message)
      } else {
        console.log("Logged in!", data.user)
        router.replace('/');
        setAcess(true)

      }

    }
    // let { data, error } = await supabase.auth.signInWithPassword({
    //     email: name,
    //     password: pass
    //   })

  
  
    
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
      {/* Choose option */}
      
      
      <View style={{height:50, width:200, backgroundColor:"black",  flexDirection:"row" , left:550, top:150, borderRadius: 20}}>
     <View style={{backgroundColor: !signedUp?"#1A1A1A":"", height:50, width:100, alignSelf:'center',alignItems:"center",justifyContent:"center", borderColor:"grey", borderWidth: !signedUp?1: 0, borderBottomLeftRadius:20, borderTopLeftRadius:20}} >
      <TouchableOpacity onPress={()=>{setsignedUp(false)}}>
      <Text style={{color:"white"}}> Sign up </Text>
      </TouchableOpacity>
      </View>
      
      <View style={{backgroundColor:signedUp?"#1A1A1A":"", height:50, width:100, alignSelf:'center',alignItems:"center",justifyContent:"center", borderColor:"grey", borderWidth: signedUp?1: 0, borderBottomRightRadius:20, borderTopRightRadius:20}} >
      <TouchableOpacity onPress={()=>{setsignedUp(true)}}>
      <Text style={{color:"white"}}> Sign in </Text>
      </TouchableOpacity>
      </View>
      </View>


      {/* log in */}
      {signedUp &&
    <View style={{height:300, width:500, backgroundColor:"black" ,borderRadius:10, alignSelf:"center", top:200,alignItems: "center", justifyContent:"center", gap:10}}>
      <Text style={{position:"absolute",alignSelf:"center",fontSize: 25, top:10,          
      fontWeight: 'medium',
      color: 'white'}}>log in</Text>
    {/* //   <View style={{height:200, width:500, backgroundColor:"black" ,borderRadius:10, alignSelf:"center", top:200,alignItems: "center", justifyContent:"center", gap:10}}> */}
      <View style={{flexDirection:"row", alignItems:"center", gap:5}}>
        <Text style={{color:'white',fontWeight:'bold'}}>Username:</Text>
        <TextInput style={{backgroundColor:"#2A003F", color:'white',width:200, height:50, borderRadius:8, alignSelf:'center',borderColor:"grey",borderWidth:1}} placeholder="Enter your Username.." placeholderTextColor="white" 
        value={name} onChangeText={(text)=>setName(text)}></TextInput></View>

        <View style={{flexDirection:"row", alignItems:"center", gap:5}}>
        <Text style={{color:'white',fontWeight:'bold'}}>Password:</Text>
        <TextInput style={{backgroundColor:"#2A003F", color:'white',width:200, height:50, borderRadius:8, alignSelf:'center',borderColor:"grey",borderWidth:1}} placeholder="Enter your Password.." placeholderTextColor="white"
        value={pass} onChangeText={(text)=>{setPass(text)}}></TextInput></View>
        <TouchableOpacity onPress={signIn} >
        <View style={{height:35, backgroundColor:"2A003F", width:250, borderRadius:10, borderColor:"grey",borderWidth:1,bottom:0 , alignItems:"center", justifyContent:"center"}}><Text style={{ color:'white'}} >sign in</Text></View>
        </TouchableOpacity>
      </View>
       }

      {/* Sign up */}
      {!signedUp &&
        <View style={{height:300, width:500, backgroundColor:"black" ,borderRadius:10, alignSelf:"center", top:200,alignItems: "center", justifyContent:"center", gap:10}}>

        <Text style={{position:"absolute",alignSelf:"center",fontSize: 25, top:10,         
      fontWeight: 'medium',
      color: 'white'}}>Sign Up</Text>
      {/* <View style={{height:200, width:500, backgroundColor:"black" ,borderRadius:10, alignSelf:"center", top:200,alignItems: "center", justifyContent:"center", gap:10}}> */}
      <View style={{flexDirection:"row", alignItems:"center", gap:5}}>
        <Text style={{color:'white',fontWeight:'bold'}}>Username:</Text>
        <TextInput style={{backgroundColor:"#2A003F", color:'white',width:200, height:50, borderRadius:8, alignSelf:'center',borderColor:"grey",borderWidth:1}} placeholder="Enter a Username.." placeholderTextColor="white" 
        value={name} onChangeText={(text)=>{setName(text)}}
        ></TextInput></View>

        <View style={{flexDirection:"row", alignItems:"center", gap:5}}>
        <Text style={{color:'white',fontWeight:'bold'}}>Password:</Text>
        <TextInput style={{backgroundColor:"#2A003F", color:'white',width:200, height:50, borderRadius:8, alignSelf:'center',borderColor:"grey",borderWidth:1}} placeholder="Enter a Password.." placeholderTextColor="white" 
        value={pass} onChangeText={(text)=>{setPass(text)}}></TextInput></View>
        <TouchableOpacity onPress={addUser} >
        <View style={{height:35, backgroundColor:"2A003F", width:250, borderRadius:10, borderColor:"grey",borderWidth:1,bottom:0 , alignItems:"center", justifyContent:"center"}}><Text style={{ color:'white'}} >sign up</Text></View>
        </TouchableOpacity>
      </View>
      }
      

   


      
        </View>
        </LinearGradient>
      
    )
  }
  

export default AuthPage;

const styles = StyleSheet.create({container:{flex:1},
    title: {fontSize: 40,          
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    alignSelf: "center",justifyContent:"center", alignItems:"center"},
    
    favorites:{height:30, width:35 ,position:"absolute",right:13,top:2},
    style:{height:40, width:40 ,position:"absolute",right:10},
    calendar:{height:40, width:40,position:"absolute", left:10, top:0},
    plus:{height:40, width:40 ,position:"absolute", alignSelf: "center"},
    fits:{position:"absolute",left:7,fontSize: 18, top:9,          
      fontWeight: 'medium',
      color: 'white',}

})

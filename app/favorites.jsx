import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import React, {useState,useEffect} from 'react';
import { useRouter } from 'expo-router';
import pants from '../assets/LEPANTS.png';
import shirt from '../assets/LESHIRT.png';
const router = useRouter();


const Favorites = (props) => {
  const photos = [{id:1,source:pants},{id:2,source:shirt}]
  // const {user} = supabase.auth.getUser()
  // const {data: photos, error: topError} = supabase.from("Favorites").select('*');

  const [allFits, setAllFits] = useState([{}])
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
      <Text style={{position:"absolute",alignSelf:"center",fontSize: 25, top:103,          
      fontWeight: 'medium',
      color: 'white'}}>Favorites</Text>

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

         {/* Favorites grid */} 
        <View style={{flex:1,flexDirection: "row",  flexWrap:"wrap",justifyContent: "space-between",}}>
          {photos.map((photo)=>(
            <Image key={photo.id} source={photo.source}  style={{width: "48%",  
              aspectRatio: 1,borderWidth:2 ,width: 300, height:300, borderColor:"black",}}></Image>
            

          ))}
        </View>
       
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
  

export default Favorites;

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

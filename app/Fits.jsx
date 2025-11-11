import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Button,Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import React, {useState,useEffect} from 'react';
import { useRouter } from 'expo-router';
import pants from '../assets/LEPANTS.png';
import shirt from '../assets/LESHIRT.png';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../database/supabase';


const router = useRouter();


const Fits = (props) => {
  const [photos,setphotos] = useState([])
  


  React.useEffect(()=>{
    const fetchimg = async()=>{
    const {data: userData, error: usererror} = await supabase.auth.getUser();
    if (usererror || !userData?.user) {
      console.error("User not logged in:", usererror);
      return;
    }
    const {data: closetData,error: closetError} = await supabase.from("Closet").select("*").eq("userid", userData.user.id).single()
    if (closetError || !closetData) {
      console.log("Closet not found for user:", userData.user.id);

      console.error("Closet not found for user:", closetError);
      return;
    }
    const {data: fitsData,error: fitsError} = await supabase.from("outfits").select("id, link").eq("closetid", closetData.id)
    if (fitsError) console.error(fitsError);
      else setphotos(fitsData);

      console.log("Fetched photos:", closetData.id );
      console.log("Fits photos:", fitsData );

}
fetchimg();},[])
  

  const [allFits, setAllFits] = useState([{}])
  const [showOne, setshowOne] = useState(false)
  const [clicked, setClicked] = useState("")
  const [schedule, setschedule] = useState(false)
  

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    setShow(false);
    if (selectedDate) setDate(selectedDate);
  };

  
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
      <Text style={{position:"absolute",alignSelf:"center",fontSize: 25, top:83,          
      fontWeight: 'medium',
      color: 'white'}}>Fits</Text>

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

         {/* Fits grid */} 
         {!showOne &&
        <View style={{flex:1,flexDirection: "row",  flexWrap:"wrap",justifyContent: "flex-start", gap: 10,paddingHorizontal: 10}}>

          {photos.map((photo)=>(
            <TouchableOpacity key={photo.id} onPress={()=>{setClicked({uri:photo.link});setshowOne(true)}}>
            <Image key={photo.id} source={{uri:photo.link}}  style={{  
              aspectRatio: 1,borderWidth:2 ,width: 200, height:200, borderColor:"black"}} ></Image>
            </TouchableOpacity>

          ))}
        </View>}

        {showOne && (
        <View>
          <TouchableOpacity onPress={()=>setschedule(true)}>
            <View style={styles.plusSectionButtons}><Text style={{color: 'white'}}>Schedule</Text></View>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={addfav}>
            <View><Text>Favorite</Text></View>
            </TouchableOpacity>

            <TouchableOpacity onPress={del}>
            <View><Text>Delete</Text></View>
            </TouchableOpacity> */}
            <Image source={clicked} style={{width: 400, height:400, alignSelf:"center", justifyContent:"center"}}></Image>
            
        
        {schedule && (
          <View><Text style={{color: 'white'}}>Select a date</Text>
          <View>
      <Button title="Select Date" onPress={() => setShow(true)} />
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'} 
          onChange={onChange}
          
        />
      )}
    </View>
          
          
          </View>
          
        
        
    )}
        </View>)}
       
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
  

export default Fits;

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
      color: 'white',},
      plusSectionButtons:{position:"absolute",height:35, backgroundColor:"black", width:50,justifyContent:"center",alignItems:"center", borderRadius:10, borderColor:"grey",borderWidth:1 , textcolor:"white", right:100}


})




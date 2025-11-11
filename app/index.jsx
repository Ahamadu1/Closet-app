
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../database/supabase';
import "expo-router/entry";
import { useEffect,useState } from 'react';

// import 'react-native-reanimated';

const router = useRouter();


const Index = () => {

    // const addimage = async ()=>{
    //   let result = await ImagePicker.launchImageLibraryAsync({
    //     allowsEditing: true,
    //     quality: 1,
    //   });
    //   if (!result.canceled){
    //     console.log(result);
    //     // router.push('/Plus')
    //   }else{
    //     alert("You didnt add any image")
    //   }
    // }
    const [topData, setTopData] = useState([]);
    const [bottomData, setBottomData] = useState([]);
    const [accessData, setAccessData] = useState([]);
    const [shoeData, setShoeData] = useState([]);

//   useEffect(()=>{
//     const checkAuth = async () => {
//       const { data: { user }, error: userError } = await supabase.auth.getUser();
// if (userError || !user) {
//   console.error("No authenticated user:", userError);
//   return;
// }
// console.log("User ID:", user.id);
//       if (user) {
//         console.log(user.id)
//         const {data: closetData, error: closetError} = supabase.from("Closet").select('id').eq("userid",user.id);
//         const {data: topData, error: topError} = supabase.from("Tops").select('*').eq("closetid",closetData.id);
//         const {data: bottomData, error: bottomError} = supabase.from("Bottom").select('*').eq("closetid",closetData.id);;
//         const { data: accessData, error: accessError} = supabase.from("Accessories").select('*').eq("closetid",closetData.id);;
//         const {data: shoeData, error: shoeError} = supabase.from("shoes").select('*').eq("closetid",closetData.id);;

//       } else {
        
//         router.replace("/Authpage")
//       }
//     }
//     checkAuth()

//   },[])
 


useEffect(() => {
  const checkAuth = async () => {
    //  1. Get user safely
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("No authenticated user:", userError);
      router.replace("/Authpage");
      return;
    }

    console.log("User ID:", user.id);

    //  2. Get Closet
    const { data: closetData, error: closetError } = await supabase
      .from("Closet")
      .select("id")
      .eq("userid", user.id)
      .single();

    if (closetError || !closetData) {
      console.error("Closet not found:", closetError);
      return;
    }

    // 3. Fetch data from tables using closetData.id
    const [tops, bottoms, shoes, accessories] = await Promise.all([
      supabase.from("Tops").select("*").eq("closetid", closetData.id),
      supabase.from("Bottom").select("*").eq("closetid", closetData.id),
      supabase.from("shoes").select("*").eq("closetid", closetData.id),
      supabase.from("Accessories").select("*").eq("closetid", closetData.id),
    ]);

    // ✅ 4. Update state
    if (tops.data) setTopData(tops.data);
    if (bottoms.data) setBottomData(bottoms.data);
    if (shoes.data) setShoeData(shoes.data);
    if (accessories.data) setAccessData(accessories.data);
  };

  checkAuth();
}, []);

 

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
        <Text style={{position:"absolute",right:1,fontSize: 14, top:63,          
      fontWeight: 'medium',
      color: 'white'}}>Favorites</Text>
      </TouchableOpacity>
        </View>
        
        {/* Top Border */}
        <View style={{borderBottomColor:"grey",borderBottomWidth:1, marginVertical: 15 }}></View>
       
          {/* Clothes*/}
          {/* {data?.map(item=>{
            <Image id={item.id} source={{uri :item.link}}  style={{width: "48%",  
              aspectRatio: 1,borderWidth:2 ,width: 300, height:300, borderColor:"black",}}></Image>
          })} */}
          <View style={{flexDirection: "col", gap:20}}> 
         
         
         {/* Top Clothes section*/}
          
          <TouchableOpacity
          onPress={() => router.push('/Tops')}>
  <LinearGradient
    colors={['#3a0ca3', 'black']}
    style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Tops</Text>
    <Text style={styles.viewAll}>View all →</Text>
    </View>
  
          <View style={styles.imageRow}> 
          
          {topData && topData.length > 0 ? (
                
                topData.map(item => (
                  <Image key={item.id} source={{ uri: item.link }} style={styles.previewImg} />
                ))
                
              ) : (
                <Text style={styles.emptyText}>
                  You have no tops in your closet.
                </Text>
                
)}

          </View>
          </LinearGradient> 
          </TouchableOpacity>


          {/* Bottoms Clothes section*/}
          <TouchableOpacity
          onPress={() => router.push('/Bottoms')}>
  <LinearGradient
    colors={['#3a0ca3', 'black']}
    style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Bottoms</Text>
    <Text style={styles.viewAll}>View all →</Text>
    </View>
  
          <View style={styles.imageRow}> 
          
          {bottomData && bottomData.length > 0 ? (
                
                bottomData.map(item => (
                  <Image key={item.id} source={{ uri: item.link }} style={styles.previewImg} />
                ))
                
              ) : (
                <Text style={styles.emptyText}>
                  You have no tops in your closet.
                </Text>
                
)}

          </View>
          </LinearGradient> 
          </TouchableOpacity>
        {/* shoes section*/}
        <TouchableOpacity
          onPress={() => router.push('/Shoes')}>
  <LinearGradient
    colors={['#3a0ca3', 'black']}
    style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Shoes</Text>
    <Text style={styles.viewAll}>View all →</Text>
    </View>
  
          <View style={styles.imageRow}> 
          
          {shoeData && shoeData.length > 0 ? (
                
                shoeData.map(item => (
                  <Image key={item.id} source={{ uri: item.link }} style={styles.previewImg} />
                ))
                
              ) : (
                <Text style={styles.emptyText}>
                  You have no tops in your closet.
                </Text>
                
)}

          </View>
          </LinearGradient> 
          </TouchableOpacity>

          {/* Acessories section*/}
          <TouchableOpacity
          onPress={() => router.push('/Accessories')}>
  <LinearGradient
    colors={['#3a0ca3', 'black']}
    style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>Accessories</Text>
    <Text style={styles.viewAll}>View all →</Text>
    </View>
  
          <View style={styles.imageRow}> 
          
          {accessData && accessData.length > 0 ? (
                
                accessData.map(item => (
                  <Image key={item.id} source={{ uri: item.link }} style={styles.previewImg} />
                ))
                
              ) : (
                <Text style={styles.emptyText}>
                  You have no Accessories in your closet.
                </Text>
                
)}

          </View>
          </LinearGradient> 
          </TouchableOpacity>
          </View>



        



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
        <Text style={{position:"absolute",left:1,fontSize: 14, top:30,          
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
  

export default Index;

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
      color: 'white',}, img: {  
        aspectRatio: 1,borderWidth:2 ,width: 100, height:100, borderColor:"black"},sectionCard: {
          backgroundColor: '#1b002e',
          borderRadius: 15,
          marginVertical: 12,
          marginHorizontal: 16,
          overflow: 'hidden',
          elevation: 6, // Android shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 5, // iOS shadow
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 10,
          paddingHorizontal: 10,
          
        },
        sectionTitle: {
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold',
        },
        viewAll: {
          color: '#e0c3fc',
          fontSize: 14,
        },
        imageRow: {
          flexDirection: 'row',
          justifyContent: 'flex-start',
          padding: 10,
          gap: 10,
        },
        previewImg: {
          width: 100,
          height: 100,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#333',
        },
        emptyText: {
          color: '#bbb',
          padding: 10,
        },
      });



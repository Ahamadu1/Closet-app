import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, Image, TouchableOpacity,Animated, PanResponder } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import bottom from '../assets/bottom.png';
import shoes from '../assets/shoes.png';
import shirticon2 from '../assets/shirticon2.png';
import Tops from './Tops';
import Shoes from './Shoes';
import Bottoms from './Bottoms';
import Accessories from './Accessories';
import { createContext } from "react";
import { useNavigation } from '@react-navigation/native';

import {React, useState,useRef} from 'react';



const Style = () => {

  const router = useRouter();
  const navigation = useNavigation();
  const [pickTop,setpickTop] = useState(false);
  const [pickBottom,setpickBottom] = useState(false);
  const [pickShoes,setpickShoes] = useState(false);
  const [pickAccess,setpickAccess] = useState(false);

  const [gen, setGen] = useState(false);


  const refTop = useRef(null);
  const refBottom = useRef(null);
  const refShoes = useRef(null);
  const refOther = useRef(null);

  const [imgTop, setImgTop] = useState(null);
  const [imgBottom, setImgBottom] = useState(null);
  const [imgShoes, setImgShoes] = useState(null);
  const [imgOther, setImgOther] = useState(null);

  const [rects, setRects] = useState({
    top: null,
    bottom: null,
    shoes: null,
    other: null,
  });

  const measureBox = (key, ref) => {
    if (!ref.current) return;
    ref.current.measureInWindow((x, y, width, height) => {
      setRects((r) => ({ ...r, [key]: { x, y, width, height } }));
    });
  };

  const inside = (x, y, r) =>
    r &&
    x >= r.x &&
    x <= r.x + r.width &&
    y >= r.y &&
    y <= r.y + r.height;
  
    const onDropTop = (imgSource, gesture) => {
      const { moveX, moveY } = gesture;
      setGen(true);
      

  
      if (inside(moveX, moveY, rects.top))    { setImgTop(imgSource);    return true; }
      if (inside(moveX, moveY, rects.bottom)) { setImgBottom(imgSource); return true; }
      if (inside(moveX, moveY, rects.shoes))  { setImgShoes(imgSource);  return true; }
      if (inside(moveX, moveY, rects.other))  { setImgOther(imgSource);  return true; }
  
      return false;
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
      color: 'white'}}>Create Outfit</Text>

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
         
        <View style={{ flex:1, position:'relative' }}>
  
   {/* Generate outfit button */}
   {gen &&
  

  <TouchableOpacity
    style={{
      position:'absolute',
      top:80, right:20,
      height:45, width:160,
      backgroundColor:'black',
      justifyContent:'center', alignItems:'center',
      borderRadius:10, borderColor:'grey', borderWidth:1,
      zIndex: 10
    }}
    onPress={() => router.push({pathname:'/Generate',params:{topImg:imgTop?.uri || imgTop, bottomImg:imgBottom?.uri ||imgBottom, shoeImg:imgShoes?.uri || imgShoes, otherImg:imgOther?.uri || imgOther}})}
  >


    <Text style={{ color:'white', fontSize:16 }}>Generate Outfit</Text>
  </TouchableOpacity>
}

        {/* Drag and Drop Area */}

        <View style={{justifyContent:"space-around", alignItems:'center', gap:30, top:40}}> 
          
        <View
            ref={refTop}
            onLayout={() => measureBox('top', refTop)}
            style={styles.dropBox}
          >
            {imgTop ? (
              <Image source={imgTop} style={{ width: 60, height: 60 }} />
            ) : (
              <Text style={styles.dropText}>DRAG THE TOP HERE</Text>
            )}
          </View>
          
          
          
          <View
            ref={refBottom}
            onLayout={() => measureBox('bottom', refBottom)}
            style={styles.dropBox}
          >
            {imgBottom ? (
              <Image source={imgBottom} style={{ width: 60, height: 60 }} />
            ) : (
              <Text style={styles.dropText}>DRAG BOTTOM HERE</Text>
            )}
          </View>
          
          <View
            ref={refShoes}
            onLayout={() => measureBox('shoes', refShoes)}
            style={styles.dropBox}
          >
            {imgShoes ? (
              <Image source={imgShoes} style={{ width: 60, height: 60 }} />
            ) : (
              <Text style={styles.dropText}>DRAG THE SHOES HERE</Text>
            )}
          </View>
          
          <View
            ref={refOther}
            onLayout={() => measureBox('other', refOther)}
            style={styles.dropBox}
          >
            {imgOther ? (
              <Image source={imgOther} style={{ width: 60, height: 60 }} />
            ) : (
              <Text style={styles.dropText}>DRAG THE OTHERS HERE</Text>
            )}
          </View>
        </View>        
        
        </View>

        {/* Scrollable clothing section */}
        {!(pickTop || pickBottom || pickShoes || pickAccess )&&
        <View style={{top:90, flexDirection: "row", justifyContent: "space-around", gap:1, top:540}}>
        
        <TouchableOpacity onPress={()=>setpickTop(true)}>
        <View style={{borderColor:"grey", width:100,height:100, borderRadius:20, borderWidth:1 ,justifyContent:"center",alignItems:'center'}}><Image source={shirticon2} style={{height:40, width:60, alignSelf:"center"}}></Image><Text style={{color:"white",position:"absolute", bottom:5}}>Shirts</Text></View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={()=>setpickBottom(true)}>
        <View style={{borderColor:"grey", width:100,height:100, borderRadius:20, borderWidth:1 ,justifyContent:"center",alignItems:'center'}}><Image source={bottom} style={{height:60, width:60, alignSelf:"center"}}></Image><Text style={{color:"white",position:"absolute", bottom:5}}>Pants</Text></View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={()=>setpickShoes(true)}>
        <View style={{borderColor:"grey", width:100,height:100, borderRadius:20, borderWidth:1,justifyContent:"center",alignItems:'center' }}><Image source={shoes} style={{height:40, width:60, alignSelf:"center"}}></Image><Text style={{position:"absolute" ,color:"white", bottom:5}}>Shoes</Text></View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={()=>setpickAccess(true)}>
        <View style={{borderColor:"grey", width:100,height:100, borderRadius:20, borderWidth:1 ,justifyContent:"center",alignItems:'center'}}><Text style={{position:"absolute" ,color:"white", bottom:5}}>Accessories</Text></View>
        </TouchableOpacity>
        </View>
        
      }

      {pickTop &&
        <Tops onDropTop={onDropTop}/>
       }

      {pickBottom &&
        <Bottoms onDropTop={onDropTop}/>
       }

      {pickShoes &&
        <Shoes onDropTop={onDropTop}/>
       }

      {pickAccess &&
        <Accessories onDropTop={onDropTop}/>
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
  

export default Style;

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
      color: 'white',}, dragText :{borderColor:"grey", width:100,height:100, borderRadius:20, borderWidth:1 ,justifyContent:"center",alignItems:'center'},
      dropBox: {
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'grey',
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        width: 300,
        height: 70,
      },
      dropText: { color: 'grey', fontSize: 22 },categoryRow: { top: 90, flexDirection: 'row', justifyContent: 'space-around', gap: 1 },
      catBox: {
        borderColor: 'grey',
        width: 100,
        height: 100,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      catText: { color: 'white', position: 'absolute', bottom: 5 }

})

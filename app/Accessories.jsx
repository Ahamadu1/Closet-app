import React, { useRef, useState,useEffect} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity,Animated, PanResponder } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native-web';
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




function Accessories({ onDropTop }) {
  const [userImg, setUserImg] = useState([]);

  React.useEffect(() => {
    const fetchImgs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userCloset } = await supabase
        .from('Closet')
        .select('id')
        .eq('userid', user.id)
        .single();

      const { data: imgs, error } = await supabase
        .from('Accessories')
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
      color: 'white'}}>Fits</Text>

        <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between",  paddingHorizontal: 10 }}>
          {userImg?.map((photo, i) => (
            <TouchableOpacity key={i} onPress={() => { setClicked({ uri: photo.link }); setshowOne(true); }}>
              <Image
                source={{ uri: photo.link }}
                style={{
                  width: "48%",
                  aspectRatio: 1,
                  borderWidth: 2,
                  height: 300,
                  borderColor: "black",
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
        </View>
        </LinearGradient>
      )}
      
      </>

);


}

export default Accessories;

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
        color: 'white',}
  
  })
  ;
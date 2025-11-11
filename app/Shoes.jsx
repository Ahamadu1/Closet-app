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




function Shoes({ onDropTop }) {
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
        .from('shoes')
        .select('link')
        .eq('closetid', userCloset.id);

      if (error) console.error(error);
      else setUserImg(imgs);
    };

    fetchImgs();
  }, []);
    
    return (
        
        <View style={{top:540, flexDirection: "row", justifyContent: "space-around", gap:5}}>
        {userImg.map((p, index) => (
        <DraggableThumb key={index} source={{uri: p.link}} onDropTop={onDropTop} />
      ))}
    </View>
  );
}

export default Shoes;

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
  });
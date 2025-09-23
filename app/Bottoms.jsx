import {React,useRef, useState} from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity,Animated, PanResponder } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native-web';
const router = useRouter();
const photos = [{id:1,source:heartlogo},{id:2,source:stlyelogo},{id:3,source:pluslogo},{id:4,source:calendarlogo}]

function DraggableThumb({ source, onDropTop }) {
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




function Bottoms({ onDropTop }) {
    
    return (
        
        <View style={{top:540, flexDirection: "row", justifyContent: "space-around", gap:5}}>
        {photos.map((p) => (
        <DraggableThumb key={p.id} source={p.source} onDropTop={onDropTop} />
      ))}
    </View>
  );
}

export default Bottoms;

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
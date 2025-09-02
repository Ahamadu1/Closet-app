import { StyleSheet, Text, View, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';


const Home = () => {
    return (
      
        <LinearGradient
        colors={['#1A0033', '#3D0066']} 
        style={styles.container}>
      <View>
      <Text style={styles.title}>Klozet</Text>
        <View style={{flexDirection:"column"}}>
    
       
        <Image source={heartlogo} style={styles.favorites}/>
        </View>
        <View style={{position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,flexDirection:"column"}}>
        <Image source={calendarlogo} style={styles.calendar}/>
        <Image source={pluslogo} style={styles.plus}/>
        <Image source={stlyelogo} style={styles.style}/>
        </View>

        </View>
        </LinearGradient>
      
    )
  }
  

export default Home;

const styles = StyleSheet.create({container:{flex:1},
    title: {fontSize: 40,          
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    alignSelf: "center",},
    favorites:{height:50, width:50 ,position:"absolute",right:15,bottom:15},
    style:{height:50, width:50 ,position:"absolute",right:15,marginBottom:100},
    calendar:{height:50, width:50,position:"absolute", alignSelf: "flex-start",},
    plus:{height:50, width:50 ,position:"absolute",marginBottom:10,marginBottom:5, alignSelf: "center"},
    fits:{height:50, width:50 ,position:"absolute",marginLeft:5,marginTop:10}

})

import React, { useState, useEffect, Component } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  Text,
  View,
  Button,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';




export default function App() {
  const [hasPermission, setPermission] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    (async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermission(galleryStatus.status === 'granted');
    })();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4,3],
      quality:1,
    });

    console.log(result);

    if(!result.cancelled){
      setImage(result.uri);
    }
  };

  const pickCamera = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4,3],
      quality:1,
    });

    console.log(result);

    if(!result.cancelled){
      setImage(result.uri);
    }
  };

  if (hasPermission === false){
    return <Text>No access to Internal Storage{"\n"}Нет доступа к Внутреннему Хранилищу</Text>
  }

  return (
    <View style={{flex:1, justifyContent:'center'}}>
      <TouchableOpacity
        onPress={() => pickImage()}
        style={styles.addButton}>
          {/* <Entypo name="images" size={24} color="white" /> */}
          <Entypo name="images" size={24} color="white" />
        {image && <Image source={{uri: image}} style={{flex:1/2}}/>}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => pickCamera()}
        style={styles.takePicture}>
          {/* <Entypo name="images" size={24} color="white" /> */}
          <AntDesign name="camerao" size={24} color="white" />
        {image && <Image source={{uri: image}} style={{flex:1/2}}/>}
      </TouchableOpacity>
    </View>
    
    
  );
}


const renderItem = ({ item, index}) => {
  const pressHandler = (index) => { 
      var array = [...fileList]
      setSelectedImage(index)
      setIsVisible(true)
  }    
  
  return(
    <View style={[globalStyles.container,styles.container]}>
      <View >
          <TouchableOpacity style={[styles.deleteBtn,{right:'10%'}]} onPress={() => deleteImage(index)} >
              <MaterialIcons style={{padding:5}} name="close" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={{flex:1/2,aspectRatio:1}} onPress={() => pressHandler(index)} >
              <Image style={styles.image} resizeMode='cover' source={{isStatic:true,uri:item.uri}} key={index} />
          </TouchableOpacity>
      </View>
      <View style={styles.formContainer}>
            <PresentSelector input={site}/>
            <Text style={styles.uploadDes}>Upload Images(max. {maxImage} images)</Text>
            <FlatList
                style={styles.flatList}
                numColumns={2} 
                data={fileList}
                renderItem={renderItem}
                extraData={navigation.state.params.photo}
                keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity  onPress={()=>{!disable && setModalOpen(true)}} style={[styles.submitButton,{width:'40%',marginBottom:20}]}>
                <Text style={styles.btnDes} >CHOOSE</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  addButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    position: 'absolute',
    bottom:30,
    right:30,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 0.8,
    elevation: 6,
    shadowRadius: 15 ,
    shadowOffset : { width: 1, height: 13},
    backgroundColor: 'grey',
    color: '#FFFFFF'
  },
  takePicture: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    position: 'absolute',
    bottom:90,
    right:30,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 0.8,
    elevation: 6,
    shadowRadius: 15 ,
    shadowOffset : { width: 1, height: 13},
    backgroundColor: 'grey',
    color: '#FFFFFF'
  },
});

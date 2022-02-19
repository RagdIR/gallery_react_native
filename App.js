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
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'



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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
                  <FontAwesomeIcon icon="fa-solid fa-plus" />
        {image && <Image source={{uri: image}} style={{flex:1/2}}/>}
        {/* <Text style={{color: 'white', fontSize: 24,}}>+</Text> */}

      </TouchableOpacity>
    </View>
  );
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
    backgroundColor: '#12c100',
    color: '#FFFFFF'
  },
});

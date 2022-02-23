useEffect(()=> {
    
    setFileList(navigation.state.params.photo)
},[navigation.state.params.photo])

useEffect(()=> {
    console.log(fileList)
    if (fileList.length == maxImage){
        setDisable(true)
    } else {
        setDisable(false)
    }
},[fileList])


function PresentSelector({input, layerLevel=0,placeHolder='Location'}){
    const nestedPicker = input.map(nest => {
        return <SelectItem key={nest.id} title={nest.name} />
    })
    const subNestedPicker = input.map(nest => {
        if ( nest.children.length > 0 && hasSelected[layerLevel] && nest.name == targetSite[layerLevel]){
            const newLayerLevel = layerLevel+1
            const placeHolder = 'Section'
            return <PresentSelector key={nest.id} input={nest.children} layerLevel={newLayerLevel} placeHolder={placeHolder}/>
        } 
    })
    return (
        <View>
            <Text style={[{opacity:opacityPlaceholder[layerLevel]},styles.placeholder]}>{placeHolder}</Text>
            <Layout level={layerLevel} style={styles.layout}>
                <Select
                    onSelect={index => onPressHandler(index,layerLevel, input)}
                    value={targetSite[layerLevel]} 
                    placeholder={placeHolder}
                    styles={{fontFamily:'robot-medium'}}
                >   
                    {nestedPicker} 
                </Select>
            </Layout>
            {subNestedPicker}
        </View>
    )
}

const onPressHandler = (index,layerLevel, input) => {
    const newHasSelected = [...hasSelected]
    const newTargetSite = [...targetSite]
    const newPlaceHolder = [...opacityPlaceholder]
    setTargetPrefix(input[index.row].id)
    if (newHasSelected.slice(layerLevel+1,maxImage).includes(true)){
        const reNewHasSelected = new Array(layer+1).fill(false)
        const reNewTargetSite = new Array(layer+1).fill('')
        const reNewPlaceHolder = new Array(layer+1).fill(0)
        for(let i = 0; i < layerLevel+1; i++){
            reNewHasSelected[i] = true
            reNewTargetSite[i] = input[index.row].name
            reNewPlaceHolder[i] = 1
        }
        setHasSelected(reNewHasSelected)
        setTargetSite(reNewTargetSite)
        setOpacityPlaceholder(reNewPlaceHolder)
    }   else{
        newHasSelected[layerLevel] = true
        setHasSelected(newHasSelected)
        newTargetSite[layerLevel] = input[index.row].name
        setTargetSite(newTargetSite)
        newPlaceHolder[layerLevel] = 1
        setOpacityPlaceholder(newPlaceHolder)
    }
}

const renderItem = ({ item, index}) => {
    const pressHandler = (index) => { 
        var array = [...fileList]
        setSelectedImage(index)
        setIsVisible(true)
    }    
    
    return(
        <View >
            <TouchableOpacity style={[styles.deleteBtn,{right:'10%'}]} onPress={() => deleteImage(index)} >
                <MaterialIcons style={{padding:5}} name="close" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={{flex:1/2,aspectRatio:1}} onPress={() => pressHandler(index)} >
                <Image style={styles.image} resizeMode='cover' source={{isStatic:true,uri:item.uri}} key={index} />
            </TouchableOpacity>
            
        </View>
    )
}


const takePicture = async () => {
    setModalOpen(false)
    setSubModalOpen(false)
    setIsVisible(false)
    const {status: camera} = await Permissions.askAsync(Permissions.CAMERA);
    if (camera === 'granted'){
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        })
        if (!result.cancelled) {
            
            if (Platform.OS === 'android'){
                const uri =  "file:///" + result.uri.split("file:/").join("");
                setFileList([...fileList, { 
                    uri,
                    remark:'',
                    image:{name:uri.split("/").pop(),type:mime.getType(uri),uri:uri}
                }])
            }else if (Platform.OS === 'ios'){
                setFileList([...fileList, { 
                    uri:result.uri,
                    remark:'',
                    image:{name:result.uri.split("/").pop(),type:'image/jpeg',uri:result.uri}
                
                }])

            }
            

        }

    }
}

const convertUriToBlob = async (fileList,data) => {
    const filePress = await Promise.all(
        fileList.map(async image => {
            console.log(image.remark)
            
            data.append('remark',image.remark)
            data.append('attachment',image.image)
            console.log(data)
            })
       
    ) 
    return  data
}

const handleSubmit = async () => {
    setUploading(true)
    if (targetPrefix === ''){
        console.log('missing location')
        Alert.alert('Error','Please select the corresponding location')
        setUploading(false)
    } else if (fileList.length === 0){
        console.log('missing image')
        Alert.alert('Error','Please upload at least one image(maximun 4 images)')
        setUploading(false)
    } else{
        const data = new FormData()
        
        data.append('location',targetPrefix)
        const sendData = await convertUriToBlob(fileList,data)

        const authToken = "Token "+userData.token
        console.log(authToken)
        const result = await axios.post(constants.apiHost, sendData, {
            headers: {
                Accept: 'application/json',
                'content-type': 'multipart/form-data',
                Authorization: authToken
            }
            }).then(res => {
                    setUploading(false)
                    console.log("image uploaded")
                    navigation.goBack()
                    setUploadStatus(true)
                })
                .catch(err => {
                    setUploading(false)
                    // setUploadStatus()
                    alert(err)
                    alert(fileList[0].uri)})
    }
    

}


const deleteImage = (index) => {
    var array = [...fileList] 
    const fileLength = array.length
    array.splice(index, 1)
    setFileList(array)
}

const addImageFromLibrary = () => {
    setModalOpen(false)
    setSubModalOpen(false)
    setIsVisible(false)
    const imageCount = fileList.length
    // console.log(imageCount)
    navigation.navigate('ImageScreen',{photo:fileList,max:maxImage-imageCount})
}

const footerComponent = () => {
    return(
        <View  style={styles.modal} >
            <View style={globalStyles.container}>
                <TouchableOpacity style={{flex:0.75}} activeOpacity={1} onPress={()=>setSubModalOpen(false)} >
                </TouchableOpacity>
                <View style={{flex:0.25,
                            width:'100%',
                            backgroundColor:'#262626',
                            paddingHorizontal:20*constants.widthRatio}}>
                    <TouchableOpacity style={styles.imageLibBtn} onPress={()=>addImageFromLibrary()}>
                        <MaterialIcons name="insert-photo" size={30} color="white" />
                        <Text style={styles.imageBtnDes}>Upload from Album</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>Platform.OS ==='android'?takePicture():goToCameraScreen()}>
                        <MaterialIcons name="camera-alt" size={30} color="white" />
                        <Text style={styles.imageBtnDes}>Camera</Text>
                    </TouchableOpacity>
                </View>
            
            </View>
        </View>
    )
}

const goToCameraScreen = () => {
    setModalOpen(false)
    setSubModalOpen(false)
    setIsVisible(false)
    navigation.navigate('CameraScreen',{photo:fileList})

}
                                                                                          
const headerComponent = () => {
    // console.log(typeof(footerRef))
    const HIT_SLOP = { top: 16, left: 16, bottom: 16, right: 16 };
    const closeModal = () => {
        setIsVisible(false)
    }
    return(
        <SafeAreaView style={{flexDirection:'row'}}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal} hitSlop={HIT_SLOP}>
                <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
        </SafeAreaView>
    )
}


return (
    
    <View style={[globalStyles.container,styles.container]}>
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
        <View style={styles.subContainer}>
            <Text style={styles.reminder}>
                Please be noted that the images cannot be deleted after uploaded to the system
            </Text>
            <TouchableOpacity onPress={()=>handleSubmit()} style={styles.submitButton}>
                <Text style={styles.btnDes}>
                    UPLOAD
                </Text>
            </TouchableOpacity>
        </View>
        <Modal transparent={true} visible={modalOpen} style={{zIndex:999}}>
            <View  style={styles.modal} >
                <View style={globalStyles.container}>
                    <TouchableOpacity style={{flex:0.75}} activeOpacity={1} onPress={()=>setModalOpen(false)} >
                    </TouchableOpacity>
                    <View style={{flex:0.25,
                                width:'100%',
                                backgroundColor:'#262626',
                                paddingHorizontal:20*constants.widthRatio}}>
                        <TouchableOpacity style={styles.imageLibBtn} onPress={()=>addImageFromLibrary()}>
                            <MaterialIcons name="insert-photo" size={30} color="white" />
                            <Text style={styles.imageBtnDes}>Upload from Album</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>Platform.OS ==='android'?takePicture():goToCameraScreen()}>
                            <MaterialIcons name="camera-alt" size={30} color="white" />
                            <Text style={styles.imageBtnDes}>Camera</Text>
                        </TouchableOpacity>
                    </View>
                   
                </View>
            </View>
            
        </Modal>
        
        <ImageView
            images={fileList}
            imageIndex={selectedImage}
            visible={isVisible}
            subModalOpen={subModalOpen}
            setSubModalOpen={setSubModalOpen}
            onRequestClose={() => setIsVisible(false)}
            HeaderComponent={headerComponent}
            responseData={setFileList}
            FooterComponent={footerComponent}
            />
       
        <Modal transparent={true} visible={uploading}>
            <View style={{flex:1,justifyContent:'center'}}  >
                <View style={{backgroundColor:'#FFFFFF',flex:0.1,flexDirection:'row',justifyContent:'center',marginHorizontal:'10%',borderRadius:20}}>
                    <Text style={{fontFamily:'roboto-medium',alignSelf:'center',fontSize:20,color:'#679BCD'}}>Uploading</Text>
                    <ActivityIndicator size="large" color="#679BCD"/>
                </View>
                
            </View>
        </Modal>
    </View>
)
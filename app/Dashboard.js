import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Typography, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, Heading, VStack, Text, Input, InputField, Box, Button, ButtonText, ButtonIcon, AddIcon, CloseIcon, Modal, ModalBackdrop, ModalContent, ModalBody, ModalHeader, ModalCloseButton, ModalFooter, Icon } from '@gluestack-ui/themed';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { useNavigation, router } from 'expo-router';
import LabuddyCard from './labuddycard';
import supabase from "../lib/supabase";

export default function Dashboard() {
  const [metadata, setMetadata] = useState(null);
  const [labuddies, setLabuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const ref = useRef(null)

  const [formData, setFormData] = useState({
    wifi_name: "",
    wifi_password: "",
    network_id: ""
});

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
        ...prevData,
        [name]: value
    }));
    console.log(formData)
};

  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      console.log('onback');
      // Do your stuff here
      navigation.dispatch(e.data.action);
    });
    const fetchData = async () => {
      await getUserMetadata();
      await fetchLabuddies();
      setLoading(false); // Set loading to false after fetching data
    };

    fetchData();

    const subscription = supabase
      .channel('public:baskets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'baskets' }, (payload) => {
        console.log('Change received!', payload);
        fetchLabuddies();
      })
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function getUserMetadata() {
    const { data: user, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error fetching data:', userError);
    } else {
      // Handle the case where data might be null
      setMetadata(user?.user || []);
      console.log('metadata is ', { metadata });
    }
  }
  async function fetchLabuddies() {
    //get user data
    const { data: userdata, error: userError } = await supabase.auth.getUser();
    //get network that user can access
    const { data: network, error: networkError } = await supabase
      .from('network_users')
      .select('network_id')
      .eq('user_id', userdata?.user?.id)

    if (networkError || userError) {
      console.error('Error fetching data:', networkError);
      console.log(networkError)
    } else {
      // Handle the case where data might be null
      console.log('network: ', network.map((x) => x.network_id))
    }
    //get baskets in those networks
    const { data: baskets, error: basketError } = await supabase
      .from('baskets')
      .select()
      .eq('network_id', network.map((x) => x.network_id))

    if (basketError || userError) {
      console.error('Error fetching data:', basketError);
      console.log(network)
      console.log(basketError)
    } else {
      // Handle the case where data might be null
      setLabuddies(baskets || []);
      console.log(userdata?.user?.id)
      console.log(baskets)
    }
  }
  const doLogout = async (event) =>{
    const { error } = await supabase.auth.signOut()
    router.replace('/Login')
    
}

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  if (loading) {
    return (
      <GluestackUIProvider config={config}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider config={config}>
      <View style={styles.container}>
        <Box w="$200" p="$4" borderWidth="$1"
          borderRadius="$lg"
          borderColor="$borderLight300">
          <VStack space="xl">
            <Heading>{metadata?.user_metadata?.first_name}'s Labuddies</Heading>
            <Button style={styles.button} onPress={() => setShowModal(true)} ref={ref}><ButtonText>Add Labuddy </ButtonText><ButtonIcon as={AddIcon} /></Button>
            <Modal
              isOpen={showModal}
              onClose={() => {
                setShowModal(false)
              }}
              finalFocusRef={ref}
            >
              <ModalBackdrop />
              <ModalContent>
                <ModalHeader>
                  <Heading size="lg">Add Labuddy</Heading>
                  <ModalCloseButton>
                    <Icon as={CloseIcon} />
                  </ModalCloseButton>
                </ModalHeader>
                <ModalBody>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                  <VStack space="md">
                  <Text>Add your labuddies here.</Text>
                  <Input
                    variant="outline"
                    size="md"
                    isDisabled={false}
                    isInvalid={false}
                    isReadOnly={false}
                  >
                    <InputField placeholder="Wifi Name"
                        onChangeText={(value) => {
                        handleChange('wifi_name', value);}} />
                  </Input>
                  <Input
                    variant="outline"
                    size="md"
                    isDisabled={false}
                    isInvalid={false}
                    isReadOnly={false}
                  >
                    <InputField placeholder="Wifi Password"
                        onChangeText={(value) => {
                        handleChange('wifi_password', value);}} />
                  </Input>
                  <Input
                    variant="outline"
                    size="md"
                    isDisabled={false}
                    isInvalid={false}
                    isReadOnly={false}
                  >
                    <InputField placeholder="Network ID"
                        onChangeText={(value) => {
                        handleChange('network_id', value);}} />
                  </Input>
                  </VStack>
                  </KeyboardAvoidingView>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    action="secondary"
                    mr="$3"
                    onPress={() => {
                      setShowModal(false)
                    }}
                  >
                    <ButtonText>Cancel</ButtonText>
                  </Button>
                  <Button
                    size="sm"
                    action="positive"
                    borderWidth="$0"
                    onPress={() => {
                      // !!!------------------------------------INSERT ADDING LABUDDY STUFF HERE HEHE TYSM
                      // use formData to get inputs :)
                      setShowModal(false)
                    }}
                  >
                    <ButtonText>Add</ButtonText>
                  </Button>
                </ModalFooter>
              </ModalContent> 
            </Modal>
            {labuddies.length > 0 ? (
              labuddies.map((labuddy) => (
                <LabuddyCard labuddy={labuddy} key={labuddy.id} />
              ))
            ) : (
              <Text>No Labuddies found</Text>
            )}
            <Button style={styles.logout} onPress={doLogout} ref={ref}><ButtonText>Log out</ButtonText></Button>
          </VStack>
        </Box>
        <StatusBar style="auto" />
      </View>
    </GluestackUIProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#028391'
  },
  logout: {
    backgroundColor: '#C70039'
  }
});

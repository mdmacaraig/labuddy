import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import { Heading, FormControl, VStack, Text, Input, InputField, InputSlot, InputIcon, Button, ButtonText, Box } from '@gluestack-ui/themed';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';
import { router } from 'expo-router';
import LabuddyCard from './labuddycard';
import supabase from "../lib/supabase";

export default function Dashboard() {
  const [metadata, setMetadata] = useState([]);
  const [labuddies, getLabuddies] = useState([]);
    useEffect(() => {
      getUserMetadata();
      fetchLabuddies();
    }, []);

    async function getUserMetadata() {
      const { data: user , error: userError} = await supabase.auth.getUser();

        if (userError) {
            console.error('Error fetching data:', userError);
        } else {
            // Handle the case where data might be null
            setMetadata(user?.user || []);
            console.log('metadata is ', {metadata});
        }
    }
    async function fetchLabuddies() {
      const { data: userdata, error: userError } = await supabase.auth.getUser();
      const { data: baskets, error :networkError } = await supabase
      .from('baskets')
      .select()
      .eq('id', userdata?.user?.id)

        if (networkError || userError) {
            console.error('Error fetching data:', networkError);
            console.log(networkError)
        } else {
            // Handle the case where data might be null
            getLabuddies(baskets|| []);
            console.log(userdata?.user?.id)
            console.log(baskets)
        }
    }
  return (
    <GluestackUIProvider config={config}>
      <View style={styles.container}>
        <Box w="$200" p="$4" borderWidth="$1"
            borderRadius="$lg"
            borderColor="$borderLight300">
          <VStack space="xl">
            <Heading>{metadata?.user_metadata?.first_name}'s Labuddies</Heading>
            {labuddies.length > 0 ? (
              <LabuddyCard labuddy={labuddies[0]} />
            ) : (
              <Text>No Labuddies found</Text>
            )}
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
});
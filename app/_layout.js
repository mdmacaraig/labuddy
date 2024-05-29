import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack screenOptions={{
    headerStyle: {
      backgroundColor: '#028391',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}>
    <Stack.Screen name="index" options={{title: 'Sign Up'}} />
    <Stack.Screen name="Dashboard" options={{headerLeft: () => null}} />
    <Stack.Screen name="labuddydetails" options={{title: "Labuddy Details"}} />
  </Stack>; 
}

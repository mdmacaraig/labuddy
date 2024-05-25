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
    <Stack.Screen name="index" options={{title: 'Labuddy'}} />
  </Stack>; 
}

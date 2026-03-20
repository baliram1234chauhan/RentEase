
// import { Stack } from 'expo-router';

// export default function RootLayout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="index" />
//       <Stack.Screen name="login" />
//       <Stack.Screen name="dashboard" />
//       <Stack.Screen name="create" />
//       <Stack.Screen name="list" />
//       <Stack.Screen name="profile" />
//       <Stack.Screen name="renewals" />
//       <Stack.Screen name="upload" />
//       <Stack.Screen name="details/[id]" />
//     </Stack>
//   
// }



import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="create" />
      <Stack.Screen name="list" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="renewals" />
      <Stack.Screen name="upload" />
      <Stack.Screen name="details/[id]" />
    </Stack>
  );
}
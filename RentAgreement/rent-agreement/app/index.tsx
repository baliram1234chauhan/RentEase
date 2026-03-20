// import React, { useState } from 'react';
// import { 
//   StyleSheet, Text, View, TextInput, TouchableOpacity, 
//   ScrollView, Alert, KeyboardAvoidingView, Platform 
// } from 'react-native';

// export default function RentForm() {
//   const [ownerName, setOwnerName] = useState('');
//   const [tenantName, setTenantName] = useState('');
//   const [rentAmount, setRentAmount] = useState('');
//   const [address, setAddress] = useState('');

//   const handleSubmission = async () => {
//     if (!ownerName || !tenantName || !rentAmount || !address) {
//       Alert.alert("Error", "Kripya saari details bharein!");
//       return;
//     }
//     Alert.alert("Success", "Abhi hum backend connect karenge!");
//   };

//   return (
//     <KeyboardAvoidingView 
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={styles.container}
//     >
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Rent Agreement</Text>
//           <Text style={styles.headerSub}>Agent Portal</Text>
//         </View>

//         <View style={styles.form}>
//           <Text style={styles.label}>Owner Name</Text>
//           <TextInput style={styles.input} placeholder="Owner Name" onChangeText={setOwnerName} />

//           <Text style={styles.label}>Tenant Name</Text>
//           <TextInput style={styles.input} placeholder="Your Name" onChangeText={setTenantName} />

//           <Text style={styles.label}>Rent (₹)</Text>
//           <TextInput style={styles.input} placeholder="15000" keyboardType="numeric" onChangeText={setRentAmount} />

//           <Text style={styles.label}>Address</Text>
//           <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} onChangeText={setAddress} />

//           <TouchableOpacity style={styles.button} onPress={handleSubmission}>
//             <Text style={styles.buttonText}>Submit Data</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f4f7f6' },
//   scrollContainer: { padding: 20 },
//   header: { marginTop: 60, marginBottom: 30, alignItems: 'center' },
//   headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#2c3e50' },
//   headerSub: { fontSize: 16, color: '#7f8c8d' },
//   form: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 4 },
//   label: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
//   input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15 },
//   textArea: { height: 80, textAlignVertical: 'top' },
//   button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
//   buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
// });








// import { Redirect } from 'expo-router';
// import { Href } from 'expo-router'; // Import Href type

// export default function Index() {
//   // Abhi ke liye false rakhein taaki login screen dikhe
//   const isLoggedIn = false; 

//   // TypeScript error fix karne ke liye 'as Href' use kiya hai
//   return isLoggedIn ? 
//     <Redirect href={"/dashboard" as Href} /> : 
//     <Redirect href={"/login" as Href} />;
// }

//   pppppppppppppp



// import { Redirect } from 'expo-router';

// export default function Index() {
//   const isLoggedIn = false;
//   return isLoggedIn
//     ? <Redirect href="/dashboard" />
//     : <Redirect href="/login" />;
// }


import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('token').then(t => {
      setLogged(!!t);
      setReady(true);
    });
  }, []);

  if (!ready) return null;

  return logged ? <Redirect href="/dashboard" /> : <Redirect href="/login" />;
}






import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateAgreement() {
  const router = useRouter();

  // --- States ---
  const [owner, setOwner] = useState({ name: '', mobile: '', aadhaar: '' });
  const [tenant, setTenant] = useState({ name: '', mobile: '', aadhaar: '' });
  const [property, setProperty] = useState({ address: '', city: '', type: '' });
  const [agreement, setAgreement] = useState({
    rent: '',
    deposit: '',
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default 1 year later
  });

  // Date Picker visibility states
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  // Helper function to format date for display and backend
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const handleSubmit = () => {
    if (!owner.name || !tenant.name || !property.address || !agreement.rent) {
      Alert.alert("Error", "Kripya zaroori details bharein!");
      return;
    }

    router.push({
      pathname: '/upload',
      params: {
        o_n: owner.name, o_m: owner.mobile, o_a: owner.aadhaar,
        t_n: tenant.name, t_m: tenant.mobile, t_a: tenant.aadhaar,
        addr: property.address, city: property.city, p_type: property.type,
        rent: agreement.rent, dep: agreement.deposit,
        s_d: formatDate(agreement.startDate),
        e_d: formatDate(agreement.endDate)
      }
    } as any);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* Header Gradient */}
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agreement Details</Text>
        <View style={{width: 40}} />
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          
          {/* OWNER SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
               <Ionicons name="person" size={20} color="#4f46e5" />
               <Text style={styles.sectionTitle}>Owner Information</Text>
            </View>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#94a3b8" onChangeText={(t) => setOwner({ ...owner, name: t })} />
            <TextInput style={styles.input} placeholder="Mobile Number" keyboardType="phone-pad" placeholderTextColor="#94a3b8" onChangeText={(t) => setOwner({ ...owner, mobile: t })} />
            <TextInput style={styles.input} placeholder="Aadhaar Number" keyboardType="numeric" placeholderTextColor="#94a3b8" onChangeText={(t) => setOwner({ ...owner, aadhaar: t })} />
          </View>

          {/* TENANT SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
               <Ionicons name="people" size={20} color="#10b981" />
               <Text style={styles.sectionTitle}>Tenant Information</Text>
            </View>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#94a3b8" onChangeText={(t) => setTenant({ ...tenant, name: t })} />
            <TextInput style={styles.input} placeholder="Mobile Number" keyboardType="phone-pad" placeholderTextColor="#94a3b8" onChangeText={(t) => setTenant({ ...tenant, mobile: t })} />
            <TextInput style={styles.input} placeholder="Aadhaar Number" keyboardType="numeric" placeholderTextColor="#94a3b8" onChangeText={(t) => setTenant({ ...tenant, aadhaar: t })} />
          </View>

          {/* PROPERTY SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
               <Ionicons name="home" size={20} color="#f59e0b" />
               <Text style={styles.sectionTitle}>Property Details</Text>
            </View>
            <TextInput style={styles.input} placeholder="Address" placeholderTextColor="#94a3b8" onChangeText={(t) => setProperty({ ...property, address: t })} />
            <View style={styles.row}>
                <TextInput style={[styles.input, {flex:1, marginRight:10}]} placeholder="City" placeholderTextColor="#94a3b8" onChangeText={(t) => setProperty({ ...property, city: t })} />
                <TextInput style={[styles.input, {flex:1}]} placeholder="Type (1BHK)" placeholderTextColor="#94a3b8" onChangeText={(t) => setProperty({ ...property, type: t })} />
            </View>
          </View>

          {/* AGREEMENT SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
               <Ionicons name="document-text" size={20} color="#ef4444" />
               <Text style={styles.sectionTitle}>Rent & Duration</Text>
            </View>
            <View style={styles.row}>
                <TextInput style={[styles.input, {flex:1, marginRight:10}]} placeholder="Rent" keyboardType="numeric" placeholderTextColor="#94a3b8" onChangeText={(t) => setAgreement({ ...agreement, rent: t })} />
                <TextInput style={[styles.input, {flex:1}]} placeholder="Deposit" keyboardType="numeric" placeholderTextColor="#94a3b8" onChangeText={(t) => setAgreement({ ...agreement, deposit: t })} />
            </View>

            {/* DATE PICKERS */}
            <Text style={styles.dateLabel}>Start Date</Text>
            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowStart(true)}>
              <Text style={styles.dateText}>{formatDate(agreement.startDate)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#4f46e5" />
            </TouchableOpacity>

            <Text style={styles.dateLabel}>End Date</Text>
            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowEnd(true)}>
              <Text style={styles.dateText}>{formatDate(agreement.endDate)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#4f46e5" />
            </TouchableOpacity>
          </View>

          {/* Date Picker Components */}
          {showStart && (
            <DateTimePicker
              value={agreement.startDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStart(false);
                if (date) setAgreement({...agreement, startDate: date});
              }}
            />
          )}
          {showEnd && (
            <DateTimePicker
              value={agreement.endDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEnd(false);
                if (date) setAgreement({...agreement, endDate: date});
              }}
            />
          )}

          {/* Next Button */}
          <TouchableOpacity activeOpacity={0.8} style={styles.submitBtn} onPress={handleSubmit}>
            <LinearGradient colors={['#4f46e5', '#3b82f6']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.gradientBtn}>
               <Text style={styles.btnText}>Next: Upload Documents</Text>
               <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={{height: 50}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  backBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  scrollContainer: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  row: { flexDirection: 'row' },
  dateLabel: { fontSize: 13, color: '#64748b', marginBottom: 5, marginLeft: 5, fontWeight: '600' },
  datePickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dateText: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
  submitBtn: { borderRadius: 15, overflow: 'hidden', elevation: 8, shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10, marginTop: 10 },
  gradientBtn: { padding: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
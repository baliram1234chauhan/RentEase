
//
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { BASE_URL } from '../constants/api';

const { width } = Dimensions.get('window');

export default function UploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);

  // Documents state
  const [docs, setDocs] = useState({
    aadhaar: null as string | null,
    pan: null as string | null,
    property: null as string | null,
  });

  // Pick image logic (Unchanged)
  const pickImage = async (
    type: 'aadhaar' | 'pan' | 'property',
    useCamera: boolean
  ) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Denied',
        `Hume aapke ${useCamera ? 'Camera' : 'Gallery'} ki permission chahiye.`
      );
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });

    if (!result.canceled) {
      setDocs({ ...docs, [type]: result.assets[0].uri });
    }
  };

  const getMimeType = (uri: string) => {
    const ext = uri.split('.').pop();
    return ext === 'png' ? 'image/png' : 'image/jpeg';
  };

  // FINAL SUBMIT (Unchanged Logic)
  const handleFinalSubmit = async () => {
    if (!docs.aadhaar || !docs.pan || !docs.property) {
      Alert.alert(
        'Incomplete Documents',
        'Kripya Aadhaar, PAN aur Property teeno documents upload karein.'
      );
      return;
    }

    setLoading(true);

    const formData = new FormData();

    // Appending Data
    formData.append('owner_name', params.o_n as string);
    formData.append('owner_mobile', params.o_m as string);
    formData.append('owner_aadhaar', params.o_a as string);
    formData.append('tenant_name', params.t_n as string);
    formData.append('tenant_mobile', params.t_m as string);
    formData.append('tenant_aadhaar', params.t_a as string);
    formData.append('address', params.addr as string);
    formData.append('city', (params.city as string) || 'N/A');
    formData.append('prop_type', (params.p_type as string) || 'Residential');
    formData.append('rent', params.rent as string);
    formData.append('deposit', (params.dep as string) || '0');
    formData.append('start_date', (params.s_d as string) || '2026-01-01');
    formData.append('end_date', (params.e_d as string) || '2027-01-01');

    // Appending Files
    formData.append('aadhaar_file', {
      uri: docs.aadhaar,
      name: 'aadhaar.jpg',
      type: getMimeType(docs.aadhaar),
    } as any);

    formData.append('pan_file', {
      uri: docs.pan,
      name: 'pan.jpg',
      type: getMimeType(docs.pan),
    } as any);

    try {
      const response = await fetch(`${BASE_URL}/agreements/create-full`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success 🎉', 'Agreement aur documents successfully save ho gaye!');
        router.replace('/list');
      } else {
        Alert.alert('Backend Error', JSON.stringify(result.detail));
      }
    } catch (error) {
      Alert.alert('Network Error', 'Server se connect nahi ho pa raha. Internet check karein.');
    } finally {
      setLoading(false);
    }
  };

  // Modern Upload Box Component
  const UploadBox = ({ label, type, icon }: { label: string; type: 'aadhaar' | 'pan' | 'property', icon: any }) => {
    const hasImage = !!docs[type];

    return (
      <View style={styles.uploadCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerTitleRow}>
            <Ionicons name={icon} size={20} color="#4f46e5" />
            <Text style={styles.cardLabel}>{label}</Text>
          </View>
          {hasImage && <Ionicons name="checkmark-circle" size={20} color="#10b981" />}
        </View>

        {hasImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: docs[type]! }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => setDocs({...docs, [type]: null})}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.dashedArea}>
            <Ionicons name="cloud-upload-outline" size={40} color="#94a3b8" />
            <Text style={styles.dashedText}>Upload document here</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.camBtn, hasImage && styles.btnDisabled]} 
            onPress={() => pickImage(type, true)}
            disabled={hasImage}
          >
            <Ionicons name="camera-outline" size={18} color={hasImage ? "#94a3b8" : "#fff"} />
            <Text style={[styles.btnText, hasImage && {color: '#94a3b8'}]}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.galBtn, hasImage && styles.btnDisabled]} 
            onPress={() => pickImage(type, false)}
            disabled={hasImage}
          >
            <Ionicons name="image-outline" size={18} color={hasImage ? "#94a3b8" : "#fff"} />
            <Text style={[styles.btnText, hasImage && {color: '#94a3b8'}]}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* ---------- HEADER ---------- */}
      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.headerGradient}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Step 2 of 2</Text>
          <View style={{ width: 40 }} />
        </View>
        <Text style={styles.headerSubtitle}>Upload Required Documents</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </LinearGradient>

      {/* ---------- CONTENT ---------- */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color="#16a34a" />
          <Text style={styles.infoText}>All documents are securely encrypted.</Text>
        </View>

        <UploadBox label="Aadhaar Card (Front & Back)" type="aadhaar" icon="id-card-outline" />
        <UploadBox label="PAN Card" type="pan" icon="card-outline" />
        <UploadBox label="Property Index II / Light Bill" type="property" icon="home-outline" />

        <TouchableOpacity 
          style={[styles.submitMainBtn, (!docs.aadhaar || !docs.pan || !docs.property) && {opacity: 0.6}]} 
          onPress={handleFinalSubmit}
          disabled={loading}
        >
          <LinearGradient colors={['#4f46e5', '#3b82f6']} style={styles.gradientBtn}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Submit Agreement</Text>
                <Ionicons name="checkmark-done" size={20} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
  headerTitle: { fontSize: 16, color: '#cbd5e1', fontWeight: '600' },
  headerSubtitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 15 },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 20 },
  progressFill: { height: '100%', width: '100%', backgroundColor: '#10b981', borderRadius: 3 }, // 100% because it's step 2
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 20 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 8
  },
  infoText: { color: '#16a34a', fontSize: 13, fontWeight: '500' },
  
  // Card Styles
  uploadCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  
  dashedArea: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#f8fafc'
  },
  dashedText: { color: '#94a3b8', marginTop: 8, fontSize: 13, fontWeight: '500' },
  
  previewContainer: { position: 'relative', marginBottom: 15 },
  previewImage: { width: '100%', height: 160, borderRadius: 12 },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    borderRadius: 20,
  },
  
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  camBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5', paddingVertical: 12, borderRadius: 12, gap: 6 },
  galBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 12, gap: 6 },
  btnDisabled: { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  submitMainBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden', elevation: 4 },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10
  },
  submitBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
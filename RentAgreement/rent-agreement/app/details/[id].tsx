

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BASE_URL } from '../../constants/api';

/* ✅ PROJECT STATUS FLOW */
const NEXT_STATUS: Record<string, string | null> = {
  DRAFT: 'IN_PROGRESS',
  IN_PROGRESS: 'KYC_COMPLETE',
  KYC_COMPLETE: 'FINALIZED',
  FINALIZED: null
};

export default function AgreementDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchDetails = () => {
    fetch(`${BASE_URL}/agreements/${id}`)
      .then(res => res.json())
      .then(json => setData(json))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const updateStatus = async () => {
    if (!data || !data.details) return;

    const current = data.details.status;
    const next = NEXT_STATUS[current];

    if (!next) {
      Alert.alert('Info', 'Agreement already finalized');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/agreements/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: next })
      });

      if (res.ok) {
        Alert.alert('Success', `Status updated to ${next}`);
        fetchDetails();
      }
    } catch {
      Alert.alert('Error', 'Server not reachable');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Text>No data found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={{ color: '#1a73e8' }}>← Back to List</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Agreement #{id}</Text>

        <Text style={styles.info}>Owner: {data.details.owner_name}</Text>
        <Text style={styles.info}>Tenant: {data.details.tenant_name}</Text>
        <Text style={styles.info}>Rent: ₹{data.details.rent_amount}</Text>
        <Text style={styles.info}>
          Duration: {data.details.start_date} to {data.details.end_date}
        </Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusValue}>{data.details.status}</Text>
        </View>

        {NEXT_STATUS[data.details.status] && (
          <TouchableOpacity
            style={styles.updateBtn}
            onPress={updateStatus}
            disabled={updating}
          >
            <Text style={styles.updateBtnText}>
              Move to {NEXT_STATUS[data.details.status]}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>Uploaded Documents</Text>

      {data.documents?.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data.documents.map((doc: any, index: number) => (
            <View key={index} style={styles.docBox}>
              <Image
                source={{ uri: `${BASE_URL}${doc.file_path}` }}
                style={styles.image}
              />
              <Text style={styles.docLabel}>{doc.doc_type}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={{ color: 'gray' }}>No documents uploaded</Text>
      )}
    </ScrollView>
  );
}

/* STYLES — SAME AS YOUR ORIGINAL */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7f6', padding: 20 },
  backBtn: { marginTop: 30, marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 4 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1a73e8' },
  info: { fontSize: 16, marginBottom: 8, color: '#444' },
  statusBox: { marginTop: 15, padding: 10, borderRadius: 8, backgroundColor: '#eef2f7' },
  statusLabel: { fontSize: 12, color: '#666' },
  statusValue: { fontSize: 16, fontWeight: 'bold' },
  updateBtn: { marginTop: 15, backgroundColor: '#1a73e8', padding: 14, borderRadius: 10, alignItems: 'center' },
  updateBtnText: { color: '#fff', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 20 },
  docBox: { marginRight: 15, alignItems: 'center' },
  image: { width: 150, height: 200, borderRadius: 10, backgroundColor: '#ddd' },
  docLabel: { marginTop: 5, fontWeight: 'bold', color: '#666' }
});
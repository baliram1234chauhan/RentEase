
//
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from '../constants/api';

/* ✅ PROJECT STATUS THEME (UI SAME) */
const statusTheme: Record<
  string,
  { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  DRAFT: { bg: '#f1f5f9', text: '#64748b', icon: 'document-text-outline' },
  IN_PROGRESS: { bg: '#fff7ed', text: '#ea580c', icon: 'sync-circle-outline' },
  KYC_COMPLETE: { bg: '#eff6ff', text: '#2563eb', icon: 'checkmark-circle-outline' },
  FINALIZED: { bg: '#f0fdf4', text: '#16a34a', icon: 'ribbon-outline' }
};

export default function ListScreen() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await fetch(`${BASE_URL}/agreements/all`);
      const json = await res.json();
      setData(json);
      setFilteredData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredData(data);
      return;
    }

    const q = text.toLowerCase();
    setFilteredData(
      data.filter((item) =>
        item.owner_name?.toLowerCase().includes(q) ||
        item.tenant_name?.toLowerCase().includes(q) ||
        item.address?.toLowerCase().includes(q)
      )
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const theme = statusTheme[item.status] || statusTheme.DRAFT;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.card}
        onPress={() => router.push(`/details/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.ownerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.owner_name?.charAt(0) || 'O'}
              </Text>
            </View>
            <View>
              <Text style={styles.ownerLabel}>Property Owner</Text>
              <Text style={styles.ownerName}>{item.owner_name}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: theme.bg }]}>
            <Ionicons name={theme.icon} size={14} color={theme.text} />
            <Text style={[styles.statusText, { color: theme.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={16} color="#64748b" />
            <Text style={styles.detailText} numberOfLines={1}>
              Tenant: {item.tenant_name}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="wallet-outline" size={16} color="#10b981" />
            <Text style={styles.amountText}>
              ₹ {item.rent_amount}
            </Text>
          </View>
        </View>

        <View style={[styles.detailItem, { marginTop: 8 }]}>
          <Ionicons name="location-outline" size={16} color="#64748b" />
          <Text style={styles.addressText} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Agreements</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search owner, tenant, address..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={styles.loadingText}>Fetching database...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchData();
                }}
              />
            }
          />
        )}
      </View>
    </View>
  );
}

/* 🔽 STYLES — EXACTLY SAME AS YOUR UI */
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1e293b', marginLeft: 10 },
  contentContainer: { flex: 1, paddingHorizontal: 20, marginTop: 10 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  ownerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  ownerLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
  ownerName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 4 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  detailText: { fontSize: 14, color: '#334155' },
  amountText: { fontSize: 14, fontWeight: 'bold', color: '#10b981' },
  addressText: { fontSize: 13, color: '#64748b', lineHeight: 18 },
  centerContainer: { alignItems: 'center', marginTop: 100 },
  loadingText: { marginTop: 15, color: '#64748b' }
});









// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';

// export default function ListScreen() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchData = async () => {
//     try {
//       const response = await fetch('http://192.168.1.108:8000/agreements/all');
//       const json = await response.json();
//       setData(json);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Rental Agreements</Text>
//       {loading ? <ActivityIndicator size="large" /> : (
//         <FlatList
//           data={data}
//           keyExtractor={(item: any) => item.id.toString()}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchData();}} />}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.owner}>Owner: {item.owner_name}</Text>
//               <Text>Tenant: {item.tenant_name}</Text>
//               <Text style={styles.rent}>Rent: ₹{item.rent_amount}</Text>
//               <Text style={{color: 'gray', fontSize: 12}}>{item.address}</Text>
//             </View>
//           )}
//           ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>Koi data nahi mila.</Text>}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
//   title: { fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
//   card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, elevation: 3 },
//   owner: { fontSize: 18, fontWeight: 'bold', color: '#1a73e8' },
//   rent: { fontWeight: 'bold', color: '#2ecc71', marginTop: 5 }
// });

// pppppppppppppppppp





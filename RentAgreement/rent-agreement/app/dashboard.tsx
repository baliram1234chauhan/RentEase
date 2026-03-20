
//
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Linking
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from '../constants/api';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    renewals: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/dashboard/stats`)
      .then(res => res.json())
      .then(json => {
        setStats({
          total: json.total_agreements,
          pending: json.pending_agreements,
          completed: json.completed_agreements,
          renewals: json.renewals_due
        });
      })
      .catch(err => console.log('Dashboard stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* ---------- HEADER ---------- */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.headerTitle}>Agent Dashboard</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => router.push('/renewals')}
              style={styles.glassBtn}
            >
              <Ionicons name="notifications-outline" size={22} color="#fff" />
              {stats.renewals > 0 && <View style={styles.badge} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={styles.glassBtn}
            >
              <Ionicons name="person-circle-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ---------- STATS ---------- */}
        <View style={styles.statsContainer}>
          <View style={styles.row}>
            <StatCard label="Total Agreements" num={stats.total} icon="document-text" color="#1a73e8" loading={loading} />
            <StatCard label="Pending" num={stats.pending} icon="time" color="#fbbc04" loading={loading} />
          </View>

          <View style={styles.row}>
            <StatCard label="Completed" num={stats.completed} icon="checkmark-done" color="#34a853" loading={loading} />
            <StatCard label="Renewals Due" num={stats.renewals} icon="alert-circle" color="#ea4335" loading={loading} />
          </View>
        </View>

        {/* ---------- QUICK ACTIONS ---------- */}
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.mainActionBtn}
            onPress={() => router.push('/create')}
          >
            <LinearGradient colors={['#1a73e8', '#0d47a1']} style={styles.fullBtnGradient}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.btnText}>Create New Agreement</Text>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.secondaryActionBtn}
            onPress={() => router.push('/list')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="list" size={22} color="#1a73e8" />
            </View>
            <Text style={styles.secondaryBtnText}>View All Database Lists</Text>
            <Ionicons name="arrow-forward" size={18} color="#999" />
          </TouchableOpacity>
        </View>

        {/* ---------- TELEGRAM BOT BUTTON ---------- */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Linking.openURL('https://t.me/rentAgreement_bot')}
          style={styles.telegramBox}
        >
          <View style={styles.telegramLeft}>
            <View style={styles.pulseDot} />
            {/* FIXED ICON */}
            <Ionicons name="paper-plane-outline" size={20} color="#229ED9" />
            <Text style={styles.telegramText}>
              Telegram Bot: <Text style={styles.telegramOnline}>Online</Text>
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, num, icon, color, loading }: any) {
  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={styles.cardNum}>{loading ? '...' : num}</Text>
      </View>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10
  },

  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerIcons: { flexDirection: 'row', gap: 12 },

  glassBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 15 },
  badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, backgroundColor: '#ff4d4d', borderRadius: 4 },

  scrollContainer: { flex: 1, paddingHorizontal: 20, marginTop: 20 },
  statsContainer: { marginBottom: 25 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },

  card: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 20, borderTopWidth: 4, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardNum: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  cardLabel: { fontSize: 13, color: '#64748b' },

  actionSection: { marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },

  mainActionBtn: { borderRadius: 20, overflow: 'hidden', marginBottom: 15 },
  fullBtnGradient: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16, flex: 1 },

  secondaryActionBtn: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },

  iconCircle: { backgroundColor: '#eff6ff', padding: 10, borderRadius: 12, marginRight: 15 },
  secondaryBtnText: { flex: 1, fontWeight: '600', color: '#334155' },

  telegramBox: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    elevation: 3
  },

  telegramLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  telegramText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  telegramOnline: { color: '#16a34a', fontWeight: 'bold' },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#34a853' }
});
















// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { useRouter } from 'expo-router';
// import { BASE_URL } from '../constants/api';

// export default function Dashboard() {
//   const r = useRouter();
//   const [s, setS] = useState({ total:0, pending:0, completed:0, renewals:0 });

//   useEffect(() => {
//     fetch(`${BASE_URL}/dashboard/stats`)
//       .then(r=>r.json())
//       .then(d=>setS({
//         total:d.total_agreements,
//         pending:d.pending_agreements,
//         completed:d.completed_agreements,
//         renewals:d.renewals_due
//       }));
//   }, []);

//   return (
//     <View style={{padding:20}}>
//       <Text>Total: {s.total}</Text>
//       <Text>Pending: {s.pending}</Text>
//       <Text>Completed: {s.completed}</Text>
//       <Text>Renewals: {s.renewals}</Text>

//       <TouchableOpacity onPress={()=>r.push('/create')}>
//         <Text>Create Agreement</Text>
//       </TouchableOpacity>

//       <TouchableOpacity onPress={()=>r.push('/list')}>
//         <Text>View List</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
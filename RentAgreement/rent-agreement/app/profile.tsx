






import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, StatusBar, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();

  const agent = {
    name: "Krishna Chauhan",
    role: "Senior Field Agent", // Detail added for better UI look
    email: "krishnachauhanmailme494@gmail.com",
    id: "AGT-01",
    office: "Thane Branch"
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Kya aap logout karna chahte hain?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => router.replace('/login')
        }
      ]
    );
  };

  // Reusable Component for Info Rows with Icons
  const ProfileInfoBox = ({ icon, label, value, color }: any) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* ---------- HEADER SECTION ---------- */}
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.headerGradient}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={['#4f46e5', '#3b82f6']}
            style={styles.avatarCircle}
          >
            <Text style={styles.avatarText}>
              {agent.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </LinearGradient>
          <View style={styles.onlineStatus} />
        </View>

        <Text style={styles.agentName}>{agent.name}</Text>
        <Text style={styles.agentRole}>{agent.role || 'Agent'}</Text>
      </LinearGradient>

      {/* ---------- INFO SECTION ---------- */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        <View style={styles.infoCard}>
          <Text style={styles.cardHeader}>Personal Information</Text>
          
          <ProfileInfoBox 
            icon="finger-print" 
            label="Agent ID" 
            value={agent.id} 
            color="#4f46e5" 
          />
          <View style={styles.divider} />
          
          <ProfileInfoBox 
            icon="business" 
            label="Branch Office" 
            value={agent.office} 
            color="#10b981" 
          />
          <View style={styles.divider} />
          
          <ProfileInfoBox 
            icon="mail" 
            label="Email Address" 
            value={agent.email} 
            color="#f59e0b" 
          />
        </View>

        {/* ---------- ACTIONS ---------- */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="settings-outline" size={22} color="#64748b" />
            <Text style={styles.actionText}>App Settings</Text>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionItem, styles.logoutAction]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={[styles.actionText, {color: '#ef4444'}]}>Logout Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>App Build Version 1.0.2 (Stable)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8fafc' },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 12,
  },
  avatarWrapper: {
    marginBottom: 15,
    position: 'relative'
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: '800' },
  onlineStatus: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    backgroundColor: '#10b981',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#0f172a'
  },
  agentName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  agentRole: { fontSize: 14, color: '#94a3b8', marginTop: 4, fontWeight: '500' },
  scrollArea: { flex: 1, paddingHorizontal: 20, marginTop: -25 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  cardHeader: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  infoValue: { fontSize: 15, color: '#1e293b', fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginLeft: 60 },
  actionContainer: { marginTop: 20 },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  actionText: { marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#334155' },
  logoutAction: { borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  versionText: { textAlign: 'center', color: '#cbd5e1', fontSize: 12, marginVertical: 30 }
});
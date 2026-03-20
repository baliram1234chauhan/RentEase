





import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from '../constants/api';

export default function RenewalScreen() {
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH RENEWALS FROM BACKEND ---------------- */
  useEffect(() => {
    fetch(`${BASE_URL}/agreements/renewals`)
      .then(res => res.json())
      .then(json => setData(Array.isArray(json) ? json : []))
      .catch(() => Alert.alert('Error', 'Unable to load renewals'))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- URGENCY COLOR LOGIC ---------------- */
  const getUrgencyColor = (days: number) => {
    if (days <= 7) return '#ef4444'; // Critical
    return '#f59e0b';               // Warning
  };

  /* ---------------- RENDER CARD ---------------- */
  const renderRenewalItem = ({ item }: { item: any }) => {
    const statusColor = getUrgencyColor(item.days_left);

    return (
      <View style={styles.renewalCard}>
        <View style={[styles.cardAccent, { backgroundColor: statusColor }]} />

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.tenantInfo}>
              <View
                style={[
                  styles.avatarSmall,
                  { backgroundColor: statusColor + '15' },
                ]}
              >
                <Text style={[styles.avatarText, { color: statusColor }]}>
                  {item.tenant_name?.charAt(0) || 'T'}
                </Text>
              </View>
              <View>
                <Text style={styles.tenantName}>{item.tenant_name}</Text>
                <Text style={styles.agreementId}>
                  Agreement ID: #{item.id}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.daysBadge,
                { backgroundColor: statusColor + '15' },
              ]}
            >
              <Text style={[styles.daysText, { color: statusColor }]}>
                {item.days_left} Days Left
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <View style={styles.dateInfo}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#64748b"
              />
              <Text style={styles.dateLabel}>Expiry:</Text>
              <Text style={styles.dateValue}>{item.end_date}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.reminderBtn, { borderColor: statusColor }]}
            onPress={() =>
              Alert.alert(
                'Reminder Sent',
                `${item.tenant_name} ko renewal reminder bhej diya gaya hai.`
              )
            }
          >
            <Ionicons
              name="logo-whatsapp"
              size={18}
              color={statusColor}
            />
            <Text
              style={[styles.reminderBtnText, { color: statusColor }]}
            >
              Send WhatsApp Reminder
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ---------------- EMPTY COMPONENT (FIXED) ---------------- */
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="checkmark-circle-outline"
          size={80}
          color="#cbd5e1"
        />
        <Text style={styles.emptyText}>
          All agreements are up to date!
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* ---------- HEADER ---------- */}
      <LinearGradient
        colors={['#b91c1c', '#ef4444']}
        style={styles.headerGradient}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Renewals Due</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.headerSubtitle}>
          Action required for expiring agreements
        </Text>
      </LinearGradient>

      {/* ---------- CONTENT ---------- */}
      <View style={styles.contentContainer}>
        <View style={styles.summaryBanner}>
          <Ionicons
            name="information-circle"
            size={20}
            color="#b45309"
          />
          <Text style={styles.summaryText}>
            Showing{' '}
            <Text style={{ fontWeight: 'bold' }}>{data.length}</Text>{' '}
            agreements expiring soon.
          </Text>
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRenewalItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8fafc' },

  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },

  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 12,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },

  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
    gap: 8,
  },

  summaryText: {
    color: '#b45309',
    fontSize: 13,
  },

  renewalCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    flexDirection: 'row',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    overflow: 'hidden',
  },

  cardAccent: { width: 6 },

  cardBody: { flex: 1, padding: 15 },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  avatarSmall: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontWeight: '800',
    fontSize: 18,
  },

  tenantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },

  agreementId: {
    fontSize: 12,
    color: '#94a3b8',
  },

  daysBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  daysText: {
    fontSize: 11,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },

  detailsRow: {
    marginBottom: 15,
  },

  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dateLabel: {
    fontSize: 13,
    color: '#64748b',
  },

  dateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },

  reminderBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    backgroundColor: '#fff',
  },

  reminderBtnText: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 100,
  },

  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 10,
    fontWeight: '500',
  },
});
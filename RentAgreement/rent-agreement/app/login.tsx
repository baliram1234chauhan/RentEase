//
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BASE_URL } from '../constants/api';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || password.length < 6) {
      Alert.alert('Invalid Input', 'Email aur password sahi bharein (min 6 chars).');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.access_token);
        router.replace('/dashboard');
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Network Error', 'Backend server connect nahi ho pa raha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.blob, { top: -60, right: -60, backgroundColor: '#3b82f6' }]} />
      <View style={[styles.blob, { bottom: -100, left: -80, backgroundColor: '#1d4ed8', width: 300, height: 300 }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="home" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>Rent Agreement</Text>
          <Text style={styles.subtitle}>Agent Management Portal</Text>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.loginHeader}>Agent Login</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username / Email</Text>
            <View style={styles.inputBox}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="Enter email"
                placeholderTextColor="#64748b"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#64748b"
                secureTextEntry={secure}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Ionicons
                  name={secure ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.btnGradient}
              >
                <Text style={styles.loginBtnText}>SIGN IN</Text>
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 35,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  loginHeader: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 25,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  loginBtn: {
    height: 55,
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '../database/supabase';
import React, { useState } from 'react';

// Design System
const COLORS = {
  primary: '#2A003F',
  secondary: '#1A0029',
  dark: '#0D0014',
  accent: '#8B5CF6',
  border: '#4A4A4A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  cardBg: 'rgba(0, 0, 0, 0.6)',
  buttonBg: 'rgba(0, 0, 0, 0.6)',
  inputBg: '#1A1A1A',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TYPOGRAPHY = {
  title: { fontSize: 40, fontWeight: 'bold' },
  subtitle: { fontSize: 24, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
};

const AuthPage = () => {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const addUser = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Sign up error:", error);
        alert(`Error: ${error.message}`);
        return;
      }

      if (data?.user) {
        const { error: closetError } = await supabase
          .from("Closet")
          .insert([{ userid: data.user.id }]);

        if (closetError) {
          console.error("Closet creation error:", closetError);
        }

        alert("Account created! Please check your email to verify.");
        setIsSignUp(true);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Login failed:", error.message);
        alert(`Login failed: ${error.message}`);
        return;
      }

      if (data.user) {
        console.log("Logged in!", data.user);
        router.replace('/');
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary, COLORS.dark]}
      locations={[0.1, 0.5, 1]}
      start={{ x: 0.8, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Klozet</Text>
            <Text style={styles.subtitle}>Your Digital Closet</Text>
          </View>

          {/* Toggle Switch */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !isSignUp && styles.toggleButtonActive]}
              onPress={() => setIsSignUp(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleButton, isSignUp && styles.toggleButtonActive]}
              onPress={() => setIsSignUp(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {/* Auth Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isSignUp ? 'Welcome Back' : 'Create Account'}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email..."
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password..."
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={isSignUp ? signIn : addUser}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => setIsSignUp(!isSignUp)}
              activeOpacity={0.7}
            >
              <Text style={styles.switchModeText}>
                {isSignUp
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default AuthPage;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'black',
    borderRadius: 20,
    padding: SPACING.xs,
    marginBottom: SPACING.xl,
    alignSelf: 'center',
    width: 300,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  toggleTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  formTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    fontSize: 14,
  },
  input: {
    backgroundColor: COLORS.primary,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: COLORS.accent,
    borderWidth: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  switchModeText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
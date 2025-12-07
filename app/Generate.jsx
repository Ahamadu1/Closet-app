import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  Dimensions, SafeAreaView, StatusBar, ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import ViewShot from "react-native-view-shot";
import { supabase } from '../database/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 48;

// 👇 your local backend
const BG_API_URL = "http://192.168.1.17:3000/remove-background";

const COLORS = {
  primary: '#2A003F',
  secondary: '#1A0029',
  dark: '#0D0014',
  accent: '#8B5CF6',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  canvasBg: '#FFFFFF',
};

const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

const Generate = () => {
  const router = useRouter();
  const viewRef = useRef(null);

  const { topImg, bottomImg, shoeImg, otherImg } = useLocalSearchParams();

  // processed images (start as originals)
  const [processed, setProcessed] = useState({
    top: topImg || null,
    bottom: bottomImg || null,
    shoe: shoeImg || null,
    other: otherImg || null,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveEnabled, setSaveEnabled] = useState(false);

  // enable save button after 2.5s no matter what
  useEffect(() => {
    const t = setTimeout(() => setSaveEnabled(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // ---- background remover per image (safe, with fallback) ----
  const processImage = async (uri) => {
    if (!uri) return null;

    try {
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const response = await fetch(BG_API_URL, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result?.result) {
        return result.result; // processed URL
      }
    } catch (e) {
      console.log('BG remove failed, using original:', e);
    }

    // fallback to original
    return uri;
  };

  // process all selected images in parallel once
  useEffect(() => {
    const run = async () => {
      setIsProcessing(true);

      const [pTop, pBottom, pShoe, pOther] = await Promise.all([
        processImage(topImg),
        processImage(bottomImg),
        processImage(shoeImg),
        processImage(otherImg),
      ]);

      setProcessed({
        top: pTop,
        bottom: pBottom,
        shoe: pShoe,
        other: pOther,
      });

      setIsProcessing(false);
    };

    run();
  }, [topImg, bottomImg, shoeImg, otherImg]);

  // ---- upload captured image to Supabase (same idea as your old working code) ----
  const uploadImage = async (localUri) => {
    try {
      const fileExt = localUri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;
      const fileType = 'image/jpeg';
  
      // FIX: use "base64", NOT FileSystem.EncodingType.Base64
      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: "base64",
      });
  
      const arrayBuffer = decode(base64);
  
      const { error: uploadError } = await supabase.storage
        .from('outfits')
        .upload(fileName, arrayBuffer, {
          contentType: fileType,
        });
  
      if (uploadError) {
        console.log('Upload error:', uploadError);
        return null;
      }
  
      const { data: publicData } = supabase.storage
        .from('outfits')
        .getPublicUrl(fileName);
  
      return publicData?.publicUrl ?? null;
  
    } catch (e) {
      console.log('Upload image error:', e);
      return null;
    }
  };
  

  const capture = async () => {
    try {
      setIsSaving(true);

      // small delay to ensure layout is stable
      await new Promise((r) => setTimeout(r, 150));

      const capturedUri = await viewRef.current.capture({
        format: 'jpg',
        quality: 0.9,
        result: 'tmpfile',
      });

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert('Please log in first.');
        return;
      }

      const publicUrl = await uploadImage(capturedUri);

      if (!publicUrl) {
        alert('Failed to upload outfit image.');
        return;
      }

      const { data: closetData, error: closetError } = await supabase
        .from('Closet')
        .select('id')
        .eq('userid', user.id)
        .single();

      if (closetError || !closetData) {
        console.log('Closet error:', closetError);
        alert('Could not find your closet.');
        return;
      }

      const { error: insertError } = await supabase
        .from('outfits')
        .insert([{ link: publicUrl, closetid: closetData.id }]);

      if (insertError) {
        console.log('Insert error:', insertError);
        alert('Failed to save outfit.');
        return;
      }

      alert('Outfit saved!');
      router.push('/Fits');
    } catch (e) {
      console.log('Capture/save error:', e);
      alert('Something went wrong saving the outfit.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary, COLORS.dark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Klozet</Text>
          <Text style={styles.subtitle}>Create Outfit</Text>
        </View>

        {/* (Optional) top nav – you can add icons back if you want */}

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.processingText}>Removing backgrounds...</Text>
          </View>
        )}

        {/* Canvas */}
        <ViewShot ref={viewRef} style={styles.viewShot}>
          <View style={styles.canvas}>
            {processed.top && (
              <Image
                source={{ uri: processed.top }}
                style={styles.topImage}
                resizeMode="contain"
              />
            )}
            {processed.bottom && (
              <Image
                source={{ uri: processed.bottom }}
                style={styles.bottomImage}
                resizeMode="contain"
              />
            )}
            {processed.shoe && (
              <Image
                source={{ uri: processed.shoe }}
                style={styles.shoeImage}
                resizeMode="contain"
              />
            )}
            {processed.other && (
              <Image
                source={{ uri: processed.other }}
                style={styles.otherImage}
                resizeMode="contain"
              />
            )}
          </View>
        </ViewShot>

        {/* Save button – NOT dependent on BG API */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={capture}
          disabled={!saveEnabled || isSaving}
          style={[
            styles.saveButton,
            (!saveEnabled || isSaving) && styles.saveButtonDisabled,
          ]}
        >
          {isSaving ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.saveButtonText}>Save Outfit</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Generate;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.textSecondary,
    marginTop: 4,
    fontSize: 16,
  },
  viewShot: {
    alignItems: 'center',
    marginTop: 20,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE * 1.4,
    backgroundColor: COLORS.canvasBg,
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
  },
  topImage: {
    width: '100%',
    height: '35%',
  },
  bottomImage: {
    width: '100%',
    height: '35%',
    marginTop: 8,
  },
  shoeImage: {
    width: '60%',
    height: '15%',
    alignSelf: 'center',
    marginTop: 8,
  },
  otherImage: {
    width: 80,
    height: 80,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  processingOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    zIndex: 10,
    alignItems: 'center',
  },
  processingText: {
    color: COLORS.text,
    marginTop: 8,
  },
  saveButton: {
    marginTop: 24,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

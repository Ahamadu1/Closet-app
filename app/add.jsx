import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, SafeAreaView, StatusBar, Dimensions, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../database/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import DropDownPicker from "react-native-dropdown-picker";

const { width } = Dimensions.get('window');

// Design System
const COLORS = {
  primary: '#2A003F',
  secondary: '#1A0029',
  dark: '#0D0014',
  accent: '#8B5CF6',
  border: '#4A4A4A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  cardBg: 'rgba(0, 0, 0, 0.4)',
  buttonBg: 'rgba(0, 0, 0, 0.6)',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const TYPOGRAPHY = {
  title: { fontSize: 30, fontWeight: 'bold' },
  subtitle: { fontSize: 24, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
};

const Add = () => {
  const router = useRouter();
  const [selectedValue, setSelectedValue] = useState("Tops");
  const [showImg, setShowImg] = useState(false);
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);

  const addImg = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result);
        setShowImg(true);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      alert("Failed to pick image");
    }
  };

  const openCam = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Camera permission required');
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result);
        setShowImg(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Failed to open camera");
    }
  };

  const handleDelete = () => {
    setShowImg(false);
    setPhoto(null);
    setName('');
  };

  const editImg = async () => {
    if (!photo?.assets?.length) return;

    const currentUri = photo.assets[0].uri;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setPhoto(result);
      }
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

  const saveImg = async () => {
    if (!photo?.assets?.length) {
      alert("No photo selected");
      return;
    }

    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      
      const base64 = await FileSystem.readAsStringAsync(photo.assets[0].uri, {
        encoding: 'base64',
      });

      const folder = name || 'default';
      const filePath = `${name}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(selectedValue)
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert("Failed to upload image");
        return;
      }

      const { data: publicData } = supabase.storage
        .from(selectedValue)
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      const { data: closetData, error: closetError } = await supabase
        .from("Closet")
        .select("id")
        .eq("userid", user.id)
        .single();

      if (closetError) {
        console.error("Closet error:", closetError);
        alert("Failed to find closet");
        return;
      }

      const { error: insertError } = await supabase
        .from(selectedValue)
        .insert([{ 
          link: publicUrl, 
          name: folder, 
          closetid: closetData.id 
        }]);

      if (insertError) {
        console.error("Insert error:", insertError);
        alert("Failed to save to database");
        return;
      }

      alert("Item added successfully!");
      router.replace('/');
    } catch (error) {
      console.error("Save error:", error);
      alert("An error occurred");
    } finally {
      setUploading(false);
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

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Klozet</Text>
        </View>

        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/Fits')}
            activeOpacity={0.7}
          >
            <Text style={styles.navText}>Outfits</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/Favorites')}
            activeOpacity={0.7}
          >
            <Image source={heartlogo} style={styles.navIcon} />
            <Text style={styles.navText}>Favorites</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Content */}
        <View style={styles.content}>
          {showImg ? (
            <View style={styles.imagePreviewContainer}>
              <DropDownPicker
                open={open}
                value={selectedValue}
                items={[
                  { label: 'Tops', value: 'Tops' },
                  { label: 'Bottoms', value: 'Bottoms' },
                  { label: 'shoes', value: 'shoes' },
                  { label: 'Accessories', value: 'Accessories' }
                ]}
                setOpen={setOpen}
                setValue={setSelectedValue}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                textStyle={styles.dropdownText}
                zIndex={1000}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter a name..."
                placeholderTextColor={COLORS.textSecondary}
                onChangeText={setName}
                value={name}
              />

              <Image
                source={{ uri: photo.assets[0].uri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={editImg}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, styles.deleteButton]}
                  onPress={handleDelete}
                  activeOpacity={0.7}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, styles.saveButton]}
                onPress={saveImg}
                activeOpacity={0.7}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={COLORS.text} />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addPhotoCard}>
              <Text style={styles.cardTitle}>Add Photo</Text>

              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={openCam}
                activeOpacity={0.7}
              >
                <Text style={styles.addPhotoButtonText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addPhotoButton, styles.addPhotoButtonLast]}
                onPress={addImg}
                activeOpacity={0.7}
              >
                <Text style={styles.addPhotoButtonText}>Photo Library</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.bottomNavButton}
            onPress={() => router.push('/Calendar')}
            activeOpacity={0.7}
          >
            <Image source={calendarlogo} style={styles.bottomNavIcon} />
            <Text style={styles.bottomNavText}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomNavButton}
            onPress={() => router.push('/Add')}
            activeOpacity={0.7}
          >
            <Image source={pluslogo} style={styles.bottomNavIconLarge} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomNavButton}
            onPress={() => router.push('/Style')}
            activeOpacity={0.7}
          >
            <Image source={stlyelogo} style={styles.bottomNavIcon} />
            <Text style={styles.bottomNavText}>Style</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Add;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.text,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.text,
  },
  navText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  addPhotoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addPhotoButton: {
    backgroundColor: COLORS.buttonBg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  addPhotoButtonLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 0,
  },
  addPhotoButtonText: {
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: COLORS.buttonBg,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: SPACING.md,
    width: '100%',
  },
  dropdownContainer: {
    backgroundColor: COLORS.buttonBg,
    borderColor: COLORS.border,
  },
  dropdownText: {
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.buttonBg,
    color: COLORS.text,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 16,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  imagePreview: {
    width: width - (SPACING.lg * 2),
    height: 300,
    borderRadius: 16,
    backgroundColor: COLORS.cardBg,
    marginBottom: SPACING.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.buttonBg,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    borderColor: '#dc2626',
  },
  saveButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: COLORS.accent,
    width: '100%',
    paddingVertical: 16,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bottomNavButton: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bottomNavIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.text,
  },
  bottomNavIconLarge: {
    width: 40,
    height: 40,
    tintColor: COLORS.text,
  },
  bottomNavText: {
    fontSize: 12,
    color: COLORS.text,
  },
});
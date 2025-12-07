import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Animated, PanResponder, Dimensions, ScrollView, TextInput, SafeAreaView, StatusBar, ActivityIndicator, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { useRouter } from 'expo-router';
import { supabase } from '../database/supabase';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
const TABLE_MAP = {
  Tops: "tops",
  Bottoms: "bottoms",
  shoes: "shoes",
  Shoes: "shoes",
  Accessories: "accessories",
};


const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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

function DraggableThumb({ source, onDropTop, onDragStart, onDragEnd }) {
  const pan = useRef(new Animated.ValueXY()).current;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
        onDragStart();
      },

      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),

      onPanResponderRelease: (_e, gesture) => {
        pan.flattenOffset();
        onDropTop?.(source, gesture);
        onDragEnd();

        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          bounciness: 6,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[styles.thumbWrap, { transform: pan.getTranslateTransform() }]}
      {...responder.panHandlers}
    >
      <Image source={source} style={styles.thumb} />
    </Animated.View>
  );
}

function Sections({ onDropTop, section }) {
  const router = useRouter();
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [userImg, setUserImg] = useState([]);
  const { section: sectionFromRoute } = useLocalSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [clicked, setClicked] = useState(null);
  const activeSection = section ?? sectionFromRoute;
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef(null);

  const addFav = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      



const table = TABLE_MAP[activeSection];

if (!table) {
  console.error("Invalid section:", activeSection);
  return;
}

const { data: imgs, error } = await supabase
  .from(table)
  .select('link, name')
  .eq('closetid', userCloset.id);


      
      const { error: favError } = await supabase
        .from("Favorites")
        .insert([
          {
            link: clicked.link,
            name: clicked.name,
            closetid: closetData.id,
          }
        ]);

      if (!favError) {
        alert("Added to favorites!");
      }
    } catch (error) {
      console.error("Add favorite error:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const fileName = clicked.link.split("/").pop();
      
      const { error: storageError } = await supabase
        .storage
        .from(activeSection)
        .remove([`${clicked.name}/${fileName}`]);

      if (storageError) {
        console.log("Storage delete error:", storageError);
      }

      const { error: dbError } = await supabase
        .from(activeSection)
        .delete()
        .eq("link", clicked.link);

      if (dbError) {
        alert("Failed to delete item.");
        return;
      }

      alert("Deleted successfully.");
      setShowModal(false);
      setUserImg(prev => prev.filter(item => item.link !== clicked.link));
    } catch (e) {
      console.log("Delete error:", e);
    }
  };

  const handleEdit = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) return;

      const newImg = result.assets[0];
      const base64 = await FileSystem.readAsStringAsync(newImg.uri, {
        encoding: "base64",
      });

      const finalName = newName?.length > 0 ? newName : clicked.name;
      const newFilePath = `${finalName}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(activeSection)
        .upload(newFilePath, decode(base64), { contentType: "image/jpeg" });

      if (uploadError) {
        alert("Failed to upload.");
        return;
      }

      const { data: publicData } = supabase.storage
        .from(activeSection)
        .getPublicUrl(newFilePath);

      const newUrl = publicData.publicUrl;

      const oldFileName = clicked.link.split("/").pop();
      const oldFolderName = clicked.name;
      await supabase.storage
        .from(activeSection)
        .remove([`${oldFolderName}/${oldFileName}`]);

      const { error: updateError } = await supabase
        .from(activeSection)
        .update({
          link: newUrl,
          name: finalName,
        })
        .eq("link", clicked.link);

      if (updateError) {
        alert("Failed to update.");
        return;
      }

      alert("Updated successfully!");

      setClicked({
        link: newUrl,
        name: finalName,
      });

      setUserImg(prev =>
        prev.map(item =>
          item.link === clicked.link
            ? { ...item, link: newUrl, name: finalName }
            : item
        )
      );
    } catch (err) {
      console.log("Edit error:", err);
    }
  };

  React.useEffect(() => {
    const fetchImgs = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data: userCloset } = await supabase
          .from('Closet')
          .select('id')
          .eq('userid', user.id)
          .single();

        const { data: imgs, error } = await supabase
          .from(activeSection)
          .select('link, name')
          .eq('closetid', userCloset.id);

        if (error) console.error(error);
        else setUserImg(imgs || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImgs();
  }, [activeSection]);

  if (onDropTop) {
    return (
      <ScrollView
        horizontal
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {userImg?.map((p, index) => (
          <DraggableThumb
            key={index}
            source={{ uri: p.link }}
            onDropTop={onDropTop}
            onDragStart={() => setScrollEnabled(false)}
            onDragEnd={() => setScrollEnabled(true)}
          />
        ))}
      </ScrollView>
    );
  }

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
          <Text style={styles.subtitle}>{activeSection}</Text>
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {userImg?.map((photo, i) => (
              <TouchableOpacity 
                key={i}
                style={styles.card}
                onPress={() => {
                  setClicked({
                    link: photo.link,
                    name: photo.name
                  });
                  setShowModal(true);
                }}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: photo.link }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.6)']}
                  style={styles.cardOverlay}
                >
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {photo.name}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Detail Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView 
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>{clicked?.name}</Text>

                <Image
                  source={{ uri: clicked?.link }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setShowModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleEdit}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={addFav}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Favorite</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryButton, styles.deleteButton]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Rename..."
                  placeholderTextColor={COLORS.textSecondary}
                  style={styles.input}
                  onChangeText={setNewName}
                  value={newName}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

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
}

export default Sections;

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
    marginTop: SPACING.xs,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.md,
    paddingBottom: 120,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.cardBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    justifyContent: 'flex-end',
    padding: SPACING.sm,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: SPACING.sm,
    paddingBottom: 150,
    gap: SPACING.sm,
    
  },
  thumbWrap: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.text,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
  },
  thumb: { 
    width: 70, 
    height: 70, 
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.primary,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalScrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  modalTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalImage: {
    width: width - (SPACING.lg * 2),
    height: width - (SPACING.lg * 2),
    borderRadius: 16,
    alignSelf: 'center',
    backgroundColor: COLORS.cardBg,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  primaryButton: {
    backgroundColor: COLORS.buttonBg,
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  buttonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.buttonBg,
    color: COLORS.text,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.lg,
    fontSize: 16,
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
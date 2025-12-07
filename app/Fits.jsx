import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform, Dimensions, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import React, {useState, useEffect} from 'react';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../database/supabase';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px padding on sides and 16px gap

// Design System Constants
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

const router = useRouter();

const Fits = (props) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOne, setShowOne] = useState(false);
  const [clicked, setClicked] = useState(null);
  const [schedule, setSchedule] = useState(false);
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("User not logged in:", userError);
        return;
      }

      const { data: closetData, error: closetError } = await supabase
        .from("Closet")
        .select("*")
        .eq("userid", userData.user.id)
        .single();

      if (closetError || !closetData) {
        console.error("Closet not found:", closetError);
        return;
      }

      const { data: fitsData, error: fitsError } = await supabase
        .from("outfits")
        .select("id, link")
        .eq("closetid", closetData.id);

      if (fitsError) {
        console.error(fitsError);
      } else {
        setPhotos(fitsData);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (event, selectedDate) => {
    if (Platform.OS === "ios") {
      if (selectedDate) setDate(selectedDate);
      return;
    }

    if (event.type === "set") {
      setShow(false);
      if (selectedDate) setDate(selectedDate);
    } else {
      setShow(false);
    }
  };

  const handleDelete = async () => {
    try {
      const fileName = clicked.link.split("/").pop();

      const { error: storageError } = await supabase
        .storage
        .from("outfits")
        .remove([`${fileName}`]);

      if (storageError) {
        console.log("Storage delete error:", storageError);
      }

      const { error: dbError } = await supabase
        .from("outfits")
        .delete()
        .eq("link", clicked.link);

      if (dbError) {
        alert("Failed to delete item.");
        return;
      }

      alert("Deleted successfully.");
      setPhotos(prev => prev.filter(item => item.link !== clicked.link));
      setShowOne(false);
    } catch (e) {
      console.log("Delete error:", e);
    }
  };

  const addFav = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const { data: closetData, error: closetError } = await supabase
        .from("Closet")
        .select("*")
        .eq("userid", userData.user.id)
        .single();

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

  const scheduleOutfit = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from("outfits")
        .update({ scheduled_date: date.toISOString() })
        .eq("link", clicked.link);

      if (error) {
        console.log(error, "error updating");
        alert("Failed to schedule");
      } else {
        alert("Outfit scheduled!");
        setSchedule(false);
      }
    } catch (error) {
      console.error("Schedule error:", error);
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
          <Text style={styles.subtitle}>Fits</Text>
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
        ) : !showOne ? (
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          >
            {photos.map((photo) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.card}
                onPress={() => {
                  setClicked(photo);
                  setShowOne(true);
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
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <ScrollView 
            style={styles.detailView}
            contentContainerStyle={styles.detailContent}
            showsVerticalScrollIndicator={false}
          >
            {!schedule ? (
              <>
                <Image
                  source={{ uri: clicked.link }}
                  style={styles.detailImage}
                  resizeMode="contain"
                />

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setShowOne(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setSchedule(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Schedule</Text>
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
                    onPress={() => {
                      handleDelete();
                      setShowOne(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.scheduleContainer}>
                <Image
                  source={{ uri: clicked.link }}
                  style={styles.scheduleImage}
                  resizeMode="contain"
                />

                <View style={styles.datePickerContainer}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShow(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>
                      {date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </Text>
                  </TouchableOpacity>

                  {show && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={onChange}
                      themeVariant="dark"
                    />
                  )}
                </View>

                <View style={styles.scheduleActions}>
                  <TouchableOpacity
                    style={[styles.primaryButton, { flex: 1 }]}
                    onPress={() => setSchedule(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.primaryButton, styles.saveButton, { flex: 1 }]}
                    onPress={scheduleOutfit}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Save Date</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        )}

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

export default Fits;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
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
    paddingBottom: 100,
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
  },
  detailView: {
    flex: 1,
  },
  detailContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  detailImage: {
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
  saveButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: COLORS.accent,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleContainer: {
    alignItems: 'center',
  },
  scheduleImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 16,
    backgroundColor: COLORS.cardBg,
    marginBottom: SPACING.lg,
  },
  datePickerContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  dateButton: {
    backgroundColor: COLORS.buttonBg,
    paddingVertical: 16,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
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
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    color: COLORS.text,
  },
});
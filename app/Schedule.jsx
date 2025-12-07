import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { supabase } from '../database/supabase';
import Fits from './Fits';


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
  calendarBg: 'rgba(0, 0, 0, 0.3)',
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
  subtitle: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
};

const Schedule = () => {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [photos, setPhotos] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [selectedFitImage, setSelectedFitImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduledFits();
  }, []);

  const fetchScheduledFits = async () => {
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
        .select("id, link, scheduled_date")
        .eq("closetid", closetData.id)
        .not("scheduled_date", "is", null);

      if (fitsError) {
        console.error(fitsError);
      } else {
        setPhotos(fitsData || []);

        // Convert dates into Calendar marked format
        const marked = {};
        fitsData?.forEach(fit => {
          if (fit.scheduled_date) {
            const dateKey = fit.scheduled_date.split("T")[0];
            marked[dateKey] = {
              marked: true,
              dotColor: COLORS.accent,
              selected: false,
            };
          }
        });
        setMarkedDates(marked);
      }
    } catch (error) {
      console.error("Fetch scheduled fits error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayPress = (day) => {
    const dayStr = day.dateString;
    setSelected(dayStr);

    const found = photos.find(
      item => item.scheduled_date?.split("T")[0] === dayStr
    );

    if (found) {
      setSelectedFitImage(found.link);
    } else {
      setSelectedFitImage(null);
    }

    // Update marked dates to show selected day
    const updatedMarked = { ...markedDates };
    Object.keys(updatedMarked).forEach(key => {
      updatedMarked[key] = {
        ...updatedMarked[key],
        selected: key === dayStr,
        selectedColor: key === dayStr ? COLORS.accent : undefined,
      };
    });
    
    if (!updatedMarked[dayStr]) {
      updatedMarked[dayStr] = {
        selected: true,
        selectedColor: COLORS.accent,
      };
    }
    
    setMarkedDates(updatedMarked);
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
          <Text style={styles.subtitle}>Calendar</Text>
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
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Calendar */}
            <View style={styles.calendarCard}>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={markedDates}
                theme={{
                  backgroundColor: 'transparent',
                  calendarBackground: 'transparent',
                  textSectionTitleColor: COLORS.text,
                  textSectionTitleDisabledColor: COLORS.textSecondary,
                  dayTextColor: COLORS.text,
                  todayTextColor: '#00adf5',
                  selectedDayTextColor: COLORS.text,
                  monthTextColor: COLORS.text,
                  selectedDayBackgroundColor: COLORS.accent,
                  arrowColor: COLORS.text,
                  textDisabledColor: COLORS.textSecondary,
                  dotColor: COLORS.accent,
                  selectedDotColor: COLORS.text,
                  textDayFontWeight: '400',
                  textMonthFontWeight: '600',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
              />
            </View>

            {/* Selected Outfit Display */}
            {selected && (
              <View style={styles.selectedDateCard}>
                <Text style={styles.selectedDateText}>
                  {new Date(selected).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>

                {selectedFitImage ? (
                  <View style={styles.outfitPreview}>
                    <Image
                      source={{ uri: selectedFitImage }}
                      style={styles.outfitImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.outfitLabel}>Scheduled Outfit</Text>
                  </View>
                ) : (
                  <View style={styles.noOutfitContainer}>
                    <Text style={styles.noOutfitText}>
                      No outfit scheduled for this day
                    </Text>
                    <TouchableOpacity
                      style={styles.addOutfitButton}
                      onPress={() => router.push('/Fits')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addOutfitButtonText}>
                        Schedule Outfit
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Upcoming Outfits */}
            {photos.length > 0 && (
              <View style={styles.upcomingSection}>
                <Text style={styles.upcomingSectionTitle}>
                  Upcoming Scheduled Outfits
                </Text>
                {photos
                  .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                  .slice(0, 5)
                  .map((fit, index) => (
                    <TouchableOpacity
                      key={fit.id}
                      style={styles.upcomingItem}
                      onPress={() => {
                        const dateStr = fit.scheduled_date.split("T")[0];
                        handleDayPress({ dateString: dateStr });
                      }}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: fit.link }}
                        style={styles.upcomingImage}
                      />
                      <Text style={styles.upcomingDate}>
                        {new Date(fit.scheduled_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.bottomNavButton}
            onPress={() => router.push('/Schedule')}
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

export default Schedule;

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
  scrollContent: {
    paddingBottom: 120,
  },
  calendarCard: {
    backgroundColor: COLORS.calendarBg,
    borderRadius: 16,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  outfitPreview: {
    alignItems: 'center',
  },
  outfitImage: {
    width: width - (SPACING.md * 4),
    height: width - (SPACING.md * 4),
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  outfitLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: SPACING.md,
  },
  noOutfitContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  noOutfitText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  addOutfitButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: COLORS.accent,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addOutfitButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  upcomingSection: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  upcomingSectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  upcomingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  upcomingImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  upcomingDate: {
    color: COLORS.text,
    fontSize: 16,
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
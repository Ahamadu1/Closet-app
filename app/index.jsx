import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import { useRouter } from 'expo-router';
import { supabase } from '../database/supabase';
import { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');

// Design System
const COLORS = {
  primary: '#2A003F',
  secondary: '#1A0029',
  dark: '#0D0014',
  accent: '#8B5CF6',
  accentLight: '#3a0ca3',
  border: '#4A4A4A',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  cardBg: '#1b002e',
  emptyText: '#bbb',
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
  subtitle: { fontSize: 18, fontWeight: 'bold' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
};

const Index = () => {
  const router = useRouter();
  const [topData, setTopData] = useState([]);
  const [bottomData, setBottomData] = useState([]);
  const [accessData, setAccessData] = useState([]);
  const [shoeData, setShoeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("No authenticated user:", userError);
        router.replace("/Authpage");
        return;
      }

      const { data: closetData, error: closetError } = await supabase
        .from("Closet")
        .select("id")
        .eq("userid", user.id)
        .single();

      if (closetError || !closetData) {
        console.error("Closet not found:", closetError);
        return;
      }

      const [tops, bottoms, shoes, accessories] = await Promise.all([
        supabase.from("Tops").select("*").eq("closetid", closetData.id),
        supabase.from("Bottoms").select("*").eq("closetid", closetData.id),
        supabase.from("shoes").select("*").eq("closetid", closetData.id),
        supabase.from("Accessories").select("*").eq("closetid", closetData.id),
      ]);

      if (tops.data) setTopData(tops.data);
      if (bottoms.data) setBottomData(bottoms.data);
      if (shoes.data) setShoeData(shoes.data);
      if (accessories.data) setAccessData(accessories.data);
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const CategorySection = ({ title, data, section }) => (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/Sections', params: { section } })}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['rgba(58, 12, 163, 0.25)', 'rgba(0, 0, 0, 0.4)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.sectionCard}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.viewAll}>View all →</Text>
        </View>
  
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageRow}
        >
          {data && data.length > 0 ? (
            data.slice(0, 5).map(item => (
              <Image
                key={item.id}
                source={{ uri: item.link }}
                style={styles.previewImg}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              No {title.toLowerCase()} in your closet yet.
            </Text>
          )}
        </ScrollView>
      </LinearGradient>
    </TouchableOpacity>
  );

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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Loading your closet...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <CategorySection title="Tops" data={topData} section="Tops" />
            <CategorySection title="Bottoms" data={bottomData} section="Bottoms" />
            <CategorySection title="shoes" data={shoeData} section="shoes" />
            <CategorySection title="Accessories" data={accessData} section="Accessories" />
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

export default Index;

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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionCard: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)', // ← Accent color border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, // ← Softer shadow
    shadowRadius: 5,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.text,
  },
  viewAll: {
    color: '#e0c3fc',
    fontSize: 14,
  },
  imageRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  previewImg: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyText: {
    color: COLORS.emptyText,
    padding: SPACING.md,
    fontStyle: 'italic',
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
    ...TYPOGRAPHY.small,
    color: COLORS.text,
  },
});
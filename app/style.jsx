import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import heartlogo from '../assets/hearticon.png';
import stlyelogo from '../assets/hanger.png';
import pluslogo from '../assets/plusbutton.png';
import calendarlogo from '../assets/calendaricon.png';
import bottom from '../assets/bottom.png';
import shoes from '../assets/shoes.png';
import shirticon2 from '../assets/shirticon2.png';
import Sections from './Sections';

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
  subtitle: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
};

const Style = () => {
  const router = useRouter();

  const [selectedSection, setSelectedSection] = useState(null);

  // Show generate button as soon as ANY item is dropped
  const [gen, setGen] = useState(false);

  const refTop = useRef(null);
  const refBottom = useRef(null);
  const refShoes = useRef(null);
  const refOther = useRef(null);

  const [imgTop, setImgTop] = useState(null);
  const [imgBottom, setImgBottom] = useState(null);
  const [imgShoes, setImgShoes] = useState(null);
  const [imgOther, setImgOther] = useState(null);

  const [rects, setRects] = useState({
    top: null,
    bottom: null,
    shoes: null,
    other: null,
  });

  const measureBox = (key, ref) => {
    if (!ref.current) return;
    ref.current.measureInWindow((x, y, width, height) => {
      setRects((r) => ({ ...r, [key]: { x, y, width, height } }));
    });
  };

  // Re-measure when layout changes because of section selection
  useEffect(() => {
    requestAnimationFrame(() => {
      measureBox('top', refTop);
      measureBox('bottom', refBottom);
      measureBox('shoes', refShoes);
      measureBox('other', refOther);
    });
  }, [selectedSection]);

  const inside = (x, y, r) =>
    r && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;

  const onDropTop = (imgSource, gesture) => {
    const { moveX, moveY } = gesture;

    // Show generate button as soon as ANY drop happens
    setGen(true);

    if (inside(moveX, moveY, rects.top)) {
      setImgTop(imgSource);
      return true;
    }
    if (inside(moveX, moveY, rects.bottom)) {
      setImgBottom(imgSource);
      return true;
    }
    if (inside(moveX, moveY, rects.shoes)) {
      setImgShoes(imgSource);
      return true;
    }
    if (inside(moveX, moveY, rects.other)) {
      setImgOther(imgSource);
      return true;
    }

    return false;
  };

  // Only enable Generate when outfit is complete
  const canGenerateOutfit = !!(imgTop && imgBottom);

  const CategoryButton = ({ icon, label, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.categoryButton}
    >
      {icon ? (
        <Image source={icon} style={styles.categoryIcon} />
      ) : (
        <View style={styles.categoryIconPlaceholder} />
      )}
      <Text style={styles.categoryText}>{label}</Text>
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
          <Text style={styles.subtitle}>Create Outfit</Text>
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

        {/* Main Content */}
        <View style={styles.content}>
          {/* Drop Zones */}
          <View style={styles.dropZoneContainer}>
            <View
              ref={refTop}
              onLayout={() => measureBox('top', refTop)}
              style={styles.dropBox}
            >
              {imgTop ? (
                <Image source={imgTop} style={styles.dropImage} />
              ) : (
                <Text style={styles.dropText}>Drag Top Here</Text>
              )}
            </View>

            <View
              ref={refBottom}
              onLayout={() => measureBox('bottom', refBottom)}
              style={styles.dropBox}
            >
              {imgBottom ? (
                <Image source={imgBottom} style={styles.dropImage} />
              ) : (
                <Text style={styles.dropText}>Drag Bottom Here</Text>
              )}
            </View>

            <View
              ref={refShoes}
              onLayout={() => measureBox('shoes', refShoes)}
              style={styles.dropBox}
            >
              {imgShoes ? (
                <Image source={imgShoes} style={styles.dropImage} />
              ) : (
                <Text style={styles.dropText}>Drag Shoes Here</Text>
              )}
            </View>

            <View
              ref={refOther}
              onLayout={() => measureBox('other', refOther)}
              style={styles.dropBox}
            >
              {imgOther ? (
                <Image source={imgOther} style={styles.dropImage} />
              ) : (
                <Text style={styles.dropText}>Accessories (Optional)</Text>
              )}
            </View>
          </View>

          {/* Overlay Action Buttons (zIndex above Sections) */}
          <View style={styles.actionButtonsOverlay}>
            {selectedSection && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedSection(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>← Back</Text>
              </TouchableOpacity>
            )}

            {gen && (
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  !canGenerateOutfit && styles.generateButtonDisabled,
                ]}
                disabled={!canGenerateOutfit}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: '/Generate',
                    params: {
                      topImg: imgTop?.uri ?? null,
                      bottomImg: imgBottom?.uri ?? null,
                      shoeImg: imgShoes?.uri ?? null,
                      otherImg: imgOther?.uri ?? null,
                    },
                  })
                }
              >
                <Text style={styles.buttonText}>Generate Outfit →</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category Selection */}
          {!selectedSection && (
            <View style={styles.categoryContainer}>
              <CategoryButton
                icon={shirticon2}
                label="Shirts"
                onPress={() => setSelectedSection('Tops')}
              />
              <CategoryButton
                icon={bottom}
                label="Pants"
                onPress={() => setSelectedSection('Bottoms')}
              />
              <CategoryButton
                icon={shoes}
                label="Shoes"
                onPress={() => setSelectedSection('shoes')}
              />
              <CategoryButton
                label="Accessories"
                onPress={() => setSelectedSection('Accessories')}
              />
            </View>
          )}

          {/* Draggable Items Section */}
          {selectedSection && (
            <Sections section={selectedSection} onDropTop={onDropTop} />
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

export default Style;

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
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  dropZoneContainer: {
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  dropBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.border,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 80,
    backgroundColor: COLORS.cardBg,
  },
  dropImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  dropText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  // Overlay container so Back + Generate sit above Sections
  actionButtonsOverlay: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    zIndex: 1000,
  },
  backButton: {
    backgroundColor: COLORS.buttonBg,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  categoryButton: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
    height: 100,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    marginBottom: SPACING.xs,
  },
  categoryIconPlaceholder: {
    width: 50,
    height: 50,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.border,
    borderRadius: 8,
  },
  categoryText: {
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

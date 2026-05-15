import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';

import {
  COLORS,
  SPACING,
} from '../../constants/theme';

import {
  useAppDispatch,
  useAppSelector,
} from '../../store/store';

import {
  updateProfile,
  signOut,
} from '../../store/authSlice';

const INTERESTS = [
  'Health',
  'Career',
  'Fitness',
  'Finance',
  'Mindfulness',
  'Productivity',
  'Relationships',
];

export const ProfileSetupScreen: React.FC = () => {
  const dispatch = useAppDispatch();

  const {
    user,
    loading,
    error,
  } = useAppSelector(
    (state) => state.auth
  );

  const [fullName, setFullName] =
    useState('');

  const [age, setAge] =
    useState('');

  const [
    selectedInterests,
    setSelectedInterests,
  ] = useState<string[]>([]);

  useEffect(() => {
    if (user?.user_metadata) {
      if (user.user_metadata.full_name) {
        setFullName(
          user.user_metadata.full_name
        );
      }

      if (user.user_metadata.age) {
        setAge(
          user.user_metadata.age.toString()
        );
      }
    }
  }, [user]);

  const toggleInterest = (
    interest: string
  ) => {
    if (
      selectedInterests.includes(
        interest
      )
    ) {
      setSelectedInterests(
        selectedInterests.filter(
          (i) => i !== interest
        )
      );
    } else {
      setSelectedInterests([
        ...selectedInterests,
        interest,
      ]);
    }
  };

  const handleContinue = () => {
    if (!fullName.trim()) return;

    dispatch(
      updateProfile({
        fullName: fullName.trim(),
        age: age.trim(),
        interests:
          selectedInterests,
      })
    );
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          bounces={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
          {/* Progress Indicator */}
          <View
            style={
              styles.progressContainer
            }
          >
            <View
              style={[
                styles.progressBar,
                styles.progressBarActive,
              ]}
            />

            <View
              style={
                styles.progressBar
              }
            />

            <View
              style={
                styles.progressBar
              }
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.stepText}>
              Step 1 of 3
            </Text>

            <Text style={styles.title}>
              Tell us about you
            </Text>

            <Text
              style={styles.subtitle}
            >
              Evana personalises
              your experience
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View
              style={
                styles.errorBanner
              }
            >
              <Text
                style={
                  styles.errorBannerText
                }
              >
                {error}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Your name"
              placeholder="Sara Ahmed"
              value={fullName}
              onChangeText={
                setFullName
              }
            />

            <Input
              label="Age (optional)"
              placeholder="25"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />

            {/* Interests */}
            <View
              style={
                styles.interestsSection
              }
            >
              <Text
                style={
                  styles.sectionLabel
                }
              >
                Your interests
              </Text>

              <View
                style={
                  styles.chipsContainer
                }
              >
                {INTERESTS.map(
                  (interest) => (
                    <Chip
                      key={interest}
                      label={interest}
                      selected={selectedInterests.includes(
                        interest
                      )}
                      onPress={() =>
                        toggleInterest(
                          interest
                        )
                      }
                    />
                  )
                )}
              </View>
            </View>

            {/* CTA */}
            <View
              style={styles.ctaSection}
            >
              <Button
                title={
                  loading
                    ? 'Saving...'
                    : 'Continue →'
                }
                onPress={
                  handleContinue
                }
                disabled={
                  loading ||
                  !fullName.trim()
                }
              />
            </View>

            {/* Footer */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                dispatch(signOut())
              }
              style={
                styles.logoutButton
              }
            >
              <Text
                style={
                  styles.logoutText
                }
              >
                Cancel & Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,

    paddingHorizontal:
      SPACING.lg,

    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight ||
            0) + 38
        : 72,

    paddingBottom: 48,
  },

  /* Progress */

  progressContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 28,

    gap: 8,
  },

  progressBar: {
    flex: 1,

    height: 4,

    borderRadius: 999,

    backgroundColor:
      'rgba(124,92,252,0.14)',
  },

  progressBarActive: {
    backgroundColor:
      COLORS.purple,
  },

  /* Header */

  header: {
    marginBottom: 28,
  },

  stepText: {
    fontSize: 12,

    fontWeight: '600',

    color: COLORS.textLight,

    marginBottom: 4,
  },

  title: {
    fontSize: 30,

    fontWeight: '800',

    color: COLORS.textDark,

    marginBottom: 4,

    letterSpacing: -0.6,
  },

  subtitle: {
    fontSize: 13,

    lineHeight: 22,

    color: COLORS.textMid,

    fontWeight: '500',
  },

  /* Error */

  errorBanner: {
    backgroundColor:
      '#FEE2E2',

    borderRadius: 14,

    padding: 14,

    marginBottom: 22,

    borderWidth: 1,

    borderColor: '#FECACA',
  },

  errorBannerText: {
    color: '#DC2626',

    fontSize: 12,

    fontWeight: '600',

    textAlign: 'center',
  },

  /* Form */

  form: {
    width: '100%',
  },

  /* Interests */

  interestsSection: {
    marginTop: 2,
  },

  sectionLabel: {
    fontSize: 14,

    fontWeight: '700',

    color: COLORS.textMid,

    marginBottom: 8,
  },

  chipsContainer: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 6,
  },

  /* CTA */

  ctaSection: {
    marginTop: 28,
  },

  /* Footer */

  logoutButton: {
    alignItems: 'center',

    marginTop: 24,
  },

  logoutText: {
    fontSize: 13,

    color: COLORS.textMid,

    fontWeight: '600',
  },
});
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../constants/theme';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setMainScreen, updateProfile } from '../../store/authSlice';
import { ChevronLeft, User, MessageSquare, Heart } from 'lucide-react-native';

export const EditProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Please enter your full name.");
      return;
    }

    setSaving(true);
    try {
      await dispatch(updateProfile({ fullName, bio })).unwrap();
      
      Alert.alert(
        "Success", 
        "Profile updated successfully!",
        [{ text: "OK", onPress: () => dispatch(setMainScreen('settings')) }]
      );
    } catch (error: any) {
      Alert.alert("Error", error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => dispatch(setMainScreen('settings'))}
        >
          <ChevronLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'}
            </Text>
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Input
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              icon={<User size={18} color={COLORS.textLight} />}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio / Life Context</Text>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="Tell Evana about yourself..."
              multiline
              numberOfLines={4}
              style={styles.bioInput}
              icon={<MessageSquare size={18} color={COLORS.textLight} />}
            />
            <Text style={styles.helperText}>
              Evana uses this to personalize your coaching experience.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Interests</Text>
            <TouchableOpacity style={styles.interestsPicker}>
              <Heart size={18} color={COLORS.purple} />
              <Text style={styles.interestsText}>Fitness, Reading, Career Growth</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title={saving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          disabled={saving}
          loading={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textDark,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 16,
    paddingBottom: 100,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarTextLarge: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
  },
  changePhotoBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  changePhotoText: {
    fontSize: 14,
    color: COLORS.purple,
    fontWeight: '700',
  },
  form: {
    gap: 20,
    marginBottom: 40,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginLeft: 4,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textMid,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  interestsPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  interestsText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  saveBtn: {
    borderRadius: RADIUS.lg,
    height: 56,
  },
});

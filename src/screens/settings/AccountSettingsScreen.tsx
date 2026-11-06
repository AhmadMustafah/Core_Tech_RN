import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '@/redux/hooks';
import { userService } from '@/services/userService';
import { getErrorMessage } from '@/services/api';
import type { User } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useLocalization } from '@/hooks/useLocalization';
import { getInitials } from '@/utils/formatters';
import type { ProfileStackParamList } from '@/types/navigation';
import { borderRadius, spacing } from '@/theme';
import { CustomButton, CustomInput } from '@/components/common';
import { SettingsNavRow, SettingsSection } from './settingsUi';

type Props = NativeStackScreenProps<ProfileStackParamList, 'AccountSettings'>;

export const AccountSettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { t } = useLocalization();
  const user = useAppSelector(state => state.auth.user);
  const [team, setTeam] = useState<User[]>([]);
  const [businessName, setBusinessName] = useState(user?.company || '');
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const role = String(user?.role || '').toLowerCase();
  const canListUsers = role === 'admin' || role === 'manager';
  const canCreateUsers = role === 'admin';

  const loadTeam = () => {
    if (!canListUsers) return;
    userService.getAll().then(setTeam).catch(() => setTeam([]));
  };

  useEffect(() => {
    loadTeam();
    userService.getBusiness().then(biz => {
      if (biz?.name) setBusinessName(biz.name);
    }).catch(() => undefined);
  }, [canListUsers]);

  const addMember = async () => {
    if (saving) return;
    setMemberError(null);
    setSaving(true);
    try {
      await userService.create({
        name: memberName.trim(),
        email: memberEmail.trim(),
        password: memberPassword,
        role: 'staff',
      });
      setMemberName('');
      setMemberEmail('');
      setMemberPassword('');
      loadTeam();
    } catch (err) {
      setMemberError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}>
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <Avatar.Text
          size={64}
          label={getInitials(user?.name || 'U')}
          color={colors.onPrimary}
          style={{ backgroundColor: colors.primary }}
        />
        <View style={styles.profileText}>
          <Text
            variant="titleMedium"
            numberOfLines={1}
            style={{ color: colors.text, fontWeight: '700' }}>
            {user?.name || t('settings.account')}
          </Text>
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={{ color: colors.textSecondary, marginTop: 2 }}>
            {user?.email}
          </Text>
          {user?.company ? (
            <Text variant="bodySmall" style={{ color: colors.textMuted, marginTop: 2 }}>
              {user.company}
            </Text>
          ) : null}
          {user?.role ? (
            <View style={[styles.roleBadge, { backgroundColor: colors.primaryMuted }]}>
              <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>
                {user.role}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <SettingsSection>
        <SettingsNavRow
          icon="account-edit-outline"
          title={t('settings.accountProfile')}
          description={t('settings.accountProfileDesc')}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <SettingsNavRow
          icon="office-building-outline"
          title={t('settings.accountCompany')}
          description={businessName || user?.company || t('settings.accountCompanyEmpty')}
          last
          onPress={() => navigation.navigate('EditProfile')}
        />
      </SettingsSection>

      {canCreateUsers ? (
        <SettingsSection title={t('users.addMember')}>
          <View style={styles.invite}>
            {memberError ? <Text style={{ color: colors.error, marginBottom: spacing.sm }}>{memberError}</Text> : null}
            <CustomInput label={t('auth.fullName')} value={memberName} onChangeText={setMemberName} />
            <CustomInput label={t('auth.email')} value={memberEmail} onChangeText={setMemberEmail} keyboardType="email-address" />
            <CustomInput label={t('users.password')} value={memberPassword} onChangeText={setMemberPassword} secureTextEntry />
            <CustomButton
              title={t('users.addMember')}
              onPress={addMember}
              loading={saving}
              disabled={!memberName.trim() || !memberEmail.trim() || memberPassword.length < 6}
              fullWidth
            />
          </View>
        </SettingsSection>
      ) : null}

      {canListUsers && team.length > 0 ? (
        <SettingsSection title={t('settings.team')}>
          {team.map((member, index) => (
            <SettingsNavRow
              key={member.id}
              icon="account-outline"
              title={member.name}
              description={`${member.email} · ${member.role || ''}`}
              last={index === team.length - 1}
            />
          ))}
        </SettingsSection>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xxl },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    elevation: 1,
    gap: spacing.md,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
  },
  invite: {
    padding: spacing.md,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
});

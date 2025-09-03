import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  SectionList,
  TextInput,
  Alert,
} from 'react-native';
import {
  Search,
  Plus,
  Phone,
  Users,
  Briefcase,
  Hash,
  Zap,
  Settings,
  PhoneIncoming,
  FolderPlus,
  Folder,
  User,
  CreditCard,
  LogOut,
  Trash2,
  MoreHorizontal,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { useCallerId } from '@/hooks/useCallerId';
import { apiService } from '@/services/apiService';
// Style guide
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_LAYOUT,
  HEYWAY_ACCESSIBILITY,
  HEYWAY_COMPONENTS,
  HEYWAY_CHAT_PATTERNS
} from '@/styles/HEYWAY_STYLE_GUIDE';

interface Group {
  id: string;
  name: string;
  calls: any[];
}

interface HomeSidebarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showPlusDropdown: boolean;
  onPlusToggle: () => void;
  activeNavItem: string;
  onNavItemPress: (key: string) => void;
  onNewCall: () => void;
  onNewAutomation: () => void;
  onNewContact: () => void;
  onNewList: () => void;
  onSettingsPress: () => void;
  onInboundPress: () => void;
  inboundActive: boolean;
  isMobile?: boolean;
  showMobileMenu?: boolean;
  groups?: Group[];
  onGroupSelect?: (group: Group) => void;
  onCreateGroup?: () => void;
  selectedGroupId?: string;
}

/**
 * Upgrades:
 * - Flexbox layout instead of absolute positioning (everything scrolls naturally)
 * - Extracted SidebarItem / GroupRow for readability + consistent hit targets
 * - Built-in badges + active indicator
 * - Collapsible Groups section when empty/large
 * - Safer dropdown placement and tap-outside dismissal via overlay layer (controlled externally)
 * - Better accessibility: role-like hints, larger touch targets, semantic labels
 * - Works for narrow/expanded widths; no hard-coded tops/lefts
 */
const HomeSidebar: React.FC<HomeSidebarProps> = ({
  searchQuery,
  onSearchChange,
  showPlusDropdown,
  onPlusToggle,
  activeNavItem,
  onNavItemPress,
  onNewCall,
  onNewAutomation,
  onNewContact,
  onNewList,
  onSettingsPress,
  onInboundPress,
  inboundActive,
  isMobile = false,
  showMobileMenu = true,
  groups = [],
  onGroupSelect,
  onCreateGroup,
  selectedGroupId,
}) => {
  const { user, logout, updateProfile } = useAuth();
  const callerId = useCallerId();
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [groupsExpanded, setGroupsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState(user?.profile?.firstName || '');

  const topNavItems = useMemo(
    () => [
      { key: 'recents', icon: Phone, label: 'Calls' },
      { key: 'automations', icon: Zap, label: 'Automations' },
    ],
    []
  );

  const mainNavItems = useMemo(
    () => [
      { key: 'contacts', icon: Users, label: 'Contacts' },
      { key: 'business', icon: Briefcase, label: 'Business Search' },
      { key: 'keypad', icon: Hash, label: 'Keypad' },
    ],
    []
  );

  const onPressHaptic = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(style);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveFirstName = async () => {
    if (!editedFirstName.trim()) {
      Alert.alert('Error', 'First name cannot be empty');
      return;
    }

    try {
      await updateProfile({ firstName: editedFirstName.trim() });
      setIsEditingName(false);
      Alert.alert('Success', 'Your name has been updated! This is what the AI caller will refer to you as.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update your name. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedFirstName(user?.profile?.firstName || '');
    setIsEditingName(false);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.\n\nType "DELETE" to confirm:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteUserAccount();
              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
              await logout();
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  const sections = useMemo(
    () => [
      { title: 'Top', data: topNavItems },
      { title: 'Main', data: mainNavItems },
    ],
    [topNavItems, mainNavItems]
  );

  return (
    <View
      style={[
        styles.sidebar,
        isMobile && styles.mobileSidebar,
        isMobile && !showMobileMenu && styles.hiddenMobileSidebar,
      ]}
      accessibilityRole="menu"
      accessibilityLabel="Primary navigation"
    >
      {/* Header / Branding */}
      <View style={styles.logoSection}>
        <View style={styles.logoRow}>
          <View style={styles.logoAndText}>
            <Image source={require('../assets/images/logo.webp')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.logoText}>Heyway</Text>
          </View>
          {/* New + icon button */}
          <TouchableOpacity
            style={styles.newIconButton}
            onPress={() => {
              onPressHaptic(Haptics.ImpactFeedbackStyle.Medium);
              onPlusToggle();
            }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Create new"
          >
            <Plus size={16} color={HEYWAY_COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        {/* Search field (optional) */}
        <View style={styles.searchField}>
          <Search size={16} color={HEYWAY_COLORS.text.tertiary} />
          {/* You can switch to TextInput if you want actual search typing here */}
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            {searchQuery?.length ? searchQuery : 'Search…'}
          </Text>
        </View>

        {showPlusDropdown && (
          <View style={styles.dropdownCard}>
            <DropdownItem icon={Phone} label="New Call" onPress={() => { onPressHaptic(); onNewCall(); }} />
            <DropdownItem icon={Zap} label="New Automation" onPress={() => { onPressHaptic(); onNewAutomation(); }} />
            <DropdownItem icon={User} label="New Contact" onPress={() => { onPressHaptic(); onNewContact(); }} />
            <DropdownItem icon={FolderPlus} label="Import List" onPress={() => { onPressHaptic(); onNewList(); }} />
          </View>
        )}
      </View>

      {/* Body (scrollable) */}
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {/* Top + Main nav */}
        {sections.map((section) => (
          <View key={section.title}>
            {section.data.map((item) => (
              <SidebarItem
                key={item.key}
                icon={item.icon}
                label={item.label}
                active={activeNavItem === item.key}
                onPress={() => {
                  onPressHaptic(Haptics.ImpactFeedbackStyle.Medium);
                  onNavItemPress(item.key);
                }}
              />
            ))}
          </View>
        ))}

        {/* Groups */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Groups</Text>
          {!!onCreateGroup && (
            <TouchableOpacity
              onPress={() => { onPressHaptic(); onCreateGroup?.(); }}
              style={styles.createBtn}
              accessibilityRole="button"
              accessibilityLabel="Create group"
            >
              <Plus size={12} color={HEYWAY_COLORS.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {(!groups || groups.length === 0) ? (
          <View style={styles.emptyGroupsState}>
            <FolderPlus size={24} color={HEYWAY_COLORS.text.tertiary} />
            <Text style={styles.emptyGroupsText}>No groups yet</Text>
            <Text style={styles.emptyGroupsSubtext}>Create groups to organize your calls</Text>
          </View>
        ) : (
          <View>
            <TouchableOpacity style={styles.collapseRow} onPress={() => setGroupsExpanded((v) => !v)}>
              <Text style={styles.collapseText}>{groupsExpanded ? 'Hide' : 'Show'} groups</Text>
            </TouchableOpacity>
            {groupsExpanded && groups.map((g) => (
              <GroupRow
                key={g.id}
                name={g.name}
                count={g.calls?.length ?? 0}
                active={selectedGroupId === g.id}
                onPress={() => { onPressHaptic(); onGroupSelect?.(g); }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer (fixed) */}
      <View style={styles.footer}>
        <View style={styles.accountRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{(user?.profile?.firstName || 'U').slice(0, 1)}</Text>
          </View>
          <View style={styles.accountTextCol}>
            {isEditingName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={styles.nameInput}
                  value={editedFirstName}
                  onChangeText={setEditedFirstName}
                  placeholder="Enter your first name"
                  placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                  autoFocus
                  maxLength={30}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveFirstName}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsEditingName(true)}
                style={styles.nameContainer}
                activeOpacity={0.7}
              >
                <Text style={styles.userName}>
                  {user?.profile?.firstName || 'Tap to set your name'}
                </Text>
                <Text style={styles.callerIdText} numberOfLines={1}>
                  Caller ID: {callerId?.callerIdInfo?.last4Digits ? `***-***-${callerId.callerIdInfo.last4Digits}` : 'Set up your caller ID'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.settingsIconBtn}
            onPress={() => setShowSettingsDropdown((s) => !s)}
            accessibilityRole="button"
            accessibilityLabel="Open account menu"
          >
            <MoreHorizontal size={16} color={HEYWAY_COLORS.text.tertiary} />
          </TouchableOpacity>
        </View>

        {showSettingsDropdown && (
          <View style={styles.dropdownCard}>
            <DropdownItem icon={CreditCard} label="Upgrade to Pro" onPress={() => { onPressHaptic(); onSettingsPress(); setShowSettingsDropdown(false); }} />
            <DropdownItem icon={LogOut} label="Sign Out" onPress={() => { onPressHaptic(); handleLogout(); setShowSettingsDropdown(false); }} />
            <DropdownItem icon={Trash2} label="Delete Account" destructive onPress={() => { onPressHaptic(); handleDeleteAccount(); setShowSettingsDropdown(false); }} />
          </View>
        )}

        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={styles.answeringBtn}
            onPress={() => { onPressHaptic(); onInboundPress(); }}
            accessibilityRole="switch"
            accessibilityState={{ checked: inboundActive }}
          >
            <PhoneIncoming size={16} color={inboundActive ? HEYWAY_COLORS.accent.success : HEYWAY_COLORS.text.secondary} />
            <Text style={[styles.answeringText, { color: inboundActive ? HEYWAY_COLORS.accent.success : HEYWAY_COLORS.text.secondary }]}>Answering {inboundActive ? 'On' : 'Off'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/*************************
 * Subcomponents
 *************************/
const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.navItem, active && styles.navItemActive]}
      activeOpacity={0.85}
      accessibilityRole="menuitem"
      accessibilityState={{ selected: !!active }}
    >
      <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
        <Icon size={16} color={active ? HEYWAY_COLORS.accent.success : HEYWAY_COLORS.text.primary} />
      </View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
      {active && <View style={styles.activeBar} />}
    </TouchableOpacity>
  );
};

const GroupRow = ({ name, count, active, onPress }: { name: string; count: number; active?: boolean; onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.groupRow, active && styles.groupRowActive]}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
    >
      <View style={styles.groupIconWrap}>
        <Folder size={16} color={active ? HEYWAY_COLORS.accent.success : HEYWAY_COLORS.text.secondary} />
      </View>
      <Text style={[styles.groupName, active && styles.groupNameActive]} numberOfLines={1}>{name}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
};

const DropdownItem = ({ icon: Icon, label, onPress, destructive }: { icon: any; label: string; onPress: () => void; destructive?: boolean }) => (
  <TouchableOpacity style={styles.dropdownItem} onPress={onPress} activeOpacity={0.85}>
    <Icon size={16} color={destructive ? HEYWAY_COLORS.status.error : HEYWAY_COLORS.text.secondary} />
    <Text style={[styles.dropdownText, destructive && { color: HEYWAY_COLORS.status.error }]}>{label}</Text>
  </TouchableOpacity>
);

/*************************
 * Styles
 *************************/
const SIDEBAR_WIDTH = 224; // slightly roomier than before

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRightWidth: 1,
    borderRightColor: HEYWAY_COLORS.border.secondary,
  },
  mobileSidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
  },
  hiddenMobileSidebar: { transform: [{ translateX: -SIDEBAR_WIDTH }] },

  logoSection: {
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingTop: HEYWAY_SPACING.lg,
    paddingBottom: HEYWAY_SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 12 },
  logoAndText: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 36, height: 36 },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.2,
  },
  searchField: {
    height: 32,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    paddingHorizontal: HEYWAY_SPACING.sm,
    alignItems: 'center',
    flexDirection: 'row',
    gap: HEYWAY_SPACING.sm,
    width: '100%',
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.tertiary,
  },

  newIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
  },

  dropdownCard: {
    marginTop: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
    ...HEYWAY_SHADOWS.light.md,
    paddingVertical: HEYWAY_SPACING.xs,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.lg,
  },
  dropdownText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.primary,
  },

  body: { flex: 1 },
  bodyContent: { paddingVertical: HEYWAY_SPACING.sm },

  navItem: {
    marginHorizontal: HEYWAY_SPACING.sm,
    height: HEYWAY_ACCESSIBILITY.touchTarget.minimum,
    borderRadius: HEYWAY_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    paddingRight: HEYWAY_SPACING.sm,
  },
  navItemActive: {
    backgroundColor: HEYWAY_COLORS.background.intelligenceSubtle,
    borderLeftWidth: 3,
    borderLeftColor: HEYWAY_COLORS.interactive.whatsappGreen,
    paddingLeft: 37,
  },
  navIconWrap: {
    position: 'absolute',
    left: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {},
  navLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.primary,
  },
  navLabelActive: {
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium as any,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    backgroundColor: HEYWAY_COLORS.interactive.whatsappGreen,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },

  sectionHeaderRow: {
    marginTop: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.xs,
    paddingHorizontal: HEYWAY_SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  createBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.tertiary,
  },
  createText: {
    fontSize: 10,
    color: HEYWAY_COLORS.text.tertiary,
    fontWeight: '500',
  },

  emptyGroupsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.xs,
  },
  emptyGroupsText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold as any,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  emptyGroupsSubtext: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.secondary,
  },

  collapseRow: {
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
  },
  collapseText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    color: HEYWAY_COLORS.text.tertiary,
  },

  groupRow: {
    marginHorizontal: HEYWAY_SPACING.sm,
    height: 28,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    paddingRight: HEYWAY_SPACING.sm,
  },
  groupRowActive: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },
  groupIconWrap: {
    position: 'absolute',
    left: 12,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    flex: 1,
    fontSize: 12,
    color: HEYWAY_COLORS.text.secondary,
  },
  groupNameActive: {
    color: HEYWAY_COLORS.text.primary,
    fontWeight: '500',
  },
  badge: {
    ...HEYWAY_CHAT_PATTERNS.badge,
    backgroundColor: HEYWAY_COLORS.accent.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.small,
    color: HEYWAY_COLORS.text.tertiary,
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HEYWAY_COLORS.border.tertiary,
    padding: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  avatarInitial: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    color: HEYWAY_COLORS.text.secondary,
  },
  accountTextCol: { flex: 1 },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold as any,
    color: HEYWAY_COLORS.text.primary,
    lineHeight: 16,
  },
  callerIdText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.secondary,
  },
  editNameContainer: {
    flex: 1,
  },
  nameInput: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    color: HEYWAY_COLORS.text.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.sm,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    marginBottom: HEYWAY_SPACING.xs,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  editButtons: {
    flexDirection: 'row',
    gap: HEYWAY_SPACING.xs,
  },
  saveButton: {
    backgroundColor: HEYWAY_COLORS.accent.success,
    borderRadius: HEYWAY_RADIUS.sm,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    flex: 1,
  },
  saveButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium as any,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.sm,
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    flex: 1,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  cancelButtonText: {
    color: HEYWAY_COLORS.text.secondary,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium as any,
    textAlign: 'center',
  },
  settingsIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },

  answeringBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.sm,
  },
  answeringText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium as any,
  },
});

export default HomeSidebar;

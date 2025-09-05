// HomeSidebar.tsx — Liquid-Glass Sidebar (left panel only)
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

import {
  Plus,
  Phone,
  Users,
  Briefcase,
  Hash,
  Zap,
  PhoneIncoming,
  FolderPlus,
  Folder,
  ChevronDown,
} from 'lucide-react-native';

// web-only style helpers (typed)
const webView = (obj: Record<string, any>): Partial<ViewStyle> =>
  Platform.OS === 'web' ? obj : {};
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import {
  HEYWAY_COLORS,
  HEYWAY_SPACING,
  HEYWAY_TYPOGRAPHY,
  HEYWAY_RADIUS,
  HEYWAY_SHADOWS,
  HEYWAY_LAYOUT,
  HEYWAY_CHAT_PATTERNS
} from '../styles/HEYWAY_STYLE_GUIDE';

interface Group { id: string; name: string; calls: any[]; }
interface HomeSidebarProps {
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

const HomeSidebar: React.FC<HomeSidebarProps> = ({
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
  const [groupsExpanded, setGroupsExpanded] = useState(true);

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

  const onPressHaptic = useCallback(
    (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
      if (Platform.OS === 'ios') Haptics.impactAsync(style);
    },
    []
  );

  const sections = useMemo(
    () => [{ title: 'Top', data: topNavItems }, { title: 'Main', data: mainNavItems }],
    [topNavItems, mainNavItems]
  );

  return (
    <View
      style={[
        styles.sidebarContainer,
        isMobile ? (styles.mobileSidebar as ViewStyle) : undefined,
        isMobile && !showMobileMenu ? (styles.hiddenMobileSidebar as ViewStyle) : undefined,
      ].filter(Boolean) as ViewStyle[]}
      accessibilityRole="menu"
      accessibilityLabel="Primary navigation"
    >
      {/* Liquid Glass layer */}
      {Platform.OS !== 'web' ? (
        <BlurView tint="light" intensity={40} style={StyleSheet.absoluteFill} />
      ) : (
        <View style={styles.webGlassFallback} />
      )}
      {/* Inner highlight (glass rim) */}
      <View pointerEvents="none" style={styles.innerHighlight} />

      {/* Content */}
      <View style={styles.sidebarContent}>
        {/* Header with New Button */}
        <View style={styles.header}>
          <View style={styles.newButtonContainer}>
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => { onPressHaptic(Haptics.ImpactFeedbackStyle.Medium); onPlusToggle(); }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="New"
            >
              <Plus size={16} color={HEYWAY_COLORS.text.inverse} />
              <Text style={styles.newButtonText}>New</Text>
              <ChevronDown
                size={12}
                color={HEYWAY_COLORS.text.inverse}
                style={[
                  styles.chevronIcon,
                  showPlusDropdown && { transform: [{ rotate: '180deg' }] },
                  { opacity: 0.9 }
                ]}
              />
            </TouchableOpacity>

            {showPlusDropdown && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => { onPressHaptic(); onNewCall(); }}
                  activeOpacity={0.7}
                >
                  <Phone size={16} color={HEYWAY_COLORS.text.primary} />
                  <Text style={styles.dropdownItemText}>New Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => { onPressHaptic(); onNewAutomation(); }}
                  activeOpacity={0.7}
                >
                  <Zap size={16} color={HEYWAY_COLORS.text.primary} />
                  <Text style={styles.dropdownItemText}>New Automation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => { onPressHaptic(); onNewContact(); }}
                  activeOpacity={0.7}
                >
                  <Users size={16} color={HEYWAY_COLORS.text.primary} />
                  <Text style={styles.dropdownItemText}>New Contact</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => { onPressHaptic(); onNewList(); }}
                  activeOpacity={0.7}
                >
                  <Hash size={16} color={HEYWAY_COLORS.text.primary} />
                  <Text style={styles.dropdownItemText}>New List</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Body */}
        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {sections.map((section) => (
            <View key={section.title}>
              {section.data.map((item) => (
                <SidebarItem
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  active={activeNavItem === item.key}
                  onPress={() => { onPressHaptic(Haptics.ImpactFeedbackStyle.Medium); onNavItemPress(item.key); }}
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

        {/* Footer */}
        <View style={styles.footer}>
          {Platform.OS !== 'web' && (
            <TouchableOpacity
              style={styles.answeringBtn}
              onPress={() => { onPressHaptic(); onInboundPress(); }}
              accessibilityRole="switch"
              accessibilityState={{ checked: inboundActive }}
            >
              <PhoneIncoming size={16} color={inboundActive ? HEYWAY_COLORS.accent.success : HEYWAY_COLORS.text.secondary} />
              <Text style={[styles.answeringText, { color: inboundActive ? HEYWAY_COLORS.accent.success : HEYWAY_COLORS.text.secondary }]}>
                Answering {inboundActive ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Legal Links */}
          <View style={styles.legalLinksContainer}>
            <View style={styles.legalLinksRow}>
              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => {/* Open privacy statement */ }}
                activeOpacity={0.7}
              >
                <Text style={styles.legalLinkText}>Privacy Statement</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity
                style={styles.legalLink}
                onPress={() => {/* Open terms & conditions */ }}
                activeOpacity={0.7}
              >
                <Text style={styles.legalLinkText}>Terms & Conditions</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.copyrightText}>Heyway Technologies, Inc. All rights reserved</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

/************** Subcomponents **************/
const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onPress,
}: { icon: any; label: string; active?: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.navItem, active && styles.navItemActive]}
    activeOpacity={0.85}
    accessibilityRole="menuitem"
    accessibilityState={{ selected: !!active }}
  >
    <View style={styles.navIconWrap}>
      <Icon size={18} color={active ? HEYWAY_COLORS.text.macosPrimary : HEYWAY_COLORS.text.macosSecondary} />
    </View>
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const GroupRow = ({ name, count, active, onPress }: { name: string; count: number; active?: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.groupRow, active && styles.groupRowActive]}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityState={{ selected: !!active }}
  >
    <View style={styles.groupIconWrap}>
      <Folder size={16} color={active ? '#6B6B6B' : HEYWAY_COLORS.text.secondary} />
    </View>
    <Text style={[styles.groupName, active && styles.groupNameActive]} numberOfLines={1}>{name}</Text>
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  </TouchableOpacity>
);


/************** Styles **************/
const SIDEBAR_WIDTH = 224;

const styles = StyleSheet.create({
  // Clean sidebar container with sharp borders
  sidebarContainer: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#d1d1d6', // Clean sharp border
    ...HEYWAY_SHADOWS.light.sm, // Subtle shadow
    overflow: 'hidden', // clips blur & highlight to rounded edge
    backgroundColor: '#F1F3F4', // Slightly darker gray background
  },
  // Web fallback when BlurView isn't available
  webGlassFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F1F3F4', // Slightly darker gray background
  },
  // inner highlight ring for glass rim
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRightWidth: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    // subtle inner top highlight
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.55,
    shadowRadius: 0,
  },
  // actual content wrapper to restore solid padding
  sidebarContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  mobileSidebar: {
    position: 'absolute',
    left: 8,
    top: 8,
    bottom: 8,
    right: 8,
    zIndex: 20,
    borderRadius: HEYWAY_RADIUS.lg, // Add curved corners for mobile too
  },
  hiddenMobileSidebar: { transform: [{ translateX: -(SIDEBAR_WIDTH + 16) }] }, // Account for margins

  header: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7', // Clean border
    backgroundColor: '#F1F3F4', // Slightly darker gray background
    alignItems: 'center',
  },

  newButtonContainer: {
    width: '100%',
    position: 'relative',
  },
  newButton: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    backgroundColor: '#007AFF', // Clean blue
    shadowColor: '#007AFF',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    gap: 6,
  },
  newButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  chevronIcon: {
    marginLeft: 2,
  },
  dropdown: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: HEYWAY_SPACING.sm,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    zIndex: 1000,
    ...webView({
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)'
    } as any),
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    ...webView({ cursor: 'pointer' as any }),
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.2,
  },

  body: { flex: 1 },
  bodyContent: { paddingVertical: HEYWAY_SPACING.xs },

  navItem: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: 'transparent',
    borderRadius: 8, // Rounder corners for consistency
    ...webView({ cursor: 'pointer' as any }),
  },
  navItemActive: {
    backgroundColor: '#E5E7EB', // Darker gray background
    borderRadius: 8, // Rounder corners
  },
  navIconWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  navLabel: {
    fontSize: 16,
    color: HEYWAY_COLORS.text.macosPrimary,
  },
  navLabelActive: { fontWeight: '600' },

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
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: HEYWAY_COLORS.fill.quaternary,
    borderWidth: 0.5, borderColor: HEYWAY_COLORS.border.tertiary,
    ...webView({ cursor: 'pointer' as any }),
  },

  emptyGroupsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.xs,
  },
  emptyGroupsText: {
    fontSize: 13,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: -0.2,
  },
  emptyGroupsSubtext: { fontSize: 15, color: HEYWAY_COLORS.text.secondary },

  collapseRow: {
    paddingHorizontal: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    ...webView({ cursor: 'pointer' as any }),
  },
  collapseText: { fontSize: 12, color: HEYWAY_COLORS.text.tertiary },

  groupRow: {
    marginHorizontal: HEYWAY_SPACING.sm,
    height: 28,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    paddingRight: HEYWAY_SPACING.sm,
    backgroundColor: 'transparent',
    ...webView({ cursor: 'pointer' as any }),
  },
  groupRowActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  groupIconWrap: {
    position: 'absolute',
    left: 12,
    width: 20, height: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  groupName: { flex: 1, fontSize: 12, color: HEYWAY_COLORS.text.secondary },
  groupNameActive: { color: HEYWAY_COLORS.text.primary, fontWeight: '500' },
  badge: {
    backgroundColor: '#6B6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    padding: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.sm,
    backgroundColor: '#F8F9FA',
  },

  answeringBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.sm,
    ...webView({ cursor: 'pointer' as any }),
  },
  answeringText: { fontSize: 13, fontWeight: '600' },

  /* --- LEGAL LINKS STYLES ------------------------------------------ */
  legalLinksContainer: {
    marginTop: HEYWAY_SPACING.sm,
    gap: HEYWAY_SPACING.xs,
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.xs,
  },
  legalLink: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    ...webView({ cursor: 'pointer' as any }),
  },
  legalLinkText: {
    fontSize: 10,
    color: HEYWAY_COLORS.text.tertiary,
    fontWeight: '500',
  },
  legalSeparator: {
    fontSize: 10,
    color: HEYWAY_COLORS.text.tertiary,
    fontWeight: '400',
  },
  copyrightText: {
    fontSize: 9,
    color: HEYWAY_COLORS.text.tertiary,
    fontWeight: '400',
    textAlign: 'center',
  },
});

export default HomeSidebar;

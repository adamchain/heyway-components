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
  // Modern minimal sidebar container
  sidebarContainer: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.primary,
    overflow: 'hidden',
    ...HEYWAY_SHADOWS.sm,
  },
  webGlassFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HEYWAY_COLORS.background.primary,
  },
  innerHighlight: {
    ...StyleSheet.absoluteFillObject,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  sidebarContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  mobileSidebar: {
    position: 'absolute',
    left: HEYWAY_SPACING.sm,
    top: HEYWAY_SPACING.sm,
    bottom: HEYWAY_SPACING.sm,
    right: HEYWAY_SPACING.sm,
    zIndex: 20,
    borderRadius: HEYWAY_RADIUS.lg,
  },
  hiddenMobileSidebar: { 
    transform: [{ translateX: -(SIDEBAR_WIDTH + 16) }] 
  },

  header: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    alignItems: 'center',
  },

  newButtonContainer: {
    width: '100%',
    position: 'relative',
  },
  newButton: {
    width: '100%',
    borderRadius: HEYWAY_RADIUS.md,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    backgroundColor: HEYWAY_COLORS.interactive.primary,
    flexDirection: 'row',
    gap: HEYWAY_SPACING.xs,
    ...HEYWAY_SHADOWS.sm,
  },
  newButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: '600',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  chevronIcon: {
    marginLeft: HEYWAY_SPACING.xs,
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    zIndex: 1000,
    ...HEYWAY_SHADOWS.md,
    ...webView({ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } as any),
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
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  body: { 
    flex: 1 
  },
  bodyContent: { 
    paddingVertical: HEYWAY_SPACING.sm 
  },

  navItem: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: HEYWAY_SPACING.lg,
    paddingRight: HEYWAY_SPACING.md,
    backgroundColor: 'transparent',
    borderRadius: HEYWAY_RADIUS.md,
    marginHorizontal: HEYWAY_SPACING.sm,
    marginVertical: 1,
    ...webView({ cursor: 'pointer' as any }),
  },
  navItemActive: {
    backgroundColor: HEYWAY_COLORS.background.selected,
    borderRadius: HEYWAY_RADIUS.md,
    ...HEYWAY_SHADOWS.xs,
  },
  navIconWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: HEYWAY_SPACING.sm,
  },
  navLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  navLabelActive: { 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
  },

  sectionHeaderRow: {
    marginTop: HEYWAY_SPACING.lg,
    marginBottom: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  createBtn: {
    width: 20, 
    height: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: HEYWAY_RADIUS.sm,
    backgroundColor: HEYWAY_COLORS.background.hover,
    borderWidth: StyleSheet.hairlineWidth, 
    borderColor: HEYWAY_COLORS.border.primary,
    ...webView({ cursor: 'pointer' as any }),
  },

  emptyGroupsState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: HEYWAY_SPACING.xxl,
    paddingHorizontal: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.xs,
  },
  emptyGroupsText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  emptyGroupsSubtext: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline, 
    color: HEYWAY_COLORS.text.secondary 
  },

  collapseRow: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.xs,
    ...webView({ cursor: 'pointer' as any }),
  },
  collapseText: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption, 
    color: HEYWAY_COLORS.text.secondary 
  },

  groupRow: {
    marginHorizontal: HEYWAY_SPACING.lg,
    height: 32,
    borderRadius: HEYWAY_RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 36,
    paddingRight: HEYWAY_SPACING.sm,
    backgroundColor: 'transparent',
    ...webView({ cursor: 'pointer' as any }),
  },
  groupRowActive: { 
    backgroundColor: HEYWAY_COLORS.background.selected 
  },
  groupIconWrap: {
    position: 'absolute',
    left: HEYWAY_SPACING.md,
    width: 16, 
    height: 16,
    alignItems: 'center', 
    justifyContent: 'center',
  },
  groupName: { 
    flex: 1, 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.footnote, 
    color: HEYWAY_COLORS.text.secondary 
  },
  groupNameActive: { 
    color: HEYWAY_COLORS.text.primary, 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium 
  },
  badge: {
    backgroundColor: HEYWAY_COLORS.text.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    height: 18,
    borderRadius: HEYWAY_RADIUS.sm,
    paddingHorizontal: HEYWAY_SPACING.xs,
  },
  badgeText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    color: HEYWAY_COLORS.text.inverse,
    fontWeight: '600',
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HEYWAY_COLORS.border.primary,
    padding: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.secondary,
  },

  answeringBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    paddingVertical: HEYWAY_SPACING.xs,
    paddingHorizontal: HEYWAY_SPACING.sm,
    borderRadius: HEYWAY_RADIUS.sm,
    backgroundColor: 'transparent',
    ...webView({ cursor: 'pointer' as any }),
  },
  answeringText: { 
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.footnote, 
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold 
  },

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
    paddingVertical: HEYWAY_SPACING.xs,
    paddingHorizontal: HEYWAY_SPACING.xs,
    ...webView({ cursor: 'pointer' as any }),
  },
  legalLinkText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: '500',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
  legalSeparator: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
  },
  copyrightText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    color: HEYWAY_COLORS.text.secondary,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    textAlign: 'center',
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});

export default HomeSidebar;

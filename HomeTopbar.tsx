import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Search, Plus, ChevronDown, Phone, Users, Briefcase, Hash, Zap } from 'lucide-react-native';

// Import HEYWAY Style Guide
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_LAYOUT } from '@styles/HEYWAY_STYLE_GUIDE';

interface HomeTopbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showPlusDropdown: boolean;
  onPlusToggle: () => void;
  onNewCall: () => void;
  onNewAutomation: () => void;
  onNewContact: () => void;
  onNewList: () => void;
}

const HomeTopbar: React.FC<HomeTopbarProps> = ({
  searchQuery,
  onSearchChange,
  showPlusDropdown,
  onPlusToggle,
  onNewCall,
  onNewAutomation,
  onNewContact,
  onNewList
}) => {
  return (
    <View style={styles.topbar}>
      <View style={styles.topbarContent}>
        {/* Left Panel Width Spacer */}
        <View style={styles.leftPanelSpacer}>
          {/* Logo + Heyway Title */}
          <View style={styles.topbarBranding}>
            <Image
              source={require('../assets/images/logo.webp')}
              style={styles.topbarLogoImage}
              resizeMode="contain"
            />
            <Text style={styles.topbarTitle}>Heyway</Text>
          </View>
        </View>

        {/* Search Bar - Aligned with Details Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search
              size={18}
              color={HEYWAY_COLORS.text.secondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search contacts, businesses, or calls..."
              placeholderTextColor={HEYWAY_COLORS.text.tertiary}
              value={searchQuery}
              onChangeText={onSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Right Side - Plus Icon with Dropdown */}
        <View style={styles.rightPanelSpacer}>
          <View style={styles.plusDropdownContainer}>
            <TouchableOpacity
              style={styles.plusButton}
              onPress={onPlusToggle}
              activeOpacity={0.7}
            >
              <Plus size={20} color={HEYWAY_COLORS.text.inverse} />
              <ChevronDown
                size={14}
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
                  onPress={onNewCall}
                  activeOpacity={0.7}
                >
                  <Phone size={16} color={HEYWAY_COLORS.text.primary} />
                  <Text style={styles.dropdownItemText}>New Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={onNewAutomation}
                  activeOpacity={0.7}
                >
                  <Zap size={16} color={HEYWAY_COLORS.text.primary} />
                  <Text style={styles.dropdownItemText}>New Automation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={onNewContact}
                  activeOpacity={0.7}
                >
                  <Users size={16} color={HEYWAY_COLORS.text.primary} />
                  <Text style={styles.dropdownItemText}>New Contact</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={onNewList}
                  activeOpacity={0.7}
                >
                  <Hash size={16} color={HEYWAY_COLORS.text.primary} />
                  <Text style={styles.dropdownItemText}>New List</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topbar: {
    width: '100%',
    backgroundColor: HEYWAY_COLORS.background.primary,
    paddingVertical: HEYWAY_SPACING.md,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    zIndex: 100,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  topbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    gap: HEYWAY_SPACING.lg,
  },

  leftPanelSpacer: {
    width: 220,
    justifyContent: 'center',
  },

  topbarBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
    marginLeft: HEYWAY_SPACING.lg,
  },

  topbarLogoImage: {
    width: 40,
    height: 40,
    borderRadius: HEYWAY_RADIUS.component.card.lg,
    shadowColor: 'rgba(0, 0, 0, 0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },

  topbarTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  searchContainer: {
    flex: 1,
    paddingLeft: HEYWAY_SPACING.lg,
    paddingRight: HEYWAY_SPACING.lg,
  },

  rightPanelSpacer: {
    width: 120,
    justifyContent: 'flex-end',
  },

  plusDropdownContainer: {
    position: 'relative',
    alignItems: 'flex-end',
  },

  plusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: HEYWAY_RADIUS.component.button.full,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    gap: HEYWAY_SPACING.xs,
    minHeight: 32,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },

  chevronIcon: {
    // Transform animation handled by React Native
  },

  dropdown: {
    position: 'absolute',
    top: 56,
    right: 0,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.component.card.xxl,
    paddingVertical: HEYWAY_SPACING.sm,
    minWidth: 200,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.divider,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
    zIndex: 10000,
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: HEYWAY_SPACING.lg,
    paddingHorizontal: HEYWAY_SPACING.lg,
    gap: HEYWAY_SPACING.md,
    borderRadius: HEYWAY_RADIUS.component.button.md,
    marginHorizontal: HEYWAY_SPACING.xs,
    minHeight: HEYWAY_LAYOUT.component.button.height.md,
  },

  dropdownItemText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderRadius: HEYWAY_RADIUS.component.input.xl,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    borderWidth: 0,
    minHeight: 36,
  },

  searchIcon: {
    marginRight: 8,
    opacity: 0.7,
  },

  searchInput: {
    flex: 1,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.primary,
    paddingVertical: 0,
  },
});

export default HomeTopbar;

import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MoreHorizontal, CreditCard, LogOut, Trash2, PhoneIncoming, Phone, Users, Briefcase, Hash, Zap, Plus } from 'lucide-react-native';

// Import HEYWAY Style Guide - WhatsApp-inspired Design
import { HEYWAY_COLORS, HEYWAY_TYPOGRAPHY, HEYWAY_SPACING, HEYWAY_SHADOWS, HEYWAY_RADIUS, HEYWAY_LAYOUT } from '../../styles/HEYWAY_STYLE_GUIDE';

// Custom hook for home screen logic
import { useHomeScreen } from '@/hooks/useHomeScreen';
import { useAuth } from '@/contexts/AuthContext';
import { useCallerId } from '@/hooks/useCallerId';
// Import your API service for user account actions
import { apiService } from '@/services/apiService';

// Modular components
import HomeSidebar from '@/components/HomeSidebar';
import HomeMobileHeader from '@/components/HomeMobileHeader';
import HomeMobileBottomNav from '@/components/HomeMobileBottomNav';
const HomeContentArea = React.lazy(() => import('@/components/HomeContentArea'));
const HomeModals = React.lazy(() => import('@/components/HomeModals'));

function HomeScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { callerIdInfo, saveCallerIdPreference } = useCallerId();
  const [showTopbarSettingsDropdown, setShowTopbarSettingsDropdown] = React.useState(false);
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedFirstName, setEditedFirstName] = React.useState(user?.profile?.firstName || '');
  const [isEditingCallerId, setIsEditingCallerId] = React.useState(false);
  const [editedCallerId, setEditedCallerId] = React.useState('');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteUserAccount();
              Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
              logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSaveFirstName = async () => {
    if (!editedFirstName.trim()) return alert('First name cannot be empty');
    try {
      await updateProfile({ firstName: editedFirstName.trim() });
      setIsEditingName(false);
      alert('Your name has been updated! This is what the AI caller will refer to you as.');
    } catch {
      alert('Failed to update your name. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedFirstName(user?.profile?.firstName || '');
    setIsEditingName(false);
  };

  const handleSaveCallerId = async () => {
    if (!editedCallerId.trim()) return alert('Caller ID cannot be empty');
    const phoneRegex = /^\+?[\d\s\-\(\)\.]+$/;
    if (!phoneRegex.test(editedCallerId.trim())) {
      return alert('Please enter a valid phone number');
    }
    try {
      await saveCallerIdPreference(editedCallerId.trim());
      setIsEditingCallerId(false);
      setEditedCallerId('');
      alert('Your caller ID has been updated!');
    } catch {
      alert('Failed to update caller ID. Please try again.');
    }
  };

  const handleCancelCallerIdEdit = () => {
    setEditedCallerId('');
    setIsEditingCallerId(false);
  };

  // Memoize expensive computed values
  const userInitial = useMemo(() =>
    (user?.profile?.firstName || 'U').slice(0, 1),
    [user?.profile?.firstName]
  );

  const callerIdDisplay = useMemo(() =>
    callerIdInfo?.last4Digits ? `***-***-${callerIdInfo.last4Digits}` : 'Tap to set caller ID',
    [callerIdInfo?.last4Digits]
  );

  const {
    // State
    showNewCallModal,
    activeNavItem,
    showSettingsSidebar,
    showMobileMenu,
    selectedContacts,
    showInboundModal,
    inboundActive,
    keyboardOffset,
    showOnboarding,
    hasCheckedCallerIds,
    showCallerIdBanner,
    hasVerifiedCallerId,
    showScheduledActivityBanner,
    hasCheckedScheduledActivity,
    contactsActiveSection,
    showCSVImportModal,
    showAddContactModal,
    showAutomationContactsModal,
    selectedContactsForAutomation,
    businessActiveSection,
    businessSearchQuery,
    businessLocationQuery,
    isBusinessSearchLoading,
    automationsActiveSection,
    selectedAutomation,
    showCreateAutomationModal,
    showEditAutomationModal,
    editingAutomation,
    callsActiveSection,
    selectedCall,
    showCallPanel,
    searchQuery,
    showPlusDropdown,
    groups,
    selectedGroupId,
    showCreateGroupModal,

    // Dimensions
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,

    // Animation refs
    aiGlowAnim,
    contentFadeAnim,
    contentSlideAnim,
    navIndicatorAnim,

    // Hooks
    callHistory,
    contacts,
    modals,
    aiCallerPrompts,

    // Setters
    setShowNewCallModal,
    setActiveNavItem,
    setShowSettingsSidebar,
    setShowMobileMenu,
    setSelectedContacts,
    setShowInboundModal,
    setInboundActive,
    setShowOnboarding,
    setShowCallerIdBanner,
    setShowScheduledActivityBanner,
    setContactsActiveSection,
    setShowCSVImportModal,
    setShowAddContactModal,
    setShowAutomationContactsModal,
    setSelectedContactsForAutomation,
    setBusinessActiveSection,
    setBusinessSearchQuery,
    setBusinessLocationQuery,
    setIsBusinessSearchLoading,
    setAutomationsActiveSection,
    setSelectedAutomation,
    setShowCreateAutomationModal,
    setShowEditAutomationModal,
    setEditingAutomation,
    setCallsActiveSection,
    setSelectedCall,
    setShowCallPanel,
    setSearchQuery,
    setShowPlusDropdown,
    setGroups,
    setSelectedGroupId,
    setShowCreateGroupModal,

    // Handlers
    handleNavItemPress,
    handleItemSelect,
    removeSelectedContact,
    handleContinue,
    handleOnboardingComplete,
    handleOnboardingSkip,
    handleBannerDismiss,
    handleBusinessSearch,
    handleBusinessSearchComplete,
    handleBusinessSectionChange,
    handleBusinessSearchQueryChange,
    handleBusinessLocationQueryChange,
    handleCreateAutomation,
    handleEditAutomation,
    handleAutomationToggle,
    handleAutomationDelete,
    handleImportContacts,
    handleAddContactsToAutomation,
    handleContactSelectedForAutomation,
    handleCreateGroup,
    handleGroupSelect,
    handleAddCallToGroup,
    handleRemoveCallFromGroup,

    // Utility functions
    checkScheduledActivity,
    checkInboundStatus,
    checkCallerIds,
  } = useHomeScreen();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />


        {/* Liquid Glass Header Top Bar - Full Width Above Everything */}
        {!isMobile && (
          <View style={styles.liquidGlassHeader}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.headerLogoText}>Heyway</Text>
            </View>
            <View style={styles.headerCenter}>
            </View>
            <View style={styles.headerRight}>
              {/* User Info Section */}
              <View style={styles.userInfoSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarInitial}>{userInitial}</Text>
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
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveFirstName} activeOpacity={0.7}>
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit} activeOpacity={0.7}>
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : isEditingCallerId ? (
                    <View style={styles.editNameContainer}>
                      <TextInput
                        style={styles.nameInput}
                        value={editedCallerId}
                        onChangeText={setEditedCallerId}
                        placeholder="Enter your caller ID (e.g., +1234567890)"
                        placeholderTextColor={HEYWAY_COLORS.text.tertiary}
                        autoFocus
                        keyboardType="phone-pad"
                        maxLength={20}
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSaveCallerId} activeOpacity={0.7}>
                          <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelCallerIdEdit} activeOpacity={0.7}>
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.profileFieldsContainer}>
                      <TouchableOpacity onPress={() => setIsEditingName(true)} style={styles.nameFieldContainer} activeOpacity={0.7}>
                        <Text style={styles.userName}>{user?.profile?.firstName || 'Tap to set your name'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => modals.setShowCallerIdSetup(true)} style={styles.callerIdFieldContainer} activeOpacity={0.7}>
                        <Text style={styles.callerIdText} numberOfLines={1}>
                          Caller ID: {callerIdDisplay}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.settingsIconBtn}
                  onPress={() => setShowTopbarSettingsDropdown(!showTopbarSettingsDropdown)}
                  activeOpacity={0.8}
                >
                  <MoreHorizontal size={16} color={HEYWAY_COLORS.text.tertiary} />
                </TouchableOpacity>
              </View>

              {/* Settings Dropdown */}
              {showTopbarSettingsDropdown && (
                <View style={styles.topbarSettingsDropdown}>
                  <TouchableOpacity
                    style={styles.topbarDropdownItem}
                    onPress={() => {
                      setShowSettingsSidebar(true);
                      setShowTopbarSettingsDropdown(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <CreditCard size={16} color={HEYWAY_COLORS.text.secondary} />
                    <Text style={styles.topbarDropdownText}>Upgrade to Pro</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.topbarDropdownItem}
                    onPress={() => {
                      handleLogout();
                      setShowTopbarSettingsDropdown(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <LogOut size={16} color={HEYWAY_COLORS.text.secondary} />
                    <Text style={styles.topbarDropdownText}>Sign Out</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.topbarDropdownItem}
                    onPress={() => {
                      handleDeleteAccount();
                      setShowTopbarSettingsDropdown(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Trash2 size={16} color={HEYWAY_COLORS.status.error} />
                    <Text style={[styles.topbarDropdownText, { color: HEYWAY_COLORS.status.error }]}>Delete Account</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}


        {/* Responsive Layout */}
        <View style={[styles.desktopLayout, isMobile && styles.mobileLayout]}>

          {/* Mobile Header with Menu Button */}
          {isMobile && (
            <HomeMobileHeader
              onMenuPress={() => setShowMobileMenu(!showMobileMenu)}
              onSettingsPress={() => setShowSettingsSidebar(true)}
              onNewCallPress={() => setShowNewCallModal(true)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeNavItem={activeNavItem}
            />
          )}

          {/* Left Navigation Panel - Hidden on mobile by default */}
          <HomeSidebar
            showPlusDropdown={showPlusDropdown}
            onPlusToggle={() => setShowPlusDropdown(!showPlusDropdown)}
            activeNavItem={activeNavItem}
            onNavItemPress={handleNavItemPress}
            onNewCall={() => setShowNewCallModal(true)}
            onNewAutomation={() => setShowCreateAutomationModal(true)}
            onNewContact={() => setShowAddContactModal(true)}
            onNewList={() => setShowCSVImportModal(true)}
            onSettingsPress={() => setShowSettingsSidebar(true)}
            onInboundPress={() => setShowInboundModal(true)}
            inboundActive={inboundActive}
            isMobile={isMobile}
            showMobileMenu={showMobileMenu}
            groups={groups}
            onGroupSelect={handleGroupSelect}
            onCreateGroup={() => setShowCreateGroupModal(true)}
            selectedGroupId={selectedGroupId ?? undefined}
          />

          {/* Mobile Overlay */}
          {isMobile && showMobileMenu && (
            <TouchableOpacity
              style={styles.mobileOverlay}
              onPress={() => setShowMobileMenu(false)}
              activeOpacity={1}
            />
          )}

          {/* Settings Dropdown Overlay */}
          {showTopbarSettingsDropdown && (
            <TouchableOpacity
              style={styles.mobileOverlay}
              onPress={() => setShowTopbarSettingsDropdown(false)}
              activeOpacity={1}
            />
          )}

          {/* Main Content Area - Responsive Layout */}
          <React.Suspense fallback={
            <View style={styles.loadingFallback}>
              <ActivityIndicator size="large" color={HEYWAY_COLORS.interactive.primary} />
              <Text style={styles.loadingText}>Loading content...</Text>
            </View>
          }>
            <HomeContentArea
              activeNavItem={activeNavItem}
              isMobile={isMobile}
              selectedCall={selectedCall}
              onCallSelect={setSelectedCall}
              onBackToCalls={() => setSelectedCall(null)}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              callsActiveSection={callsActiveSection}
              showScheduledActivityBanner={showScheduledActivityBanner}
              onScheduledActivityDataChange={checkScheduledActivity}
              onNewCall={() => setShowNewCallModal(true)}
              groups={groups}
              onAddCallToGroup={handleAddCallToGroup}
              contactsActiveSection={contactsActiveSection}
              onAddToCallList={handleItemSelect}
              onContactsSectionChange={setContactsActiveSection}
              onImportContacts={() => setShowCSVImportModal(true)}
              onAddContact={() => setShowAddContactModal(true)}
              selectedAutomation={selectedAutomation}
              businessActiveSection={businessActiveSection}
              businessSearchQuery={businessSearchQuery}
              businessLocationQuery={businessLocationQuery}
              isBusinessSearchLoading={isBusinessSearchLoading}
              onBusinessSearchComplete={handleBusinessSearchComplete}
              onBusinessSectionChange={handleBusinessSectionChange}
              onBusinessSearchQueryChange={handleBusinessSearchQueryChange}
              onBusinessLocationQueryChange={handleBusinessLocationQueryChange}
              onBusinessSearch={handleBusinessSearch}
              automationsActiveSection={automationsActiveSection}
              onAutomationSelect={setSelectedAutomation}
              onCreateAutomation={() => setShowCreateAutomationModal(true)}
              onEditAutomation={(automation) => {
                setEditingAutomation(automation);
                setShowEditAutomationModal(true);
              }}
              onAutomationToggle={handleAutomationToggle}
              onAutomationDelete={handleAutomationDelete}
              onAutomationAddContacts={(automation) => {
                setEditingAutomation(automation);
                setShowAutomationContactsModal(true);
                setSelectedContactsForAutomation([]);
              }}
              onAutomationImportContacts={(automation) => {
                setEditingAutomation(automation);
                setShowCSVImportModal(true);
              }}
              onAutomationViewContacts={(automation) => {
                setActiveNavItem('contacts');
                setContactsActiveSection('automations');
                setSelectedAutomation(automation);
              }}
            />
          </React.Suspense>
        </View>

        {/* Floating Action Button - Mobile Only */}
        {isMobile && (
          <View style={styles.mobileFloatingActionContainer}>
            <TouchableOpacity
              style={styles.mobileFloatingActionButton}
              onPress={() => setShowNewCallModal(true)}
              activeOpacity={0.8}
            >
              <Plus size={24} color={HEYWAY_COLORS.text.inverse} />
            </TouchableOpacity>
          </View>
        )}

        {/* Mobile Bottom Navigation - Alternative to hamburger menu */}
        {isMobile && (
          <HomeMobileBottomNav
            activeNavItem={activeNavItem}
            onNavItemPress={handleNavItemPress}
            onSettingsPress={() => setShowSettingsSidebar(true)}
          />
        )}

        {/* Modals */}
        <React.Suspense fallback={null}>
          <HomeModals
            showNewCallModal={showNewCallModal}
            showSettingsSidebar={showSettingsSidebar}
            showInboundModal={showInboundModal}
            showCreateAutomationModal={showCreateAutomationModal}
            showEditAutomationModal={showEditAutomationModal}
            showCSVImportModal={showCSVImportModal}
            showAddContactModal={showAddContactModal}
            showAutomationContactsModal={showAutomationContactsModal}
            showOnboarding={showOnboarding}
            showCallerIdBanner={showCallerIdBanner}
            showCallerIdSetup={modals.showCallerIdSetup}
            showCreateGroupModal={showCreateGroupModal}
            selectedContacts={selectedContacts}
            editingAutomation={editingAutomation}
            selectedContactsForAutomation={selectedContactsForAutomation}
            onCloseNewCallModal={() => setShowNewCallModal(false)}
            onCloseSettingsSidebar={() => setShowSettingsSidebar(false)}
            onCloseInboundModal={() => setShowInboundModal(false)}
            onCloseCreateAutomationModal={() => setShowCreateAutomationModal(false)}
            onCloseEditAutomationModal={() => {
              setShowEditAutomationModal(false);
              setEditingAutomation(null);
            }}
            onCloseCSVImportModal={() => {
              setShowCSVImportModal(false);
              setEditingAutomation(null);
            }}
            onCloseAddContactModal={() => {
              setShowAddContactModal(false);
              setEditingAutomation(null);
            }}
            onCloseAutomationContactsModal={() => {
              setShowAutomationContactsModal(false);
              setEditingAutomation(null);
              setSelectedContactsForAutomation([]);
            }}
            onCloseOnboarding={() => setShowOnboarding(false)}
            onDismissCallerIdBanner={handleBannerDismiss}
            onCloseCallerIdSetup={() => modals.setShowCallerIdSetup(false)}
            onCloseCreateGroupModal={() => setShowCreateGroupModal(false)}
            onCreateAutomation={handleCreateAutomation}
            onEditAutomation={handleEditAutomation}
            onImportContacts={handleImportContacts}
            onAddContactsToAutomation={handleAddContactsToAutomation}
            onContactSelectedForAutomation={handleContactSelectedForAutomation}
            onCompleteOnboarding={handleOnboardingComplete}
            onSkipOnboarding={handleOnboardingSkip}
            onNavigateToRecents={() => setActiveNavItem('recents')}
            onCallerIdSetup={() => modals.setShowCallerIdSetup(true)}
            onCreateGroup={handleCreateGroup}
          />
        </React.Suspense>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary, // Consistent background
  } as const,

  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Desktop Layout Styles - Clean minimalist design
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 0,
    backgroundColor: '#FFFFFF', // Clean white background
    paddingTop: 44, // Account for fixed header height
  },

  // Mobile Layout Override
  mobileLayout: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF', // Clean white background
    paddingTop: 0, // No header on mobile, so no padding needed
    paddingBottom: 0, // Bottom nav handles its own padding
  },

  // Mobile Overlay - WhatsApp-inspired overlay
  mobileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: HEYWAY_COLORS.background.overlay,
    zIndex: 999,
  },

  // Clean Header Styles
  liquidGlassHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: '#FFFFFF', // Clean white background
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7', // Clean subtle border
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.lg,
    ...HEYWAY_SHADOWS.light.xs, // Subtle shadow
    zIndex: 1000, // Ensure it's above other content
  },
  headerLeft: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerLogoText: {
    fontSize: 18,
    fontWeight: '600',
    color: HEYWAY_COLORS.interactive.primary,
    letterSpacing: -0.2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topbarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  topbarNavItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 2,
  },
  topbarNavItemActive: {
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  topbarNavLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: -0.1,
  },
  topbarNavLabelActive: {
    color: HEYWAY_COLORS.interactive.primary,
    fontWeight: '600',
  },
  headerSearchContainer: {
    position: 'relative',
    width: 300,
  },
  headerSearchIcon: {
    position: 'absolute',
    left: 12,
    top: 6,
    zIndex: 1,
  },
  headerSearchInput: {
    backgroundColor: HEYWAY_COLORS.background.macosHover,
    borderRadius: HEYWAY_RADIUS.lg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    paddingLeft: 36,
    fontSize: 14,
    color: HEYWAY_COLORS.text.macosPrimary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.xs,
    height: 32,
  },
  headerRight: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    gap: 16,
    position: 'relative',
  },
  topbarSettingsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topbarInboundButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.macosHover,
  },
  topbarSettingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.background.macosHover,
  },
  topbarSettingsDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    ...HEYWAY_SHADOWS.light.md,
    zIndex: 1001,
    minWidth: 180,
    paddingVertical: HEYWAY_SPACING.sm,
  },
  topbarDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.sm,
    gap: HEYWAY_SPACING.sm,
  },
  topbarDropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: HEYWAY_COLORS.text.secondary,
  },

  /* --- USER INFO IN HEADER STYLES ------------------------------------------ */
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: HEYWAY_COLORS.fill.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },
  avatarInitial: {
    fontSize: 13,
    color: HEYWAY_COLORS.text.secondary,
  },
  accountTextCol: {
    minWidth: 200,
  },
  profileFieldsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameFieldContainer: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    flex: 1,
  },
  callerIdFieldContainer: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: HEYWAY_COLORS.text.primary,
    lineHeight: 14,
  },
  callerIdText: {
    fontSize: 11,
    color: HEYWAY_COLORS.text.secondary,
  },
  editNameContainer: {
    minWidth: 150,
  },
  nameInput: {
    fontSize: 12,
    color: HEYWAY_COLORS.text.primary,
    backgroundColor: HEYWAY_COLORS.fill.quaternary,
    borderRadius: HEYWAY_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    height: 24,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  saveButton: {
    backgroundColor: HEYWAY_COLORS.accent.success,
    borderRadius: HEYWAY_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flex: 1,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: HEYWAY_COLORS.text.inverse,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: HEYWAY_COLORS.fill.quaternary,
    borderRadius: HEYWAY_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flex: 1,
    borderWidth: 1,
    borderColor: HEYWAY_COLORS.border.secondary,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: HEYWAY_COLORS.text.secondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HEYWAY_COLORS.fill.quaternary,
  },

  // Search Overlay Styles
  searchOverlay: {
    position: 'absolute',
    top: 44 + 8 + 14, // Header height + sidebar margin + sidebar top padding
    left: 8 + 16, // Sidebar left margin + sidebar internal padding
    width: 224 - 32, // Sidebar width minus internal padding (16px on each side)
    zIndex: 1001, // Above sidebar but below modals
  },
  overlaySearchContainer: {
    position: 'relative',
  },
  overlaySearchIcon: {
    position: 'absolute',
    left: 12,
    top: 6,
    zIndex: 1,
  },
  overlaySearchInput: {
    backgroundColor: HEYWAY_COLORS.background.macosHover,
    borderRadius: HEYWAY_RADIUS.lg,
    paddingVertical: 6,
    paddingHorizontal: 12,
    paddingLeft: 36,
    fontSize: 14,
    color: HEYWAY_COLORS.text.macosPrimary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.xs,
    height: 32,
  },

  // Mobile Floating Action Button
  mobileFloatingActionContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 85, // Above bottom navigation
    right: HEYWAY_SPACING.lg,
    zIndex: 1000,
  },

  mobileFloatingActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: HEYWAY_COLORS.interactive.whatsappGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: HEYWAY_COLORS.interactive.whatsappGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Loading fallback styles
  loadingFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: HEYWAY_COLORS.background.primary,
    gap: HEYWAY_SPACING.md,
  },

  loadingText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: '500' as const,
    color: HEYWAY_COLORS.text.secondary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },
});

export default HomeScreen;

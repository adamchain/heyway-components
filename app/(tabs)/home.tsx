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
    backgroundColor: '#FFFFFF', // Clean white background
  } as const,

  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Clean Desktop Layout
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 60, // Clean header space
  },

  // Mobile Layout
  mobileLayout: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingTop: 0,
    paddingBottom: 0,
  },

  // Clean Mobile Overlay
  mobileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 999,
  },

  // Modern Header
  liquidGlassHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5E7',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    zIndex: 1000,
  },
  headerLeft: {
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  headerLogoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    letterSpacing: -0.3,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 240,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    position: 'relative',
  },
  topbarSettingsDropdown: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
    minWidth: 200,
    paddingVertical: 8,
  },
  topbarDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  topbarDropdownText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },

  // Clean User Info Section
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E0E0',
  },
  avatarInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  accountTextCol: {
    minWidth: 180,
  },
  profileFieldsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameFieldContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    flex: 1,
  },
  callerIdFieldContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 18,
  },
  callerIdText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
  },
  editNameContainer: {
    minWidth: 160,
  },
  nameInput: {
    fontSize: 13,
    color: '#1C1C1E',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 28,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#757575',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  settingsIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E0E0E0',
  },

  // Clean Mobile FAB
  mobileFloatingActionContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 85,
    right: 20,
    zIndex: 1000,
  },

  mobileFloatingActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },

  // Clean Loading States
  loadingFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
    letterSpacing: 0,
  },
});

export default HomeScreen;

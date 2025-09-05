import React, { Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { Phone, ArrowRight, Target, Users, Search } from 'lucide-react-native';

// Import HEYWAY Style Guide
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_LAYOUT, HEYWAY_COMPONENTS } from '../styles/HEYWAY_STYLE_GUIDE';

// web-only style helpers (typed)
const webView = (obj: any): any =>
  Platform.OS === 'web' ? obj : {};

const webText = (obj: any): any =>
  Platform.OS === 'web' ? obj : {};

// Lazy loaded components
const CallSummaryCard = React.lazy(() => import('@/components/CallSummaryCard'));
const ContactsCardView = React.lazy(() => import('@/components/ContactsCardView'));
const BusinessCardView = React.lazy(() => import('@/components/BusinessCardView'));
const BusinessSearchSection = React.lazy(() => import('@/components/BusinessSearchSection'));
const AutomationsListView = React.lazy(() => import('@/components/AutomationsListView'));
const AutomationDetailsView = React.lazy(() => import('@/components/AutomationDetailsView'));
const CallsListView = React.lazy(() => import('@/components/CallsListView'));
const KeypadContent = React.lazy(() => import('@/components/KeypadContent'));

interface HomeContentAreaProps {
  activeNavItem: string;
  isMobile: boolean;
  selectedCall: any;
  onCallSelect: (call: any) => void;
  onBackToCalls: () => void;
  // Search props
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Calls section props
  callsActiveSection: string;
  showScheduledActivityBanner: boolean;
  onScheduledActivityDataChange?: () => void;
  onNewCall?: () => void;
  // Groups props
  groups?: Array<{ id: string; name: string; calls: any[] }>;
  onAddCallToGroup?: (callId: string, groupId: string) => void;
  // Contacts section props
  contactsActiveSection: string;
  onAddToCallList: (contact: any) => void;
  onContactsSectionChange: (section: string) => void;
  onImportContacts: () => void;
  onAddContact: () => void;
  selectedAutomation: any;
  // Business section props
  businessActiveSection: string;
  businessSearchQuery: string;
  businessLocationQuery: string;
  isBusinessSearchLoading: boolean;
  onBusinessSearchComplete: () => void;
  onBusinessSectionChange: (section: string) => void;
  onBusinessSearchQueryChange: (query: string) => void;
  onBusinessLocationQueryChange: (query: string) => void;
  onBusinessSearch: () => void;
  // Automations section props
  automationsActiveSection: string;
  onAutomationSelect: (automation: any) => void;
  onCreateAutomation: () => void;
  onEditAutomation: (automation: any) => void;
  onAutomationToggle: (automationId: string) => Promise<void>;
  onAutomationDelete: (automationId: string) => Promise<void>;
  onAutomationAddContacts: (automation: any) => void;
  onAutomationImportContacts: (automation: any) => void;
  onAutomationViewContacts: (automation: any) => void;
}

const HomeContentArea: React.FC<HomeContentAreaProps> = ({
  activeNavItem,
  isMobile,
  selectedCall,
  onCallSelect,
  onBackToCalls,
  searchQuery,
  onSearchChange,
  callsActiveSection,
  showScheduledActivityBanner,
  onScheduledActivityDataChange,
  onNewCall,
  groups = [],
  onAddCallToGroup,
  contactsActiveSection,
  onAddToCallList,
  onContactsSectionChange,
  onImportContacts,
  onAddContact,
  selectedAutomation,
  businessActiveSection,
  businessSearchQuery,
  businessLocationQuery,
  isBusinessSearchLoading,
  onBusinessSearchComplete,
  onBusinessSectionChange,
  onBusinessSearchQueryChange,
  onBusinessLocationQueryChange,
  onBusinessSearch,
  automationsActiveSection,
  onAutomationSelect,
  onCreateAutomation,
  onEditAutomation,
  onAutomationToggle,
  onAutomationDelete,
  onAutomationAddContacts,
  onAutomationImportContacts,
  onAutomationViewContacts,
}) => {
  const screenDimensions = Dimensions.get('window');
  const screenWidth = screenDimensions.width;

  const LoadingFallback = ({ message }: { message: string }) => (
    <View style={styles.detailsPlaceholder}>
      <View style={styles.placeholderCard}>
        <Text style={styles.detailsPlaceholderText}>{message}</Text>
      </View>
    </View>
  );

  const SearchBar = () => (
    <View style={styles.searchBarContainer}>
      <View style={styles.searchBarWrapper}>
        <Search size={16} color={HEYWAY_COLORS.text.macosSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeNavItem}...`}
          placeholderTextColor={HEYWAY_COLORS.text.macosSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );

  const renderRecentsContent = () => (
    <>
      {/* Left Half - Calls List */}
      <View style={[
        styles.leftHalfPanel,
        isMobile && styles.mobileLeftHalf,
        isMobile && selectedCall && styles.mobileHiddenPanel,
        !isMobile && !selectedCall && styles.desktopFullWidthPanel
      ]}>
        <Suspense fallback={<LoadingFallback message="Loading..." />}>
          <CallsListView
            activeSection={callsActiveSection}
            onCallSelect={(call) => {
              onCallSelect(call);
            }}
            selectedCallId={selectedCall?.id || selectedCall?.callId}
            showScheduledActivityBanner={callsActiveSection === 'all' && showScheduledActivityBanner}
            onScheduledActivityPress={() => {
              // Banner handles its own modal
            }}
            onScheduledActivityDataChange={onScheduledActivityDataChange}
            onNewCallInitiated={(recipients, searchQuery) => {
              // Handle new call initiation if needed
            }}
            groups={groups}
            onAddCallToGroup={onAddCallToGroup}
            onNewCall={onNewCall}
          />
        </Suspense>
      </View>

      {/* Right Half - Call Details */}
      <View style={[
        styles.rightHalfPanel,
        isMobile && styles.mobileRightHalf,
        isMobile && !selectedCall && styles.mobileHiddenPanel,
        !isMobile && !selectedCall && styles.desktopHiddenPanel
      ]}>
        {isMobile && selectedCall && (
          <View style={styles.mobileBackButton}>
            <TouchableOpacity
              onPress={onBackToCalls}
              style={styles.backButtonContainer}
              activeOpacity={0.7}
            >
              <ArrowRight size={20} color={HEYWAY_COLORS.text.inverse} style={{ transform: [{ rotate: '180deg' }] }} />
              <Text style={styles.backButtonText}>Back to Calls</Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedCall ? (
          <Suspense fallback={<LoadingFallback message="Loading..." />}>
            <CallSummaryCard
              call={selectedCall}
              callId={selectedCall.callId || selectedCall.id}
              sessionId={selectedCall.sessionId || selectedCall.id}
              transcript={selectedCall.transcript || selectedCall.transcription || []}
              isInbound={selectedCall.isInbound || false}
              onClose={() => onCallSelect(null)}
              isEmbedded={true}
            />
          </Suspense>
        ) : (
          !isMobile && (
            <View style={styles.detailsPlaceholder}>
              <View style={styles.placeholderCard}>
                <Phone size={48} color={HEYWAY_COLORS.text.tertiary} />
                <Text style={styles.detailsPlaceholderText}>Select a call to view details</Text>
                <Text style={styles.detailsPlaceholderSubtext}>
                  Choose a recent call from the list to see the transcript and call information
                </Text>
              </View>
            </View>
          )
        )}
      </View>
    </>
  );

  const renderContactsContent = () => (
    <View style={[
      styles.fullWidthPanel,
      isMobile && styles.mobileFullWidthPanel
    ]}>
      <Suspense fallback={<LoadingFallback message="Loading..." />}>
        <ContactsCardView
          activeSection={contactsActiveSection}
          onAddToCallList={onAddToCallList}
          onSectionChange={onContactsSectionChange}
          onImportContacts={onImportContacts}
          onAddContact={onAddContact}
          selectedAutomation={selectedAutomation}
        />
      </Suspense>
    </View>
  );

  const renderOtherContent = () => (
    <View style={[
      styles.fullWidthPanel,
      isMobile && styles.mobileFullWidthPanel
    ]}>
      {activeNavItem === 'business' ? (
        <Suspense fallback={<LoadingFallback message="Loading..." />}>
          <BusinessSearchSection
            activeSection={businessActiveSection}
            onSectionChange={onBusinessSectionChange}
            searchQuery={businessSearchQuery}
            onSearchQueryChange={onBusinessSearchQueryChange}
            locationQuery={businessLocationQuery}
            onLocationQueryChange={onBusinessLocationQueryChange}
            onSearch={onBusinessSearch}
            isLoading={isBusinessSearchLoading}
            onSearchComplete={onBusinessSearchComplete}
            onAddToCallList={onAddToCallList}
          />
        </Suspense>
      ) : activeNavItem === 'keypad' ? (
        <Suspense fallback={<LoadingFallback message="Loading..." />}>
          <KeypadContent
            onContactsSelected={() => { }}
            onDone={() => { }}
          />
        </Suspense>
      ) : (
        <View style={styles.detailsPlaceholder}>
          <Phone size={48} color={HEYWAY_COLORS.text.tertiary} />
          <Text style={styles.detailsPlaceholderText}>Select an item to view details</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[
      styles.mainContentArea,
      isMobile && styles.mobileMainContent
    ]}>
      {/* Search Bar Overlay - Desktop Only */}
      {!isMobile && (activeNavItem === 'recents' || activeNavItem === 'automations' || activeNavItem === 'contacts') && (
        <SearchBar />
      )}

      {/* Responsive Content Layout */}
      <View style={[
        styles.twoSectionLayout,
        isMobile && styles.mobileTwoSectionLayout
      ]}>
        {activeNavItem === 'recents' ? renderRecentsContent() :
          activeNavItem === 'automations' ? (
            <View style={styles.twoSectionContainer}>
              {/* Left Half - Automations List */}
              <View style={[
                styles.leftHalfPanel,
                isMobile && styles.mobileLeftHalf,
                isMobile && selectedAutomation && styles.mobileHiddenPanel,
                !isMobile && !selectedAutomation && styles.desktopFullWidthPanel
              ]}>
                <Suspense fallback={<LoadingFallback message="Loading..." />}>
                  <AutomationsListView
                    activeSection={automationsActiveSection}
                    onAutomationSelect={onAutomationSelect}
                    onCreateAutomation={onCreateAutomation}
                    onEditAutomation={onEditAutomation}
                    selectedAutomationId={selectedAutomation?.id}
                    isFullWidth={!selectedAutomation}
                  />
                </Suspense>
              </View>

              {/* Right Half - Automation Details */}
              <View style={[
                styles.rightHalfPanel,
                isMobile && styles.mobileRightHalf,
                isMobile && !selectedAutomation && styles.mobileHiddenPanel,
                !isMobile && !selectedAutomation && styles.desktopHiddenPanel
              ]}>
                {isMobile && selectedAutomation && (
                  <View style={styles.mobileBackButton}>
                    <TouchableOpacity
                      onPress={() => onAutomationSelect(null)}
                      style={styles.backButtonContainer}
                      activeOpacity={0.7}
                    >
                      <ArrowRight size={20} color={HEYWAY_COLORS.text.inverse} style={{ transform: [{ rotate: '180deg' }] }} />
                      <Text style={styles.backButtonText}>Back to Automations</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedAutomation ? (
                  <Suspense fallback={<LoadingFallback message="Loading..." />}>
                    <AutomationDetailsView
                      automation={selectedAutomation}
                      onClose={() => onAutomationSelect(null)}
                      onEdit={onEditAutomation}
                      onToggle={onAutomationToggle}
                      onDelete={onAutomationDelete}
                      onImportContacts={onAutomationImportContacts}
                      onViewContacts={onAutomationViewContacts}
                    />
                  </Suspense>
                ) : (
                  !isMobile && (
                    <View style={styles.detailsPlaceholder}>
                      <View style={styles.placeholderCard}>
                        <Target size={48} color={HEYWAY_COLORS.text.tertiary} />
                        <Text style={styles.detailsPlaceholderText}>Select an automation to view details</Text>
                        <Text style={styles.detailsPlaceholderSubtext}>
                          Choose an automation from the list to see its configuration and call history
                        </Text>
                      </View>
                    </View>
                  )
                )}
              </View>
            </View>
          ) : activeNavItem === 'contacts' ? renderContactsContent() : renderOtherContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContentArea: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    position: 'relative',
    overflow: 'hidden',
  },

  mobileMainContent: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginLeft: 0,
    paddingLeft: 0,
    backgroundColor: HEYWAY_COLORS.background.primary,
    paddingBottom: 0,
  },

  twoSectionLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },

  mobileTwoSectionLayout: {
    flexDirection: 'column',
    position: 'relative',
  },

  leftHalfPanel: {
    width: 400,
    minWidth: 320,
    maxWidth: 480,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRightWidth: 1,
    borderRightColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
    paddingTop: 56,
  },

  rightHalfPanel: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    ...HEYWAY_SHADOWS.sm,
  },

  fullWidthPanel: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    ...HEYWAY_SHADOWS.xs,
  },

  mobileLeftHalf: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRightWidth: 0,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 0,
    paddingTop: 0,
  },

  mobileRightHalf: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 0,
  },

  mobileFullWidthPanel: {
    backgroundColor: HEYWAY_COLORS.background.primary,
  },

  mobileHiddenPanel: {
    display: 'none',
  },

  desktopFullWidthPanel: {
    flex: 1,
    width: '100%',
    borderRightWidth: 0,
  },

  desktopHiddenPanel: {
    display: 'none',
  },

  twoSectionContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: HEYWAY_COLORS.background.primary,
  },

  paneToolbar: {
    height: 44,
    paddingHorizontal: HEYWAY_SPACING.lg,
    alignItems: 'center',
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
  },

  paneTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.headline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  paneSubtitle: {
    marginLeft: 'auto',
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    color: HEYWAY_COLORS.text.secondary,
  },

  mobileBackButton: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    ...HEYWAY_SHADOWS.xs,
  },

  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
  },

  backButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.primary,
  },

  detailsPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HEYWAY_SPACING.xl,
    gap: HEYWAY_SPACING.md,
    backgroundColor: 'transparent',
  },

  placeholderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.xxl,
    paddingHorizontal: HEYWAY_SPACING.xxl,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    borderRadius: HEYWAY_RADIUS.lg,
    ...HEYWAY_SHADOWS.md,
  },

  detailsPlaceholderText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.headline,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  detailsPlaceholderSubtext: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: HEYWAY_TYPOGRAPHY.lineHeight.relaxed * HEYWAY_TYPOGRAPHY.fontSize.body,
    maxWidth: 320,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  insetSurface: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
  },

  rowCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    ...HEYWAY_SHADOWS.xs,
  },

  sectionHeader: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
  },

  sectionHeaderText: {
    color: HEYWAY_COLORS.text.secondary,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.caption,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
    textTransform: 'uppercase',
  },

  searchBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 400,
    minWidth: 320,
    maxWidth: 480,
    zIndex: 100,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HEYWAY_COLORS.border.primary,
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.sm,
    ...HEYWAY_SHADOWS.sm,
  },

  searchBarWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchIcon: {
    position: 'absolute',
    left: HEYWAY_SPACING.sm,
    zIndex: 1,
  },

  searchInput: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    paddingVertical: HEYWAY_SPACING.sm,
    paddingHorizontal: HEYWAY_SPACING.md,
    paddingLeft: 32,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.subheadline,
    color: HEYWAY_COLORS.text.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: HEYWAY_COLORS.border.primary,
    height: 32,
    ...HEYWAY_SHADOWS.xs,
  },
});

export default HomeContentArea;

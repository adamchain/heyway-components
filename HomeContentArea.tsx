import React, { Suspense } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Phone, ArrowRight, Target, Users } from 'lucide-react-native';

// Import HEYWAY Style Guide
import { HEYWAY_COLORS, HEYWAY_SPACING, HEYWAY_TYPOGRAPHY, HEYWAY_RADIUS, HEYWAY_SHADOWS, HEYWAY_LAYOUT, HEYWAY_COMPONENTS } from '@/styles/HEYWAY_STYLE_GUIDE';

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
  // Calls section props
  callsActiveSection: string;
  showScheduledActivityBanner: boolean;
  onScheduledActivityDataChange?: () => void;
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
  callsActiveSection,
  showScheduledActivityBanner,
  onScheduledActivityDataChange,
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

  const renderOtherContent = () => (
    <View style={[
      styles.fullWidthPanel,
      isMobile && styles.mobileFullWidthPanel
    ]}>
      {activeNavItem === 'contacts' ? (
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
      ) : activeNavItem === 'business' ? (
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
      ) : activeNavItem === 'automations' ? (
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
                  onAddContacts={onAutomationAddContacts}
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
      ) : activeNavItem === 'contacts' ? (
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
      ) : activeNavItem === 'business' ? (
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
      {/* Responsive Content Layout */}
      <View style={[
        styles.twoSectionLayout,
        isMobile && styles.mobileTwoSectionLayout
      ]}>
        {activeNavItem === 'recents' ? renderRecentsContent() : renderOtherContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* --- ROOT CANVAS ------------------------------------------------------ */
  mainContentArea: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
    position: 'relative',
    overflow: 'hidden',
  },

  mobileMainContent: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    marginLeft: 0,
    paddingLeft: 0,
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
    paddingBottom: 72,
  },

  /* --- LAYOUT ----------------------------------------------------------- */
  twoSectionLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },

  mobileTwoSectionLayout: {
    flexDirection: 'column',
    position: 'relative',
  },

  /* Left list pane (Calls list) - WhatsApp-inspired */
  leftHalfPanel: {
    width: HEYWAY_LAYOUT.chatList.width,
    padding: HEYWAY_SPACING.lg,
    minWidth: HEYWAY_LAYOUT.chatList.minWidth,
    maxWidth: HEYWAY_LAYOUT.chatList.maxWidth,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRightWidth: 1,
    borderRightColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  /* Right details pane (Call details) - WhatsApp-inspired */
  rightHalfPanel: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    padding: HEYWAY_SPACING.lg,

    ...HEYWAY_SHADOWS.light.sm,
  },

  /* Single-pane modes (Contacts, Business, Keypad, Automations, etc.) - WhatsApp-inspired */
  fullWidthPanel: {
    flex: 1,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    ...HEYWAY_SHADOWS.light.xs,
  },

  /* --- MOBILE STACKING - WhatsApp-inspired ----------------------------- */
  mobileLeftHalf: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRightWidth: 0,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 0, // No radius on mobile for full coverage
  },

  mobileRightHalf: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: 0, // No radius on mobile for full coverage
  },

  mobileFullWidthPanel: {
    backgroundColor: HEYWAY_COLORS.background.primary,
  },

  mobileHiddenPanel: { display: 'none' },

  desktopFullWidthPanel: {
    flex: 2,
    borderRightWidth: 0,
  },

  desktopHiddenPanel: {
    display: 'none'
  },

  /* --- TWO SECTION LAYOUT STYLES ------------------------------- */
  twoSectionContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: HEYWAY_COLORS.background.whatsappPanel,
  },

  /* --- OPTIONAL PANE TOOLBARS (WhatsApp-style) ------------------------- */
  paneToolbar: {
    height: 48,
    paddingHorizontal: HEYWAY_SPACING.lg,
    alignItems: 'center',
    flexDirection: 'row',
    gap: HEYWAY_SPACING.md,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.xs,
  },
  paneTitle: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.large,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },
  paneSubtitle: {
    marginLeft: 'auto',
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
    color: HEYWAY_COLORS.text.tertiary,
  },

  /* --- MOBILE BACK (WhatsApp-style) ------------------------------------ */
  mobileBackButton: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
    backgroundColor: HEYWAY_COLORS.interactive.whatsappDark,
    ...HEYWAY_SHADOWS.light.xs,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEYWAY_SPACING.sm,
  },
  backButtonText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.medium,
    color: HEYWAY_COLORS.text.inverse, // White text for dark background
  },

  /* --- EMPTY / LOADING STATES ------------------------------------------ */
  detailsPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: HEYWAY_SPACING.xxxxl,
    gap: HEYWAY_SPACING.lg,
    // glass-lite card floating on the AI wash
    backgroundColor: 'transparent',
  },

  // wrapper card to use around placeholders or Suspense fallbacks (WhatsApp-inspired)
  placeholderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEYWAY_SPACING.md,
    paddingVertical: HEYWAY_SPACING.xl,
    paddingHorizontal: HEYWAY_SPACING.xl,
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
    borderRadius: HEYWAY_RADIUS.lg,
    ...HEYWAY_SHADOWS.light.md,
  },

  detailsPlaceholderText: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.title.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    color: HEYWAY_COLORS.text.primary,
    textAlign: 'center',
    marginBottom: HEYWAY_SPACING.xs,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.tight,
  },

  detailsPlaceholderSubtext: {
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.regular,
    color: HEYWAY_COLORS.text.secondary,
    textAlign: 'center',
    lineHeight:
      HEYWAY_TYPOGRAPHY.lineHeight.relaxed *
      HEYWAY_TYPOGRAPHY.fontSize.body.medium,
    maxWidth: 360,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.normal,
  },

  /* --- LIST / DETAILS INNER SURFACES ----------------------------------- */
  // use for inner scroll regions in list/detail children to get a subtle inset look (WhatsApp-inspired)
  insetSurface: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
  },

  // card shells for child rows (calls, contacts, etc.) - WhatsApp-inspired
  rowCard: {
    backgroundColor: HEYWAY_COLORS.background.primary,
    borderRadius: HEYWAY_RADIUS.md,
    borderWidth: 0.5,
    borderColor: HEYWAY_COLORS.border.secondary,
    ...HEYWAY_SHADOWS.light.xs,
  },

  // minimal section headers inside panes - WhatsApp-inspired
  sectionHeader: {
    paddingHorizontal: HEYWAY_SPACING.lg,
    paddingVertical: HEYWAY_SPACING.sm,
    backgroundColor: HEYWAY_COLORS.background.secondary,
    borderBottomWidth: 0.5,
    borderBottomColor: HEYWAY_COLORS.border.secondary,
  },
  sectionHeaderText: {
    color: HEYWAY_COLORS.text.tertiary,
    fontSize: HEYWAY_TYPOGRAPHY.fontSize.label.small,
    fontWeight: HEYWAY_TYPOGRAPHY.fontWeight.semibold,
    letterSpacing: HEYWAY_TYPOGRAPHY.letterSpacing.wide,
  },
});

export default HomeContentArea;

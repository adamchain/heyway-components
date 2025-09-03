// Fixed useTwilioCallManager.ts - Custom hook for managing Twilio calls

import { useState, useCallback, useEffect } from 'react';
import { twilioService, CallResult, InitiateCallOptions } from '../services/twilioService';
import { websocketService } from '../services/websocketService';
import { apiService } from '../services/apiService';


interface UseTwilioCallManagerOptions {
    onCallStatusChange?: (status: string, callData?: CallResult) => void;
    onError?: (error: string) => void;
}

export const useTwilioCallManager = (options: UseTwilioCallManagerOptions = {}) => {
    const { onCallStatusChange, onError } = options;
    const [isInitiating, setIsInitiating] = useState(false);
    const [activeCall, setActiveCall] = useState<CallResult | null>(null);
    const [callStatus, setCallStatus] = useState<string>('idle');
    const [callerId, setCallerId] = useState<string | undefined>();

    // Handle call status updates
    const handleCallStatusChange = useCallback((status: string, callData?: CallResult) => {
        setCallStatus(status);
        if (callData) {
            setActiveCall(callData);
        }
        onCallStatusChange?.(status, callData);
    }, [onCallStatusChange]);

    // Handle errors
    const handleError = useCallback((error: string) => {
        console.error('❌ Call error:', error);
        setCallStatus('error');
        onError?.(error);
    }, [onError]);

    // Fetch caller ID preference on load
    useEffect(() => {
        const fetchCallerId = async () => {
            try {
                const res = await apiService.get('/user/caller-id-preference') as any;
                setCallerId(res?.data?.callerId || '');
            } catch (error) {
                console.warn('⚠️ Could not load caller ID preference');
            }
        };

        fetchCallerId();
    }, []);

    // Listen for transcription updates
    useEffect(() => {
        const handleTranscription = (data: any) => {
            console.log('📝 Received transcription update:', data);
            // You can forward this via a new callback, state, or context depending on your architecture
        };
        websocketService.on('transcription', handleTranscription);
        return () => {
            websocketService.off('transcription', handleTranscription);
        };
    }, []);

    // Initiate a call
    const initiateCall = useCallback(async (options: InitiateCallOptions) => {
        try {
            setIsInitiating(true);
            handleCallStatusChange('initiating');

            console.log('📞 Starting call initiation process...');

            // Check if user has verified caller IDs
            const callerIds = await apiService.getCallerIds();
            const verifiedCallerIds = callerIds.filter(id => id.verified);
            
            if (verifiedCallerIds.length === 0) {
                throw new Error('No verified caller IDs available. Please add and verify a caller ID before making calls.');
            }

            // Get the selected caller ID preference
            const callerIdPreference = await apiService.getCallerIdPreference();
            const selectedCallerId = options.callerId || callerIdPreference.callerId;

            // If no caller ID is selected or the selected one is not verified, use the first verified one
            let finalCallerId = selectedCallerId;
            if (!selectedCallerId || !verifiedCallerIds.find(id => id.phoneNumber === selectedCallerId)) {
                finalCallerId = verifiedCallerIds[0].phoneNumber;
                console.log(`📞 Using verified caller ID: ${finalCallerId}`);
            }

            // Enrich options with verified caller ID
            const enrichedOptions = {
                ...options,
                callerId: finalCallerId,
            };

            // Call the Twilio service
            const callData = await twilioService.initiateCall(enrichedOptions);

            console.log('📱 Call initiated, received data:', callData);

            // CRITICAL: Ensure both callId and sessionId are present
            if (!callData.callId) {
                throw new Error('No callId received from server');
            }

            // Use callId as sessionId if sessionId is missing (fallback)
            const sessionId = callData.sessionId || callData.callId;

            if (!sessionId) {
                throw new Error('No sessionId available');
            }

            // Update the call data with ensured sessionId
            const enhancedCallData: CallResult = {
                ...callData,
                sessionId
            };

            console.log('🔍 Enhanced call data:', enhancedCallData);

            setActiveCall(enhancedCallData);
            handleCallStatusChange('initiated', enhancedCallData);

            // Join the WebSocket room with BOTH callId and sessionId
            console.log('🌐 Joining WebSocket room:', {
                callId: enhancedCallData.callId,
                sessionId: enhancedCallData.sessionId
            });

            await websocketService.joinCallRoom(
                enhancedCallData.callId,
                enhancedCallData.sessionId
            );

            console.log('✅ Successfully joined WebSocket room');
            handleCallStatusChange('connected', enhancedCallData);

            return enhancedCallData;

        } catch (error) {
            console.error('❌ Call initiation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            handleError(`Call initiation failed: ${errorMessage}`);
            throw error;
        } finally {
            setIsInitiating(false);
        }
    }, [handleCallStatusChange, handleError, callerId]);

    // End a call
    const endCall = useCallback(async () => {
        if (!activeCall?.callId) {
            console.warn('⚠️ No active call to end');
            return;
        }

        try {
            console.log('📞 Ending call:', activeCall.callId);
            handleCallStatusChange('ending');

            // End the call via Twilio service
            await twilioService.endCall(activeCall.callId);

            // Leave the WebSocket room
            if (activeCall.sessionId) {
                await websocketService.leaveCallRoom(activeCall.callId, activeCall.sessionId);
            }

            setActiveCall(null);
            handleCallStatusChange('ended');

            console.log('✅ Call ended successfully');

        } catch (error) {
            console.error('❌ Failed to end call:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            handleError(`Failed to end call: ${errorMessage}`);
        }
    }, [activeCall, handleCallStatusChange, handleError]);

    // Get call status
    const getCallStatus = useCallback(async (callId: string) => {
        try {
            const status = await twilioService.getCallStatus(callId);
            return status;
        } catch (error) {
            console.error('❌ Failed to get call status:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            handleError(`Failed to get call status: ${errorMessage}`);
            return null;
        }
    }, [handleError]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (activeCall?.callId && activeCall?.sessionId) {
                websocketService.leaveCallRoom(activeCall.callId, activeCall.sessionId).catch(console.error);
            }
        };
    }, [activeCall]);

    return {
        isInitiating,
        activeCall,
        callStatus,
        callerId,
        initiateCall,
        endCall,
        getCallStatus
    };
};

// Don't export the hook as default - only use named export
// export default useTwilioCallManager; // ❌ This causes the error!
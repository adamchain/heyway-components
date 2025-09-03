import { apiService } from '../services/apiService';

export const testAPIConnection = async () => {
    console.log('🔍 Testing API Connection...');

    try {
        const isConnected = await apiService.testConnection();

        if (isConnected) {
            console.log('✅ API connection successful!');
            return { success: true, message: 'Connected to API server' };
        } else {
            console.log('❌ API connection failed');
            return {
                success: false,
                message: 'Failed to connect to API server. Check your internet connection and try again.'
            };
        }
    } catch (error) {
        console.error('❌ Connection test error:', error);
        return {
            success: false,
            message: `Connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

export const getAPIConfig = () => {
    return {
        baseURL: apiService['baseURL'],
        isDevelopment: __DEV__,
        platform: typeof window !== 'undefined' ? 'web' : 'native'
    };
}; 
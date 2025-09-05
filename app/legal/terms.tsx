import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/components/designSystem';

export default function TermsOfServiceScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>Terms of Service</Text>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <Text style={styles.paragraph}>
                        These Terms of Service govern your use of the HeyWay application. By using
                        the app, you agree to these terms. This page is a placeholder; replace with
                        your actual legal copy.
                    </Text>
                    <Text style={styles.sectionTitle}>Use of Service</Text>
                    <Text style={styles.paragraph}>
                        You agree to use the service in compliance with applicable laws and our
                        acceptable use policies.
                    </Text>
                    <Text style={styles.sectionTitle}>Limitation of Liability</Text>
                    <Text style={styles.paragraph}>
                        HeyWay is provided as-is without warranties. To the maximum extent permitted
                        by law, we are not liable for any indirect or consequential damages.
                    </Text>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    <Text style={styles.paragraph}>
                        For questions about these terms, contact support@heyway.app.
                    </Text>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000' },
    container: { flex: 1, padding: 16 },
    scroll: { flex: 1 },
    content: { paddingBottom: 32 },
    title: { fontSize: 24, fontWeight: '700', color: COLORS.text.primary, marginBottom: 12 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text.primary, marginTop: 16, marginBottom: 8 },
    paragraph: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 20 },
});

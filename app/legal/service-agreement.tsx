import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/components/designSystem';

export default function ServiceAgreementScreen() {
    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.title}>Service Agreement</Text>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
                    <Text style={styles.paragraph}>
                        This Service Agreement describes the terms under which HeyWay provides its
                        services to you. This page is a placeholder; replace it with your official
                        agreement text.
                    </Text>
                    <Text style={styles.sectionTitle}>Services</Text>
                    <Text style={styles.paragraph}>
                        We provide AI-assisted calling features and related tools as described in the
                        application.
                    </Text>
                    <Text style={styles.sectionTitle}>Your Responsibilities</Text>
                    <Text style={styles.paragraph}>
                        You are responsible for maintaining the confidentiality of your account and
                        for all activities that occur under your account.
                    </Text>
                    <Text style={styles.sectionTitle}>Termination</Text>
                    <Text style={styles.paragraph}>
                        We may suspend or terminate access for violations of this agreement or
                        applicable laws.
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

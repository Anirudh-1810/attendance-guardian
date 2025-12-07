import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout } = useAuth();
    const { resetAllData } = useAttendanceData();

    const handleResetData = () => {
        Alert.alert(
            'Reset All Data',
            'Are you sure you want to reset all data? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        resetAllData();
                        Alert.alert('Success', 'All data has been reset');
                    },
                },
            ]
        );
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    router.replace('/');
                },
            },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            {/* Semester Settings */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Semester Settings</Text>
                <Card style={styles.card}>
                    <Input
                        label="Semester Start Date"
                        placeholder="YYYY-MM-DD"
                        containerStyle={styles.input}
                    />
                    <Input
                        label="Semester End Date"
                        placeholder="YYYY-MM-DD"
                        containerStyle={styles.input}
                    />
                    <Input
                        label="Required Attendance %"
                        placeholder="75"
                        keyboardType="numeric"
                        containerStyle={styles.input}
                    />
                    <Button
                        title="Save Changes"
                        onPress={() => Alert.alert('Success', 'Settings updated')}
                        variant="primary"
                        size="medium"
                    />
                </Card>
            </View>

            {/* Export Data */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Export Data</Text>
                <Card style={styles.card}>
                    <Text style={styles.cardDescription}>
                        Download your attendance records as a report
                    </Text>
                    <Button
                        title="Export Attendance Report"
                        onPress={() => Alert.alert('Export', 'Feature coming soon!')}
                        variant="outline"
                        size="medium"
                        style={styles.exportButton}
                    />
                </Card>
            </View>

            {/* Account */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <Card style={styles.card}>
                    <Button
                        title="Logout"
                        onPress={handleLogout}
                        variant="outline"
                        size="medium"
                        style={styles.logoutButton}
                    />
                </Card>
            </View>

            {/* Danger Zone */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
                <Card style={[styles.card, styles.dangerCard]}>
                    <Text style={styles.cardDescription}>
                        Clear all attendance data and reset the application
                    </Text>
                    <Button
                        title="Reset All Data"
                        onPress={handleResetData}
                        variant="danger"
                        size="medium"
                        style={styles.resetButton}
                    />
                </Card>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        padding: 16,
        paddingTop: 60,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 12,
    },
    dangerTitle: {
        color: Colors.light.danger,
    },
    card: {
        padding: 20,
    },
    dangerCard: {
        borderWidth: 1,
        borderColor: Colors.light.danger,
    },
    cardDescription: {
        fontSize: 14,
        color: Colors.light.muted,
        marginBottom: 16,
    },
    input: {
        marginBottom: 8,
    },
    exportButton: {
        marginTop: 8,
    },
    logoutButton: {
        marginTop: 0,
    },
    resetButton: {
        marginTop: 8,
    },
});

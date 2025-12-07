import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ImageBackground,
    LinearGradient,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { calculateStatus, calculatePercentage } from '@/lib/calculations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SubjectCard } from '@/components/SubjectCard';
import { Colors } from '@/constants/Colors';
import { getInitials } from '@/lib/utils';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { subjects, loading, error } = useAttendanceData();
    const [refreshing, setRefreshing] = useState(false);

    const totalAttended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
    const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
    const avgAttendance = calculatePercentage(totalAttended, totalClasses);

    const atRiskCount = subjects.filter((s) => {
        const status = calculateStatus(s);
        return status === 'high' || status === 'critical';
    }).length;

    const handleRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    if (loading && subjects.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Dark Background with Gradient */}
            <ExpoLinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                style={StyleSheet.absoluteFillObject}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                {/* Student Details Header - Glassmorphic */}
                <View style={styles.headerCard}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <ExpoLinearGradient
                                colors={['#3b82f6', '#8b5cf6']}
                                style={styles.avatar}
                            >
                                <Text style={styles.avatarText}>
                                    {user ? getInitials(user.name) : 'S'}
                                </Text>
                            </ExpoLinearGradient>
                            <View>
                                <Text style={styles.userName}>{user?.name || 'Student'}</Text>
                                <Text style={styles.userEmail}>{user?.email || ''}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleLogout}>
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Stats Overview - Gradient Cards */}
                {subjects.length > 0 && (
                    <View style={styles.statsSection}>
                        {/* Overall Attendance - Blue Gradient */}
                        <ExpoLinearGradient
                            colors={['#3b82f6', '#2563eb']}
                            style={styles.statCard}
                        >
                            <View style={styles.statContent}>
                                <View>
                                    <Text style={styles.statLabel}>Overall Attendance</Text>
                                    <Text style={styles.statValue}>{avgAttendance}%</Text>
                                </View>
                                <View style={styles.statIconCircle}>
                                    <Text style={styles.statIcon}>✓</Text>
                                </View>
                            </View>
                        </ExpoLinearGradient>

                        {/* Total Subjects - Purple Gradient */}
                        <ExpoLinearGradient
                            colors={['#8b5cf6', '#7c3aed']}
                            style={styles.statCard}
                        >
                            <View style={styles.statContent}>
                                <View>
                                    <Text style={styles.statLabel}>Total Subjects</Text>
                                    <Text style={styles.statValue}>{subjects.length}</Text>
                                </View>
                                <View style={styles.statIconCircle}>
                                    <Text style={styles.statIcon}>📚</Text>
                                </View>
                            </View>
                        </ExpoLinearGradient>

                        {/* At Risk - Orange to Red Gradient */}
                        <ExpoLinearGradient
                            colors={['#f97316', '#ef4444']}
                            style={styles.statCard}
                        >
                            <View style={styles.statContent}>
                                <View>
                                    <Text style={styles.statLabel}>At Risk</Text>
                                    <Text style={styles.statValue}>{atRiskCount}</Text>
                                </View>
                                <View style={styles.statIconCircle}>
                                    <Text style={styles.statIcon}>⚠️</Text>
                                </View>
                            </View>
                        </ExpoLinearGradient>
                    </View>
                )}

                {/* Subjects Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Subjects</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => alert('Add Subject feature coming soon!')}
                        >
                            <ExpoLinearGradient
                                colors={['#3b82f6', '#8b5cf6']}
                                style={styles.addButtonGradient}
                            >
                                <Text style={styles.addButtonText}>+ Add Subject</Text>
                            </ExpoLinearGradient>
                        </TouchableOpacity>
                    </View>

                    {subjects.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyIcon}>📚</Text>
                            <Text style={styles.emptyTitle}>No Subjects Yet</Text>
                            <Text style={styles.emptyText}>
                                Start tracking your attendance by adding your first subject
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => alert('Add Subject feature coming soon!')}
                            >
                                <ExpoLinearGradient
                                    colors={['#3b82f6', '#8b5cf6']}
                                    style={styles.emptyButtonGradient}
                                >
                                    <Text style={styles.emptyButtonText}>+ Add Your First Subject</Text>
                                </ExpoLinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.subjectsList}>
                            {subjects.map((subject) => (
                                <SubjectCard key={subject.id} subject={subject} />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingTop: 60,
        paddingBottom: 100,
    },
    headerCard: {
        marginBottom: 24,
        padding: 20,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    userEmail: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 2,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ef4444',
    },
    statsSection: {
        gap: 16,
        marginBottom: 24,
    },
    statCard: {
        borderRadius: 12,
        padding: 20,
    },
    statContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 36,
        fontWeight: '700',
        color: '#fff',
    },
    statIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 28,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    addButton: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    addButtonGradient: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyCard: {
        padding: 48,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderStyle: 'dashed',
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 8,
    },
    emptyButtonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    subjectsList: {
        gap: 16,
    },
});

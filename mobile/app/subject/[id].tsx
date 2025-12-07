import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import {
    calculateStatus,
    calculateBunks,
    calculateMustAttend,
    calculatePercentage,
} from '@/lib/calculations';
import { StatusColors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function SubjectDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getSubject } = useAttendanceData();

    const subject = getSubject(id!);

    if (!subject) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient
                    colors={['#0f172a', '#1e293b', '#0f172a']}
                    style={StyleSheet.absoluteFillObject}
                />
                <Text style={styles.errorText}>Subject not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backText}>← Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const attendancePct = calculatePercentage(
        subject.attendedClasses,
        subject.totalClasses
    );
    const status = calculateStatus(subject);
    const bunks = calculateBunks(subject);
    const mustAttend = calculateMustAttend(subject);
    const statusColor = StatusColors[status];

    const getGradientColors = () => {
        switch (status) {
            case 'safe':
                return ['#10b981', '#059669'];
            case 'warning':
                return ['#f59e0b', '#d97706'];
            case 'high':
                return ['#f97316', '#ea580c'];
            case 'critical':
                return ['#ef4444', '#dc2626'];
            default:
                return ['#10b981', '#059669'];
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                style={StyleSheet.absoluteFillObject}
            />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.subjectName}>{subject.name}</Text>
                        <Text style={styles.subjectCode}>{subject.code}</Text>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                </View>

                {/* Teacher Info */}
                <View style={styles.teacherCard}>
                    <Text style={styles.teacherLabel}>Instructor</Text>
                    <Text style={styles.teacherName}>{subject.teacher}</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Current</Text>
                        <Text style={styles.statValue}>{attendancePct}%</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Required</Text>
                        <Text style={styles.statValue}>{subject.requiredPercentage}%</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Can Bunk</Text>
                        <Text style={[styles.statValue, styles.statValueGreen]}>{bunks}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Must Attend</Text>
                        <Text style={[styles.statValue, styles.statValueRed]}>{mustAttend}</Text>
                    </View>
                </View>

                {/* Attendance Progress */}
                <View style={styles.progressCard}>
                    <Text style={styles.cardTitle}>Attendance Progress</Text>
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Overall Attendance</Text>
                            <Text style={styles.progressPercentage}>{attendancePct}%</Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                            <LinearGradient
                                colors={getGradientColors()}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressBarFill, { width: `${attendancePct}%` }]}
                            />
                        </View>
                        <View style={styles.progressFooter}>
                            <Text style={styles.progressText}>
                                {subject.attendedClasses} / {subject.totalClasses} classes
                            </Text>
                            <View style={[
                                styles.badge,
                                attendancePct >= subject.requiredPercentage ? styles.badgeSafe : styles.badgeRisk
                            ]}>
                                <Text style={styles.badgeText}>
                                    {attendancePct >= subject.requiredPercentage ? 'Safe' : 'At Risk'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Class Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.cardTitle}>Class Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total Classes:</Text>
                        <Text style={styles.detailValue}>{subject.totalClasses}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Attended:</Text>
                        <Text style={[styles.detailValue, styles.detailValueGreen]}>
                            {subject.attendedClasses}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Missed:</Text>
                        <Text style={[styles.detailValue, styles.detailValueRed]}>
                            {subject.totalClasses - subject.attendedClasses}
                        </Text>
                    </View>
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
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
        paddingTop: 60,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: '#fff',
    },
    headerContent: {
        flex: 1,
    },
    subjectName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    subjectCode: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    teacherCard: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    teacherLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 4,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    statValueGreen: {
        color: '#10b981',
    },
    statValueRed: {
        color: '#ef4444',
    },
    progressCard: {
        padding: 20,
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
    },
    progressSection: {
        gap: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    progressPercentage: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 999,
    },
    progressFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeSafe: {
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    badgeRisk: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    detailsCard: {
        padding: 20,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    detailLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    detailValueGreen: {
        color: '#10b981',
    },
    detailValueRed: {
        color: '#ef4444',
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    backText: {
        fontSize: 16,
        color: '#3b82f6',
    },
});

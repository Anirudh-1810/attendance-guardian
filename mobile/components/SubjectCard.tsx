import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Subject } from '@/lib/calculations';
import {
    calculateStatus,
    calculateBunks,
    calculateMustAttend,
    calculatePercentage,
} from '@/lib/calculations';
import { StatusColors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface SubjectCardProps {
    subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
    const router = useRouter();
    const attendancePct = calculatePercentage(
        subject.attendedClasses,
        subject.totalClasses
    );
    const status = calculateStatus(subject);
    const canBunk = calculateBunks(subject);
    const mustAttend = calculateMustAttend(subject);

    const statusColor = StatusColors[status];

    // Gradient colors based on status
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

    const handlePress = () => {
        router.push(`/subject/${subject.id}`);
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
            <View style={styles.card}>
                {/* Glassmorphic background */}
                <View style={styles.glassBackground} />

                {/* Status indicator bar at top */}
                <LinearGradient
                    colors={getGradientColors()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.statusBar}
                />

                {/* Content */}
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.subjectName} numberOfLines={1}>
                                {subject.name}
                            </Text>
                            <Text style={styles.subjectCode}>{subject.code}</Text>
                            <Text style={styles.teacher}>{subject.teacher}</Text>
                        </View>
                    </View>

                    {/* Progress Section */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.attendanceText}>Attendance</Text>
                            <Text style={styles.attendancePercentage}>{attendancePct}%</Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <LinearGradient
                                colors={getGradientColors()}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressBarFill, { width: `${attendancePct}%` }]}
                            />
                        </View>

                        <View style={styles.progressFooter}>
                            <Text style={styles.classesText}>
                                {subject.attendedClasses}/{subject.totalClasses} classes
                            </Text>
                            <Text
                                style={[
                                    styles.statusText,
                                    attendancePct >= subject.requiredPercentage
                                        ? styles.statusSafe
                                        : styles.statusRisk,
                                ]}
                            >
                                {attendancePct >= subject.requiredPercentage ? '✓ Safe' : '⚠ At Risk'}
                            </Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Can Bunk</Text>
                            <Text style={[styles.statValue, styles.statValueGreen]}>{canBunk}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Must Attend</Text>
                            <Text style={[styles.statValue, styles.statValueRed]}>{mustAttend}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    glassBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
    },
    statusBar: {
        height: 4,
        width: '100%',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
    },
    subjectName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    subjectCode: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 2,
    },
    teacher: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    progressSection: {
        marginBottom: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    attendanceText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    attendancePercentage: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    progressBarContainer: {
        height: 10,
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
        marginTop: 8,
    },
    classesText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusSafe: {
        color: '#10b981',
    },
    statusRisk: {
        color: '#ef4444',
    },
    stats: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        paddingTop: 12,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statValueGreen: {
        color: '#10b981',
    },
    statValueRed: {
        color: '#ef4444',
    },
});

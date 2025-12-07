import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { formatDate } from '@/lib/utils';

export default function AttendanceScreen() {
    const { subjects, updateSubject } = useAttendanceData();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [markedClasses, setMarkedClasses] = useState<Record<string, 'present' | 'absent'>>({});

    const handleMark = (subjectId: string, status: 'present' | 'absent') => {
        updateSubject(subjectId, status);
        setMarkedClasses((prev) => ({ ...prev, [subjectId]: status }));
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Mark Attendance</Text>
                <Text style={styles.date}>{formatDate(selectedDate)}</Text>
            </View>

            {/* Date Selector */}
            <Card style={styles.dateCard}>
                <Text style={styles.dateLabel}>Selected Date</Text>
                <Text style={styles.dateValue}>{formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}</Text>
                {/* TODO: Add calendar picker */}
            </Card>

            {/* Subjects List */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's Classes</Text>

                {subjects.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No subjects added yet</Text>
                    </Card>
                ) : (
                    <View style={styles.subjectsList}>
                        {subjects.map((subject) => (
                            <Card key={subject.id} style={styles.subjectCard}>
                                <View style={styles.subjectInfo}>
                                    <Text style={styles.subjectName}>{subject.name}</Text>
                                    <Text style={styles.subjectCode}>{subject.code}</Text>
                                    <Text style={styles.subjectTeacher}>{subject.teacher}</Text>
                                </View>

                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            styles.presentButton,
                                            markedClasses[subject.id] === 'present' && styles.actionButtonActive,
                                        ]}
                                        onPress={() => handleMark(subject.id, 'present')}
                                    >
                                        <Text
                                            style={[
                                                styles.actionButtonText,
                                                markedClasses[subject.id] === 'present' && styles.actionButtonTextActive,
                                            ]}
                                        >
                                            ✓ Present
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            styles.absentButton,
                                            markedClasses[subject.id] === 'absent' && styles.actionButtonActive,
                                        ]}
                                        onPress={() => handleMark(subject.id, 'absent')}
                                    >
                                        <Text
                                            style={[
                                                styles.actionButtonText,
                                                markedClasses[subject.id] === 'absent' && styles.actionButtonTextActive,
                                            ]}
                                        >
                                            ✗ Absent
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Card>
                        ))}
                    </View>
                )}
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
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: Colors.light.muted,
    },
    dateCard: {
        marginBottom: 24,
        padding: 20,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.muted,
        marginBottom: 8,
    },
    dateValue: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.light.text,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 16,
    },
    emptyCard: {
        padding: 48,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: Colors.light.muted,
    },
    subjectsList: {
        gap: 12,
    },
    subjectCard: {
        padding: 16,
    },
    subjectInfo: {
        marginBottom: 16,
    },
    subjectName: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 4,
    },
    subjectCode: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.muted,
        marginBottom: 2,
    },
    subjectTeacher: {
        fontSize: 12,
        color: Colors.light.muted,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        alignItems: 'center',
    },
    presentButton: {
        borderColor: Colors.light.success,
        backgroundColor: 'transparent',
    },
    absentButton: {
        borderColor: Colors.light.danger,
        backgroundColor: 'transparent',
    },
    actionButtonActive: {
        backgroundColor: Colors.light.primary,
        borderColor: Colors.light.primary,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    actionButtonTextActive: {
        color: '#fff',
    },
});

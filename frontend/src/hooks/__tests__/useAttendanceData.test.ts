/**
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useAttendanceData } from '../useAttendanceData';
import { useAuth } from '@/contexts/AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn(),
}));

const mockToken = 'test-token';
const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };

describe('useAttendanceData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
        (useAuth as any).mockReturnValue({
            token: mockToken,
            isAuthenticated: true,
            user: mockUser,
        });
    });

    it('should fetch subjects on mount', async () => {
        const mockSemesterData = {
            id: 'sem1',
            subjects: [
                {
                    id: 'sub1',
                    courseName: 'Math',
                    courseCode: 'M101',
                    totalClassesConducted: 10,
                    totalClassesAttended: 8,
                    teacher: 'Dr. Smith',
                },
            ],
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockSemesterData,
        });

        const { result } = renderHook(() => useAttendanceData());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.subjects).toHaveLength(1);
        expect(result.current.subjects[0].name).toBe('Math');
        expect(result.current.subjects[0].attendedClasses).toBe(8);
    });

    it('should handle fetch error', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
        });

        const { result } = renderHook(() => useAttendanceData());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.error).toBe('Failed to fetch semester');
    });

    it('should update subject attendance optimistically', async () => {
        const mockSemesterData = {
            id: 'sem1',
            subjects: [
                {
                    id: 'sub1',
                    courseName: 'Math',
                    courseCode: 'M101',
                    totalClassesConducted: 10,
                    totalClassesAttended: 8,
                },
            ],
        };

        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => mockSemesterData,
        });

        const { result } = renderHook(() => useAttendanceData());
        await waitFor(() => expect(result.current.subjects.length).toBe(1));

        const { act } = require('@testing-library/react');
        await act(async () => {
            result.current.updateSubject('sub1', 'present');
        });

        await waitFor(() => {
            expect(result.current.subjects[0].attendedClasses).toBe(9);
            expect(result.current.subjects[0].totalClasses).toBe(11);
        });
    });
});

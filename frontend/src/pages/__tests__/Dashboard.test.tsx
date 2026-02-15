import { render, screen } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the dependencies
vi.mock('@/hooks/useAttendanceData', () => ({
    useAttendanceData: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: vi.fn().mockReturnValue({
        user: { name: 'Test Student' },
        logout: vi.fn(),
    }),
}));

// Mock ResizeObserver which is used by Recharts
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('user', JSON.stringify({ name: 'Test Student', course: 'B.Tech' }));
    });

    it('renders empty state when no subjects', () => {
        (useAttendanceData as any).mockReturnValue({
            subjects: [],
            setSubjects: vi.fn(),
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByText(/No Subjects Yet/i)).toBeDefined();
    });

    it('renders subject cards when subjects are present', () => {
        const mockSubjects = [
            {
                id: 1,
                name: 'Mathematics',
                code: 'MATH101',
                teacher: 'Dr. Euler',
                totalClasses: 20,
                attendedClasses: 18,
                requiredPercentage: 75,
            },
        ];

        (useAttendanceData as any).mockReturnValue({
            subjects: mockSubjects,
            setSubjects: vi.fn(),
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByText('Mathematics')).toBeDefined();
        expect(screen.getAllByText('90%')).toBeDefined();
    });

    it('calculates overall attendance correctly', () => {
        const mockSubjects = [
            {
                id: 1,
                name: 'Math',
                code: 'M1',
                totalClasses: 10,
                attendedClasses: 8,
                requiredPercentage: 75,
            },
            {
                id: 2,
                name: 'Physics',
                code: 'P1',
                totalClasses: 10,
                attendedClasses: 6,
                requiredPercentage: 75,
            }
        ];

        (useAttendanceData as any).mockReturnValue({
            subjects: mockSubjects,
            setSubjects: vi.fn(),
        });

        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByText('70%')).toBeDefined();
    });
});

import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.light.primary,
                tabBarInactiveTintColor: Colors.light.muted,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: Colors.light.border,
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
                }}
            />
            <Tabs.Screen
                name="attendance"
                options={{
                    title: 'Attendance',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>✓</Text>,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>⚙️</Text>,
                }}
            />
        </Tabs>
    );
}

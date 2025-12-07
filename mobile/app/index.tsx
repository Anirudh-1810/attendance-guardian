import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { signup, login as apiLogin } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { getGreeting } from '@/lib/utils';

export default function LandingPage() {
    const router = useRouter();
    const { login: authLogin, isAuthenticated, isLoading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [greeting, setGreeting] = useState('Welcome');

    // Login state
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // Signup state
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.replace('/(tabs)/dashboard');
        }
    }, [isAuthenticated, authLoading]);

    const handleLogin = async () => {
        if (!loginData.email || !loginData.password) {
            alert('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiLogin(loginData);
            await authLogin(response.token, response.user);
            router.replace('/(tabs)/dashboard');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!signupData.name || !signupData.email || !signupData.password) {
            alert('Please fill in all required fields');
            return;
        }

        if (signupData.password !== signupData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await signup({
                name: signupData.name,
                email: signupData.email,
                password: signupData.password,
            });
            await authLogin(response.token, response.user);
            router.replace('/(tabs)/dashboard');
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>{greeting} 👋</Text>
                    <Text style={styles.title}>Attendance Guardian</Text>
                    <Text style={styles.subtitle}>
                        Track your attendance, calculate safe bunks, and never miss a class
                    </Text>
                </View>

                {/* Auth Card */}
                <Card style={styles.authCard}>
                    {/* Tabs */}
                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'login' && styles.tabActive]}
                            onPress={() => setActiveTab('login')}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'login' && styles.tabTextActive,
                                ]}
                            >
                                Login
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
                            onPress={() => setActiveTab('signup')}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === 'signup' && styles.tabTextActive,
                                ]}
                            >
                                Sign Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Form */}
                    {activeTab === 'login' && (
                        <View style={styles.form}>
                            <Input
                                label="Email"
                                placeholder="student@university.edu"
                                value={loginData.email}
                                onChangeText={(text) =>
                                    setLoginData({ ...loginData, email: text })
                                }
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Input
                                label="Password"
                                placeholder="Enter your password"
                                value={loginData.password}
                                onChangeText={(text) =>
                                    setLoginData({ ...loginData, password: text })
                                }
                                secureTextEntry
                            />
                            <Button
                                title={isLoading ? 'Logging in...' : 'Log In'}
                                onPress={handleLogin}
                                loading={isLoading}
                                disabled={isLoading}
                                variant="primary"
                                size="large"
                                style={styles.submitButton}
                            />
                        </View>
                    )}

                    {/* Signup Form */}
                    {activeTab === 'signup' && (
                        <View style={styles.form}>
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                value={signupData.name}
                                onChangeText={(text) =>
                                    setSignupData({ ...signupData, name: text })
                                }
                            />
                            <Input
                                label="Email"
                                placeholder="student@university.edu"
                                value={signupData.email}
                                onChangeText={(text) =>
                                    setSignupData({ ...signupData, email: text })
                                }
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Input
                                label="Password"
                                placeholder="Create a password"
                                value={signupData.password}
                                onChangeText={(text) =>
                                    setSignupData({ ...signupData, password: text })
                                }
                                secureTextEntry
                            />
                            <Input
                                label="Confirm Password"
                                placeholder="Confirm your password"
                                value={signupData.confirmPassword}
                                onChangeText={(text) =>
                                    setSignupData({ ...signupData, confirmPassword: text })
                                }
                                secureTextEntry
                            />
                            <Button
                                title={isLoading ? 'Creating Account...' : 'Sign Up'}
                                onPress={handleSignup}
                                loading={isLoading}
                                disabled={isLoading}
                                variant="primary"
                                size="large"
                                style={styles.submitButton}
                            />
                        </View>
                    )}
                </Card>

                {/* Features */}
                <View style={styles.features}>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>📊</Text>
                        <Text style={styles.featureText}>Track Attendance</Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>🎯</Text>
                        <Text style={styles.featureText}>Calculate Bunks</Text>
                    </View>
                    <View style={styles.feature}>
                        <Text style={styles.featureIcon}>⚠️</Text>
                        <Text style={styles.featureText}>Risk Alerts</Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
    },
    header: {
        marginBottom: 32,
    },
    greeting: {
        fontSize: 16,
        color: Colors.light.muted,
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.muted,
        lineHeight: 24,
    },
    authCard: {
        marginBottom: 32,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 24,
        backgroundColor: Colors.light.border,
        borderRadius: 8,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    tabActive: {
        backgroundColor: '#fff',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.light.muted,
    },
    tabTextActive: {
        color: Colors.light.primary,
    },
    form: {
        gap: 8,
    },
    submitButton: {
        marginTop: 8,
    },
    features: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    feature: {
        alignItems: 'center',
    },
    featureIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    featureText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.light.text,
    },
});

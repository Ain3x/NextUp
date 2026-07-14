import {
    View, ViewStyle, KeyboardAvoidingView, Platform,
    ScrollView, Animated, Text, StyleSheet,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/context/ThemeContext';
import { Button, Input, Typography, ParticleLayer, AuthCard } from '@/components/shared';
import { ROUTES } from '@/constants';

type FormErrors = {
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
};

function SuccessCard({ email, onBack, theme }: {
    email: string;
    onBack: () => void;
    theme: ReturnType<typeof import('@/context/ThemeContext').useTheme>['theme'];
}) {
    const y = useRef(new Animated.Value(40)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const envY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
            Animated.timing(y, { toValue: 0, duration: 500, delay: 100, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(envY, { toValue: -8, duration: 900, useNativeDriver: true }),
                Animated.timing(envY, { toValue: 0, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.successCard,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    opacity,
                    transform: [{ translateY: y }],
                },
            ]}
        >
            <Animated.Text style={[styles.successEmoji, { transform: [{ translateY: envY }] }]}>
                📬
            </Animated.Text>
            <Typography variant="heading" style={{ textAlign: 'center' }}>Check your email</Typography>
            <Typography variant="body" color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
                We sent a confirmation link to{'\n'}
                <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>{email}</Text>
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={{ textAlign: 'center' }}>
                Click it to activate your account, then sign in.
            </Typography>
            <Button
                label="Back to sign in"
                onPress={onBack}
                variant="secondary"
                style={{ marginTop: 8, width: '100%' }}
            />
        </Animated.View>
    );
}

export function SignUpScreen() {
    const { theme } = useTheme();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validate()) return;
        setLoading(true);
        setErrors({});
        const { error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
        });
        if (error) {
            setErrors({ general: error.message });
            setLoading(false);
            return;
        }
        setSuccess(true);
        setLoading(false);
    };

    const containerStyle: ViewStyle = {
        flex: 1,
        backgroundColor: theme.colors.background,
    };

    return (
        <KeyboardAvoidingView
            style={containerStyle}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ParticleLayer />
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                {success ? (
                    <SuccessCard
                        email={email}
                        onBack={() => router.replace(ROUTES.SIGN_IN)}
                        theme={theme}
                    />
                ) : (
                    <AuthCard>
                        <Typography variant="heading">Create account</Typography>
                        <Typography variant="body" color={theme.colors.textSecondary}>
                            Start tracking your watchlist
                        </Typography>

                        <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.sm }}>
                            <Input
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="you@example.com"
                                keyboardType="email-address"
                                error={errors.email}
                            />
                            <Input
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="••••••••"
                                secureTextEntry
                                error={errors.password}
                            />
                            <Input
                                label="Confirm password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="••••••••"
                                secureTextEntry
                                error={errors.confirmPassword}
                            />

                            {errors.general && (
                                <Typography variant="caption" color={theme.colors.error}>
                                    {errors.general}
                                </Typography>
                            )}

                            <Button label="Create account" onPress={handleSignUp} loading={loading} />
                            <Button
                                label="Already have an account? Sign in"
                                onPress={() => router.replace(ROUTES.SIGN_IN)}
                                variant="ghost"
                            />
                        </View>
                    </AuthCard>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    successCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
        gap: 16,
        paddingVertical: 36,
    },
    successEmoji: {
        fontSize: 52,
        marginBottom: 4,
    },
});
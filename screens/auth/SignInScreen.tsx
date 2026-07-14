import {
    View, ViewStyle, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
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
    general?: string;
};

export function SignInScreen() {
    const { theme } = useTheme();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignIn = async () => {
        if (!validate()) return;
        setLoading(true);
        setErrors({});
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });
        if (error) {
            setErrors({ general: error.message });
            setLoading(false);
        }
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
                <AuthCard>
                    <Typography variant="heading">Welcome back</Typography>
                    <Typography variant="body" color={theme.colors.textSecondary}>
                        Sign in to continue watching
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

                        {errors.general && (
                            <Typography variant="caption" color={theme.colors.error}>
                                {errors.general}
                            </Typography>
                        )}

                        <Button label="Sign in" onPress={handleSignIn} loading={loading} />
                        <Button
                            label="Don't have an account? Sign up"
                            onPress={() => router.push(ROUTES.SIGN_UP)}
                            variant="ghost"
                        />
                    </View>
                </AuthCard>
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
});
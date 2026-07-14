import { Animated, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

type Props = {
    children: React.ReactNode;
};

export function AuthCard({ children }: Props) {
    const { theme } = useTheme();
    const y = useRef(new Animated.Value(40)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
            Animated.timing(y, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    opacity,
                    transform: [{ translateY: y }],
                },
            ]}
        >
            {/* Wordmark inside the card */}
            <View style={styles.wordmark}>
                <Text style={[styles.logo, { color: theme.colors.primary }]}>NextUp</Text>
                <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
                    Your queue. Your vibe.
                </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        gap: 16,
    },
    wordmark: {
        alignItems: 'center',
        paddingVertical: 8,
        gap: 4,
    },
    logo: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    tagline: {
        fontSize: 13,
        fontWeight: '400',
        letterSpacing: 0.2,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: -24,
    },
});
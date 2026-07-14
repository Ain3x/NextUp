import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

type Props = {
    text: string | null;
    loading: boolean;
};

export function TasteCard({ text, loading }: Props) {
    const { theme } = useTheme();

    if (!text && !loading) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.header}>
                <Ionicons name="sparkles" size={15} color={theme.colors.primary} />
                <Text style={[styles.label, { color: theme.colors.primary, fontSize: theme.font.sizes.xs }]}>
                    Your viewer identity
                </Text>
                {loading && (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.spinner} />
                )}
            </View>
            {text ? (
                <Text style={[styles.text, { color: theme.colors.text, fontSize: theme.font.sizes.sm }]}>
                    {text}
                </Text>
            ) : (
                <View style={styles.skeleton}>
                    <View style={[styles.skeletonLine, { backgroundColor: theme.colors.border, width: '100%' }]} />
                    <View style={[styles.skeletonLine, { backgroundColor: theme.colors.border, width: '80%' }]} />
                    <View style={[styles.skeletonLine, { backgroundColor: theme.colors.border, width: '60%' }]} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    label: {
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    spinner: { marginLeft: 'auto' },
    text: {
        lineHeight: 20,
        fontStyle: 'italic',
    },
    skeleton: { gap: 6 },
    skeletonLine: { height: 10, borderRadius: 5 },
});
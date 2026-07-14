import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTasteCard } from '@/hooks/useTasteCard';
import { supabase } from '@/lib/supabase';
import {
    WatchStatCard,
    TasteCard,
    CompletionRateSection,
    RatingDistribution,
    PaceSparkline,
    HistorySection,
} from '@/components/business/profile';

function initials(email: string): string {
    return email.slice(0, 2).toUpperCase();
}

function formatHours(h: number): string {
    if (h < 1) return `${Math.round(h * 60)}m`;
    return `${h}h`;
}

export default function ProfileScreen() {
    const { theme, isDark, toggleTheme } = useTheme();
    const { session } = useAuth();
    const { stats, completedHistory, topRated, loading, error, refetch } = useProfile();
    const { tasteCard, loading: tasteCardLoading } = useTasteCard(
        completedHistory,
        topRated,
        stats?.titlesCompleted ?? 0,
    );

    const handleSignOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const email = session?.user?.email ?? '';

    const statCards = stats ? [
        { icon: 'hourglass' as const,       label: 'Hours watched', value: formatHours(stats.totalHours),                              accent: theme.colors.primary },
        { icon: 'checkmark-circle' as const, label: 'Completed',     value: stats.titlesCompleted ?? 0,                                 accent: theme.colors.success },
        { icon: 'star' as const,             label: 'Avg rating',    value: stats.avgRating > 0 ? `${stats.avgRating}/10` : '—',        accent: '#FFD60A' },
        { icon: 'trending-up' as const,      label: 'Pace',          value: `${stats.pace}/mo`,                                          accent: '#FF6B35' },
        { icon: 'ribbon' as const,           label: 'Favourite',     value: stats.favouriteGenre ?? '—',                                 accent: theme.colors[stats.mostWatchedType] ?? theme.colors.primary },
        { icon: 'tv' as const,               label: 'Most watched',  value: stats.mostWatchedType ?? '—',                                accent: theme.colors[stats.mostWatchedType] ?? theme.colors.primary },
    ] : [];

    const hasInsights = stats && (
        stats.completionRate > 0 ||
        Object.values(stats.ratingBuckets).some(v => v > 0) ||
        stats.monthlyPace.some(m => m.count > 0)
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.heading, { color: theme.colors.text, fontSize: theme.font.sizes.xl }]}>
                    Profile
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Avatar + email */}
                <View style={styles.avatarRow}>
                    <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.avatarText}>{initials(email)}</Text>
                    </View>
                    <View style={styles.avatarInfo}>
                        <Text style={[styles.emailText, { color: theme.colors.text, fontSize: theme.font.sizes.md }]}>
                            {email}
                        </Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: theme.font.sizes.xs }}>
                            Member
                        </Text>
                    </View>
                </View>

                {/* Settings */}
                <View style={[styles.settingsSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={[styles.settingsRow, { borderBottomColor: theme.colors.border, borderBottomWidth: 0.2 }]}>
                        <View style={styles.settingsRowLeft}>
                            <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={theme.colors.text} />
                            <Text style={[styles.settingsLabel, { color: theme.colors.text, fontSize: theme.font.sizes.md }]}>
                                Dark mode
                            </Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                            thumbColor="#fff"
                        />
                    </View>
                    <TouchableOpacity style={styles.settingsRow} onPress={handleSignOut}>
                        <View style={styles.settingsRowLeft}>
                            <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
                            <Text style={[styles.settingsLabel, { color: theme.colors.error, fontSize: theme.font.sizes.md }]}>
                                Sign out
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={theme.colors.error} />
                    </TouchableOpacity>
                </View>

                {/* Loading / error */}
                {loading && (
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
                )}
                {error && (
                    <TouchableOpacity onPress={refetch} style={styles.errorRow}>
                        <Text style={{ color: theme.colors.error, fontSize: theme.font.sizes.sm }}>
                            {error} — tap to retry
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Stats + insights */}
                {stats && (
                    <>
                        <View style={styles.statsGrid}>
                            {statCards.map((card) => (
                                <WatchStatCard key={card.label} icon={card.icon} label={card.label} value={card.value} accent={card.accent} />
                            ))}
                        </View>

                        <TasteCard text={tasteCard} loading={tasteCardLoading} />

                        {hasInsights && (
                            <View style={styles.insightsBlock}>
                                <CompletionRateSection rate={stats.completionRate} />
                                {Object.values(stats.ratingBuckets).some(v => v > 0) && (
                                    <RatingDistribution buckets={stats.ratingBuckets} avg={stats.avgRating} />
                                )}
                                {stats.monthlyPace.length > 0 && (
                                    <PaceSparkline monthly={stats.monthlyPace} pace={stats.pace} />
                                )}
                            </View>
                        )}
                    </>
                )}

                <HistorySection title="Completed" items={completedHistory} mode="completed" />
                <HistorySection title="Top Rated"  items={topRated}          mode="toprated"  />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { paddingBottom: 48 },
    header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    heading: { fontWeight: '700' },
    avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 16 },
    avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
    avatarInfo: { gap: 2 },
    emailText: { fontWeight: '600' },
    loader: { marginTop: 32 },
    errorRow: { paddingHorizontal: 16, paddingTop: 12 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10, marginTop: 4 },
    settingsSection: { marginHorizontal: 16, marginBottom: 32, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
    settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
    settingsRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingsLabel: { fontWeight: '500' },
    insightsBlock: { marginTop: 4 },
});
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { FromQueueTab } from '@/screens/pick/FromQueueTab';
import { DiscoverTab } from '@/screens/pick/DiscoverTab';

export function PickScreen() {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'queue' | 'discover'>('queue');

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.font.sizes.xl }]}>
                    What's the vibe?
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary, fontSize: theme.font.sizes.sm }]}>
                    {activeTab === 'queue'
                        ? 'Pick your mood — Gemini chooses from your queue.'
                        : 'Discover something new based on your taste.'}
                </Text>
            </View>

            <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                {(['queue', 'discover'] as const).map((tab) => {
                    const active = activeTab === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabBtn, active && { backgroundColor: theme.colors.primary, borderRadius: 8 }]}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={tab === 'queue' ? 'list' : 'compass-outline'}
                                size={15}
                                color={active ? '#fff' : theme.colors.textSecondary}
                            />
                            <Text style={[styles.tabBtnText, { color: active ? '#fff' : theme.colors.textSecondary }]}>
                                {tab === 'queue' ? 'From Queue' : 'Discover'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {activeTab === 'queue' ? <FromQueueTab theme={theme} /> : <DiscoverTab theme={theme} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 4 },
    title: { fontWeight: '700' },
    subtitle: { lineHeight: 20 },
    tabBar: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 4, borderRadius: 10, borderWidth: 1, padding: 4, gap: 4 },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9 },
    tabBtnText: { fontSize: 13, fontWeight: '600' },
});
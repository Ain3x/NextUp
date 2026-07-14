import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAIPick } from '@/hooks/useAIPick';
import { MoodChip } from '@/components/business/pick/MoodChip';
import { AIPickCard } from '@/components/business/pick/AIPickCard';
import { TimeSelector } from '@/components/business/pick/TimeSelector';
import type { MoodType } from '@/types';

const MOODS: MoodType[] = ['chill', 'hype', 'emotional', 'funny', 'epic', 'dark', 'wholesome', 'mindless', 'intense'];

type Props = { theme: ReturnType<typeof useTheme>['theme'] };

export function FromQueueTab({ theme }: Props) {
    const {
        mood, timeAvailable, pickState, currentPick,
        selectMood, selectTimeAvailable, generatePick,
        nextPick, confirmPick, dismissPick, reset,
    } = useAIPick();

    const [customMinutes, setCustomMinutes] = useState('');
    const canGenerate = mood !== null && timeAvailable !== null && pickState.status !== 'loading';
    const totalPicks = pickState.status === 'results' ? pickState.picks.length : 0;

    const handleConfirm = useCallback(async () => { await confirmPick(); }, [confirmPick]);
    const handleReset = useCallback(() => { setCustomMinutes(''); reset(); }, [reset]);

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Mood</Text>
                <View style={styles.chipWrap}>
                    {MOODS.map((m) => (
                        <MoodChip key={m} mood={m} selected={mood === m} onPress={selectMood} />
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Time available</Text>
                <TimeSelector
                    timeAvailable={timeAvailable}
                    customMinutes={customMinutes}
                    setCustomMinutes={setCustomMinutes}
                    onSelectTime={selectTimeAvailable}
                    theme={theme}
                />
            </View>

            {pickState.status !== 'results' && (
                <TouchableOpacity
                    style={[styles.generateBtn, { backgroundColor: canGenerate ? theme.colors.primary : theme.colors.border }]}
                    onPress={generatePick}
                    disabled={!canGenerate}
                    activeOpacity={0.8}
                >
                    {pickState.status === 'loading'
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.generateBtnText}>{pickState.status === 'error' ? 'Try again' : 'Pick for me ✨'}</Text>
                    }
                </TouchableOpacity>
            )}

            {pickState.status === 'error' && (
                <View style={[styles.errorBox, { backgroundColor: theme.colors.error + '18', borderColor: theme.colors.error + '44' }]}>
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>{pickState.message}</Text>
                </View>
            )}

            {pickState.status === 'results' && currentPick && (
                <View style={styles.section}>
                    <AIPickCard
                        pick={currentPick}
                        totalPicks={totalPicks}
                        onConfirm={handleConfirm}
                        onNext={nextPick}
                        onDismiss={dismissPick}
                    />
                    <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                        <Text style={[styles.resetText, { color: theme.colors.textSecondary }]}>Start over</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: { padding: 16, gap: 20, paddingBottom: 48 },
    section: { gap: 10 },
    sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    generateBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
    generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    errorBox: { borderWidth: 1, borderRadius: 12, padding: 16 },
    errorText: { fontSize: 13, lineHeight: 20 },
    resetBtn: { alignSelf: 'center', paddingVertical: 8 },
    resetText: { fontSize: 13, fontWeight: '500' },
});
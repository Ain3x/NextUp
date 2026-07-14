import { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useDiscover } from '@/hooks/useDiscover';
import { TimeSelector } from '@/components/business/pick/TimeSelector';
import { DiscoverCard } from '@/components/business/pick/DiscoverCard';
import type { MediaType } from '@/types';

const MEDIA_TYPES: { label: string; value: MediaType; emoji: string }[] = [
    { label: 'Anime', value: 'anime', emoji: '⛩️' },
    { label: 'Movie', value: 'movie', emoji: '🎬' },
    { label: 'Show', value: 'show', emoji: '📺' },
];

type Props = { theme: ReturnType<typeof useTheme>['theme'] };

export function DiscoverTab({ theme }: Props) {
    const {
        mediaType, timeAvailable, genre, freeText, discoverState, currentDiscover,
        setMediaType, setDiscoverTime, setGenre, setFreeText,
        generateDiscover, nextDiscover, prevDiscover, resetDiscover,
    } = useDiscover();

    const [customMinutes, setCustomMinutes] = useState('');
    const canGenerate = mediaType !== null && timeAvailable !== null && discoverState.status !== 'loading';
    const currentIndex = discoverState.status === 'results' ? discoverState.currentIndex : 0;
    const total = discoverState.status === 'results' ? discoverState.items.length : 0;

    const handleReset = useCallback(() => { setCustomMinutes(''); resetDiscover(); }, [resetDiscover]);

    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>What are you in the mood for?</Text>
                <View style={styles.typeRow}>
                    {MEDIA_TYPES.map((t) => {
                        const active = mediaType === t.value;
                        return (
                            <TouchableOpacity
                                key={t.value}
                                style={[
                                    styles.typeChip,
                                    {
                                        flex: 1,
                                        backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                                        borderColor: active ? theme.colors.primary : theme.colors.border,
                                    },
                                ]}
                                onPress={() => setMediaType(t.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                                <Text style={[styles.typeLabel, { color: active ? '#fff' : theme.colors.text }]}>{t.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Time available</Text>
                <TimeSelector
                    timeAvailable={timeAvailable}
                    customMinutes={customMinutes}
                    setCustomMinutes={setCustomMinutes}
                    onSelectTime={setDiscoverTime}
                    theme={theme}
                />
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>Genre / vibe</Text>
                <TextInput
                    style={[
                        styles.textField,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: genre.trim() ? theme.colors.primary : theme.colors.border,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="e.g. romance, psychological thriller, feel-good..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={genre}
                    onChangeText={setGenre}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                    {'Anything else? '}
                    <Text style={{ fontWeight: '400', textTransform: 'none', letterSpacing: 0 }}>(optional)</Text>
                </Text>
                <TextInput
                    style={[
                        styles.textField,
                        styles.textArea,
                        {
                            backgroundColor: theme.colors.surface,
                            borderColor: freeText.trim() ? theme.colors.primary : theme.colors.border,
                            color: theme.colors.text,
                        },
                    ]}
                    placeholder="e.g. something like Attack on Titan but lighter, or a hidden gem from the 90s..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={freeText}
                    onChangeText={setFreeText}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            {discoverState.status !== 'results' && (
                <TouchableOpacity
                    style={[styles.generateBtn, { backgroundColor: canGenerate ? theme.colors.primary : theme.colors.border }]}
                    onPress={generateDiscover}
                    disabled={!canGenerate}
                    activeOpacity={0.8}
                >
                    {discoverState.status === 'loading'
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.generateBtnText}>{discoverState.status === 'error' ? 'Try again' : 'Find something new ✨'}</Text>
                    }
                </TouchableOpacity>
            )}

            {discoverState.status === 'error' && (
                <View style={[styles.errorBox, { backgroundColor: theme.colors.error + '18', borderColor: theme.colors.error + '44' }]}>
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>{discoverState.message}</Text>
                </View>
            )}

            {discoverState.status === 'results' && currentDiscover && (
                <View style={styles.section}>
                    <DiscoverCard
                        item={currentDiscover}
                        index={currentIndex}
                        total={total}
                        onPrev={prevDiscover}
                        onNext={nextDiscover}
                        theme={theme}
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
    typeRow: { flexDirection: 'row', gap: 8 },
    typeChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderRadius: 10, paddingVertical: 12 },
    typeEmoji: { fontSize: 16 },
    typeLabel: { fontSize: 13, fontWeight: '600' },
    generateBtn: { borderRadius: 999, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
    generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
    errorBox: { borderWidth: 1, borderRadius: 12, padding: 16 },
    errorText: { fontSize: 13, lineHeight: 20 },
    resetBtn: { alignSelf: 'center', paddingVertical: 8 },
    resetText: { fontSize: 13, fontWeight: '500' },
    textField: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
    textArea: { minHeight: 80, paddingTop: 11 },
});
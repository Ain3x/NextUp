import { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Share,
    StyleSheet,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    DateTimePickerEvent,
    DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useTheme } from '@/context/ThemeContext';
import { useQueueContext } from '@/context/QueueContext';
import { useNotifications } from '@/hooks/useNotifications';

export function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const { items, markEpisodeWatched, markComplete, rateItem, addNote } = useQueueContext();
    const { scheduleReminder, cancelReminder } = useNotifications();

    // ── All hooks before any early return ─────────────────────────────────────

    const item = items.find((i) => i.id === id);

    const [noteText, setNoteText] = useState(item?.notes ?? '');
    const [noteSaved, setNoteSaved] = useState(false);
    const [reminderDate, setReminderDate] = useState<Date>(new Date(Date.now() + 3600 * 1000));
    const [showIOSPicker, setShowIOSPicker] = useState(false);
    const [scheduledId, setScheduledId] = useState<string | null>(null);
    const [reminderError, setReminderError] = useState<string | null>(null);

    const handleShare = useCallback(async () => {
        if (!item) return;
        const progress = item.totalEpisodes
            ? `Episode ${item.currentEpisode}/${item.totalEpisodes}`
            : item.runtimeMins ? `${item.runtimeMins} min` : '';
        await Share.share({
            message: `Watching ${item.title}${progress ? ` · ${progress}` : ''} — via NextUp`,
        });
    }, [item]);

    const handleSaveNote = useCallback(async () => {
        if (!item) return;
        await addNote(item.id, noteText);
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2000);
    }, [item, noteText, addNote]);

    const handleScheduleReminder = useCallback(async () => {
        if (!item) return;
        setReminderError(null);
        try {
            if (scheduledId) await cancelReminder(scheduledId);
            const newId = await scheduleReminder(item, reminderDate);
            setScheduledId(newId);
        } catch (err) {
            setReminderError(err instanceof Error ? err.message : 'Failed to set reminder');
        }
    }, [item, reminderDate, scheduledId, scheduleReminder, cancelReminder]);

    const handleCancelReminder = useCallback(async () => {
        if (!scheduledId) return;
        await cancelReminder(scheduledId);
        setScheduledId(null);
    }, [scheduledId, cancelReminder]);

    const handleOpenDatePicker = useCallback(() => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: reminderDate,
                mode: 'date',
                minimumDate: new Date(),
                onChange: (_: DateTimePickerEvent, date?: Date) => {
                    if (!date) return;
                    DateTimePickerAndroid.open({
                        value: date, // ← use the picked date as base, not reminderDate
                        mode: 'time',
                        onChange: (_2: DateTimePickerEvent, time?: Date) => {
                            if (!time) return;
                            // Merge: take date from first picker, hours/minutes from second
                            const merged = new Date(date);
                            merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
                            setReminderDate(merged);
                        },
                    });
                },
            });
        } else {
            setShowIOSPicker((prev) => !prev);
        }
    }, [reminderDate]);

    const handleIOSDateChange = useCallback((_: DateTimePickerEvent, date?: Date) => {
        if (date) setReminderDate(date);
    }, []);

    const s = useMemo(() => styles(theme), [theme]);

    // ── Early return after all hooks ───────────────────────────────────────────

    if (!item) {
        return (
            <SafeAreaView style={s.root}>
                <View style={s.notFound}>
                    <Text style={[s.notFoundText, { color: theme.colors.textSecondary }]}>Item not found.</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={{ color: theme.colors.primary, marginTop: 8 }}>Go back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }


    const isEpisodic = item.totalEpisodes !== null;
    const isCompleted = item.status === 'completed';
    const typeColor =
        item.type === 'anime' ? theme.colors.anime :
            item.type === 'movie' ? theme.colors.movie :
                theme.colors.show;

    const STATUS_COLORS: Record<string, string> = {
        not_started: theme.colors.textSecondary,
        watching: theme.colors.success,
        paused: '#FFD60A',
        completed: theme.colors.primary,
        dropped: theme.colors.error,
    };

    const totalRuntime = (() => {
        if (!isEpisodic || !item.totalEpisodes || !item.runtimeMins) return null;
        const totalMins = item.totalEpisodes * item.runtimeMins;
        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''} total`;
    })();

    return (
        <SafeAreaView style={s.root}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="chevron-down" size={26} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="share-outline" size={22} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
                {/* Hero row */}
                <View style={s.hero}>
                    <View style={s.posterWrapper}>
                        {item.posterUrl ? (
                            <Image source={{ uri: item.posterUrl }} style={s.poster} resizeMode="cover" />
                        ) : (
                            <View style={[s.poster, s.posterFallback, { backgroundColor: theme.colors.surface }]}>
                                <Ionicons name="film-outline" size={36} color={theme.colors.textSecondary} />
                            </View>
                        )}
                        <View style={[s.typeBadge, { backgroundColor: typeColor }]}>
                            <Text style={s.typeBadgeText}>{item.type}</Text>
                        </View>
                    </View>

                    <View style={s.heroInfo}>
                        <Text style={[s.title, { color: theme.colors.text }]} numberOfLines={3}>
                            {item.title}
                        </Text>
                        <View style={[s.statusPill, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                            <View style={[s.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                            <Text style={[s.statusLabel, { color: STATUS_COLORS[item.status] }]}>
                                {item.status.replace(/_/g, ' ')}
                            </Text>
                        </View>
                        {isEpisodic && (
                            <Text style={[s.meta, { color: theme.colors.textSecondary }]}>
                                Ep {item.currentEpisode}/{item.totalEpisodes}
                            </Text>
                        )}
                        {!isEpisodic && item.runtimeMins && (
                            <Text style={[s.meta, { color: theme.colors.textSecondary }]}>
                                {item.runtimeMins} min
                            </Text>
                        )}
                        {totalRuntime && (
                            <Text style={[s.meta, { color: theme.colors.textSecondary }]}>
                                {totalRuntime}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Progress actions */}
                {!isCompleted && (
                    <View style={s.section}>
                        <Text style={[s.sectionLabel, { color: theme.colors.textSecondary }]}>PROGRESS</Text>
                        {isEpisodic && (
                            <TouchableOpacity
                                style={[s.actionBtn, { backgroundColor: typeColor + '22', borderColor: typeColor + '55' }]}
                                onPress={() => markEpisodeWatched(item.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="checkmark-circle" size={18} color={typeColor} />
                                <Text style={[s.actionBtnText, { color: typeColor }]}>
                                    Mark episode {item.currentEpisode + 1} watched
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[s.actionBtn, { backgroundColor: theme.colors.success + '22', borderColor: theme.colors.success + '55' }]}
                            onPress={() => markComplete(item.id)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="checkmark-done-circle" size={18} color={theme.colors.success} />
                            <Text style={[s.actionBtnText, { color: theme.colors.success }]}>Mark complete</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Rating */}
                <View style={s.section}>
                    <Text style={[s.sectionLabel, { color: theme.colors.textSecondary }]}>RATING</Text>
                    <View style={s.starsRow}>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => rateItem(item.id, star)}
                                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                            >
                                <Ionicons
                                    name={item.rating && star <= item.rating ? 'star' : 'star-outline'}
                                    size={26}
                                    color={item.rating && star <= item.rating ? '#FFD60A' : theme.colors.border}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    {item.rating && (
                        <Text style={[s.ratingLabel, { color: theme.colors.textSecondary }]}>
                            {item.rating}/10
                        </Text>
                    )}
                </View>

                {/* Notes */}
                <View style={s.section}>
                    <Text style={[s.sectionLabel, { color: theme.colors.textSecondary }]}>NOTES</Text>
                    <TextInput
                        style={[s.notesInput, {
                            backgroundColor: theme.colors.surface,
                            borderColor: theme.colors.border,
                            color: theme.colors.text,
                        }]}
                        placeholder="Add a note..."
                        placeholderTextColor={theme.colors.textSecondary}
                        multiline
                        numberOfLines={4}
                        value={noteText}
                        onChangeText={(t) => { setNoteText(t); setNoteSaved(false); }}
                    />
                    <TouchableOpacity
                        style={[s.saveBtn, { backgroundColor: noteSaved ? theme.colors.success : theme.colors.primary }]}
                        onPress={handleSaveNote}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={noteSaved ? 'checkmark' : 'save-outline'} size={15} color="#fff" />
                        <Text style={s.saveBtnText}>{noteSaved ? 'Saved' : 'Save note'}</Text>
                    </TouchableOpacity>
                </View>

                {/* Reminder */}
                <View style={s.section}>
                    <Text style={[s.sectionLabel, { color: theme.colors.textSecondary }]}>REMINDER</Text>

                    <TouchableOpacity
                        style={[s.dateRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                        onPress={handleOpenDatePicker}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
                        <Text style={[s.dateText, { color: theme.colors.text }]}>
                            {reminderDate.toLocaleString()}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    {showIOSPicker && (
                        <DateTimePicker
                            value={reminderDate}
                            mode="datetime"
                            minimumDate={new Date()}
                            onChange={handleIOSDateChange}
                            display="inline"
                        />
                    )}

                    {reminderError && (
                        <Text style={[s.reminderError, { color: theme.colors.error }]}>{reminderError}</Text>
                    )}

                    {scheduledId ? (
                        <View style={s.reminderRow}>
                            <View style={[s.reminderActive, { backgroundColor: theme.colors.success + '18', borderColor: theme.colors.success + '44' }]}>
                                <Ionicons name="notifications" size={14} color={theme.colors.success} />
                                <Text style={[s.reminderActiveText, { color: theme.colors.success }]}>Reminder set</Text>
                            </View>
                            <TouchableOpacity onPress={handleCancelReminder}>
                                <Text style={[s.cancelReminder, { color: theme.colors.error }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[s.actionBtn, { backgroundColor: theme.colors.primary + '18', borderColor: theme.colors.primary + '44' }]}
                            onPress={handleScheduleReminder}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="notifications-outline" size={16} color={theme.colors.primary} />
                            <Text style={[s.actionBtnText, { color: theme.colors.primary }]}>Set reminder</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) =>
    StyleSheet.create({
        root: { flex: 1, backgroundColor: theme.colors.background },
        notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
        notFoundText: { fontSize: theme.font.sizes.md },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        content: { padding: 16, gap: 24, paddingBottom: 48 },
        hero: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
        posterWrapper: { position: 'relative', flexShrink: 0 },
        poster: { width: 100, height: 144, borderRadius: 12 },
        posterFallback: { justifyContent: 'center', alignItems: 'center' },
        typeBadge: {
            position: 'absolute', bottom: 6, left: 6,
            borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
        },
        typeBadgeText: {
            color: '#fff', fontSize: 9, fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: 0.4,
        },
        heroInfo: { flex: 1, gap: 8, paddingTop: 2 },
        title: { fontSize: theme.font.sizes.lg, fontWeight: '700', lineHeight: 26 },
        statusPill: {
            flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
            borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, gap: 5,
        },
        statusDot: { width: 6, height: 6, borderRadius: 3 },
        statusLabel: { fontSize: theme.font.sizes.xs, fontWeight: '600' },
        meta: { fontSize: theme.font.sizes.sm },
        section: { gap: 10 },
        sectionLabel: {
            fontSize: theme.font.sizes.xs, fontWeight: '700',
            letterSpacing: 0.8, textTransform: 'uppercase',
        },
        actionBtn: {
            flexDirection: 'row', alignItems: 'center', gap: 8,
            borderWidth: 1, borderRadius: 10,
            paddingHorizontal: 14, paddingVertical: 11,
        },
        actionBtnText: { fontSize: theme.font.sizes.sm, fontWeight: '600' },
        starsRow: { flexDirection: 'row', gap: 4 },
        ratingLabel: { fontSize: theme.font.sizes.xs, marginTop: 2 },
        notesInput: {
            borderWidth: 1, borderRadius: 10,
            padding: 12, fontSize: theme.font.sizes.sm,
            minHeight: 96, textAlignVertical: 'top', lineHeight: 20,
        },
        saveBtn: {
            flexDirection: 'row', alignItems: 'center', gap: 6,
            borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16,
            alignSelf: 'flex-end',
        },
        saveBtnText: { color: '#fff', fontSize: theme.font.sizes.sm, fontWeight: '700' },
        dateRow: {
            flexDirection: 'row', alignItems: 'center', gap: 10,
            borderWidth: 1, borderRadius: 10,
            paddingHorizontal: 14, paddingVertical: 12,
        },
        dateText: { flex: 1, fontSize: theme.font.sizes.sm },
        reminderError: { fontSize: theme.font.sizes.xs },
        reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        reminderActive: {
            flexDirection: 'row', alignItems: 'center', gap: 6,
            borderWidth: 1, borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 8,
        },
        reminderActiveText: { fontSize: theme.font.sizes.sm, fontWeight: '600' },
        cancelReminder: { fontSize: theme.font.sizes.sm, fontWeight: '600' },
    });
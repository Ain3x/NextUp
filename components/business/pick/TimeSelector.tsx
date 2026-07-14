import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { TimeAvailable } from '@/types';

type Props = {
    timeAvailable: TimeAvailable | null;
    customMinutes: string;
    setCustomMinutes: (v: string) => void;
    onSelectTime: (t: TimeAvailable) => void;
    theme: ReturnType<typeof useTheme>['theme'];
};

export function TimeSelector({ timeAvailable, customMinutes, setCustomMinutes, onSelectTime, theme }: Props) {
    return (
        <View style={styles.timeRow}>
            <TouchableOpacity
                style={[
                    styles.timeChip,
                    {
                        backgroundColor: timeAvailable === 'all_night' ? theme.colors.primary : theme.colors.surface,
                        borderColor: timeAvailable === 'all_night' ? theme.colors.primary : theme.colors.border,
                    },
                ]}
                onPress={() => { setCustomMinutes(''); onSelectTime('all_night'); }}
                activeOpacity={0.7}
            >
                <Text style={[styles.timeChipText, { color: timeAvailable === 'all_night' ? '#fff' : theme.colors.text }]}>
                    All night
                </Text>
            </TouchableOpacity>

            <TextInput
                style={[
                    styles.timeInput,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: typeof timeAvailable === 'number' ? theme.colors.primary : theme.colors.border,
                        color: theme.colors.text,
                    },
                ]}
                placeholder="e.g. 45"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                maxLength={4}
                value={customMinutes}
                onChangeText={(val) => {
                    const digits = val.replace(/[^0-9]/g, '');
                    setCustomMinutes(digits);
                    const n = parseInt(digits, 10);
                    if (!isNaN(n) && n > 0) onSelectTime(n);
                }}
            />
            {typeof timeAvailable === 'number' && (
                <Text style={[styles.timeUnit, { color: theme.colors.textSecondary }]}>min</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    timeRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    timeChip: {
        borderWidth: 1.5,
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 9,
    },
    timeChipText: {
        fontSize: 13,
        fontWeight: '500',
    },
    timeInput: {
        borderWidth: 1.5,
        borderRadius: 999,
        paddingHorizontal: 18,
        paddingVertical: 9,
        fontSize: 13,
        fontWeight: '500',
        minWidth: 90,
        textAlign: 'center',
    },
    timeUnit: {
        fontSize: 13,
        fontWeight: '500',
    },
});
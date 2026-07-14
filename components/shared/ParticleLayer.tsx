import { View, Animated, StyleSheet, Dimensions, Text } from 'react-native';
import { useEffect, useRef } from 'react';

const { width: SW, height: SH } = Dimensions.get('window');

const PARTICLES = ['🎬', '⛩️', '📺', '✨', '🎭', '🍿', '🎞️', '⭐'];

const PARTICLE_CONFIG = PARTICLES.map((emoji, i) => ({
    emoji,
    startX: (SW / PARTICLES.length) * i + Math.random() * 30,
    delay: i * 900,
    duration: 7000 + i * 500,
}));

function Particle({ emoji, startX, delay, duration }: {
    emoji: string;
    startX: number;
    delay: number;
    duration: number;
}) {
    const y = useRef(new Animated.Value(SH + 20)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loop = () => {
            y.setValue(SH + 20);
            opacity.setValue(0);
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(y, { toValue: -60, duration, useNativeDriver: true }),
                    Animated.sequence([
                        Animated.timing(opacity, { toValue: 0.35, duration: 600, useNativeDriver: true }),
                        Animated.delay(duration - 1200),
                        Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
                    ]),
                ]),
            ]).start(loop);
        };
        loop();
    }, []);

    return (
        <Animated.Text style={[styles.particle, { left: startX, transform: [{ translateY: y }], opacity }]}>
            {emoji}
        </Animated.Text>
    );
}

export function ParticleLayer() {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {PARTICLE_CONFIG.map((p, i) => <Particle key={i} {...p} />)}
        </View>
    );
}

const styles = StyleSheet.create({
    particle: { position: 'absolute', fontSize: 22 },
});
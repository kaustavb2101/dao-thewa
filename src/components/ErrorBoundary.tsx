import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <SafeAreaView style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.emoji}>🔮</Text>
                        <Text style={styles.title}>เกิดข้อผิดพลาดบางอย่าง</Text>
                        <Text style={styles.subtitle}>
                            Something went wrong. The stars are slightly misaligned.
                        </Text>
                        <Text style={styles.errorText}>
                            {this.state.error?.message || 'Unknown Error'}
                        </Text>
                        <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                            <Text style={styles.buttonText}>ลองใหม่อีกครั้ง / Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bg.deep,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.gold.bright,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text.primary,
        marginBottom: 24,
        textAlign: 'center',
        opacity: 0.8,
    },
    errorText: {
        fontSize: 12,
        color: Colors.text.secondary,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 32,
        fontFamily: 'System',
        textAlign: 'center',
    },
    button: {
        backgroundColor: Colors.gold.warm,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 30,
    },
    buttonText: {
        color: Colors.bg.deep,
        fontWeight: '700',
        fontSize: 16,
    },
});

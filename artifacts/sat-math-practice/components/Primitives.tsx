import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import type { Language } from '@/src/i18n';

export function AppScreen({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: Platform.OS === 'web' ? 67 : insets.top,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function AppButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  compact = false,
  rtl = false,
  testID,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  compact?: boolean;
  rtl?: boolean;
  testID?: string;
}) {
  const colors = useColors();
  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'danger'
        ? colors.destructive
        : variant === 'secondary'
          ? colors.secondary
          : 'transparent';
  const foregroundColor =
    variant === 'primary' || variant === 'danger'
      ? colors.primaryForeground
      : colors.foreground;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        {
          backgroundColor,
          borderColor: variant === 'outline' ? colors.border : backgroundColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: disabled ? 0.42 : pressed ? 0.82 : 1,
          flexDirection: rtl ? 'row-reverse' : 'row',
        },
      ]}
    >
      {icon ? <Feather name={icon} size={18} color={foregroundColor} /> : null}
      <Text style={[styles.buttonLabel, { color: foregroundColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.55 : 1 }]}
    >
      <Feather name={icon} size={20} color={colors.foreground} />
    </Pressable>
  );
}

export function ScreenTitle({
  title,
  subtitle,
  rtl = false,
  trailing,
}: {
  title: string;
  subtitle?: string;
  rtl?: boolean;
  trailing?: ReactNode;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.titleRow,
        { flexDirection: rtl ? 'row-reverse' : 'row' },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.screenTitle,
            { color: colors.foreground, textAlign: rtl ? 'right' : 'left' },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[
              styles.screenSubtitle,
              { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

export function LoadingView() {
  const colors = useColors();
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function BodyText({
  children,
  rtl = false,
  style,
}: {
  children: ReactNode;
  rtl?: boolean;
  style?: object;
}) {
  const colors = useColors();
  return (
    <Text
      style={[
        styles.body,
        {
          color: colors.foreground,
          textAlign: rtl ? 'right' : 'left',
          writingDirection: rtl ? 'rtl' : 'ltr',
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonCompact: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 13,
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.05,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    alignItems: 'center',
    gap: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.45,
  },
  screenSubtitle: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export type AppLanguage = Language;

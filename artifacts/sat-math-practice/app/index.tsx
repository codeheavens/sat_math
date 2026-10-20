import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AppButton, AppScreen } from '@/components/Primitives';
import { usePractice } from '@/src/context/PracticeContext';
import { copy } from '@/src/i18n';
import { TOPICS } from '@/src/questions';

export default function HomeScreen() {
  const colors = useColors();
  const {
    ready,
    storageIssue,
    language,
    setLanguage,
    session,
    scores,
    startTest,
  } = usePractice();
  const rtl = language === 'ar';
  const label = (english: string, arabic: string) =>
    language === 'ar' ? arabic : english;

  if (!ready) {
    return (
      <AppScreen>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topLine, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <View style={[styles.brand, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
              <Feather
                name="crosshair"
                size={20}
                color={colors.primaryForeground}
              />
            </View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>
              SAT Math Practice
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy(language, 'language')}
            onPress={() => setLanguage(rtl ? 'en' : 'ar')}
            testID="language-toggle"
            style={({ pressed }) => [
              styles.languageButton,
              { backgroundColor: colors.secondary, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="globe" size={15} color={colors.primary} />
            <Text style={[styles.languageLabel, { color: colors.primary }]}>
              {copy(language, 'language')}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              alignItems: rtl ? 'flex-end' : 'flex-start',
            },
          ]}
        >
          <View style={styles.eyebrow}>
            <View style={[styles.eyebrowDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.eyebrowText, { color: colors.primary }]}>
              DIGITAL SAT · MATH
            </Text>
          </View>
          <Text
            style={[
              styles.heroTitle,
              {
                color: colors.foreground,
                textAlign: rtl ? 'right' : 'left',
                writingDirection: rtl ? 'rtl' : 'ltr',
              },
            ]}
          >
            {copy(language, 'tagline')}
          </Text>
          <Text
            style={[
              styles.heroDescription,
              { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
            ]}
          >
            {label(
              '30 original questions across four math topics.',
              '٣٠ سؤالًا أصليًا في أربعة موضوعات رياضية.',
            )}
          </Text>
          <View style={[styles.metaRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <View style={[styles.metaItem, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <Feather name="layers" size={15} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {copy(language, 'modules')}
              </Text>
            </View>
            <View style={[styles.metaItem, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
              <Feather name="clock" size={15} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {copy(language, 'minutesPerModule')}
              </Text>
            </View>
          </View>
        </View>

        {session ? (
          <AppButton
            label={copy(language, 'resume')}
            icon="play"
            rtl={rtl}
            onPress={() => router.push('/test')}
            testID="resume-practice"
          />
        ) : null}
        <AppButton
          label={copy(language, 'startTest')}
          icon="arrow-up-right"
          rtl={rtl}
          onPress={() => {
            startTest();
            router.push('/test');
          }}
          testID="start-test"
        />
        <AppButton
          label={copy(language, 'topicPractice')}
          icon="grid"
          variant="outline"
          rtl={rtl}
          onPress={() => router.push('/topics')}
          testID="practice-by-topic"
        />

        <View style={styles.topicPreview}>
          <View style={[styles.sectionHeading, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {copy(language, 'chooseTopic')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/topics')}
              style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}
            >
              <Feather
                name={rtl ? 'arrow-left' : 'arrow-right'}
                size={18}
                color={colors.primary}
              />
            </Pressable>
          </View>
          <View style={styles.topicChips}>
            {TOPICS.map((topic) => (
              <Pressable
                key={topic.id}
                accessibilityRole="button"
                onPress={() => router.push('/topics')}
                style={({ pressed }) => [
                  styles.topicChip,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.topicChipText, { color: colors.foreground }]}>
                  {language === 'ar' ? topic.arabic : topic.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.scoresSection}>
          <View style={[styles.sectionHeading, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {copy(language, 'recentScores')}
            </Text>
            <Feather name="bar-chart-2" size={18} color={colors.primary} />
          </View>
          {scores.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
              ]}
            >
              {copy(language, 'noScores')}
            </Text>
          ) : (
            scores.slice(0, 3).map((score) => {
              const percent = Math.round(
                (score.correctCount / score.questionCount) * 100,
              );
              return (
                <View
                  key={score.id}
                  style={[
                    styles.scoreRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      flexDirection: rtl ? 'row-reverse' : 'row',
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.scoreTitle,
                        { color: colors.foreground, textAlign: rtl ? 'right' : 'left' },
                      ]}
                    >
                      {score.topic
                        ? TOPICS.find((topic) => topic.id === score.topic)?.[
                            language === 'ar' ? 'arabic' : 'label'
                          ]
                        : copy(language, 'testMode')}
                    </Text>
                    <Text
                      style={[
                        styles.scoreDate,
                        { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
                      ]}
                    >
                      {new Date(score.completedAt).toLocaleDateString(
                        language === 'ar' ? 'ar-EG' : 'en-US',
                        { month: 'short', day: 'numeric' },
                      )}
                    </Text>
                  </View>
                  <Text style={[styles.scoreValue, { color: colors.primary }]}>
                    {score.correctCount}/{score.questionCount}
                    <Text style={styles.scorePercent}> · {percent}%</Text>
                  </Text>
                </View>
              );
            })
          )}
        </View>
        <Text
          style={[
            styles.saveNote,
            { color: storageIssue ? colors.destructive : colors.mutedForeground },
          ]}
        >
          {copy(language, storageIssue ? 'storageIssue' : 'savedLocally')}
        </Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 22,
    paddingBottom: 30,
    gap: 13,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topLine: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 4,
  },
  brand: { alignItems: 'center', gap: 10 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  languageButton: {
    paddingHorizontal: 11,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  languageLabel: { fontSize: 13, fontWeight: '700' },
  hero: {
    padding: 21,
    borderRadius: 23,
    borderWidth: 1,
    marginTop: 6,
  },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  eyebrowDot: { width: 7, height: 7, borderRadius: 4 },
  eyebrowText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.3 },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.7,
    lineHeight: 35,
    marginTop: 16,
  },
  heroDescription: { fontSize: 14, lineHeight: 21, marginTop: 8 },
  metaRow: { flexWrap: 'wrap', gap: 15, marginTop: 18 },
  metaItem: { gap: 6, alignItems: 'center' },
  metaText: { fontSize: 12, fontWeight: '500' },
  topicPreview: { marginTop: 7, gap: 12 },
  sectionHeading: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  topicChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topicChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  topicChipText: { fontSize: 12, fontWeight: '600' },
  scoresSection: { marginTop: 10, gap: 10 },
  emptyText: { fontSize: 14, lineHeight: 20, paddingVertical: 3 },
  scoreRow: {
    minHeight: 66,
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 10,
  },
  scoreTitle: { fontSize: 14, fontWeight: '700' },
  scoreDate: { fontSize: 12, marginTop: 3 },
  scoreValue: { fontSize: 16, fontWeight: '800' },
  scorePercent: { fontSize: 12, fontWeight: '600' },
  saveNote: { fontSize: 12, textAlign: 'center', marginTop: 5 },
});

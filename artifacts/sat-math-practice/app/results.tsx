import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import {
  AppButton,
  AppScreen,
  LoadingView,
  ScreenTitle,
} from '@/components/Primitives';
import { usePractice } from '@/src/context/PracticeContext';
import { copy } from '@/src/i18n';
import {
  answerLabel,
  answersMatch,
  QUESTION_BY_ID,
  TOPICS,
} from '@/src/questions';

export default function ResultsScreen() {
  const colors = useColors();
  const {
    ready,
    latestResult,
    language,
    startTest,
    startTopic,
  } = usePractice();
  const rtl = language === 'ar';

  if (!ready) {
    return (
      <AppScreen>
        <LoadingView />
      </AppScreen>
    );
  }
  if (!latestResult) {
    return (
      <AppScreen>
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {copy(language, 'results')}
          </Text>
          <AppButton
            label={copy(language, 'home')}
            icon="home"
            onPress={() => router.replace('/')}
          />
        </View>
      </AppScreen>
    );
  }

  const percent = Math.round(
    (latestResult.correctCount / latestResult.questionCount) * 100,
  );
  const topicName = latestResult.topic
    ? TOPICS.find((topic) => topic.id === latestResult.topic)?.[
        language === 'ar' ? 'arabic' : 'label'
      ]
    : copy(language, 'testMode');

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSpace} />
        <View
          style={[
            styles.scoreCard,
            { backgroundColor: colors.primary, alignItems: 'center' },
          ]}
        >
          <View
            style={[
              styles.resultIcon,
              { backgroundColor: colors.primaryForeground },
            ]}
          >
            <Feather name="check" size={22} color={colors.primary} />
          </View>
          <Text
            style={[
              styles.resultEyebrow,
              { color: colors.primaryForeground },
            ]}
          >
            {copy(language, 'testComplete')}
          </Text>
          <Text style={[styles.scoreValue, { color: colors.primaryForeground }]}>
            {latestResult.correctCount}
            <Text
              style={[
                styles.scoreDenominator,
                { color: colors.primaryForeground },
              ]}
            >
              {' '}
              / {latestResult.questionCount}
            </Text>
          </Text>
          <Text style={[styles.percentText, { color: colors.primaryForeground }]}>
            {percent}% · {topicName}
          </Text>
          <Text
            style={[
              styles.scoreSubtitle,
              { color: colors.primaryForeground },
            ]}
          >
            {copy(language, 'testSubtitle')}
          </Text>
        </View>

        <View style={[styles.statsRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <StatCard
            label={copy(language, 'correct')}
            value={latestResult.correctCount}
            icon="check-circle"
            color={colors.success}
            rtl={rtl}
          />
          <StatCard
            label={copy(language, 'incorrect')}
            value={latestResult.wrongCount}
            icon="x-circle"
            color={colors.destructive}
            rtl={rtl}
          />
          <StatCard
            label={copy(language, 'unanswered')}
            value={latestResult.unansweredCount}
            icon="minus-circle"
            color={colors.mutedForeground}
            rtl={rtl}
          />
        </View>

        <ScreenTitle
          title={copy(language, 'review')}
          subtitle={`${latestResult.questionCount} ${copy(language, 'questions')}`}
          rtl={rtl}
        />

        <View style={styles.reviewList}>
          {latestResult.questionIds.map((id, index) => {
            const question = QUESTION_BY_ID[id];
            if (!question) return null;
            const myAnswer = latestResult.answers[id] ?? '';
            const isCorrect = answersMatch(question, myAnswer);
            return (
              <View
                key={id}
                style={[
                  styles.reviewCard,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.reviewHeading,
                    { flexDirection: rtl ? 'row-reverse' : 'row' },
                  ]}
                >
                  <View
                    style={[
                      styles.reviewNumber,
                      {
                        backgroundColor: isCorrect
                          ? colors.successSoft
                          : colors.destructiveSoft,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reviewNumberText,
                        { color: isCorrect ? colors.success : colors.destructive },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.reviewTopic,
                        { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
                      ]}
                    >
                      {language === 'ar'
                        ? TOPICS.find((topic) => topic.id === question.topic)?.arabic
                        : question.topic}
                    </Text>
                    <Text
                      style={[
                        styles.reviewQuestion,
                        { color: colors.foreground, textAlign: rtl ? 'right' : 'left' },
                      ]}
                    >
                      {question.question}
                    </Text>
                  </View>
                  <Feather
                    name={isCorrect ? 'check-circle' : 'x-circle'}
                    size={20}
                    color={isCorrect ? colors.success : colors.destructive}
                  />
                </View>
                <View style={[styles.answerRows, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
                  <ReviewAnswer
                    label={copy(language, 'myAnswer')}
                    value={answerLabel(question, myAnswer) || copy(language, 'noAnswer')}
                    color={isCorrect ? colors.success : colors.destructive}
                    rtl={rtl}
                  />
                  <ReviewAnswer
                    label={copy(language, 'correctAnswer')}
                    value={answerLabel(question, question.answer)}
                    color={colors.success}
                    rtl={rtl}
                  />
                  <Text
                    style={[
                      styles.explanationLabel,
                      { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
                    ]}
                  >
                    {copy(language, 'explanation')}
                  </Text>
                  <Text
                    style={[
                      styles.explanation,
                      {
                        color: colors.foreground,
                        textAlign: rtl ? 'right' : 'left',
                        writingDirection: rtl ? 'rtl' : 'ltr',
                      },
                    ]}
                  >
                    {question.explanation}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.actions}>
          <AppButton
            label={copy(language, 'tryAgain')}
            icon="refresh-cw"
            rtl={rtl}
            onPress={() => {
              if (latestResult.topic) {
                startTopic(latestResult.topic);
              } else {
                startTest();
              }
              router.replace('/test');
            }}
          />
          <AppButton
            label={copy(language, 'home')}
            icon="home"
            variant="outline"
            rtl={rtl}
            onPress={() => router.replace('/')}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  rtl,
}: {
  label: string;
  value: number;
  icon: 'check-circle' | 'x-circle' | 'minus-circle';
  color: string;
  rtl: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          alignItems: rtl ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <Feather name={icon} size={17} color={color} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text
        style={[
          styles.statLabel,
          { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ReviewAnswer({
  label,
  value,
  color,
  rtl,
}: {
  label: string;
  value: string;
  color: string;
  rtl: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.reviewAnswer}>
      <Text
        style={[
          styles.reviewAnswerLabel,
          { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.reviewAnswerValue,
          { color, textAlign: rtl ? 'right' : 'left' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingBottom: 34, gap: 17 },
  topSpace: { height: 4 },
  scoreCard: {
    borderRadius: 24,
    padding: 23,
    minHeight: 208,
    justifyContent: 'center',
  },
  resultIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultEyebrow: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 11,
  },
  scoreValue: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 4,
  },
  scoreDenominator: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  scoreSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 9,
  },
  statsRow: { gap: 8 },
  statCard: {
    flex: 1,
    minHeight: 102,
    borderRadius: 16,
    borderWidth: 1,
    padding: 11,
    gap: 4,
  },
  statValue: { fontSize: 20, lineHeight: 23, fontWeight: '800' },
  statLabel: { fontSize: 11, lineHeight: 15, fontWeight: '600' },
  reviewList: { gap: 11 },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 15,
    gap: 13,
  },
  reviewHeading: { alignItems: 'flex-start', gap: 10 },
  reviewNumber: {
    width: 31,
    height: 31,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewNumberText: { fontSize: 13, fontWeight: '800' },
  reviewTopic: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  reviewQuestion: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  answerRows: { gap: 9 },
  reviewAnswer: { gap: 2 },
  reviewAnswerLabel: { fontSize: 11, fontWeight: '600' },
  reviewAnswerValue: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  explanationLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  explanation: { fontSize: 13, lineHeight: 19 },
  actions: { gap: 10, marginTop: 3 },
  empty: { flex: 1, padding: 24, justifyContent: 'center', gap: 18 },
  emptyTitle: { fontSize: 23, fontWeight: '700', textAlign: 'center' },
});

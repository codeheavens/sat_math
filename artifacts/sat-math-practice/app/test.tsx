import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import {
  AppButton,
  AppScreen,
  IconButton,
  LoadingView,
} from '@/components/Primitives';
import {
  CalculatorSheet,
  FormulaSheet,
  NavigatorSheet,
} from '@/components/TestOverlays';
import { usePractice } from '@/src/context/PracticeContext';
import { copy } from '@/src/i18n';
import { QUESTION_BY_ID, TOPICS } from '@/src/questions';

const MODULE_QUESTION_COUNT = 15;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TestScreen() {
  const colors = useColors();
  const {
    ready,
    language,
    session,
    setAnswer,
    toggleEliminated,
    toggleFlag,
    goToQuestion,
    goToPreviousQuestion,
    startSecondModule,
    toggleTimerVisibility,
    finishSession,
  } = usePractice();
  const [overlay, setOverlay] = useState<'navigator' | 'calculator' | 'formulas' | null>(
    null,
  );
  const [clock, setClock] = useState(Date.now());
  const handledExpiryAt = useRef<number | null>(null);
  const rtl = language === 'ar';

  useEffect(() => {
    const interval = setInterval(() => setClock(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentId = session?.questionIds[session.currentIndex];
  const currentQuestion = currentId ? QUESTION_BY_ID[currentId] : undefined;
  const moduleStart =
    session?.mode === 'test' && session.currentIndex >= MODULE_QUESTION_COUNT
      ? MODULE_QUESTION_COUNT
      : 0;
  const moduleNumber = moduleStart === 0 ? 1 : 2;
  const currentModuleQuestion =
    session?.mode === 'test'
      ? (session.currentIndex - moduleStart + 1)
      : (session?.currentIndex ?? 0) + 1;
  const totalInModule =
    session?.mode === 'test'
      ? MODULE_QUESTION_COUNT
      : (session?.questionIds.length ?? 0);
  const remainingSeconds = session?.timerEndsAt
    ? Math.max(0, Math.ceil((session.timerEndsAt - clock) / 1000))
    : null;
  const navigatorQuestions = useMemo(
    () =>
      (session?.questionIds ?? []).map((id) => ({
        id,
        answered: !!session?.answers[id]?.trim(),
        flagged: !!session?.flagged.includes(id),
      })),
    [session?.questionIds, session?.answers, session?.flagged],
  );

  useEffect(() => {
    if (
      !session ||
      session.mode !== 'test' ||
      remainingSeconds !== 0 ||
      !session.timerEndsAt ||
      handledExpiryAt.current === session.timerEndsAt
    ) {
      return;
    }
    handledExpiryAt.current = session.timerEndsAt;
    if (session.currentIndex < MODULE_QUESTION_COUNT) {
      startSecondModule();
      Alert.alert(
        language === 'ar' ? 'انتهى وقت الوحدة الأولى' : 'Module 1 time is up',
        language === 'ar'
          ? 'سيبدأ المؤقت من جديد للوحدة الثانية.'
          : 'The timer has reset for Module 2.',
      );
    } else {
      finishSession();
      router.replace('/results');
    }
  }, [
    session,
    remainingSeconds,
    startSecondModule,
    finishSession,
    language,
  ]);

  if (!ready) {
    return (
      <AppScreen>
        <LoadingView />
      </AppScreen>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <AppScreen>
        <View style={styles.missing}>
          <Text style={[styles.missingText, { color: colors.foreground }]}>
            {language === 'ar'
              ? 'لا توجد جلسة تدريب نشطة.'
              : 'There is no active practice session.'}
          </Text>
          <AppButton
            label={copy(language, 'home')}
            onPress={() => router.replace('/')}
            icon="home"
          />
        </View>
      </AppScreen>
    );
  }

  const selectedAnswer = session.answers[currentQuestion.id] ?? '';
  const isFlagged = session.flagged.includes(currentQuestion.id);
  const eliminated = session.eliminated[currentQuestion.id] ?? [];
  const topicName = session.topic
    ? TOPICS.find((topic) => topic.id === session.topic)?.[
        language === 'ar' ? 'arabic' : 'label'
      ]
    : undefined;

  const nextQuestion = () => {
    Keyboard.dismiss();
    if (session.mode === 'test' && session.currentIndex === MODULE_QUESTION_COUNT - 1) {
      Alert.alert(
        copy(language, 'finishModuleTitle'),
        copy(language, 'finishModuleBody'),
        [
          { text: copy(language, 'cancel'), style: 'cancel' },
          {
            text: copy(language, 'continue'),
            onPress: () => {
              startSecondModule();
            },
          },
        ],
      );
      return;
    }
    if (session.currentIndex >= session.questionIds.length - 1) {
      finishSession();
      router.replace('/results');
      return;
    }
    goToQuestion(session.currentIndex + 1);
  };

  const markAnswer = (answer: string) => {
    setAnswer(currentQuestion.id, answer);
    void Haptics.selectionAsync();
  };

  const markForReview = () => {
    toggleFlag(currentQuestion.id);
    void Haptics.selectionAsync();
  };

  const timerColor =
    remainingSeconds !== null && remainingSeconds < 5 * 60
      ? colors.destructive
      : colors.foreground;

  return (
    <AppScreen>
      <View style={styles.topBar}>
        <View style={[styles.topLine, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <IconButton
            icon={rtl ? 'arrow-right' : 'arrow-left'}
            label={copy(language, 'home')}
            onPress={() => router.replace('/')}
          />
          <View style={styles.moduleLabelWrap}>
            <Text
              style={[
                styles.moduleLabel,
                { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
              ]}
            >
              {session.mode === 'test'
                ? `${copy(language, 'module')} ${moduleNumber} ${language === 'ar' ? 'من ٢' : 'of 2'}`
                : topicName ?? copy(language, 'topicMode')}
            </Text>
            <Text
              style={[
                styles.modeLabel,
                { color: colors.foreground, textAlign: rtl ? 'right' : 'left' },
              ]}
            >
              {session.mode === 'test'
                ? copy(language, 'testMode')
                : copy(language, 'topicMode')}
            </Text>
          </View>
          {session.mode === 'test' ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy(
                language,
                session.timerHidden ? 'showTimer' : 'hideTimer',
              )}
              onPress={toggleTimerVisibility}
              testID="timer-toggle"
              style={({ pressed }) => [
                styles.timerBox,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <Feather
                name={session.timerHidden ? 'eye' : 'eye-off'}
                size={15}
                color={colors.mutedForeground}
              />
              <Text style={[styles.timerText, { color: timerColor }]}>
                {session.timerHidden
                  ? '••:••'
                  : formatTime(remainingSeconds ?? 0)}
              </Text>
            </Pressable>
          ) : null}
        </View>
        {session.mode === 'test' ? (
          <View style={[styles.moduleTrack, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.moduleTrackFill,
                {
                  backgroundColor: colors.primary,
                  width: `${(currentModuleQuestion / MODULE_QUESTION_COUNT) * 100}%`,
                },
              ]}
            />
          </View>
        ) : null}
        <View style={[styles.toolRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setOverlay('calculator')}
            testID="calculator-button"
            style={({ pressed }) => [
              styles.toolButton,
              { backgroundColor: colors.card, opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Feather name="grid" size={16} color={colors.primary} />
            <Text style={[styles.toolLabel, { color: colors.foreground }]}>
              {copy(language, 'calculator')}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setOverlay('formulas')}
            testID="formula-button"
            style={({ pressed }) => [
              styles.toolButton,
              { backgroundColor: colors.card, opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <Feather name="book-open" size={16} color={colors.primary} />
            <Text style={[styles.toolLabel, { color: colors.foreground }]}>
              {copy(language, 'formulas')}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.questionScroll}
        contentContainerStyle={styles.questionContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.questionMeta, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <Text
            style={[
              styles.questionNumber,
              { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
            ]}
          >
            {copy(language, 'question')} {currentModuleQuestion} {copy(language, 'of')}{' '}
            {totalInModule}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isFlagged }}
            accessibilityLabel={
              isFlagged ? copy(language, 'flagged') : copy(language, 'flag')
            }
            onPress={markForReview}
            testID="flag-question"
            style={({ pressed }) => [
              styles.flagButton,
              {
                borderColor: isFlagged ? colors.warning : colors.border,
                backgroundColor: isFlagged ? colors.warningSoft : colors.background,
                flexDirection: rtl ? 'row-reverse' : 'row',
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <Feather
              name={isFlagged ? 'bookmark' : 'flag'}
              size={14}
              color={isFlagged ? colors.warning : colors.mutedForeground}
            />
            <Text
              style={[
                styles.flagLabel,
                { color: isFlagged ? colors.warning : colors.mutedForeground },
              ]}
            >
              {isFlagged ? copy(language, 'flagged') : copy(language, 'flag')}
            </Text>
          </Pressable>
        </View>

        <Text
          style={[
            styles.prompt,
            {
              color: colors.foreground,
              textAlign: rtl ? 'right' : 'left',
              writingDirection: rtl ? 'rtl' : 'ltr',
            },
          ]}
        >
          {currentQuestion.question}
        </Text>

        {currentQuestion.type === 'multiple-choice' ? (
          <View style={styles.options}>
            {(currentQuestion.options ?? []).map((option) => {
              const isSelected = selectedAnswer === option.id;
              const isEliminated = eliminated.includes(option.id);
              return (
                <View
                  key={option.id}
                  style={[
                    styles.optionRow,
                    {
                      backgroundColor: isSelected
                        ? colors.primarySoft
                        : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                      flexDirection: rtl ? 'row-reverse' : 'row',
                      opacity: isEliminated ? 0.52 : 1,
                    },
                  ]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: isSelected,
                      disabled: isEliminated,
                    }}
                    disabled={isEliminated}
                    onPress={() => markAnswer(option.id)}
                    testID={`answer-${option.id}`}
                    style={[
                      styles.optionSelect,
                      { flexDirection: rtl ? 'row-reverse' : 'row' },
                    ]}
                  >
                    <View
                      style={[
                        styles.optionLetter,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.secondary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLetterText,
                          {
                            color: isSelected
                              ? colors.primaryForeground
                              : colors.foreground,
                          },
                        ]}
                      >
                        {option.id}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: colors.foreground,
                          textAlign: rtl ? 'right' : 'left',
                          textDecorationLine: isEliminated ? 'line-through' : 'none',
                          writingDirection: rtl ? 'rtl' : 'ltr',
                        },
                      ]}
                    >
                      {option.text}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      isEliminated
                        ? copy(language, 'removeStrike')
                        : copy(language, 'crossOut')
                    }
                    onPress={() => toggleEliminated(currentQuestion.id, option.id)}
                    testID={`cross-out-${option.id}`}
                    style={({ pressed }) => [
                      styles.crossOutButton,
                      { opacity: pressed ? 0.55 : 1 },
                    ]}
                  >
                    <Feather
                      name={isEliminated ? 'rotate-ccw' : 'x'}
                      size={17}
                      color={isEliminated ? colors.primary : colors.mutedForeground}
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.responseBlock}>
            <Text
              style={[
                styles.responseLabel,
                { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
              ]}
            >
              {copy(language, 'questionType')}
            </Text>
            <TextInput
              value={selectedAnswer}
              onChangeText={markAnswer}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              placeholder={copy(language, 'enterNumber')}
              placeholderTextColor={colors.mutedForeground}
              accessibilityLabel={copy(language, 'answer')}
              testID="student-response-input"
              style={[
                styles.responseInput,
                {
                  backgroundColor: colors.card,
                  borderColor: selectedAnswer ? colors.primary : colors.border,
                  color: colors.foreground,
                  textAlign: rtl ? 'right' : 'left',
                },
              ]}
            />
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { borderColor: colors.border }]}>
        <View style={[styles.navRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <AppButton
            label={copy(language, 'back')}
            icon={rtl ? 'arrow-right' : 'arrow-left'}
            variant="outline"
            compact
            rtl={rtl}
            disabled={
              session.currentIndex ===
              (session.mode === 'test' && moduleStart > 0
                ? moduleStart
                : 0)
            }
            onPress={goToPreviousQuestion}
            testID="back-question"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy(language, 'navigator')}
            onPress={() => setOverlay('navigator')}
            testID="open-navigator"
            style={({ pressed }) => [
              styles.navigatorButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <Feather name="grid" size={17} color={colors.primary} />
            <Text style={[styles.navigatorLabel, { color: colors.foreground }]}>
              {currentModuleQuestion}/{totalInModule}
            </Text>
          </Pressable>
          <AppButton
            label={
              session.mode === 'test' &&
              session.currentIndex === MODULE_QUESTION_COUNT - 1
                ? copy(language, 'nextModule')
                : session.currentIndex === session.questionIds.length - 1
                  ? copy(language, 'finishTest')
                  : copy(language, 'next')
            }
            icon={session.currentIndex === session.questionIds.length - 1 ? 'check' : rtl ? 'arrow-left' : 'arrow-right'}
            compact
            rtl={rtl}
            onPress={nextQuestion}
            testID="next-question"
          />
        </View>
      </View>

      <NavigatorSheet
        visible={overlay === 'navigator'}
        onClose={() => setOverlay(null)}
        language={language}
        questions={navigatorQuestions}
        currentIndex={session.currentIndex}
        moduleStart={moduleStart}
        onSelect={goToQuestion}
      />
      <CalculatorSheet
        visible={overlay === 'calculator'}
        onClose={() => setOverlay(null)}
        language={language}
      />
      <FormulaSheet
        visible={overlay === 'formulas'}
        onClose={() => setOverlay(null)}
        language={language}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: 16, paddingBottom: 9 },
  topLine: { alignItems: 'center', gap: 6 },
  moduleLabelWrap: { flex: 1 },
  moduleLabel: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  modeLabel: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
  timerBox: {
    minWidth: 82,
    height: 40,
    borderWidth: 1,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 10,
  },
  timerText: { fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  moduleTrack: { height: 4, borderRadius: 4, overflow: 'hidden', marginTop: 9 },
  moduleTrackFill: { height: '100%', borderRadius: 4 },
  toolRow: { gap: 9, marginTop: 10 },
  toolButton: {
    height: 35,
    borderRadius: 11,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  toolLabel: { fontSize: 12, fontWeight: '600' },
  questionScroll: { flex: 1 },
  questionContent: {
    paddingHorizontal: 21,
    paddingTop: 12,
    paddingBottom: 20,
  },
  questionMeta: { alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  questionNumber: { fontSize: 13, fontWeight: '600' },
  flagButton: {
    borderWidth: 1,
    minHeight: 34,
    borderRadius: 11,
    paddingHorizontal: 9,
    alignItems: 'center',
    gap: 6,
  },
  flagLabel: { fontSize: 11, fontWeight: '600' },
  prompt: {
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 31,
    letterSpacing: -0.25,
    marginTop: 22,
    marginBottom: 21,
  },
  options: { gap: 10 },
  optionRow: {
    minHeight: 60,
    borderWidth: 1.25,
    borderRadius: 16,
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 4,
  },
  optionSelect: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    gap: 12,
  },
  optionLetter: {
    width: 33,
    height: 33,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: { fontSize: 13, fontWeight: '800' },
  optionText: { flex: 1, fontSize: 16, lineHeight: 22, fontWeight: '500' },
  crossOutButton: {
    width: 40,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  responseBlock: { gap: 9 },
  responseLabel: { fontSize: 13, fontWeight: '600' },
  responseInput: {
    height: 58,
    borderWidth: 1.5,
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 19,
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 9,
    borderTopWidth: 1,
  },
  navRow: { alignItems: 'center', justifyContent: 'space-between', gap: 7 },
  navigatorButton: {
    minWidth: 70,
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navigatorLabel: { fontSize: 12, fontWeight: '700' },
  missing: { flex: 1, padding: 22, justifyContent: 'center', gap: 18 },
  missingText: { fontSize: 17, textAlign: 'center' },
});

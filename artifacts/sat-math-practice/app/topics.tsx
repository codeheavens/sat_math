import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AppScreen, IconButton, ScreenTitle } from '@/components/Primitives';
import { usePractice } from '@/src/context/PracticeContext';
import { copy } from '@/src/i18n';
import { QUESTIONS, TOPICS } from '@/src/questions';

export default function TopicsScreen() {
  const colors = useColors();
  const { language, startTopic } = usePractice();
  const rtl = language === 'ar';

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.page}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
          <IconButton
            icon={rtl ? 'arrow-right' : 'arrow-left'}
            label={copy(language, 'home')}
            onPress={() => router.back()}
          />
          <View style={styles.headerTitle}>
            <ScreenTitle
              title={copy(language, 'chooseTopic')}
              subtitle={copy(language, 'topicSubtitle')}
              rtl={rtl}
            />
          </View>
        </View>
        <View style={styles.list}>
          {TOPICS.map((topic, index) => {
            const count = QUESTIONS.filter(
              (question) => question.topic === topic.id,
            ).length;
            return (
              <Pressable
                key={topic.id}
                accessibilityRole="button"
                onPress={() => {
                  startTopic(topic.id);
                  router.push('/test');
                }}
                testID={`topic-${index + 1}`}
                style={({ pressed }) => [
                  styles.topicCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    flexDirection: rtl ? 'row-reverse' : 'row',
                    opacity: pressed ? 0.72 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconWell,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Feather name={topic.icon} size={21} color={colors.primary} />
                </View>
                <View style={styles.topicContent}>
                  <Text
                    style={[
                      styles.topicTitle,
                      { color: colors.foreground, textAlign: rtl ? 'right' : 'left' },
                    ]}
                  >
                    {language === 'ar' ? topic.arabic : topic.label}
                  </Text>
                  <Text
                    style={[
                      styles.topicDescription,
                      {
                        color: colors.mutedForeground,
                        textAlign: rtl ? 'right' : 'left',
                      },
                    ]}
                  >
                    {language === 'ar'
                      ? topic.arabicDescription
                      : topic.description}
                  </Text>
                  <Text
                    style={[
                      styles.questionCount,
                      { color: colors.primary, textAlign: rtl ? 'right' : 'left' },
                    ]}
                  >
                    {count} {copy(language, 'questions')}
                  </Text>
                </View>
                <Feather
                  name={rtl ? 'chevron-left' : 'chevron-right'}
                  size={20}
                  color={colors.mutedForeground}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingBottom: 32, gap: 22 },
  header: { alignItems: 'center', gap: 9, marginTop: 5 },
  headerTitle: { flex: 1 },
  list: { gap: 12, marginTop: 5 },
  topicCard: {
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 19,
    padding: 15,
    alignItems: 'center',
    gap: 12,
  },
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicContent: { flex: 1, gap: 3 },
  topicTitle: { fontSize: 15, lineHeight: 21, fontWeight: '700' },
  topicDescription: { fontSize: 12, lineHeight: 17 },
  questionCount: { fontSize: 12, fontWeight: '700', marginTop: 3 },
});

import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { copy, type CopyKey, type Language } from '@/src/i18n';

function SheetFrame({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <View style={styles.sheetHeading}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy('en', 'cancel')}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Feather name="x" size={21} color={colors.foreground} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const formulaRows: { title: CopyKey; expression: string; note?: string }[] = [
  { title: 'formulaCircle', expression: 'A = πr²', note: 'C = 2πr' },
  { title: 'formulaTriangle', expression: 'A = ½bh' },
  { title: 'formulaRightTriangle', expression: 'a² + b² = c²', note: '30°–60°–90°: x, x√3, 2x' },
  { title: 'formulaVolume', expression: 'V = lwh', note: 'Cylinder: V = πr²h' },
  { title: 'formulaCoordinate', expression: 'm = (y₂ − y₁) / (x₂ − x₁)', note: 'Distance: d = √((x₂−x₁)² + (y₂−y₁)²)' },
  { title: 'formulaQuadratic', expression: 'x = (−b ± √(b² − 4ac)) / 2a' },
];

export function FormulaSheet({
  visible,
  onClose,
  language,
}: {
  visible: boolean;
  onClose: () => void;
  language: Language;
}) {
  const colors = useColors();
  const rtl = language === 'ar';
  return (
    <SheetFrame
      visible={visible}
      title={copy(language, 'formulasTitle')}
      onClose={onClose}
    >
      <ScrollView
        contentContainerStyle={styles.formulaList}
        showsVerticalScrollIndicator={false}
      >
        {formulaRows.map((formula) => (
          <View
            key={formula.title}
            style={[
              styles.formulaRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.formulaName,
                { color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
              ]}
            >
              {copy(language, formula.title)}
            </Text>
            <Text style={[styles.formulaExpression, { color: colors.foreground }]}>
              {formula.expression}
            </Text>
            {formula.note ? (
              <Text style={[styles.formulaNote, { color: colors.foreground }]}>
                {formula.note}
              </Text>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SheetFrame>
  );
}

function calculate(input: string) {
  const normalized = input.replace(/×/g, '*').replace(/÷/g, '/');
  const tokens = normalized.match(/\d*\.?\d+|[+\-*/]/g) ?? [];
  if (tokens.join('') !== normalized.replace(/\s/g, '') || tokens.length === 0) {
    throw new Error('Invalid expression');
  }
  let position = 0;
  const factor = (): number => {
    const token = tokens[position];
    if (token === '+' || token === '-') {
      position += 1;
      const value = factor();
      return token === '-' ? -value : value;
    }
    if (!token || !/^\d*\.?\d+$/.test(token)) throw new Error('Invalid number');
    position += 1;
    return Number(token);
  };
  const term = (): number => {
    let value = factor();
    while (tokens[position] === '*' || tokens[position] === '/') {
      const operator = tokens[position++];
      const next = factor();
      if (operator === '/' && next === 0) throw new Error('Cannot divide by zero');
      value = operator === '*' ? value * next : value / next;
    }
    return value;
  };
  const expression = (): number => {
    let value = term();
    while (tokens[position] === '+' || tokens[position] === '-') {
      const operator = tokens[position++];
      const next = term();
      value = operator === '+' ? value + next : value - next;
    }
    return value;
  };
  const result = expression();
  if (position !== tokens.length || !Number.isFinite(result)) {
    throw new Error('Invalid expression');
  }
  return Number(result.toPrecision(10)).toString();
}

const keypad = [
  ['C', 'DEL', '÷', '×'],
  ['7', '8', '9', '−'],
  ['4', '5', '6', '+'],
  ['1', '2', '3', '='],
  ['0', '.', '±', '='],
];

export function CalculatorSheet({
  visible,
  onClose,
  language,
}: {
  visible: boolean;
  onClose: () => void;
  language: Language;
}) {
  const colors = useColors();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const rtl = language === 'ar';

  const pressKey = (key: string) => {
    if (key === 'C') {
      setExpression('');
      setResult('');
    } else if (key === 'DEL') {
      setExpression((value) => value.slice(0, -1));
    } else if (key === '=') {
      try {
        setResult(calculate(expression));
      } catch {
        setResult('—');
      }
    } else if (key === '±') {
      setExpression((value) =>
        value.startsWith('-') ? value.slice(1) : `-${value}`,
      );
    } else {
      setExpression((value) => `${value}${key === '−' ? '-' : key}`);
      setResult('');
    }
  };

  return (
    <SheetFrame
      visible={visible}
      title={copy(language, 'calculatorTitle')}
      onClose={onClose}
    >
      <View style={styles.calculator}>
        <View
          style={[
            styles.calculatorDisplay,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[styles.calculatorExpression, { color: colors.mutedForeground }]}
          >
            {expression || '0'}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.calculatorResult, { color: colors.foreground }]}
          >
            {result}
          </Text>
        </View>
        {keypad.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[styles.keyRow, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
          >
            {row.map((key, keyIndex) => {
              const isAction = ['C', 'DEL', '÷', '×', '−', '+', '='].includes(key);
              return (
                <Pressable
                  key={`${key}-${keyIndex}`}
                  accessibilityRole="button"
                  accessibilityLabel={
                    key === 'C'
                      ? copy(language, 'clear')
                      : key === 'DEL'
                        ? copy(language, 'delete')
                        : key === '='
                          ? copy(language, 'equals')
                          : key
                  }
                  onPress={() => pressKey(key)}
                  style={({ pressed }) => [
                    styles.key,
                    {
                      backgroundColor:
                        key === '=' ? colors.primary : isAction ? colors.secondary : colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                      flex: key === '0' ? 2 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.keyText,
                      {
                        color:
                          key === '=' ? colors.primaryForeground : colors.foreground,
                      },
                    ]}
                  >
                    {key === 'C'
                      ? copy(language, 'clear')
                      : key === 'DEL'
                        ? '⌫'
                        : key}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </SheetFrame>
  );
}

export interface NavigatorQuestion {
  id: string;
  answered: boolean;
  flagged: boolean;
}

export function NavigatorSheet({
  visible,
  onClose,
  language,
  questions,
  currentIndex,
  moduleStart,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  language: Language;
  questions: NavigatorQuestion[];
  currentIndex: number;
  moduleStart: number;
  onSelect: (index: number) => void;
}) {
  const colors = useColors();
  const rtl = language === 'ar';
  const shownQuestions = useMemo(
    () => questions.slice(moduleStart, moduleStart + 15),
    [questions, moduleStart],
  );
  return (
    <SheetFrame
      visible={visible}
      title={copy(language, 'navigator')}
      onClose={onClose}
    >
      <View style={styles.navigatorLegend}>
        <LegendDot color={colors.primary} label={copy(language, 'answered')} />
        <LegendDot color={colors.border} label={copy(language, 'unanswered')} />
        <LegendDot color={colors.warning} label={copy(language, 'flagged')} />
        <LegendDot color={colors.foreground} label={copy(language, 'current')} />
      </View>
      <View
        style={[
          styles.questionGrid,
          { flexDirection: rtl ? 'row-reverse' : 'row' },
        ]}
      >
        {shownQuestions.map((question, localIndex) => {
          const index = moduleStart + localIndex;
          const isCurrent = index === currentIndex;
          const colorsForTile = question.answered
            ? colors.primary
            : colors.card;
          return (
            <Pressable
              key={question.id}
              accessibilityRole="button"
              accessibilityLabel={`${copy(language, 'question')} ${index + 1}`}
              onPress={() => {
                onSelect(index);
                onClose();
              }}
              style={({ pressed }) => [
                styles.questionTile,
                {
                  backgroundColor: colorsForTile,
                  borderColor: isCurrent
                    ? colors.foreground
                    : question.flagged
                      ? colors.warning
                      : colors.border,
                  borderWidth: isCurrent ? 2 : question.flagged ? 2 : 1,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.questionTileText,
                  {
                    color: question.answered
                      ? colors.primaryForeground
                      : colors.foreground,
                  },
                ]}
              >
                {index + 1}
              </Text>
              {question.flagged ? (
                <View style={[styles.flagDot, { backgroundColor: colors.warning }]} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </SheetFrame>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const colors = useColors();
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[styles.legendText, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(12, 24, 44, 0.38)',
  },
  sheet: {
    maxHeight: '88%',
    minHeight: '55%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 42,
    height: 4,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  sheetHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formulaList: {
    paddingBottom: 24,
    gap: 11,
  },
  formulaRow: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 7,
  },
  formulaName: {
    fontSize: 13,
    fontWeight: '600',
  },
  formulaExpression: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'left',
  },
  formulaNote: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  calculator: {
    gap: 9,
    paddingBottom: 12,
  },
  calculatorDisplay: {
    height: 104,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  calculatorExpression: {
    fontSize: 17,
  },
  calculatorResult: {
    fontSize: 32,
    fontWeight: '700',
  },
  keyRow: {
    gap: 8,
  },
  key: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  navigatorLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  questionGrid: {
    flexWrap: 'wrap',
    gap: 11,
  },
  questionTile: {
    width: '17%',
    aspectRatio: 1,
    maxWidth: 54,
    minWidth: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  questionTileText: {
    fontSize: 16,
    fontWeight: '700',
  },
  flagDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    position: 'absolute',
    top: 4,
    right: 4,
  },
});

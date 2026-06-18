import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { exactAssets } from '@/assets/exact/assets';
import { ExactHeader } from '@/components/exact/ExactHeader';
import { ExactScreen } from '@/components/exact/ExactScreen';
import { getOrCreateAnonymousUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { exactColors, exactGradient, exactRadius, exactShadow } from '@/theme/exact-match';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
};

type CoachIntent = 'meal' | 'workout' | 'fat_loss' | 'motivation';

const quickPrompts: { label: string; message: string; intent: CoachIntent }[] = [
  {
    label: 'Meal swap',
    message: 'I do not want fish today. Can I eat chicken instead?',
    intent: 'meal',
  },
  {
    label: 'Belly fat',
    message: 'I want to lose belly fat. What should I do today?',
    intent: 'fat_loss',
  },
  {
    label: 'Workout change',
    message: 'Can you make today’s workout easier?',
    intent: 'workout',
  },
  {
    label: 'Motivate me',
    message: 'Motivate me to stay consistent today.',
    intent: 'motivation',
  },
];

function getTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildDemoAnswer(message: string) {
  const lower = message.toLowerCase();

  if (
    lower.includes('chicken') ||
    lower.includes('tavuk') ||
    lower.includes('fish') ||
    lower.includes('balık') ||
    lower.includes('meal') ||
    lower.includes('yemek')
  ) {
    return [
      'Yes. I can swap your meal and keep your calories balanced.',
      'Choose lean chicken breast, keep the same carb portion, add salad, and drink water before the meal.',
      'Your plan stays on track.',
    ].join('\n');
  }

  if (
    lower.includes('belly') ||
    lower.includes('fat') ||
    lower.includes('yağ') ||
    lower.includes('lose') ||
    lower.includes('kilo')
  ) {
    return [
      'Great goal. For today, focus on fat-loss fundamentals:',
      'Stay in a light calorie deficit, complete your cardio, keep protein high, and protect your sleep window.',
      'Consistency beats intensity.',
    ].join('\n');
  }

  if (lower.includes('workout') || lower.includes('exercise') || lower.includes('antrenman')) {
    return [
      'I can adjust today’s workout.',
      'Reduce the load, keep the movement quality high, and finish with 15–20 minutes light cardio.',
      'You still get the win for today.',
    ].join('\n');
  }

  if (lower.includes('motivate') || lower.includes('motivasyon')) {
    return [
      'You do not need a perfect day. You need one completed action.',
      'Finish today’s first task, then the next one becomes easier.',
      'Your future body is built by small daily wins.',
    ].join('\n');
  }

  return [
    'I can help adjust your workout, meal plan, cardio, sleep or motivation routine.',
    'Tell me what you want to change today and I will keep your plan balanced.',
  ].join('\n');
}

export default function AICoachScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const bottomSpace = useMemo(
    () => (Platform.OS === 'android' ? Math.max(insets.bottom, 26) : Math.max(insets.bottom, 12)),
    [insets.bottom]
  );

  useFocusEffect(
    useCallback(() => {
      loadMessages();
    }, [])
  );

  async function loadMessages() {
    try {
      setIsLoading(true);
      const user = await getOrCreateAnonymousUser();

      const { data, error } = await supabase
        .from('ai_messages')
        .select('id, role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const loaded = (data ?? []) as Message[];

      if (!loaded.length) {
        setMessages([
          {
            id: 'local-welcome',
            role: 'assistant',
            content:
              "Hi! I'm your AI Coach. I'm here to guide you, answer questions, and keep your plan on track.",
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        setMessages(loaded);
      }

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 120);
    } catch (error) {
      console.error('AI_COACH_LOAD_ERROR', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage(customMessage?: string) {
    const trimmed = (customMessage ?? input).trim();
    if (!trimmed || sending) return;

    setInput('');
    setSending(true);

    try {
      const user = await getOrCreateAnonymousUser();
      const now = new Date().toISOString();
      const userMessage: Message = {
        id: `local-user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        created_at: now,
      };

      const answer = buildDemoAnswer(trimmed);
      const assistantMessage: Message = {
        id: `local-assistant-${Date.now()}`,
        role: 'assistant',
        content: answer,
        created_at: new Date().toISOString(),
      };

      setMessages((current) => [...current, userMessage, assistantMessage]);

      const { error } = await supabase.from('ai_messages').insert([
        { user_id: user.id, role: 'user', content: trimmed },
        { user_id: user.id, role: 'assistant', content: answer },
      ]);

      if (error) throw error;

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    } catch (error) {
      console.error('AI_COACH_SEND_ERROR', error);
    } finally {
      setSending(false);
    }
  }

  return (
    <ExactScreen waveMode="home" contentStyle={{ paddingBottom: bottomSpace }}>
      <ExactHeader title="AI COACH" showBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 18 : 0}
        style={styles.flex}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.coachIntroCard}>
            <Image source={exactAssets.icons.aiBadge} style={styles.introBadge} resizeMode="contain" />
            <View style={styles.introTextBox}>
              <Text style={styles.introTitle}>Your transformation coach</Text>
              <Text style={styles.introText}>
                Ask for meal swaps, workout changes, fat-loss advice or motivation. Your plan stays balanced.
              </Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            {quickPrompts.map((item) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [styles.quickChip, pressed && styles.pressed]}
                onPress={() => sendMessage(item.message)}
                disabled={sending}
              >
                <Text style={styles.quickChipText}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          {isLoading ? <Text style={styles.loadingText}>Loading coach history...</Text> : null}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}
        </ScrollView>

        <View style={[styles.inputBar, { marginBottom: Platform.OS === 'android' ? 6 : 0 }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor={exactColors.muted}
            style={styles.input}
            multiline
          />
          <Pressable style={({ pressed }) => [styles.send, pressed && styles.pressed]} onPress={() => sendMessage()} disabled={sending}>
            <Image source={exactAssets.icons.send} style={styles.sendIcon} resizeMode="contain" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ExactScreen>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const lines = message.content.split('\n').filter(Boolean);
  const showAsAdvice = !isUser && lines.length > 1;

  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser ? <Image source={exactAssets.icons.aiBadge} style={styles.avatar} resizeMode="contain" /> : null}
      <View style={[styles.bubble, isUser && styles.bubbleUser, showAsAdvice && styles.adviceBubble]}>
        {showAsAdvice ? (
          <View>
            <Text style={styles.bubbleText}>{lines[0]}</Text>
            <View style={styles.adviceList}>
              {lines.slice(1).map((line) => (
                <View key={line} style={styles.adviceItem}>
                  <Image source={exactAssets.icons.check} style={styles.checkIcon} resizeMode="contain" />
                  <Text style={styles.adviceText}>{line}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text style={styles.bubbleText}>{message.content}</Text>
        )}
        <Text style={styles.timeText}>{getTimeLabel(message.created_at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  messages: {
    paddingTop: 2,
    paddingBottom: 18,
    gap: 12,
  },
  coachIntroCard: {
    minHeight: 104,
    borderRadius: exactRadius.lg,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.76)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 13,
    ...exactShadow.card,
  },
  introBadge: {
    width: 52,
    height: 52,
  },
  introTextBox: {
    flex: 1,
  },
  introTitle: {
    color: exactColors.goldLight,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  introText: {
    color: exactColors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '650',
    marginTop: 5,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickChip: {
    borderRadius: exactRadius.full,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickChipText: {
    color: exactColors.goldLight,
    fontSize: 12,
    fontWeight: '900',
  },
  loadingText: {
    color: exactColors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 42,
    height: 42,
    marginTop: 2,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: exactRadius.md,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.80)',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  adviceBubble: {
    maxWidth: '82%',
    backgroundColor: 'rgba(4,24,16,0.86)',
  },
  bubbleUser: {
    borderColor: 'rgba(246,217,143,0.25)',
    backgroundColor: 'rgba(14,47,31,0.84)',
  },
  bubbleText: {
    color: exactColors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '650',
  },
  adviceList: {
    marginTop: 10,
    gap: 8,
  },
  adviceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkIcon: {
    width: 15,
    height: 15,
    marginTop: 2,
  },
  adviceText: {
    flex: 1,
    color: exactColors.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  timeText: {
    color: exactColors.muted,
    fontSize: 9,
    fontWeight: '700',
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  inputBar: {
    minHeight: 54,
    borderRadius: exactRadius.full,
    borderWidth: 1,
    borderColor: exactColors.border,
    backgroundColor: 'rgba(7,31,20,0.90)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 7,
    ...exactShadow.card,
  },
  input: {
    flex: 1,
    maxHeight: 86,
    color: exactColors.text,
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 10,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(201,161,90,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248,223,161,0.55)',
  },
  sendIcon: {
    width: 23,
    height: 23,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
});

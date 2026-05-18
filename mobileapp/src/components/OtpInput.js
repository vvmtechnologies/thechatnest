// ─── OTP Input — TheChatNest ───────────────────────────────────────
//
// 6-box code input. Adapts to dark surfaces (navy + gold) by default.
// Pass `mode="light"` if rendering on a light background.

import { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';

const OTP_LENGTH = 6;
const { width } = Dimensions.get('window');
const BOX_SIZE = Math.min(48, (width - 80) / OTP_LENGTH - 8);

const GOLD = '#ffd54a';

export default function OtpInput({ value, onChange, mode = 'dark' }) {
  const inputs = useRef([]);
  const [focused, setFocused] = useState(-1);
  const digits = (value || '').split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);

  const handleChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length === OTP_LENGTH) {
      onChange(cleaned);
      inputs.current[OTP_LENGTH - 1]?.blur();
      return;
    }
    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1);
    onChange(newDigits.join(''));
    if (cleaned && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const d = [...digits]; d[index - 1] = ''; onChange(d.join(''));
    }
  };

  const isLight = mode === 'light';
  const base = isLight ? styles.boxLight : styles.boxDark;
  const focus = isLight ? styles.focusLight : styles.focusDark;
  const filled = isLight ? styles.filledLight : styles.filledDark;

  return (
    <View style={styles.row}>
      {digits.map((digit, i) => (
        <TextInput
          key={i}
          ref={r => (inputs.current[i] = r)}
          style={[
            styles.box,
            base,
            focused === i && focus,
            digit && filled,
          ]}
          value={digit}
          onChangeText={t => handleChange(t, i)}
          onKeyPress={e => handleKeyPress(e, i)}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(-1)}
          keyboardType="number-pad"
          maxLength={i === 0 ? OTP_LENGTH : 1}
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          selectTextOnFocus
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE + 8,
    borderRadius: 14,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
  },

  // Dark variant (glass on navy)
  boxDark: {
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#f1f5f9',
  },
  focusDark: {
    borderColor: GOLD,
    backgroundColor: 'rgba(255,213,74,0.08)',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  filledDark: {
    borderColor: GOLD,
    backgroundColor: 'rgba(255,213,74,0.12)',
  },

  // Light variant
  boxLight: {
    borderColor: '#e2e8f0',
    backgroundColor: '#fafbfc',
    color: '#0f172a',
  },
  focusLight: {
    borderColor: GOLD,
    backgroundColor: '#fffbeb',
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  filledLight: { borderColor: GOLD, backgroundColor: '#fff' },
});

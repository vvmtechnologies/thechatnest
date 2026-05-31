import { useMemo, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../store/ThemeContext';

// Drop-in replacement for @react-native-community/datetimepicker (date/time
// modes only) that uses pure-JS scroll wheels. Built because the community
// picker's TurboModule spec doesn't resolve in Expo Go on Windows for some
// SDK 54 setups. This component renders inline (not as a native dialog), so
// the caller controls modal/visibility.
//
// API (matches the subset of @react-native-community/datetimepicker we use):
//   <SimpleDateTimePicker
//     value={Date}
//     mode="date" | "time"
//     minimumDate={Date}      // optional, date mode only
//     onChange={(event, picked) => ...}
//   />
//
// Event passed to onChange: { type: 'set', nativeEvent: {} } so existing
// callsites that branch on event?.type === 'dismissed' keep working.

const ITEM_HEIGHT = 44;
const VISIBLE = 5; // odd so a centre row is selected
const PAD_ROWS = Math.floor(VISIBLE / 2);

const Wheel = ({ data, selectedIndex, onSelect, formatter, accent, text, mutedText, borderLight }) => {
  const ref = useRef(null);
  const pad = useMemo(() => Array.from({ length: PAD_ROWS }, () => null), []);
  const padded = useMemo(() => [...pad, ...data, ...pad], [pad, data]);

  // Sync scroll position when selectedIndex changes externally.
  useEffect(() => {
    if (!ref.current) return;
    const offset = selectedIndex * ITEM_HEIGHT;
    // Defer to next tick so the FlatList has mounted.
    const t = setTimeout(() => {
      try { ref.current.scrollToOffset({ offset, animated: false }); } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, [selectedIndex]);

  return (
    <View style={styles.wheelWrap}>
      {/* Centre highlight band */}
      <View
        pointerEvents="none"
        style={[
          styles.centerBand,
          { top: PAD_ROWS * ITEM_HEIGHT, height: ITEM_HEIGHT, borderColor: borderLight },
        ]}
      />
      <FlatList
        ref={ref}
        data={padded}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, i) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * i, index: i })}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const idx = Math.max(0, Math.min(data.length - 1, Math.round(y / ITEM_HEIGHT)));
          onSelect(idx);
        }}
        renderItem={({ item, index }) => {
          if (item === null) return <View style={{ height: ITEM_HEIGHT }} />;
          const realIdx = index - PAD_ROWS;
          const isSelected = realIdx === selectedIndex;
          return (
            <View style={[styles.row, { height: ITEM_HEIGHT }]}>
              <Text style={[
                styles.cell,
                { color: isSelected ? accent : mutedText, fontWeight: isSelected ? '800' : '500' },
              ]}>
                {formatter(item, realIdx)}
              </Text>
            </View>
          );
        }}
        style={{ height: ITEM_HEIGHT * VISIBLE }}
      />
    </View>
  );
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const daysInMonth = (year, monthIdx) => new Date(year, monthIdx + 1, 0).getDate();

export default function SimpleDateTimePicker({
  value,
  mode = 'date',
  minimumDate = null,
  onChange,
}) {
  const { theme: t } = useTheme();
  const safeValue = value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();
  const accent = t.accent;
  const text = t.text;
  const mutedText = t.textTer || '#94a3b8';
  const borderLight = t.borderLight || '#e2e8f0';

  const fire = (next) => {
    if (minimumDate && next.getTime() < minimumDate.getTime()) return;
    onChange?.({ type: 'set', nativeEvent: { timestamp: next.getTime() } }, next);
  };

  if (mode === 'time') {
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
    const selH = safeValue.getHours();
    const selM = safeValue.getMinutes();
    return (
      <View style={[styles.container, { backgroundColor: t.surface }]}>
        <View style={styles.row2}>
          <Wheel
            data={hours}
            selectedIndex={selH}
            formatter={(v) => String(v).padStart(2, '0')}
            accent={accent} text={text} mutedText={mutedText} borderLight={borderLight}
            onSelect={(idx) => {
              const next = new Date(safeValue);
              next.setHours(idx, next.getMinutes(), 0, 0);
              fire(next);
            }}
          />
          <Text style={[styles.colon, { color: text }]}>:</Text>
          <Wheel
            data={minutes}
            selectedIndex={selM}
            formatter={(v) => String(v).padStart(2, '0')}
            accent={accent} text={text} mutedText={mutedText} borderLight={borderLight}
            onSelect={(idx) => {
              const next = new Date(safeValue);
              next.setHours(next.getHours(), idx, 0, 0);
              fire(next);
            }}
          />
        </View>
      </View>
    );
  }

  // date mode
  const thisYear = safeValue.getFullYear();
  const years = useMemo(() => {
    // Show 50 years back, 5 years forward (covers most scheduling).
    const start = thisYear - 50;
    return Array.from({ length: 56 }, (_, i) => start + i);
  }, [thisYear]);
  const selYearIdx = years.indexOf(safeValue.getFullYear());
  const selMonth = safeValue.getMonth();
  const dim = daysInMonth(safeValue.getFullYear(), selMonth);
  const days = useMemo(() => Array.from({ length: dim }, (_, i) => i + 1), [dim]);
  const selDay = Math.min(safeValue.getDate(), dim) - 1;

  return (
    <View style={[styles.container, { backgroundColor: t.surface }]}>
      <View style={styles.row2}>
        <Wheel
          data={MONTHS}
          selectedIndex={selMonth}
          formatter={(v) => v}
          accent={accent} text={text} mutedText={mutedText} borderLight={borderLight}
          onSelect={(idx) => {
            const next = new Date(safeValue);
            next.setMonth(idx, Math.min(next.getDate(), daysInMonth(next.getFullYear(), idx)));
            fire(next);
          }}
        />
        <Wheel
          data={days}
          selectedIndex={selDay}
          formatter={(v) => String(v).padStart(2, '0')}
          accent={accent} text={text} mutedText={mutedText} borderLight={borderLight}
          onSelect={(idx) => {
            const next = new Date(safeValue);
            next.setDate(days[idx]);
            fire(next);
          }}
        />
        <Wheel
          data={years}
          selectedIndex={selYearIdx === -1 ? 0 : selYearIdx}
          formatter={(v) => String(v)}
          accent={accent} text={text} mutedText={mutedText} borderLight={borderLight}
          onSelect={(idx) => {
            const next = new Date(safeValue);
            const y = years[idx];
            next.setFullYear(y, next.getMonth(), Math.min(next.getDate(), daysInMonth(y, next.getMonth())));
            fire(next);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8, paddingHorizontal: 4, borderRadius: 12 },
  row2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  colon: { fontSize: 24, fontWeight: '700', marginHorizontal: 2 },
  wheelWrap: { flex: 1, position: 'relative' },
  centerBand: {
    position: 'absolute', left: 0, right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: { alignItems: 'center', justifyContent: 'center' },
  cell: { fontSize: 17, ...Platform.select({ ios: { fontVariant: ['tabular-nums'] } }) },
});

import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Share, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../../src/store/ThemeContext';
import { useToast } from '../../src/components/Toast';

const FAQS = [
  { q: 'How do I start a new chat?', a: 'Tap the People tab, then tap a contact to open a chat. Or use the floating + button on the Chats screen to create a group.' },
  { q: 'How do I send media?', a: 'Inside a chat, tap the paperclip / + icon next to the message input. You can pick from gallery, camera, documents, contacts and location.' },
  { q: 'How do I make a voice or video call?', a: 'Open any 1-to-1 chat and tap the phone or video icon in the header.' },
  { q: 'Can I use this on web?', a: 'Yes. Open Profile > Linked Devices, then scan the QR code shown at app.thechatnest.com on your browser.' },
  { q: 'How do I change app theme or color?', a: 'Profile > Appearance to switch dark/light, and Profile > Customize to pick a brand color, font and size.' },
  { q: 'How do I delete my account?', a: 'Profile > Delete Account (at the bottom). This is permanent and cannot be undone.' },
  { q: 'My notifications are not coming.', a: 'Open Profile > Notifications and make sure system notifications are enabled. Also check your phone’s Do Not Disturb setting.' },
  { q: 'How do I report a problem?', a: 'Tap "Contact Support" below, or email us at support@thechatnest.com with a brief description and screenshots.' },
];

export default function HelpScreen() {
  const { theme: t, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [openFaq, setOpenFaq] = useState(null);

  const ACCENT = t.accent;
  const bg = isDark ? '#0b141a' : '#fff';
  const headerBg = isDark ? '#1f2c34' : ACCENT;
  const cardBg = isDark ? '#1e293b' : '#f8fafc';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const subColor = isDark ? '#64748b' : '#94a3b8';

  const version = Constants.expoConfig?.version || '1.0.0';
  const buildNum = Platform.OS === 'ios'
    ? Constants.expoConfig?.ios?.buildNumber
    : Constants.expoConfig?.android?.versionCode;

  const openMail = async () => {
    const subject = encodeURIComponent('TheChatNest mobile support');
    const body = encodeURIComponent(`\n\n— — — \nApp version: ${version}${buildNum ? ` (${buildNum})` : ''}\nPlatform: ${Platform.OS} ${Platform.Version}`);
    const url = `mailto:support@thechatnest.com?subject=${subject}&body=${body}`;
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url); else toast('No mail app configured', 'error');
  };

  const openLink = async (url) => {
    const ok = await Linking.canOpenURL(url);
    if (ok) Linking.openURL(url); else toast('Cannot open link', 'error');
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Try TheChatNest — fast, private team messaging. https://thechatnest.com',
      });
    } catch {}
  };

  const SHORTCUTS = [
    { icon: 'book-outline',        tint: '#06b6d4', label: 'App Guide',        desc: 'Walk through features',     onPress: () => router.push('/chat/guide') },
    { icon: 'sparkles-outline',    tint: ACCENT,    label: 'AI Assistant',     desc: 'Ask the in-app AI',         onPress: () => router.push('/chat/assistant') },
    { icon: 'document-text-outline', tint: '#8b5cf6', label: 'Terms of Service', desc: 'Read our terms',          onPress: () => router.push('/chat/legal?type=terms') },
    { icon: 'shield-checkmark-outline', tint: '#3b82f6', label: 'Privacy Policy', desc: 'How we handle your data', onPress: () => router.push('/chat/legal?type=privacy') },
  ];

  const CONTACTS = [
    { icon: 'mail-outline',        tint: '#22c55e', label: 'Email Support',    desc: 'support@thechatnest.com',   onPress: openMail },
    { icon: 'globe-outline',       tint: '#3b82f6', label: 'Help Center',      desc: 'thechatnest.com/help',      onPress: () => openLink('https://thechatnest.com/help') },
    { icon: 'logo-whatsapp',       tint: '#22c55e', label: 'WhatsApp Us',      desc: 'Chat with our team',        onPress: () => openLink('https://wa.me/919999999999?text=Hi%20TheChatNest%20support') },
    { icon: 'share-social-outline',tint: '#f59e0b', label: 'Share App',        desc: 'Invite a teammate',         onPress: shareApp },
  ];

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <View style={[s.header, { backgroundColor: headerBg, paddingTop: insets.top + 6 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 50 }]}>
        {/* Hero card */}
        <View style={[s.hero, { backgroundColor: ACCENT + '15', borderColor: ACCENT + '30' }]}>
          <View style={[s.heroIcon, { backgroundColor: ACCENT }]}>
            <Ionicons name="help-buoy" size={26} color="#fff" />
          </View>
          <Text style={[s.heroTitle, { color: textColor }]}>How can we help?</Text>
          <Text style={[s.heroDesc, { color: subColor }]}>Browse common questions or reach out — we usually reply within a few hours on business days.</Text>
        </View>

        <Text style={[s.sectionLabel, { color: subColor }]}>SHORTCUTS</Text>
        {SHORTCUTS.map((item, i) => (
          <TouchableOpacity key={i} style={[s.row, { backgroundColor: cardBg }]} activeOpacity={0.7} onPress={item.onPress}>
            <View style={[s.rowIcon, { backgroundColor: item.tint + '15' }]}>
              <Ionicons name={item.icon} size={18} color={item.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: textColor }]}>{item.label}</Text>
              <Text style={[s.rowDesc, { color: subColor }]}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={subColor} />
          </TouchableOpacity>
        ))}

        <Text style={[s.sectionLabel, { color: subColor, marginTop: 18 }]}>FREQUENTLY ASKED</Text>
        {FAQS.map((f, i) => {
          const isOpen = openFaq === i;
          return (
            <View key={i} style={[s.faq, { backgroundColor: cardBg }]}>
              <TouchableOpacity style={s.faqHeader} onPress={() => setOpenFaq(isOpen ? null : i)} activeOpacity={0.6}>
                <Text style={[s.faqQ, { color: textColor }]}>{f.q}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={subColor} />
              </TouchableOpacity>
              {isOpen && (
                <View style={[s.faqBody, { borderTopColor: subColor + '20' }]}>
                  <Text style={[s.faqA, { color: subColor }]}>{f.a}</Text>
                </View>
              )}
            </View>
          );
        })}

        <Text style={[s.sectionLabel, { color: subColor, marginTop: 18 }]}>CONTACT US</Text>
        {CONTACTS.map((item, i) => (
          <TouchableOpacity key={i} style={[s.row, { backgroundColor: cardBg }]} activeOpacity={0.7} onPress={item.onPress}>
            <View style={[s.rowIcon, { backgroundColor: item.tint + '15' }]}>
              <Ionicons name={item.icon} size={18} color={item.tint} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowLabel, { color: textColor }]}>{item.label}</Text>
              <Text style={[s.rowDesc, { color: subColor }]}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={subColor} />
          </TouchableOpacity>
        ))}

        <View style={[s.versionRow]}>
          <Text style={[s.versionText, { color: subColor }]}>TheChatNest · v{version}{buildNum ? ` (${buildNum})` : ''}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingBottom: 12, elevation: 4 },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  body: { padding: 12, gap: 8 },
  hero: { borderRadius: 18, padding: 20, alignItems: 'center', borderWidth: 1, marginBottom: 4 },
  heroIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  heroDesc: { fontSize: 12.5, marginTop: 6, textAlign: 'center', lineHeight: 17 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginTop: 6, marginBottom: 4, marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14 },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14.5, fontWeight: '700' },
  rowDesc: { fontSize: 11.5, marginTop: 2 },
  faq: { borderRadius: 14, overflow: 'hidden' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 14 },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '700' },
  faqBody: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  faqA: { fontSize: 13, lineHeight: 19 },
  versionRow: { alignItems: 'center', marginTop: 24, marginBottom: 8 },
  versionText: { fontSize: 11.5, fontWeight: '600' },
});

import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl, SectionList, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../src/components/Avatar';
import ImageViewer from '../../src/components/ImageViewer';
import { getContacts, getThreads } from '../../src/api/chat';
import api from '../../src/api/config';
import { useAuth } from '../../src/store/AuthContext';
import { useTheme } from '../../src/store/ThemeContext';
import useSocket from '../../src/hooks/useSocket';

export default function ContactsScreen() {
  const { user } = useAuth();
  const { theme: t, isDark } = useTheme();
  const { on } = useSocket();
  const insets = useSafeAreaInsets();
  const listBottomPad = 64 + Math.max(insets.bottom - 4, 10) + 24;
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userStatuses, setUserStatuses] = useState({}); // { odne: 'Online' | 'Away' | 'Idle' | 'offline' }
  const [existingThreads, setExistingThreads] = useState(new Set()); // threadIds that have chats
  const [tab, setTab] = useState('people'); // 'people' | 'groups'
  const [deptFilter, setDeptFilter] = useState(null);
  const [viewPhoto, setViewPhoto] = useState(null); // department name or null

  const load = useCallback(async () => {
    try {
      // Load contacts + groups + existing threads in parallel
      const [contactsRes, threadsRes] = await Promise.all([
        getContacts().catch(() => null),
        getThreads().catch(() => null),
      ]);

      // Contacts
      const rows = (contactsRes?.contacts || contactsRes?.rows || contactsRes || []).map(c => ({
        id: c.user_id || c.id,
        name: c.name || c.email,
        email: c.email,
        avatar: c.profile_url || c.avatar,
        department: c.department_name || c.department || '',
        designation: c.designation_name || c.designation || '',
        status: c.status || c.membership_status,
        isGlobal: !!(c.isGlobalMember || c.isGlobal || c.is_global || c.global_user || c.is_global_member),
      }));
      setContacts(rows);

      // Groups — backend returns { threads: [...] } with groups mixed in
      // Filter groups from combined threads array
      const allThreads = threadsRes?.threads || [];
      const separateGroups = threadsRes?.groupThreads || [];
      const groupThreads = [
        ...allThreads.filter(th => th.isGroup || th.threadType === 'group' || th.type === 'group'),
        ...separateGroups,
      ];
      const gRows = [];
      for (const th of groupThreads) {
        const gId = th.group_id || th.groupId || (th.id || '').replace('group-', '');
        gRows.push({
          id: gId,
          name: th.label || th.username || th.group_name || th.groupName,
          description: th.description || th.group_description || '',
          avatar: th.profilePicture || th.group_image || th.groupImage || '',
          memberCount: th.memberCount || th.member_count || 0,
          isAirtime: th.is_airtime,
          threadId: th.id || `group-${gId}`,
          memberStatus: th.hasLeft ? 'left' : (th.membershipStatus || 'active'),
        });
      }
      setGroups(gRows);

      // Existing threads — to know who has active chats
      const dmThreads = allThreads.filter(th => !th.isGroup && th.threadType !== 'group' && th.type !== 'group');
      const threadSet = new Set();
      dmThreads.forEach(th => {
        const tid = th.id || `dm-${th.user_id || th.other_user_id}`;
        threadSet.add(tid);
      });
      groupThreads.forEach(th => {
        threadSet.add(th.id || `group-${th.group_id || th.groupId}`);
      });
      setExistingThreads(threadSet);
    } catch (err) {
      console.warn('[contacts]', err?.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Track status via socket — Online, Away, Idle, offline
  useEffect(() => {
    const unsub1 = on('user:online', (data) => {
      const uid = String(data?.userId || data?.user_id || data);
      if (uid) setUserStatuses(prev => ({ ...prev, [uid]: data?.status || 'Online' }));
    });
    const unsub2 = on('user:offline', (data) => {
      const uid = String(data?.userId || data?.user_id || data);
      if (uid) setUserStatuses(prev => ({ ...prev, [uid]: 'offline' }));
    });
    const unsub3 = on('user:status', (data) => {
      const uid = String(data?.userId || data?.user_id || data);
      if (uid && data?.status) setUserStatuses(prev => ({ ...prev, [uid]: data.status }));
    });
    // Bulk online list on connect
    const unsub4 = on('users:online_list', (data) => {
      const list = data?.users || data || [];
      const map = {};
      list.forEach(u => {
        const uid = String(u.userId || u.user_id || u.id || u);
        map[uid] = u.status || u.activity_status || 'Online';
      });
      setUserStatuses(prev => ({ ...prev, ...map }));
    });
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [on]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  // Filter
  // Get unique departments
  const departments = [...new Set(contacts.map(c => c.department).filter(Boolean))].sort();

  const filteredContacts = contacts.filter(c => {
    if (deptFilter && c.department !== deptFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
    }
    return true;
  });

  const filteredGroups = search.trim()
    ? groups.filter(g => (g.name || '').toLowerCase().includes(search.toLowerCase()) || (g.description || '').toLowerCase().includes(search.toLowerCase()))
    : groups;

  // Group contacts by first letter
  const grouped = {};
  filteredContacts.forEach(c => {
    const letter = (c.name || '?')[0].toUpperCase();
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(c);
  });
  const sections = Object.keys(grouped).sort().map(letter => ({ title: letter, data: grouped[letter] }));

  const openChat = (contact) => {
    const threadId = `dm-${contact.id}`;
    // If existing chat, go to chats — otherwise open new chat
    router.push(`/chat/${threadId}?name=${encodeURIComponent(contact.name || '')}&avatar=${encodeURIComponent(contact.avatar || '')}`);
  };

  const openGroup = (group) => {
    router.push(`/chat/${group.threadId}?name=${encodeURIComponent(group.name || '')}&avatar=${encodeURIComponent(group.avatar || '')}`);
  };

  const openSelf = () => {
    router.push(`/chat/dm-${user?.id}?name=Myself&avatar=${encodeURIComponent(user?.avatar || '')}`);
  };

  const hasChat = (contactId) => existingThreads.has(`dm-${contactId}`);

  const onlineCount = Object.values(userStatuses).filter(s => s && s !== 'offline').length;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: t.bg }]} edges={['top', 'bottom']}>
      <View style={[s.header, { borderBottomColor: t.divider }]}>
        <View style={s.headerLeft}>
          <View style={s.brandTile}>
            <Ionicons name="people" size={14} color="#6e4f10" />
          </View>
          <View>
            <Text style={[s.title, { color: t.text }]}>People</Text>
            <Text style={[s.titleSub, { color: t.textTer }]}>
              {tab === 'people' ? `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}` : `${groups.length} group${groups.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats hero — 3 cards across */}
      <View style={s.statsRow}>
        <View style={[s.statCard, { backgroundColor: t.surface, borderColor: t.divider }]}>
          <View style={[s.statIconWrap, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
            <View style={s.onlineDot} />
          </View>
          <Text style={[s.statValue, { color: t.text }]}>{onlineCount}</Text>
          <Text style={[s.statLabel, { color: t.textTer }]}>Online now</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: t.surface, borderColor: t.divider }]}>
          <View style={[s.statIconWrap, { backgroundColor: 'rgba(255,213,74,0.18)' }]}>
            <Ionicons name="people" size={14} color={t.accent} />
          </View>
          <Text style={[s.statValue, { color: t.text }]}>{contacts.length}</Text>
          <Text style={[s.statLabel, { color: t.textTer }]}>Teammates</Text>
        </View>
        <View style={[s.statCard, { backgroundColor: t.surface, borderColor: t.divider }]}>
          <View style={[s.statIconWrap, { backgroundColor: 'rgba(109,93,252,0.18)' }]}>
            <Ionicons name="grid" size={13} color="#6d5dfc" />
          </View>
          <Text style={[s.statValue, { color: t.text }]}>{departments.length || '—'}</Text>
          <Text style={[s.statLabel, { color: t.textTer }]}>Departments</Text>
        </View>
      </View>

      {/* Pill tab switcher */}
      <View style={s.pillTabWrap}>
        <View style={[s.pillTabContainer, { backgroundColor: t.surface, borderColor: t.divider }]}>
          <TouchableOpacity
            style={[s.pillTab, tab === 'people' && { backgroundColor: t.accent }]}
            onPress={() => setTab('people')}
            activeOpacity={0.85}
          >
            <Ionicons name={tab === 'people' ? 'person' : 'person-outline'} size={14} color={tab === 'people' ? '#6e4f10' : t.textSec} />
            <Text style={[s.pillTabLabel, { color: tab === 'people' ? '#6e4f10' : t.textSec }]}>People</Text>
            <View style={[s.pillCount, { backgroundColor: tab === 'people' ? 'rgba(110,79,16,0.2)' : t.divider }]}>
              <Text style={[s.pillCountText, { color: tab === 'people' ? '#6e4f10' : t.textSec }]}>{contacts.length}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.pillTab, tab === 'groups' && { backgroundColor: t.accent }]}
            onPress={() => setTab('groups')}
            activeOpacity={0.85}
          >
            <Ionicons name={tab === 'groups' ? 'people' : 'people-outline'} size={14} color={tab === 'groups' ? '#6e4f10' : t.textSec} />
            <Text style={[s.pillTabLabel, { color: tab === 'groups' ? '#6e4f10' : t.textSec }]}>Groups</Text>
            <View style={[s.pillCount, { backgroundColor: tab === 'groups' ? 'rgba(110,79,16,0.2)' : t.divider }]}>
              <Text style={[s.pillCountText, { color: tab === 'groups' ? '#6e4f10' : t.textSec }]}>{groups.length}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.searchWrap}>
        <View style={[s.searchBox, { backgroundColor: t.surface, borderColor: t.divider }]}>
          <Ionicons name="search" size={15} color={t.textTer} />
          <TextInput style={[s.searchInput, { color: t.text }]}
            placeholder={tab === 'people' ? 'Search people…' : 'Search groups…'}
            placeholderTextColor={t.textTer}
            value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={t.textTer} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Department filter chips — People tab only */}
      {tab === 'people' && departments.length > 0 && (
        <View style={s.deptRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 16, paddingVertical: 6 }}>
            <TouchableOpacity style={[s.deptChip, !deptFilter && { backgroundColor: `${t.accent}15`, borderColor: t.accent }]}
              onPress={() => setDeptFilter(null)} activeOpacity={0.7}>
              <Text style={[s.deptChipText, { color: !deptFilter ? t.accent : t.textTer }]}>All</Text>
            </TouchableOpacity>
            {departments.map(d => (
              <TouchableOpacity key={d} style={[s.deptChip, deptFilter === d && { backgroundColor: `${t.accent}15`, borderColor: t.accent }]}
                onPress={() => setDeptFilter(deptFilter === d ? null : d)} activeOpacity={0.7}>
                <Text style={[s.deptChipText, { color: deptFilter === d ? t.accent : t.textTer }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {tab === 'people' ? (
        /* ─── People Tab ─── */
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: listBottomPad }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[t.accent]} />}
          ListHeaderComponent={
            <TouchableOpacity style={[s.myselfRow, { backgroundColor: t.surface, borderColor: t.divider }]} onPress={openSelf} activeOpacity={0.7}>
              <View style={[s.myselfAvatar, { backgroundColor: t.accent }]}>
                <Ionicons name="bookmark" size={20} color="#6e4f10" />
              </View>
              <View style={s.myselfBody}>
                <Text style={[s.myselfName, { color: t.text }]}>Myself</Text>
                <Text style={[s.myselfSub, { color: t.textSec }]}>Notes • drafts • reminders</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={t.textTer} />
            </TouchableOpacity>
          }
          renderSectionHeader={({ section }) => (
            <Text style={[s.sectionHeader, { color: t.accent, backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>{section.title}</Text>
          )}
          renderItem={({ item }) => {
            const chatExists = hasChat(item.id);
            return (
              <TouchableOpacity style={[s.contactRow, { borderBottomColor: t.borderLight || t.border }]} onPress={() => openChat(item)} activeOpacity={0.65}>
                <Avatar uri={item.avatar} name={item.name} size={46} status={userStatuses[String(item.id)] || 'offline'} isGlobal={item.isGlobal}
                  onPress={item.avatar ? () => setViewPhoto({ uri: item.avatar, name: item.name }) : undefined} />
                <View style={s.contactBody}>
                  <Text style={[s.contactName, { color: t.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[s.contactSub, { color: t.textSec }]} numberOfLines={1}>{item.designation || item.department || item.email}</Text>
                </View>
                {chatExists ? (
                  <View style={[s.chatBadge, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                    <Ionicons name="chatbubble" size={12} color="#22c55e" />
                  </View>
                ) : null}
                <TouchableOpacity style={[s.chatBtn, { backgroundColor: t.accent }]} onPress={() => openChat(item)} activeOpacity={0.85}>
                  <Ionicons name="chatbubble" size={16} color="#6e4f10" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="people-outline" size={48} color={t.textTer} />
              <Text style={[s.emptyText, { color: t.textTer }]}>No contacts found</Text>
            </View>
          }
        />
      ) : (
        /* ─── Groups Tab ─── */
        <FlatList
          data={filteredGroups}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ paddingBottom: listBottomPad }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[t.accent]} />}
          ListHeaderComponent={
            <TouchableOpacity style={[s.myselfRow, { backgroundColor: t.surface, borderColor: t.divider }]}
              onPress={() => router.push('/chat/create-group')} activeOpacity={0.7}>
              <View style={[s.createGroupIcon, { backgroundColor: t.accent }]}>
                <Ionicons name="add" size={22} color="#6e4f10" />
              </View>
              <View style={s.myselfBody}>
                <Text style={[s.myselfName, { color: t.text }]}>New group</Text>
                <Text style={[s.myselfSub, { color: t.textSec }]}>Start a new team conversation</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={t.textTer} />
            </TouchableOpacity>
          }
          renderItem={({ item }) => {
            const isLeft = item.memberStatus === 'left' || item.memberStatus === 'kicked';
            return (
              <TouchableOpacity style={[s.contactRow, { borderBottomColor: t.borderLight || t.border, opacity: isLeft ? 0.55 : 1 }]}
                onPress={() => openGroup(item)} activeOpacity={0.65}>
                <View style={[s.groupAvatar, { backgroundColor: isLeft ? (isDark ? '#1e293b' : '#f1f5f9') : (isDark ? '#1e293b' : '#ede9fe') }]}>
                  <Ionicons name="people" size={22} color={isLeft ? '#94a3b8' : t.accent} />
                </View>
                <View style={s.contactBody}>
                  <View style={s.groupNameRow}>
                    <Text style={[s.contactName, { color: t.text }]} numberOfLines={1}>{item.name}</Text>
                    {isLeft && (
                      <View style={[s.leftBadge, { backgroundColor: '#fee2e2' }]}>
                        <Text style={s.leftBadgeText}>{item.memberStatus === 'kicked' ? 'Removed' : 'Left'}</Text>
                      </View>
                    )}
                    {!isLeft && item.isAirtime && (
                      <View style={[s.airtimeBadge, { backgroundColor: '#fef3c7' }]}>
                        <Ionicons name="megaphone" size={10} color="#f59e0b" />
                      </View>
                    )}
                  </View>
                  <Text style={[s.contactSub, { color: t.textSec }]} numberOfLines={1}>
                    {isLeft ? 'You can only view old messages' : (item.description || `${item.memberCount || ''} members`)}
                  </Text>
                </View>
                <TouchableOpacity style={[s.chatBtn, { backgroundColor: isLeft ? t.surface : t.accent }]} onPress={() => openGroup(item)} activeOpacity={0.85}>
                  <Ionicons name={isLeft ? 'eye-outline' : 'chatbubble'} size={16} color={isLeft ? '#94a3b8' : '#6e4f10'} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="people-outline" size={48} color={t.textTer} />
              <Text style={[s.emptyText, { color: t.textTer }]}>No groups found</Text>
            </View>
          }
        />
      )}
      <ImageViewer visible={!!viewPhoto} uri={viewPhoto?.uri} caption={viewPhoto?.name} onClose={() => setViewPhoto(null)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandTile: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: '#ffd54a',
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#ffd54a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  title: { fontSize: 22, fontWeight: '900', letterSpacing: -0.4 },
  titleSub: { fontSize: 11, fontWeight: '600', marginTop: 1 },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: 1,
    gap: 8,
  },
  statIconWrap: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  statValue: { fontSize: 18, fontWeight: '900', letterSpacing: -0.4 },
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },

  // Pill tabs
  pillTabWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  pillTabContainer: {
    flexDirection: 'row', borderRadius: 14, padding: 4, gap: 4,
    borderWidth: 1,
  },
  pillTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  pillTabLabel: { fontSize: 13, fontWeight: '800', letterSpacing: -0.1 },
  pillCount: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, minWidth: 22, alignItems: 'center' },
  pillCountText: { fontSize: 10, fontWeight: '900' },

  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, paddingHorizontal: 14, height: 44,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },

  // Myself row + new group row
  myselfRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13, gap: 13,
    marginHorizontal: 12, marginVertical: 6,
    borderRadius: 16, borderWidth: 1,
  },
  myselfAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  myselfEmoji: { fontSize: 20 },
  myselfBody: { flex: 1, minWidth: 0 },
  myselfName: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  myselfSub: { fontSize: 12, marginTop: 2 },

  // Create group icon
  createGroupIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  // Section header
  sectionHeader: {
    fontSize: 11, fontWeight: '900',
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },

  // Contact row
  contactRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 11, gap: 12,
    marginHorizontal: 8, marginVertical: 1,
    borderRadius: 12,
    borderBottomWidth: 0,
  },
  contactBody: { flex: 1, minWidth: 0 },
  contactName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  contactSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  chatBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#ffd54a', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  chatBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },

  // Group avatar
  groupAvatar: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,213,74,0.2)',
  },
  groupNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  airtimeBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  leftBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  leftBadgeText: { fontSize: 9, fontWeight: '900', color: '#ef4444', textTransform: 'uppercase', letterSpacing: 0.3 },

  // Department filter
  deptRow: { },
  deptChip: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'transparent' },
  deptChipText: { fontSize: 11, fontWeight: '800' },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 32 },
  emptyText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});

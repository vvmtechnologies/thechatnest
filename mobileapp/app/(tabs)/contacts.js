import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl,
  SectionList, ScrollView, Platform, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../../src/components/Avatar';
import ImageViewer from '../../src/components/ImageViewer';
import { getContacts, getThreads } from '../../src/api/chat';
import { useAuth } from '../../src/store/AuthContext';
import { useTheme } from '../../src/store/ThemeContext';
import useSocket from '../../src/hooks/useSocket';

export default function ContactsScreen() {
  const { user } = useAuth();
  const { theme: t, isDark } = useTheme();
  const { on } = useSocket();
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const isTablet = winW >= 768;
  const contentMaxWidth = isTablet ? 720 : winW;
  const listBottomPad = 64 + Math.max(insets.bottom - 4, 10) + 24;

  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});
  const [existingThreads, setExistingThreads] = useState(new Set());
  const [tab, setTab] = useState('people');
  const [deptFilter, setDeptFilter] = useState(null);
  const [quickFilter, setQuickFilter] = useState('all'); // 'all' | 'online' | 'active'
  const [viewPhoto, setViewPhoto] = useState(null);

  // ─── Data load ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const [contactsRes, threadsRes] = await Promise.all([
        getContacts().catch(() => null),
        getThreads().catch(() => null),
      ]);

      const rows = (contactsRes?.contacts || contactsRes?.rows || contactsRes || []).map((c) => ({
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

      const allThreads = threadsRes?.threads || [];
      const separateGroups = threadsRes?.groupThreads || [];
      const groupThreads = [
        ...allThreads.filter((th) => th.isGroup || th.threadType === 'group' || th.type === 'group'),
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

      const dmThreads = allThreads.filter((th) => !th.isGroup && th.threadType !== 'group' && th.type !== 'group');
      const threadSet = new Set();
      dmThreads.forEach((th) => {
        const tid = th.id || `dm-${th.user_id || th.other_user_id}`;
        threadSet.add(tid);
      });
      groupThreads.forEach((th) => {
        threadSet.add(th.id || `group-${th.group_id || th.groupId}`);
      });
      setExistingThreads(threadSet);
    } catch (err) {
      console.warn('[contacts]', err?.message);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Socket status tracking ────────────────────────────────────────────
  useEffect(() => {
    const unsub1 = on('user:online', (data) => {
      const uid = String(data?.userId || data?.user_id || data);
      if (uid) setUserStatuses((prev) => ({ ...prev, [uid]: data?.status || 'Online' }));
    });
    const unsub2 = on('user:offline', (data) => {
      const uid = String(data?.userId || data?.user_id || data);
      if (uid) setUserStatuses((prev) => ({ ...prev, [uid]: 'offline' }));
    });
    const unsub3 = on('user:status', (data) => {
      const uid = String(data?.userId || data?.user_id || data);
      if (uid && data?.status) setUserStatuses((prev) => ({ ...prev, [uid]: data.status }));
    });
    const unsub4 = on('users:online_list', (data) => {
      const list = data?.users || data || [];
      const map = {};
      list.forEach((u) => {
        const uid = String(u.userId || u.user_id || u.id || u);
        map[uid] = u.status || u.activity_status || 'Online';
      });
      setUserStatuses((prev) => ({ ...prev, ...map }));
    });
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, [on]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  // ─── Derived ───────────────────────────────────────────────────────────
  const departments = useMemo(
    () => [...new Set(contacts.map((c) => c.department).filter(Boolean))].sort(),
    [contacts]
  );

  const onlineCount = useMemo(
    () => contacts.filter((c) => {
      const s = userStatuses[String(c.id)];
      return s && s !== 'offline';
    }).length,
    [contacts, userStatuses]
  );

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (deptFilter && c.department !== deptFilter) return false;
      if (quickFilter === 'online') {
        const st = userStatuses[String(c.id)];
        if (!st || st === 'offline') return false;
      }
      if (quickFilter === 'active' && !existingThreads.has(`dm-${c.id}`)) return false;
      if (!q) return true;
      return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
    });
  }, [contacts, search, deptFilter, quickFilter, userStatuses, existingThreads]);

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) => (g.name || '').toLowerCase().includes(q) || (g.description || '').toLowerCase().includes(q)
    );
  }, [groups, search]);

  const sections = useMemo(() => {
    const grouped = {};
    filteredContacts.forEach((c) => {
      const letter = (c.name || '?')[0].toUpperCase();
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(c);
    });
    return Object.keys(grouped).sort().map((letter) => ({ title: letter, data: grouped[letter] }));
  }, [filteredContacts]);

  // ─── Actions ───────────────────────────────────────────────────────────
  const openChat = useCallback((contact) => {
    const threadId = `dm-${contact.id}`;
    router.push(`/chat/${threadId}?name=${encodeURIComponent(contact.name || '')}&avatar=${encodeURIComponent(contact.avatar || '')}`);
  }, []);

  const openGroup = useCallback((group) => {
    router.push(`/chat/${group.threadId}?name=${encodeURIComponent(group.name || '')}&avatar=${encodeURIComponent(group.avatar || '')}`);
  }, []);

  const openSelf = useCallback(() => {
    router.push(`/chat/dm-${user?.id}?name=Myself&avatar=${encodeURIComponent(user?.avatar || '')}`);
  }, [user?.id, user?.avatar]);

  const hasChat = useCallback((contactId) => existingThreads.has(`dm-${contactId}`), [existingThreads]);

  const clearAllFilters = useCallback(() => {
    setSearch(''); setDeptFilter(null); setQuickFilter('all');
  }, []);

  const filtersActive = Boolean(search.trim() || deptFilter || quickFilter !== 'all');
  const visibleCount = tab === 'people' ? filteredContacts.length : filteredGroups.length;
  const totalCount = tab === 'people' ? contacts.length : groups.length;

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.root, { backgroundColor: t.bg }]} edges={['top']}>
      <View style={{ width: '100%', maxWidth: contentMaxWidth, alignSelf: 'center', flex: 1 }}>

        {/* ─── Top bar ─── */}
        <View style={s.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={[s.topKicker, { color: t.textTer }]}>YOUR ORG</Text>
            <Text style={[s.topTitle, { color: t.text }]}>People & Groups</Text>
          </View>
          <View style={[s.onlineBadge, { backgroundColor: '#22c55e15', borderColor: '#22c55e44' }]}>
            <View style={s.onlineDotLg} />
            <Text style={s.onlineBadgeText}>{onlineCount} online</Text>
          </View>
        </View>

        {/* ─── Stats hero — 3 compact cards ─── */}
        <View style={s.statsRow}>
          <StatCard t={t} tint="#22c55e" label="Online" value={onlineCount} />
          <StatCard t={t} tint={t.accent} label="Teammates" value={contacts.length} />
          <StatCard t={t} tint="#6d5dfc" label="Groups" value={groups.length} />
          <StatCard t={t} tint="#0ea5e9" label="Departments" value={departments.length || '—'} />
        </View>

        {/* ─── Tabs ─── */}
        <View style={[s.tabBar, { backgroundColor: t.surface, borderColor: t.divider }]}>
          <TabButton
            t={t}
            active={tab === 'people'}
            icon="person-outline"
            iconActive="person"
            label="People"
            count={contacts.length}
            onPress={() => { setTab('people'); setSearch(''); }}
          />
          <TabButton
            t={t}
            active={tab === 'groups'}
            icon="people-outline"
            iconActive="people"
            label="Groups"
            count={groups.length}
            onPress={() => { setTab('groups'); setSearch(''); }}
          />
        </View>

        {/* ─── Search ─── */}
        <View style={s.searchWrap}>
          <View style={[s.searchBox, { backgroundColor: t.surface, borderColor: t.divider }]}>
            <Ionicons name="search" size={16} color={t.textTer} />
            <TextInput
              style={[s.searchInput, { color: t.text }]}
              placeholder={tab === 'people' ? 'Search people, email, designation…' : 'Search groups…'}
              placeholderTextColor={t.textTer}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={10}>
                <Ionicons name="close-circle" size={17} color={t.textTer} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ─── Quick filter chips (People tab only) ─── */}
        {tab === 'people' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipScroll}
          >
            <FilterChip
              t={t}
              active={quickFilter === 'all'}
              icon="people-outline"
              label="All"
              onPress={() => setQuickFilter('all')}
            />
            <FilterChip
              t={t}
              active={quickFilter === 'online'}
              icon="ellipse"
              iconColor="#22c55e"
              label="Online"
              onPress={() => setQuickFilter('online')}
            />
            <FilterChip
              t={t}
              active={quickFilter === 'active'}
              icon="chatbubble-outline"
              label="Active chats"
              onPress={() => setQuickFilter('active')}
            />
            {departments.length > 0 && <View style={[s.chipDivider, { backgroundColor: t.divider }]} />}
            {departments.map((d) => (
              <FilterChip
                key={d}
                t={t}
                active={deptFilter === d}
                label={d}
                onPress={() => setDeptFilter(deptFilter === d ? null : d)}
              />
            ))}
            {filtersActive && (
              <TouchableOpacity onPress={clearAllFilters} style={[s.clearChip, { borderColor: '#ef444466' }]} activeOpacity={0.7}>
                <Ionicons name="close" size={13} color="#ef4444" />
                <Text style={s.clearChipText}>Clear</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* ─── Result count strip ─── */}
        {filtersActive && tab === 'people' && (
          <View style={s.resultStrip}>
            <Text style={[s.resultText, { color: t.textTer }]}>
              {visibleCount} of {totalCount} {tab === 'people' ? 'people' : 'groups'} match
            </Text>
          </View>
        )}

        {/* ─── List ─── */}
        {tab === 'people' ? (
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingBottom: listBottomPad, paddingHorizontal: 4 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[t.accent]} tintColor={t.accent} />}
            ListHeaderComponent={
              <PinnedRow
                t={t}
                tint={t.accent}
                icon="bookmark"
                title="Myself"
                subtitle="Notes • drafts • reminders"
                onPress={openSelf}
              />
            }
            renderSectionHeader={({ section }) => (
              <View style={[s.sectionHeaderWrap, { backgroundColor: t.bg }]}>
                <Text style={[s.sectionHeader, { color: t.accent }]}>{section.title}</Text>
                <View style={[s.sectionLine, { backgroundColor: t.divider }]} />
              </View>
            )}
            renderItem={({ item }) => {
              const userStatus = userStatuses[String(item.id)] || 'offline';
              const chatExists = hasChat(item.id);
              return (
                <ContactRow
                  t={t}
                  item={item}
                  userStatus={userStatus}
                  chatExists={chatExists}
                  onPress={() => openChat(item)}
                  onAvatarPress={item.avatar ? () => setViewPhoto({ uri: item.avatar, name: item.name }) : undefined}
                />
              );
            }}
            ListEmptyComponent={
              <EmptyState
                t={t}
                icon="people-outline"
                title={filtersActive ? 'No matches' : 'No teammates yet'}
                hint={
                  filtersActive
                    ? 'Try clearing filters or adjusting your search.'
                    : 'Once teammates join your org they\'ll appear here.'
                }
                action={filtersActive ? { label: 'Clear filters', onPress: clearAllFilters } : null}
              />
            }
          />
        ) : (
          <FlatList
            data={filteredGroups}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: listBottomPad, paddingHorizontal: 4 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[t.accent]} tintColor={t.accent} />}
            ListHeaderComponent={
              <PinnedRow
                t={t}
                tint="#6d5dfc"
                icon="add"
                title="New group"
                subtitle="Start a new team conversation"
                onPress={() => router.push('/chat/create-group')}
              />
            }
            renderItem={({ item }) => (
              <GroupRow t={t} isDark={isDark} item={item} onPress={() => openGroup(item)} />
            )}
            ListEmptyComponent={
              <EmptyState
                t={t}
                icon="people-outline"
                title={search ? 'No matching groups' : 'No groups yet'}
                hint={
                  search
                    ? 'Try a different search term.'
                    : 'Tap "New group" above to start your first team chat.'
                }
                action={search ? { label: 'Clear search', onPress: () => setSearch('') } : null}
              />
            }
          />
        )}
      </View>

      <ImageViewer visible={!!viewPhoto} uri={viewPhoto?.uri} caption={viewPhoto?.name} onClose={() => setViewPhoto(null)} />
    </SafeAreaView>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────
function StatCard({ t, tint, label, value }) {
  return (
    <View style={[s.statCard, { backgroundColor: t.surface, borderColor: t.divider }]}>
      <View style={[s.statTint, { backgroundColor: tint }]} />
      <Text style={[s.statValue, { color: t.text }]} numberOfLines={1}>{value}</Text>
      <Text style={[s.statLabel, { color: t.textTer }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function TabButton({ t, active, icon, iconActive, label, count, onPress }) {
  return (
    <TouchableOpacity
      style={[s.tabBtn, active && { backgroundColor: t.accent }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={active ? iconActive : icon} size={14} color={active ? '#6e4f10' : t.textSec} />
      <Text style={[s.tabBtnLabel, { color: active ? '#6e4f10' : t.textSec }]}>{label}</Text>
      <View style={[s.tabCount, { backgroundColor: active ? 'rgba(110,79,16,0.2)' : t.divider }]}>
        <Text style={[s.tabCountText, { color: active ? '#6e4f10' : t.textSec }]}>{count}</Text>
      </View>
    </TouchableOpacity>
  );
}

function FilterChip({ t, active, icon, iconColor, label, onPress }) {
  // Inactive chips need stronger contrast — t.surface + t.divider was
  // disappearing into the page background. Use the page card colour with
  // a clearly visible 1.5px border, and the primary text colour for the
  // label. Active chips get a solid accent background instead of an
  // alpha overlay so they pop unmistakably.
  return (
    <TouchableOpacity
      style={[
        s.filterChip,
        active
          ? { backgroundColor: t.accent, borderColor: t.accent }
          : { backgroundColor: t.card, borderColor: t.border || t.divider },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={13}
          color={active ? '#6e4f10' : (iconColor || t.text)}
        />
      ) : null}
      <Text style={[s.filterChipText, { color: active ? '#6e4f10' : t.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function PinnedRow({ t, tint, icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity
      style={[s.pinnedRow, { backgroundColor: t.surface, borderColor: t.divider }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[s.pinnedIcon, { backgroundColor: tint }]}>
        <Ionicons name={icon} size={20} color="#6e4f10" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[s.pinnedTitle, { color: t.text }]} numberOfLines={1}>{title}</Text>
        <Text style={[s.pinnedSub, { color: t.textSec }]} numberOfLines={1}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={t.textTer} />
    </TouchableOpacity>
  );
}

function ContactRow({ t, item, userStatus, chatExists, onPress, onAvatarPress }) {
  return (
    <TouchableOpacity
      style={[s.contactRow, { borderColor: t.divider, backgroundColor: t.surface }]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <Avatar
        uri={item.avatar}
        name={item.name}
        size={46}
        status={userStatus}
        isGlobal={item.isGlobal}
        onPress={onAvatarPress}
      />
      <View style={s.contactBody}>
        <View style={s.contactNameRow}>
          <Text style={[s.contactName, { color: t.text }]} numberOfLines={1}>{item.name}</Text>
          {chatExists && (
            <View style={[s.activeChatPill, { backgroundColor: '#22c55e15' }]}>
              <Ionicons name="chatbubble" size={9} color="#22c55e" />
              <Text style={s.activeChatText}>Active</Text>
            </View>
          )}
        </View>
        <Text style={[s.contactSub, { color: t.textSec }]} numberOfLines={1}>
          {item.designation || item.department || item.email}
        </Text>
      </View>
      <View style={[s.chatBtn, { backgroundColor: t.accent }]}>
        <Ionicons name="chatbubble" size={16} color="#6e4f10" />
      </View>
    </TouchableOpacity>
  );
}

function GroupRow({ t, isDark, item, onPress }) {
  const isLeft = item.memberStatus === 'left' || item.memberStatus === 'kicked';
  return (
    <TouchableOpacity
      style={[s.contactRow, { borderColor: t.divider, backgroundColor: t.surface, opacity: isLeft ? 0.55 : 1 }]}
      onPress={onPress}
      activeOpacity={0.65}
    >
      <View
        style={[
          s.groupAvatar,
          { backgroundColor: isLeft ? (isDark ? '#1e293b' : '#f1f5f9') : (isDark ? '#1e293b' : '#ede9fe') },
        ]}
      >
        <Ionicons name="people" size={22} color={isLeft ? '#94a3b8' : t.accent} />
      </View>
      <View style={s.contactBody}>
        <View style={s.contactNameRow}>
          <Text style={[s.contactName, { color: t.text }]} numberOfLines={1}>{item.name}</Text>
          {isLeft && (
            <View style={[s.statusPill, { backgroundColor: '#ef444415' }]}>
              <Text style={[s.statusPillText, { color: '#ef4444' }]}>
                {item.memberStatus === 'kicked' ? 'Removed' : 'Left'}
              </Text>
            </View>
          )}
          {!isLeft && item.isAirtime && (
            <View style={[s.statusPill, { backgroundColor: '#f59e0b22' }]}>
              <Ionicons name="megaphone" size={10} color="#f59e0b" />
              <Text style={[s.statusPillText, { color: '#f59e0b' }]}>Airtime</Text>
            </View>
          )}
        </View>
        <Text style={[s.contactSub, { color: t.textSec }]} numberOfLines={1}>
          {isLeft ? 'You can only view old messages' : (item.description || `${item.memberCount || 0} member${item.memberCount === 1 ? '' : 's'}`)}
        </Text>
      </View>
      <View style={[s.chatBtn, { backgroundColor: isLeft ? t.surface : t.accent, borderWidth: isLeft ? 1 : 0, borderColor: t.divider }]}>
        <Ionicons name={isLeft ? 'eye-outline' : 'chatbubble'} size={16} color={isLeft ? '#94a3b8' : '#6e4f10'} />
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ t, icon, title, hint, action }) {
  return (
    <View style={s.empty}>
      <View style={[s.emptyIconWrap, { backgroundColor: t.accent + '15' }]}>
        <Ionicons name={icon} size={36} color={t.accent} />
      </View>
      <Text style={[s.emptyTitle, { color: t.text }]}>{title}</Text>
      <Text style={[s.emptyHint, { color: t.textTer }]}>{hint}</Text>
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={[s.emptyAction, { backgroundColor: t.accent }]}
          activeOpacity={0.85}
        >
          <Text style={s.emptyActionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 8, paddingBottom: 6,
  },
  topKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  topTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginTop: 2 },
  onlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: 999, borderWidth: 1,
  },
  onlineDotLg: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  onlineBadgeText: { fontSize: 11, fontWeight: '800', color: '#15803d', letterSpacing: 0.2 },

  // Stats
  statsRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 12, paddingTop: 14, paddingBottom: 4,
  },
  statCard: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 12,
    borderRadius: 14, borderWidth: 1, overflow: 'hidden',
    position: 'relative',
  },
  statTint: {
    position: 'absolute', top: 0, left: 0,
    width: 3, height: '100%',
  },
  statValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginTop: 2, textTransform: 'uppercase' },

  // Tabs
  tabBar: {
    flexDirection: 'row', marginHorizontal: 12, marginTop: 12,
    borderRadius: 14, padding: 4, gap: 4, borderWidth: 1,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  tabBtnLabel: { fontSize: 13, fontWeight: '800', letterSpacing: -0.1 },
  tabCount: {
    paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8,
    minWidth: 22, alignItems: 'center',
  },
  tabCountText: { fontSize: 10, fontWeight: '900' },

  // Search
  searchWrap: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, paddingHorizontal: 14, height: 46, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14.5, fontWeight: '500' },

  // Filter chips — tuned for visibility: solid bg, 1.5px border, primary
  // text. Smaller chips were getting lost against the page surface.
  chipScroll: { gap: 8, paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center' },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 999, borderWidth: 1.5,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
      android: { elevation: 1 },
    }),
  },
  filterChipText: { fontSize: 13, fontWeight: '800', letterSpacing: -0.1 },
  chipDivider: { width: 1.5, height: 22, marginHorizontal: 6, opacity: 0.6 },
  clearChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5,
    backgroundColor: 'rgba(239,68,68,0.08)', marginLeft: 4,
  },
  clearChipText: { fontSize: 12, fontWeight: '800', color: '#ef4444', letterSpacing: -0.1 },

  // Result strip
  resultStrip: { paddingHorizontal: 18, paddingBottom: 4 },
  resultText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  // Pinned row (Myself / New group)
  pinnedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    marginHorizontal: 8, marginVertical: 6,
    borderRadius: 16, borderWidth: 1,
  },
  pinnedIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pinnedTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  pinnedSub: { fontSize: 12, marginTop: 2 },

  // Section header
  sectionHeaderWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 6,
  },
  sectionHeader: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  sectionLine: { flex: 1, height: StyleSheet.hairlineWidth },

  // Contact row
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    marginHorizontal: 8, marginVertical: 2,
    borderRadius: 14, borderWidth: 1,
  },
  contactBody: { flex: 1, minWidth: 0 },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  contactSub: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  activeChatPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 999,
  },
  activeChatText: { fontSize: 9, fontWeight: '900', color: '#22c55e', letterSpacing: 0.3 },
  chatBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#ffd54a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },

  // Group avatar
  groupAvatar: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.3, textTransform: 'uppercase' },

  // Empty state
  empty: {
    alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 10,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center', letterSpacing: -0.2 },
  emptyHint: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 19 },
  emptyAction: {
    marginTop: 8, paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 999,
  },
  emptyActionText: { fontSize: 13, fontWeight: '800', color: '#6e4f10', letterSpacing: 0.2 },
});

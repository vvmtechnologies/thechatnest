// Centralized AsyncStorage keys. Keep this file as the single source of truth —
// renaming a key in code without updating storage migrations would orphan user data.

export const StorageKeys = {
  // Chat list state
  pinnedChats:        'pinned_chats',
  archivedChats:      'archived_chats',

  // Per-thread (use builders)
  draftFor:           (threadId) => `draft-${threadId}`,
  wallpaperFor:       (threadId) => `wallpaper-${threadId}`,

  // Notifications & sound
  notificationTone:   'notificationTone',
  notifyMessage:      'notify_message',
  notifyGroup:        'notify_group',
  notifyCall:         'notify_call',
  notifyMention:      'notify_mention',
  notifyPreview:      'notify_show_preview',
  notifyVibrate:      'notify_vibrate',
  notifyInApp:        'notify_in_app',
  notifyDnd:          'notify_dnd',

  // Privacy
  privacyLastSeen:        'privacy_last_seen',
  privacyProfilePhoto:    'privacy_profile_photo',
  privacyAbout:           'privacy_about',
  privacyReadReceipts:    'privacy_read_receipts',
  privacyGroups:          'privacy_groups',
  privacyAppLock:         'privacy_app_lock',
  privacyBlockScreenshot: 'privacy_block_screenshots',

  // Misc app state
  starredMessages:    'starred_messages',
  activeThread:       'activeThread',
  expoPushToken:      'expoPushToken',
};

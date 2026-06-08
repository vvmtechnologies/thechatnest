const APP_BRANDING_ASSETS = {
    mascot: '/thechatnestElement.png',
    notificationIcon: '/thechatnest_logo_element.png',
};

// Bump on each deploy where SW logic changes. v6 switches the PWA icons
// over to the proper brand-supplied favicon set (android-chrome-192/512,
// favicon-16/32, apple-touch-icon, .ico). v5 had stand-ins generated
// from the logo element — these are the real ones.
const CACHE_NAME = 'thechatnest-cache-v6';

const getPrecacheUrls = () => [
    // Do NOT cache '/': it can serve different content depending on deploy
    '/index.html',
    APP_BRANDING_ASSETS.notificationIcon
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(getPrecacheUrls()))
            .then(() => self.skipWaiting())
            .catch((error) => console.error('Install failed:', error))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((name) => {
                        if (name !== CACHE_NAME) {
                            return caches.delete(name);
                        }
                    })
                );
            }),
            self.clients.claim()
        ]).catch((error) => console.error('Activate failed:', error))
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Network-first for navigations (HTML) to avoid blank screen after deploys
    if (req.mode === 'navigate') {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
                    return res;
                })
                .catch(() => caches.match('/index.html'))
        );
        return;
    }

    // Hashed Vite chunks (`/assets/*-HASH.js|css`) need network-first.
    // A cached old chunk would 404 the next deploy → white screen.
    const url = new URL(req.url);
    const isHashedAsset = url.pathname.startsWith('/assets/') &&
        /-[A-Za-z0-9_]{6,}\.(js|css)$/.test(url.pathname);

    if (isHashedAsset) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    if (res && res.ok) {
                        const copy = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                    }
                    return res;
                })
                .catch(() => caches.match(req))
        );
        return;
    }

    // Cache-first for true static assets (images, fonts) — these don't
    // change per deploy and benefit from offline caching.
    const destination = req.destination;
    if (['image', 'font', 'style'].includes(destination)) {
        event.respondWith(
            caches.match(req).then((cached) => {
                if (cached) return cached;
                return fetch(req).then((res) => {
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
                    return res;
                });
            })
        );
        return;
    }
});

self.addEventListener('message', (event) => {
    if (!event.data) {
        return;
    }

    if (event.data.type === 'APP_BRANDING_ASSETS') {
        const { mascot, notificationIcon } = event.data.payload || {};
        if (typeof mascot === 'string') {
            APP_BRANDING_ASSETS.mascot = mascot;
        }
        if (typeof notificationIcon === 'string') {
            APP_BRANDING_ASSETS.notificationIcon = notificationIcon;
            event.waitUntil(
                caches.open(CACHE_NAME)
                    .then((cache) => cache.add(notificationIcon))
                    .catch((error) => console.error('Branding asset cache failed:', error))
            );
        }
        return;
    }

    if (event.data.type === 'SHOW_NOTIFICATION') {
        const { title, body, messageId, threadId = null, organizationId = null } = event.data;
        const notificationOptions = {
            body,
            icon: APP_BRANDING_ASSETS.notificationIcon,
            badge: APP_BRANDING_ASSETS.notificationIcon,
            vibrate: [200, 100, 200],
            tag: messageId,
            data: { messageId, threadId, organizationId },
            requireInteraction: true
        };

        event.waitUntil(
            self.registration.showNotification(title, notificationOptions)
                .then(() => {
                    return self.clients.matchAll({ type: 'window', includeUncontrolled: true })
                        .then((clients) => {
                            clients.forEach((client) => {
                                client.postMessage({
                                    type: 'PLAY_NOTIFICATION_SOUND',
                                    messageId
                                });
                            });
                        });
                })
                .catch((error) => console.error('Notification failed:', error))
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const data = event.notification.data || {};
    const { threadId = null, organizationId = null, url = '/app' } = data;
    const payload = {
        type: 'OPEN_THREAD_FROM_NOTIFICATION',
        threadId,
        organizationId,
    };
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clients) => {
                const preferred = clients.find((client) =>
                    typeof client.url === 'string' && client.url.includes('/app')
                );
                const targetClient = preferred || clients[0];
                if (targetClient) {
                    if (targetClient.focus) {
                        targetClient.focus();
                    }
                    targetClient.postMessage(payload);
                    return;
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow(url).then((client) => {
                        if (client) {
                            client.postMessage(payload);
                        }
                    });
                }
            })
            .catch((error) => console.error('Notification click failed:', error))
    );
});

// ─── Web Push (background notifications) ────────────────────────────────────
self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data ? event.data.json() : {};
    } catch (_) {
        try {
            payload = { title: 'TheChatNest', body: event.data ? event.data.text() : '' };
        } catch (__) { payload = {}; }
    }

    const title = payload.title || 'TheChatNest';
    const options = {
        body: payload.body || '',
        icon: APP_BRANDING_ASSETS.notificationIcon,
        badge: APP_BRANDING_ASSETS.notificationIcon,
        tag: payload.tag || payload.threadId || 'thechatnest',
        renotify: !!payload.renotify,
        requireInteraction: !!payload.requireInteraction,
        vibrate: [120, 60, 120],
        data: {
            threadId: payload.threadId || null,
            url: payload.url || '/app',
            type: payload.type || null,
        },
    };

    event.waitUntil((async () => {
        // If a client is already focused/visible, skip native notification — in-app UI handles it
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        const hasVisibleClient = clients.some((c) => c.visibilityState === 'visible' && c.focused);
        // Always postMessage so visible client can sync state / play sound
        clients.forEach((c) => {
            try { c.postMessage({ type: 'PUSH_RECEIVED', payload }); } catch (_) {}
        });
        if (hasVisibleClient && payload.type !== 'call-incoming') {
            return; // in-app already shows it
        }
        return self.registration.showNotification(title, options);
    })());
});

self.addEventListener('pushsubscriptionchange', (event) => {
    // Subscription rotated — let the client re-subscribe when it loads
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            clients.forEach((c) => {
                try { c.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' }); } catch (_) {}
            });
        })
    );
});

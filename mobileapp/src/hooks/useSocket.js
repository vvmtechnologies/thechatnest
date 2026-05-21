import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { SOCKET_URL, API_BASE_URL } from '../api/config';
import { useAuth } from '../store/AuthContext';
import { isTokenExpired as isTokenExpiredHelper } from '../utils/jwt';

// ─── Singleton socket ─────────────────────────────────────────────────────
let globalSocket = null;
let globalConnected = false;
let isConnecting = false;
let lastToken = null;
const stateListeners = new Set();
const eventHandlers = new Map();

const notifyState = () => stateListeners.forEach(fn => fn(globalConnected));

const reattachHandlers = (socket) => {
  eventHandlers.forEach((handlers, event) => {
    handlers.forEach(h => { socket.off(event, h); socket.on(event, h); });
  });
};

// JWT expiry check — uses the shared safe decoder. Treats missing `exp` as expired
// (was previously treated as forever-valid — see audit P3).
const isTokenExpired = isTokenExpiredHelper;

const doRefresh = async () => {
  try {
    const rt = await SecureStore.getItemAsync('refreshToken');
    if (!rt) return null;
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: rt,
      device_type: 'mobile',
    });
    const r = data?.data || data;
    if (r?.access_token) {
      await SecureStore.setItemAsync('accessToken', r.access_token);
      if (r.refresh_token) await SecureStore.setItemAsync('refreshToken', r.refresh_token);
      return r.access_token;
    }
  } catch (e) {
    console.log('[socket] token refresh failed:', e.message);
  }
  return null;
};

const getFreshToken = async () => {
  const token = await SecureStore.getItemAsync('accessToken');
  // If token exists and is NOT expired, use it
  if (token && !isTokenExpired(token)) return token;
  // Token missing or expired — force refresh
  return doRefresh();
};

// Wake up Render server before socket connect (cold start can take 30s+)
const wakeUpServer = async () => {
  try {
    await axios.get(`${API_BASE_URL}/health`, { timeout: 45000 });
  } catch {
    // Server might not have /health — that's OK, the request itself wakes it up
  }
};

const connectSocket = async (forceNew = false) => {
  // Prevent concurrent/duplicate connects
  if (isConnecting && !forceNew) return globalSocket;
  if (globalSocket?.connected && !forceNew) return globalSocket;

  isConnecting = true;
  try {
    // Wake up the server first (Render free tier sleeps after inactivity)
    await wakeUpServer();

    const token = await getFreshToken();
    if (!token) { isConnecting = false; return null; }

    // Same token, already connected
    if (globalSocket?.connected && token === lastToken) { isConnecting = false; return globalSocket; }

    // Disconnect old
    if (globalSocket) {
      globalSocket.removeAllListeners();
      globalSocket.disconnect();
      globalSocket = null;
    }

    lastToken = token;
    console.log('[socket] connecting to', SOCKET_URL);

    const socket = io(SOCKET_URL, {
      auth: { token },
      // Polling-only on mobile — Render's HTTP/1.1 proxy strips the WS upgrade
      // header, which triggers a noisy `connect_error: websocket error` AFTER
      // the polling handshake already succeeded. Polling handles 1k+ msg/sec
      // per user just fine; we can re-enable upgrade once we move to a proper
      // WS-capable proxy (Cloudflare WS, Fly.io, or our own VPS).
      transports: ['polling'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      timeout: 45000,
      forceNew: true,
    });

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id);
      globalConnected = true;
      authRetries = 0;
      notifyState();
      reattachHandlers(socket);
    });

    let reconnectTimer = null;
    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
      globalConnected = false;
      notifyState();
      // Clear any pending reconnect to prevent stacking
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
      if (reason === 'io server disconnect') {
        // Server kicked — refresh token and reconnect
        reconnectTimer = setTimeout(async () => {
          reconnectTimer = null;
          const newToken = await doRefresh();
          if (newToken && socket) {
            socket.auth = { token: newToken };
            lastToken = newToken;
            socket.connect();
          }
        }, 1000);
      }
    });

    let authRetries = 0;
    socket.on('connect_error', async (err) => {
      const msg = err?.message || 'unknown';
      // Only log auth/server failures — silence the noisy transport errors
      // that happen during the polling→websocket upgrade race or on network
      // hiccups (socket.io will auto-retry these anyway).
      if (!/websocket error|xhr poll error|timeout/i.test(msg)) {
        console.log('[socket] connect_error:', msg);
      }
      // On auth failure, try refreshing token (might be expired)
      if (/auth|token|jwt|expired|unauthorized/i.test(msg) && authRetries < 3) {
        authRetries++;
        const newToken = await doRefresh();
        if (newToken) {
          lastToken = newToken;
          socket.auth = { token: newToken };
          await SecureStore.setItemAsync('accessToken', newToken);
        }
      }
    });

    globalSocket = socket;
    return socket;
  } finally {
    isConnecting = false;
  }
};

const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.removeAllListeners();
    globalSocket.disconnect();
    globalSocket = null;
  }
  globalConnected = false;
  lastToken = null;
  isConnecting = false;
  eventHandlers.clear();
  notifyState();
};

// ─── Hook ─────────────────────────────────────────────────────────────────
export default function useSocket() {
  const [connected, setConnected] = useState(globalConnected);
  const { user } = useAuth();
  const appStateRef = useRef(AppState.currentState);
  const didConnect = useRef(false);

  useEffect(() => {
    const handler = (val) => setConnected(val);
    stateListeners.add(handler);
    setConnected(globalConnected);
    return () => stateListeners.delete(handler);
  }, []);

  // Connect once when user available
  useEffect(() => {
    if (user && !didConnect.current) {
      didConnect.current = true;
      connectSocket();
    } else if (!user) {
      didConnect.current = false;
      disconnectSocket();
    }
  }, [user]);

  // Reconnect on foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const wasBg = appStateRef.current.match(/inactive|background/);
      appStateRef.current = next;
      if (wasBg && next === 'active' && user && !globalSocket?.connected) {
        connectSocket(true);
      }
    });
    return () => sub.remove();
  }, [user]);

  const emit = useCallback(async (event, data) => {
    if (!globalSocket?.connected) {
      const s = await connectSocket();
      if (!s?.connected) return { error: 'Not connected' };
      await new Promise(r => setTimeout(r, 300));
      if (!globalSocket?.connected) return { error: 'Not connected' };
    }
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve({ error: 'Timeout' }), 15000);
      try {
        globalSocket.emit(event, data, (response) => {
          clearTimeout(timer);
          resolve(response || { ok: true });
        });
      } catch (e) {
        clearTimeout(timer);
        resolve({ error: e.message });
      }
    });
  }, []);

  const on = useCallback((event, handler) => {
    if (!eventHandlers.has(event)) eventHandlers.set(event, new Set());
    eventHandlers.get(event).add(handler);
    if (globalSocket) { globalSocket.off(event, handler); globalSocket.on(event, handler); }
    return () => {
      const s = eventHandlers.get(event);
      if (s) { s.delete(handler); if (!s.size) eventHandlers.delete(event); }
      if (globalSocket) globalSocket.off(event, handler);
    };
  }, []);

  const sendMessage = useCallback((threadId, message, type = 'text', metadata = null) => {
    return emit('message:send', { threadId, message, message_type: type, metadata });
  }, [emit]);

  const focusThread = useCallback((threadId) => {
    if (globalSocket?.connected) globalSocket.emit('thread:focus', { threadId });
  }, []);

  return { socket: globalSocket, connected, emit, on, sendMessage, focusThread, reconnect: () => connectSocket(true) };
}

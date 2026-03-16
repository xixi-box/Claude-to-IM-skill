import { create } from 'zustand'
import { invoke } from '@tauri-apps/api/tauri'

export interface BridgeStatus {
  running: boolean
  pid: number | null
  platforms: string[]
  last_error: string | null
}

export interface Settings {
  auto_start: boolean
  start_minimized: boolean
  auto_start_bridge: boolean
  notify_on_start: boolean
  notify_on_stop: boolean
  notify_on_message: boolean
  theme: string
  language: string
  message_retention_days: number
}

export interface LogLine {
  time: string
  level: string
  message: string
}

export interface ChatMessage {
  id: string
  session_id: string
  platform: string
  role: string
  content: string
  timestamp: number
}

interface BridgeStore {
  status: BridgeStatus
  settings: Settings
  logs: LogLine[]
  messages: ChatMessage[]

  fetchStatus: () => Promise<void>
  start: () => Promise<void>
  stop: () => Promise<void>
  restart: () => Promise<void>

  fetchSettings: () => Promise<void>
  saveSettings: (settings: Settings) => Promise<void>

  fetchLogs: (lines?: number) => Promise<void>
  fetchMessages: () => Promise<void>
  clearMessages: (sessionId?: string) => Promise<void>
}

const defaultSettings: Settings = {
  auto_start: false,
  start_minimized: true,
  auto_start_bridge: false,
  notify_on_start: true,
  notify_on_stop: true,
  notify_on_message: false,
  theme: 'system',
  language: 'zh-CN',
  message_retention_days: 3,
}

export const useBridgeStore = create<BridgeStore>((set, get) => ({
  status: {
    running: false,
    pid: null,
    platforms: [],
    last_error: null,
  },
  settings: defaultSettings,
  logs: [],
  messages: [],

  fetchStatus: async () => {
    try {
      const status = await invoke<BridgeStatus>('get_bridge_status')
      set({ status })
    } catch (e) {
      console.error('Failed to fetch status:', e)
    }
  },

  start: async () => {
    try {
      await invoke('start_bridge')
      await get().fetchStatus()
    } catch (e) {
      console.error('Failed to start:', e)
    }
  },

  stop: async () => {
    try {
      await invoke('stop_bridge')
      await get().fetchStatus()
    } catch (e) {
      console.error('Failed to stop:', e)
    }
  },

  restart: async () => {
    try {
      await invoke('stop_bridge')
      await new Promise(r => setTimeout(r, 1000))
      await invoke('start_bridge')
      await get().fetchStatus()
    } catch (e) {
      console.error('Failed to restart:', e)
    }
  },

  fetchSettings: async () => {
    try {
      const settings = await invoke<Settings>('get_settings')
      set({ settings: settings || defaultSettings })
    } catch (e) {
      console.error('Failed to fetch settings:', e)
    }
  },

  saveSettings: async (settings: Settings) => {
    try {
      await invoke('save_settings', { settings })
      set({ settings })
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  },

  fetchLogs: async (lines = 100) => {
    try {
      const logs = await invoke<LogLine[]>('get_logs', { lines })
      set({ logs })
    } catch (e) {
      console.error('Failed to fetch logs:', e)
    }
  },

  fetchMessages: async () => {
    try {
      const messages = await invoke<ChatMessage[]>('get_messages')
      set({ messages })
    } catch (e) {
      console.error('Failed to fetch messages:', e)
    }
  },

  clearMessages: async (sessionId?: string) => {
    try {
      await invoke('clear_messages', { sessionId })
      await get().fetchMessages()
    } catch (e) {
      console.error('Failed to clear messages:', e)
    }
  },
}))
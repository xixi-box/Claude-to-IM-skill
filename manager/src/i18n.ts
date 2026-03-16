export type Language = 'zh-CN' | 'zh-TW' | 'en'

export const translations = {
  'zh-CN': {
    // 导航
    status: '状态',
    logs: '日志',
    chat: '聊天',
    settings: '设置',
    running: '运行中',
    stopped: '已停止',

    // 状态页
    statusTitle: '状态',
    statusSubtitle: '查看桥接服务状态',
    overview: '概览',
    pid: '进程ID',
    controls: '控制',
    start: '启动',
    stop: '停止',
    restart: '重启',
    connectedPlatforms: '已连接平台',
    lastError: '最近错误',

    // 日志页
    logsTitle: '系统日志',
    logsSubtitle: '查看桥接服务日志',
    all: '全部',
    refresh: '刷新',
    noLogs: '暂无日志',

    // 聊天页
    chatTitle: '聊天记录',
    chatSubtitle: '查看最近消息（自动清理旧消息）',
    allSessions: '全部会话',
    allPlatforms: '全部平台',
    user: '用户',
    clearOld: '清理旧消息',
    clearAll: '清空全部',
    noMessages: '暂无消息',
    messages: '条消息',
    confirmClearAll: '确定清空所有聊天记录？此操作不可撤销。',
    confirmClearOld: '确定清理超过保留天数的旧消息？',

    // 设置页
    settingsTitle: '设置',
    settingsSubtitle: '配置应用偏好设置',
    startup: '启动',
    autoStart: '开机自启动',
    startMinimized: '启动时最小化到托盘',
    autoStartBridge: '启动时自动运行桥接服务',
    notifications: '通知',
    notifyOnStart: '桥接服务启动时通知',
    notifyOnStop: '桥接服务停止时通知',
    notifyOnMessage: '收到新消息时通知',
    dataCleanup: '数据清理',
    messageRetention: '消息保留天数',
    messageRetentionHint: '超过此天数的消息将被自动删除',
    days: '天',
    never: '永不',
    appearance: '外观',
    theme: '主题',
    language: '语言',
    themeSystem: '跟随系统',
    themeLight: '浅色',
    themeDark: '深色',
    reset: '重置',
    save: '保存设置',
  },
  'zh-TW': {
    // 導航
    status: '狀態',
    logs: '日誌',
    chat: '聊天',
    settings: '設置',
    running: '運行中',
    stopped: '已停止',

    // 狀態頁
    statusTitle: '狀態',
    statusSubtitle: '查看橋接服務狀態',
    overview: '概覽',
    pid: '進程ID',
    controls: '控制',
    start: '啟動',
    stop: '停止',
    restart: '重啟',
    connectedPlatforms: '已連接平台',
    lastError: '最近錯誤',

    // 日誌頁
    logsTitle: '系統日誌',
    logsSubtitle: '查看橋接服務日誌',
    all: '全部',
    refresh: '刷新',
    noLogs: '暫無日誌',

    // 聊天頁
    chatTitle: '聊天記錄',
    chatSubtitle: '查看最近消息（自動清理舊消息）',
    allSessions: '全部會話',
    allPlatforms: '全部平台',
    user: '用戶',
    clearOld: '清理舊消息',
    clearAll: '清空全部',
    noMessages: '暫無消息',
    messages: '條消息',
    confirmClearAll: '確定清空所有聊天記錄？此操作不可撤銷。',
    confirmClearOld: '確定清理超過保留天數的舊消息？',

    // 設置頁
    settingsTitle: '設置',
    settingsSubtitle: '配置應用偏好設置',
    startup: '啟動',
    autoStart: '開機自啟動',
    startMinimized: '啟動時最小化到托盤',
    autoStartBridge: '啟動時自動運行橋接服務',
    notifications: '通知',
    notifyOnStart: '橋接服務啟動時通知',
    notifyOnStop: '橋接服務停止時通知',
    notifyOnMessage: '收到新消息時通知',
    dataCleanup: '數據清理',
    messageRetention: '消息保留天數',
    messageRetentionHint: '超過此天數的消息將被自動刪除',
    days: '天',
    never: '永不',
    appearance: '外觀',
    theme: '主題',
    language: '語言',
    themeSystem: '跟隨系統',
    themeLight: '淺色',
    themeDark: '深色',
    reset: '重置',
    save: '保存設置',
  },
  en: {
    // Navigation
    status: 'Status',
    logs: 'Logs',
    chat: 'Chat',
    settings: 'Settings',
    running: 'Running',
    stopped: 'Stopped',

    // Status page
    statusTitle: 'Status',
    statusSubtitle: 'View bridge service status',
    overview: 'Overview',
    pid: 'PID',
    controls: 'Controls',
    start: 'Start',
    stop: 'Stop',
    restart: 'Restart',
    connectedPlatforms: 'Connected Platforms',
    lastError: 'Last Error',

    // Logs page
    logsTitle: 'System Logs',
    logsSubtitle: 'View bridge service logs',
    all: 'All',
    refresh: 'Refresh',
    noLogs: 'No logs',

    // Chat page
    chatTitle: 'Chat History',
    chatSubtitle: 'View recent messages (auto-cleanup enabled)',
    allSessions: 'All Sessions',
    allPlatforms: 'All Platforms',
    user: 'User',
    clearOld: 'Clear Old',
    clearAll: 'Clear All',
    noMessages: 'No messages',
    messages: 'messages',
    confirmClearAll: 'Clear all chat history? This cannot be undone.',
    confirmClearOld: 'Clear messages older than retention days?',

    // Settings page
    settingsTitle: 'Settings',
    settingsSubtitle: 'Configure application preferences',
    startup: 'Startup',
    autoStart: 'Auto-start on login',
    startMinimized: 'Start minimized to tray',
    autoStartBridge: 'Auto-start bridge on launch',
    notifications: 'Notifications',
    notifyOnStart: 'Notify on bridge start',
    notifyOnStop: 'Notify on bridge stop',
    notifyOnMessage: 'Notify on new message',
    dataCleanup: 'Data Cleanup',
    messageRetention: 'Message retention (days)',
    messageRetentionHint: 'Messages older than this will be automatically deleted',
    days: 'days',
    never: 'Never',
    appearance: 'Appearance',
    theme: 'Theme',
    language: 'Language',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    reset: 'Reset',
    save: 'Save Settings',
  }
}

export type TranslationKey = keyof typeof translations['zh-CN']

export function getTranslation(lang: string, key: TranslationKey): string {
  const validLang: Language = (lang === 'zh-CN' || lang === 'zh-TW' || lang === 'en') ? lang : 'zh-CN'
  return translations[validLang]?.[key] || translations['zh-CN'][key] || key
}
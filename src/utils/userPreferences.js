// 用户偏好设置的默认配置和数据模型

// 默认用户偏好设置
export const DEFAULT_USER_PREFERENCES = {
  // 主题设置: light, dark, system
  theme: 'system',
  
  // 通知开关
  notificationEnabled: true,
  
  // 每日提醒时间 (HH:mm格式)
  dailyReminderTime: '09:00',
  
  // 自动保存进度
  autoSaveProgress: true,
  
  // 首次启动标识
  firstLaunch: true,
  
  // 最后同步时间
  lastSyncTime: 0,
  
};

// 可选的主题值
export const THEME_OPTIONS = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' }
];


// 验证用户偏好设置
export const validateUserPreferences = (preferences) => {
  const validated = { ...DEFAULT_USER_PREFERENCES };
  
  if (preferences) {
    // 验证主题设置
    if (preferences.theme && ['light', 'dark', 'system'].includes(preferences.theme)) {
      validated.theme = preferences.theme;
    }
    
    // 验证布尔值设置
    if (typeof preferences.notificationEnabled === 'boolean') {
      validated.notificationEnabled = preferences.notificationEnabled;
    }
    
    if (typeof preferences.autoSaveProgress === 'boolean') {
      validated.autoSaveProgress = preferences.autoSaveProgress;
    }
    
    if (typeof preferences.firstLaunch === 'boolean') {
      validated.firstLaunch = preferences.firstLaunch;
    }
    
    // 验证每日提醒时间格式 (HH:mm)
    if (typeof preferences.dailyReminderTime === 'string') {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (timeRegex.test(preferences.dailyReminderTime)) {
        validated.dailyReminderTime = preferences.dailyReminderTime;
      }
    }
    
    // 验证数字值
    if (typeof preferences.lastSyncTime === 'number' && preferences.lastSyncTime >= 0) {
      validated.lastSyncTime = preferences.lastSyncTime;
    }
    
    // 验证应用版本
    if (typeof preferences.appVersion === 'string' && preferences.appVersion.length > 0) {
      validated.appVersion = preferences.appVersion;
    }
  }
  
  return validated;
};

export default {
  DEFAULT_USER_PREFERENCES,
  THEME_OPTIONS,
  validateUserPreferences
};
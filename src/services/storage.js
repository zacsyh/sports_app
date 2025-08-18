// localStorage操作工具函数
import { DEFAULT_USER_PREFERENCES, validateUserPreferences } from '../utils/userPreferences';

const USER_PREFERENCES_KEY = 'user_preferences';

// 初始化用户偏好设置
export const initializeUserPreferences = async () => {
  try {
    const existingPreferences = getUserPreferences();
    
    // 如果没有现有设置，使用默认设置
    if (!existingPreferences) {
      setUserPreferences(DEFAULT_USER_PREFERENCES);
      return DEFAULT_USER_PREFERENCES;
    }
    
    // 验证现有设置并返回
    const validatedPreferences = validateUserPreferences(existingPreferences);
    setUserPreferences(validatedPreferences);
    return validatedPreferences;
  } catch (error) {
    console.error('初始化用户偏好设置失败:', error);
    // 即使初始化失败，也返回默认设置以确保应用可以运行
    return DEFAULT_USER_PREFERENCES;
  }
};

// 获取所有用户偏好设置
export const getUserPreferences = () => {
  try {
    const preferences = localStorage.getItem(USER_PREFERENCES_KEY);
    return preferences ? JSON.parse(preferences) : null;
  } catch (error) {
    console.error('获取用户偏好设置失败:', error);
    return null;
  }
};

// 设置所有用户偏好设置
export const setUserPreferences = (preferences) => {
  try {
    const validatedPreferences = validateUserPreferences(preferences);
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(validatedPreferences));
    return validatedPreferences;
  } catch (error) {
    console.error('设置用户偏好设置失败:', error);
    throw new Error('保存设置失败，请重试');
  }
};

// 更新用户偏好设置
export const updateUserPreferences = (updates) => {
  try {
    const currentPreferences = getUserPreferences() || {};
    const newPreferences = { ...currentPreferences, ...updates };
    const validatedPreferences = validateUserPreferences(newPreferences);
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(validatedPreferences));
    return validatedPreferences;
  } catch (error) {
    console.error('更新用户偏好设置失败:', error);
    throw new Error('更新设置失败，请重试');
  }
};

// 获取特定偏好设置
export const getPreference = (key) => {
  try {
    const preferences = getUserPreferences();
    return preferences ? preferences[key] : null;
  } catch (error) {
    console.error(`获取偏好设置项 ${key} 失败:`, error);
    return null;
  }
};

// 设置特定偏好设置
export const setPreference = (key, value) => {
  try {
    const preferences = getUserPreferences() || {};
    preferences[key] = value;
    const validatedPreferences = validateUserPreferences(preferences);
    localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(validatedPreferences));
    return validatedPreferences;
  } catch (error) {
    console.error(`设置偏好设置项 ${key} 失败:`, error);
    throw new Error(`保存设置项 ${key} 失败，请重试`);
  }
};

// 清除所有偏好设置
export const clearAllPreferences = () => {
  try {
    localStorage.removeItem(USER_PREFERENCES_KEY);
  } catch (error) {
    console.error('清除所有偏好设置失败:', error);
    throw new Error('清除设置失败，请重试');
  }
};

// 重置为默认偏好设置
export const resetToDefaultPreferences = () => {
  try {
    setUserPreferences(DEFAULT_USER_PREFERENCES);
    return DEFAULT_USER_PREFERENCES;
  } catch (error) {
    console.error('重置为默认偏好设置失败:', error);
    throw new Error('重置设置失败，请重试');
  }
};

export default {
  initializeUserPreferences,
  getUserPreferences,
  setUserPreferences,
  updateUserPreferences,
  getPreference,
  setPreference,
  clearAllPreferences,
  resetToDefaultPreferences
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initializeUserPreferences, 
  getUserPreferences, 
  updateUserPreferences,
  setPreference
} from '../../services/storage';

// 创建设置上下文
const SettingsContext = createContext();

// 设置提供者组件
export const SettingsProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化用户偏好设置
  useEffect(() => {
    const initPreferences = async () => {
      try {
        setLoading(true);
        const initialPreferences = await initializeUserPreferences();
        setPreferences(initialPreferences);
      } catch (err) {
        console.error('初始化用户偏好设置失败:', err);
        setError('初始化设置失败');
      } finally {
        setLoading(false);
      }
    };

    initPreferences();
  }, []);

  // 更新偏好设置
  const updatePreferences = async (updates) => {
    try {
      const updatedPreferences = await updateUserPreferences(updates);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error('更新偏好设置失败:', err);
      setError(err.message || '更新设置失败');
      throw err;
    }
  };

  // 更新单个偏好设置项
  const updatePreference = async (key, value) => {
    try {
      const updatedPreferences = await setPreference(key, value);
      setPreferences(updatedPreferences);
      return updatedPreferences;
    } catch (err) {
      console.error(`更新偏好设置项 ${key} 失败:`, err);
      setError(err.message || `更新设置项 ${key} 失败`);
      throw err;
    }
  };

  // 重置为默认设置
  const resetToDefaults = async () => {
    try {
      const { resetToDefaultPreferences } = await import('../../services/storage');
      const defaultPreferences = await resetToDefaultPreferences();
      setPreferences(defaultPreferences);
      return defaultPreferences;
    } catch (err) {
      console.error('重置为默认设置失败:', err);
      setError(err.message || '重置设置失败');
      throw err;
    }
  };

  // 获取单个偏好设置项的值
  const getPreferenceValue = (key) => {
    return preferences ? preferences[key] : null;
  };

  // 应用主题到文档
  const applyTheme = (theme) => {
    const html = document.documentElement;
    
    // 清除现有的主题类
    html.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      // 根据系统偏好设置主题
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      html.classList.add(systemTheme);
    } else {
      // 应用指定的主题
      html.classList.add(theme);
    }
  };

  // 当偏好设置改变时应用主题
  useEffect(() => {
    if (preferences && preferences.theme) {
      applyTheme(preferences.theme);
    }
  }, [preferences?.theme]);

  const contextValue = {
    preferences,
    loading,
    error,
    updatePreferences,
    updatePreference,
    resetToDefaults,
    getPreferenceValue,
    applyTheme
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// 自定义hook用于访问设置上下文
export const useSettings = () => {
  const context = useContext(SettingsContext);
  
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  
  return context;
};

export default SettingsContext;
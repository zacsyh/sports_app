import React, { useState, useEffect } from 'react';
import { useSettings } from '../components/settings/SettingsContext';
import { THEME_OPTIONS } from '../utils/userPreferences';
import Toast from '../components/common/Toast';
import BottomNavigation from '../components/layout/BottomNavigation';

const Settings = () => {
  const {
    preferences,
    loading,
    error,
    updatePreference,
    resetToDefaults
  } = useSettings();

  const [toast, setToast] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // 显示Toast消息
  const showToast = (message, type = 'success', action = null, onAction = null) => {
    setToast({ message, type, action, onAction });
  };

  // 关闭Toast消息
  const closeToast = () => {
    setToast(null);
  };

  // 处理设置更改
  const handlePreferenceChange = async (key, value) => {
    try {
      await updatePreference(key, value);
      showToast('设置已保存');
    } catch (err) {
      console.error(`更新设置项 ${key} 失败:`, err);
      showToast('设置保存失败，请重试', 'error', 'retry', () => handlePreferenceChange(key, value));
    }
  };

  // 处理主题更改
  const handleThemeChange = (theme) => {
    handlePreferenceChange('theme', theme);
  };

  
  // 处理开关更改
  const handleToggleChange = (key, value) => {
    handlePreferenceChange(key, value);
  };

  // 处理时间更改
  const handleTimeChange = (time) => {
    handlePreferenceChange('dailyReminderTime', time);
  };

  // 重置为默认设置
  const handleResetToDefaults = async () => {
    if (window.confirm('确定要重置所有设置为默认值吗？')) {
      try {
        setIsResetting(true);
        await resetToDefaults();
        showToast('设置已重置为默认值');
      } catch (err) {
        console.error('重置设置失败:', err);
        showToast('重置设置失败，请重试', 'error');
      } finally {
        setIsResetting(false);
      }
    }
  };

  // 重新查看引导
  const handleRevisitGuide = () => {
    handlePreferenceChange('firstLaunch', true);
    showToast('引导已重置，应用将重新启动', 'success');
    // 模拟应用重启
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading">加载中...</div>
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-page">
        <div className="error">加载设置失败: {error}</div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>设置</h1>
      </header>

      <main className="settings-content">
        {/* 用户偏好设置分组 */}
        <section className="settings-section">
          <h2 className="section-title">用户偏好设置</h2>
          
          {/* 主题设置项 */}
          <div className="setting-item">
            <div className="setting-info">
              <h3>主题</h3>
              <p>选择应用主题</p>
            </div>
            <div className="setting-control">
              <select
                value={preferences?.theme || 'system'}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="setting-select"
              >
                {THEME_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
                    
          {/* 通知开关项 */}
          <div className="setting-item">
            <div className="setting-info">
              <h3>通知</h3>
              <p>允许应用发送通知</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences?.notificationEnabled ?? true}
                  onChange={(e) => handleToggleChange('notificationEnabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          
          {/* 每日提醒时间项 */}
          <div className="setting-item">
            <div className="setting-info">
              <h3>每日提醒时间</h3>
              <p>设置每日健身提醒时间</p>
            </div>
            <div className="setting-control">
              <input
                type="time"
                value={preferences?.dailyReminderTime || '09:00'}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="setting-time"
              />
            </div>
          </div>
          
          {/* 自动保存进度项 */}
          <div className="setting-item">
            <div className="setting-info">
              <h3>自动保存进度</h3>
              <p>在应用后台时自动保存跟踪进度</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferences?.autoSaveProgress ?? true}
                  onChange={(e) => handleToggleChange('autoSaveProgress', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </section>

        {/* 应用信息分组 */}
        <section className="settings-section">
          <h2 className="section-title">应用信息</h2>
          
          {/* 首次启动引导项 */}
          <div className="setting-item">
            <div className="setting-info">
              <h3>重新查看引导</h3>
              <p>重新查看应用的首次使用引导</p>
            </div>
            <div className="setting-control">
              <button
                onClick={handleRevisitGuide}
                className="setting-button"
              >
                重新查看
              </button>
            </div>
          </div>
          
          {/* 应用版本信息项 */}
          <div className="setting-item">
            <div className="setting-info">
              <h3>应用版本</h3>
              <p>当前安装的应用版本</p>
            </div>
            <div className="setting-control">
              <span className="setting-value">
                1.0.5
              </span>
            </div>
          </div>
        </section>

        {/* 重置设置按钮 */}
        <div className="settings-footer">
          <button
            onClick={handleResetToDefaults}
            disabled={isResetting}
            className="reset-button"
          >
            {isResetting ? '重置中...' : '重置为默认设置'}
          </button>
        </div>
      </main>

      {/* 底部导航栏 */}
      <BottomNavigation />

      {/* Toast消息 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onAction={toast.onAction}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default Settings;

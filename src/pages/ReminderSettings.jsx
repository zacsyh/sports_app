import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import db from '../services/database';
import Toast from '../components/common/Toast';
import BottomNavigation from '../components/layout/BottomNavigation';

const ReminderSettings = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  
  // 提醒设置状态
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [remindBefore, setRemindBefore] = useState(30);
  
  // 表单验证错误状态
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProjectAndReminder();
  }, [id]);

  const loadProjectAndReminder = async () => {
    try {
      setLoading(true);
      
      // 加载项目信息
      const projectData = await db.fitness_projects.get(id);
      if (!projectData) {
        setError('项目不存在');
        return;
      }
      setProject(projectData);
      
      // 加载提醒设置（如果存在）
      const existingReminder = await db.reminders
        .where('projectId')
        .equals(id)
        .first();
      
      if (existingReminder) {
        setReminderEnabled(existingReminder.enabled);
        setDeadline(new Date(existingReminder.deadline).toISOString().slice(0, 16));
        setRemindBefore(existingReminder.remindBefore);
      }
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (reminderEnabled) {
      if (!deadline) {
        newErrors.deadline = '请选择截止日期和时间';
      } else {
        const deadlineTime = new Date(deadline).getTime();
        if (deadlineTime <= Date.now()) {
          newErrors.deadline = '截止时间必须晚于当前时间';
        }
      }
      
      if (remindBefore <= 0 || remindBefore > 1440) {
        newErrors.remindBefore = '提前时间必须在1-1440分钟之间';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const existingReminder = await db.reminders
        .where('projectId')
        .equals(id)
        .first();
      
      const reminderData = {
        projectId: id,
        enabled: reminderEnabled,
        deadline: reminderEnabled ? new Date(deadline).getTime() : null,
        remindBefore: reminderEnabled ? remindBefore : 0,
        updatedAt: Date.now()
      };
      
      if (existingReminder) {
        // 更新现有提醒
        await db.reminders.update(existingReminder.id, reminderData);
      } else {
        // 创建新提醒
        reminderData.createdAt = Date.now();
        await db.reminders.add(reminderData);
      }
      
      setToast({message: '提醒设置已保存', type: 'success'});
      setTimeout(() => {
        navigate(`/project/${id}`);
      }, 1500);
    } catch (err) {
      console.error('保存提醒设置失败:', err);
      setToast({message: '提醒设置保存失败，请重试', type: 'error'});
    }
  };

  const handleCancel = () => {
    navigate(`/project/${id}`);
  };

  const handleRetry = () => {
    setError(null);
    loadProjectAndReminder();
  };

  if (loading) {
    return (
      <div className="reminder-settings-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reminder-settings-page">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        <div className="error-state">
          <p>{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="reminder-settings-page">
        <div className="empty-state">
          <p>项目不存在</p>
          <button className="primary-button" onClick={() => navigate('/')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reminder-settings-page">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* 顶部导航栏 */}
      <header className="reminder-settings-header">
        <button className="back-button" onClick={handleCancel}>
          ←
        </button>
        <h1 className="page-title">提醒设置</h1>
        <button className="save-button" onClick={handleSave}>
          保存
        </button>
      </header>

      <div className="reminder-settings-content">
        {/* 项目信息卡片 */}
        <div className="card">
          <h2>项目信息</h2>
          <div className="project-info">
            <p className="project-name">{project.name}</p>
            {project.description && (
              <p className="project-description">{project.description}</p>
            )}
            <div className="project-type-tag">
              {project.type === 'SETS_REPS' ? 'Sets×Reps' : 'Total count/weight'}
            </div>
          </div>
        </div>

        {/* 提醒设置卡片 */}
        <div className="card">
          <h2>提醒设置</h2>
          <div className="reminder-form">
            {/* 提醒开关 */}
            <div className="form-group">
              <div className="switch-container">
                <span>启用提醒</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* 截止日期和时间设置 */}
            <div className="form-group">
              <label htmlFor="deadline">截止日期和时间</label>
              <input
                type="datetime-local"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className={errors.deadline ? 'error' : ''}
                disabled={!reminderEnabled}
              />
              {errors.deadline && (
                <div className="error-message">{errors.deadline}</div>
              )}
            </div>

            {/* 提前时间设置 */}
            <div className="form-group">
              <label htmlFor="remindBefore">提前多少分钟提醒</label>
              <input
                type="number"
                id="remindBefore"
                value={remindBefore}
                onChange={(e) => setRemindBefore(parseInt(e.target.value) || 0)}
                min="1"
                max="1440"
                className={errors.remindBefore ? 'error' : ''}
                disabled={!reminderEnabled}
              />
              {errors.remindBefore && (
                <div className="error-message">{errors.remindBefore}</div>
              )}
              <div className="helper-text">请输入1-1440之间的整数（最多24小时）</div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="reminder-settings-actions">
        <button className="secondary-button" onClick={handleCancel}>
          取消
        </button>
        <button className="primary-button" onClick={handleSave}>
          保存
        </button>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default ReminderSettings;
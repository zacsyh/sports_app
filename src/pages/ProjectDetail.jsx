import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import db from '../services/database';
import Toast from '../components/common/Toast';
import CircularProgress from '../components/common/CircularProgress';
import BottomNavigation from '../components/layout/BottomNavigation';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [reminder, setReminder] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadProject();
    loadReminder();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const projectData = await db.fitness_projects.get(id);
      if (projectData) {
        setProject(projectData);
        
        // 加载历史记录
        const records = await db.progress_records
          .where('projectId')
          .equals(id)
          .sortBy('timestamp');
        setHistoryRecords(records); // 显示所有历史记录
      } else {
        setError('项目不存在');
      }
    } catch (err) {
      console.error('加载项目失败:', err);
      setError('加载项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const loadReminder = async () => {
    try {
      const reminderData = await db.reminders
        .where('projectId')
        .equals(id)
        .first();
      if (reminderData) {
        setReminder(reminderData);
      }
    } catch (err) {
      console.error('加载提醒信息失败:', err);
    }
  };

  const handleDelete = () => {
    // 显示自定义确认对话框
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // 删除项目相关的所有数据
      // 1. 删除项目本身
      await db.fitness_projects.delete(id);
      
      // 2. 删除相关的进度记录
      await db.progress_records.where('projectId').equals(id).delete();
      
      // 3. 删除相关的提醒（如果有的话）
      // 添加错误处理，以防reminders表不存在或没有projectId索引
      try {
        await db.reminders.where('projectId').equals(id).delete();
      } catch (reminderError) {
        console.warn('删除提醒数据时出错（可能是因为数据库版本问题）:', reminderError);
        // 继续执行，不中断删除流程
      }
      
      // 关闭确认对话框
      setShowDeleteConfirm(false);
      
      setToast({message: '项目删除成功', type: 'success'});
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('删除项目失败:', err);
      setToast({message: '删除项目失败，请重试', type: 'error'});
      // 关闭确认对话框
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleRetry = () => {
    setError(null);
    loadProject();
  };

  const handleEditHistory = (record) => {
    setEditingRecord(record);
    setEditValue(record.value.toString());
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord || !editValue) return;
    
    try {
      const newValue = parseInt(editValue);
      if (isNaN(newValue) || newValue < 0) {
        setToast({message: '请输入有效的数值', type: 'error'});
        return;
      }
      
      // 验证数值是否合理
      if (project.type === 'SETS_REPS') {
        if (newValue > project.repsPerSet * 10) { // 设置一个合理的上限
          setToast({message: '完成组数过大，请检查输入', type: 'error'});
          return;
        }
      } else if (project.type === 'TOTAL_COUNT') {
        if (newValue > project.targetCount * 10) { // 设置一个合理的上限
          setToast({message: '完成次数过大，请检查输入', type: 'error'});
          return;
        }
      }
      
      // 更新进度记录
      await db.progress_records.update(editingRecord.id, { value: newValue });
      
      // 如果是SETS_REPS类型，还需要更新项目中的completedSets
      if (project.type === 'SETS_REPS' && project.completedSets) {
        // 重新计算completedSets数组
        const updatedHistory = await db.progress_records
          .where('projectId')
          .equals(id)
          .sortBy('timestamp');
        
        // 重新构建completedSets数组
        const newCompletedSets = updatedHistory
          .filter(record => record.type === 'SETS_REPS')
          .map(record => record.value);
        
        // 更新项目
        const updatedProject = {
          ...project,
          completedSets: newCompletedSets,
          updatedAt: Date.now()
        };
        await db.fitness_projects.update(id, updatedProject);
        setProject(updatedProject);
      } else if (project.type === 'TOTAL_COUNT') {
        // 更新TOTAL_COUNT类型的项目
        const updatedProject = {
          ...project,
          currentCount: newValue,
          updatedAt: Date.now()
        };
        await db.fitness_projects.update(id, updatedProject);
        setProject(updatedProject);
      }
      
      // 重新加载历史记录
      const records = await db.progress_records
        .where('projectId')
        .equals(id)
        .sortBy('timestamp');
      setHistoryRecords(records);
      
      setShowEditModal(false);
      setToast({message: '记录更新成功', type: 'success'});
    } catch (err) {
      console.error('更新记录失败:', err);
      setToast({message: '更新记录失败，请重试', type: 'error'});
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingRecord(null);
    setEditValue('');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeadline = (deadline, createdAt) => {
    const deadlineDate = new Date(deadline);
    const createdDate = new Date(createdAt);
    
    // 检查是否同一天
    if (deadlineDate.getFullYear() === createdDate.getFullYear() &&
        deadlineDate.getMonth() === createdDate.getMonth() &&
        deadlineDate.getDate() === createdDate.getDate()) {
      // 同一天，只显示小时和分钟
      return deadlineDate.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      // 不同天，显示完整日期和时间
      return deadlineDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-');
    }
  };

  const calculateTimeRemaining = (deadline) => {
    const now = Date.now();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;
    
    if (diff <= 0) {
      return '已过期';
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}天${hours}小时${minutes}分钟`;
    } else if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  const calculateProgress = (project) => {
    if (project.type === 'SETS_REPS') {
      // 计算实际完成的总组数，而不是操作次数
      const totalCompletedSets = project.completedSets 
        ? project.completedSets.reduce((sum, count) => sum + count, 0) 
        : 0;
      return project.sets > 0 ? (totalCompletedSets / project.sets) * 100 : 0;
    } else {
      return project.targetCount > 0 ? (project.currentCount || 0) / project.targetCount * 100 : 0;
    }
  };

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-detail-page">
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
      <div className="project-detail-page">
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
    <CSSTransition in={true} timeout={300} classNames="page" appear>
      <div className="project-detail-page">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        
        {/* 编辑历史记录模态框 */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>编辑记录</h3>
              <div className="form-group">
                <label htmlFor="editValue">完成组数</label>
                <input
                  type="number"
                  id="editValue"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  min="0"
                  className="edit-value-input"
                />
              </div>
              <div className="modal-actions">
                <button className="secondary-button" onClick={handleCancelEdit}>
                  取消
                </button>
                <button className="primary-button" onClick={handleSaveEdit}>
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 删除确认对话框 */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>确认删除</h3>
              <p>确定要删除此项目吗？此操作不可撤销。</p>
              <div className="modal-actions">
                <button className="secondary-button" onClick={cancelDelete}>
                  取消
                </button>
                <button className="primary-button delete-confirm-button" onClick={confirmDelete}>
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 顶部导航栏 */}
        <header className="project-detail-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ←
          </button>
          <h1 className="project-title">{project.name}</h1>
          <Link to={`/project/${id}/edit`} className="edit-button">
            编辑
          </Link>
        </header>

        <div className="project-detail-content">
          {/* 项目基本信息卡片 */}
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
              {/* 显示已完成状态 */}
              {project.type === 'SETS_REPS' && project.completedSets && project.completedSets.reduce((sum, count) => sum + count, 0) >= project.sets && (
                <div className="project-completed-tag">
                  已完成
                </div>
              )}
              {project.type === 'TOTAL_COUNT' && project.currentCount >= project.targetCount && (
                <div className="project-completed-tag">
                  已完成
                </div>
              )}
              {/* 显示提醒状态 */}
              {reminder && reminder.enabled && (
                <div className="project-reminder-tag">
                  已设置提醒: {formatDeadline(reminder.deadline, project.createdAt)} (剩余: {calculateTimeRemaining(reminder.deadline)})
                </div>
              )}
              <p className="project-created-at">
                创建时间: {formatDate(project.createdAt)}
              </p>
            </div>
          </div>

          {/* 项目目标信息卡片 */}
          <div className="card">
            <h2>目标</h2>
            <div className="project-goal">
              {project.type === 'SETS_REPS' ? (
                <p>{project.sets}组 × {project.repsPerSet}次</p>
              ) : (
                <p>{project.targetCount}次{project.targetWeight ? ` (${project.targetWeight}kg)` : ''}</p>
              )}
            </div>
          </div>

          {/* 进度可视化区域 */}
          <div className="card">
            <h2>进度</h2>
            <div className="progress-section">
              <div className="circular-progress-wrapper">
                <CircularProgress percentage={calculateProgress(project)} />
              </div>
              {project.type === 'SETS_REPS' ? (
                <div className="sets-reps-progress">
                  <p>已完成 {
                    project.completedSets 
                      ? project.completedSets.reduce((sum, count) => sum + count, 0) 
                      : 0
                  } 组/共 {project.sets} 组</p>
                </div>
              ) : (
                <div className="count-weight-progress">
                  <p>已完成 {project.currentCount || 0} 次/共 {project.targetCount} 次</p>
                </div>
              )}
            </div>
          </div>

          {/* 历史记录区域 */}
          <div className="card">
            <h2>历史记录</h2>
            <div className="history-section">
              {historyRecords.length > 0 ? (
                <ul className="history-list">
                  {historyRecords.map((record) => (
                    <li key={record.id} className="history-item">
                      <div className="history-item-content">
                        <span className="history-item-time">
                          {formatDate(record.timestamp)}
                        </span>
                        <span className="history-item-value">
                          {record.type === 'SETS_REPS' 
                            ? `完成 ${record.value} 组` 
                            : `完成 ${record.value} 次`}
                        </span>
                        <button 
                          className="edit-history-button"
                          onClick={() => handleEditHistory(record)}
                        >
                          编辑
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-history">暂无历史记录</p>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作按钮区域 */}
        <div className="project-detail-actions">
          <button 
            className="secondary-button" 
            onClick={() => navigate(`/project/${id}/reminder`)}
          >
            提醒设置
          </button>
          <button 
            className="primary-button" 
            onClick={() => navigate(`/tracking/${id}`)}
          >
            开始
          </button>
        </div>
        
        <BottomNavigation />
      </div>
    </CSSTransition>
  );
};

export default ProjectDetail;
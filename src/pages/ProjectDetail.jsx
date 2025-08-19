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
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadProject();
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

  const handleDelete = async () => {
    if (window.confirm('确定要删除此项目吗？此操作不可撤销。')) {
      try {
        await db.fitness_projects.delete(id);
        setToast({message: '项目删除成功', type: 'success'});
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (err) {
        console.error('删除项目失败:', err);
        setToast({message: '删除项目失败，请重试', type: 'error'});
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    loadProject();
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
              {project.type === 'SETS_REPS' && project.completedSets && project.completedSets.length >= project.sets && (
                <div className="project-completed-tag">
                  已完成
                </div>
              )}
              {project.type === 'TOTAL_COUNT' && project.currentCount >= project.targetCount && (
                <div className="project-completed-tag">
                  已完成
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
          <button className="delete-button" onClick={handleDelete}>
            删除
          </button>
          <button className="secondary-button" onClick={() => navigate(`/project/${id}/edit`)}>
            编辑
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
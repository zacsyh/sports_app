import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import db from '../services/database';
import BottomNavigation from '../components/layout/BottomNavigation';
import ProjectCard from '../components/common/ProjectCard';
import AddButton from '../components/common/AddButton';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [reminders, setReminders] = useState({});
  const [loading, setLoading] = useState(true);
  const [confirmDeleteProjectId, setConfirmDeleteProjectId] = useState(null);
  const location = useLocation();

  useEffect(() => {
    loadProjects();
    loadReminders();
  }, [location]);

  const loadProjects = async () => {
    try {
      console.log('开始加载项目...');
      console.log('数据库版本:', db.verno);
      console.log('数据库表结构:', db.tables.map(table => table.name));
      
      // 先尝试不排序的查询
      const allProjectsUnsorted = await db.fitness_projects.toArray();
      console.log('未排序的项目:', allProjectsUnsorted);
      
      // 再尝试排序查询
      const allProjects = await db.fitness_projects.orderBy('createdAt').reverse().toArray();
      console.log('从数据库查询到的项目:', allProjects);
      console.log('项目数量:', allProjects.length);
      
      // 实现自动清空功能：过滤掉前一天已完成的项目
      const today = new Date().toISOString().split('T')[0];
      const filteredProjects = allProjects.filter(project => {
        // 如果项目已完成且完成日期不是今天，则隐藏该项目
        if (project.status === 'COMPLETED' && project.completedDate && project.completedDate !== today) {
          console.log(`隐藏前一天已完成的项目: ${project.name}, 完成日期: ${project.completedDate}`);
          return false; // 隐藏前一天已完成的项目
        }
        return true; // 显示进行中的项目和当天完成的项目
      });
      
      console.log('过滤后的项目数量:', filteredProjects.length);
      setProjects(filteredProjects);
      setLoading(false);
    } catch (error) {
      console.error('加载项目失败:', error);
      console.error('错误详情:', error.message);
      setLoading(false);
    }
  };

  const loadReminders = async () => {
    try {
      const allReminders = await db.reminders.toArray();
      const remindersMap = {};
      allReminders.forEach(reminder => {
        remindersMap[reminder.projectId] = reminder;
      });
      setReminders(remindersMap);
    } catch (error) {
      console.error('加载提醒失败:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    // 设置确认对话框状态
    setConfirmDeleteProjectId(projectId);
  };

  const confirmDeleteProject = async () => {
    if (!confirmDeleteProjectId) return;
    
    try {
      // 删除项目相关的所有数据
      // 1. 删除项目本身
      await db.fitness_projects.delete(confirmDeleteProjectId);
      
      // 2. 删除相关的进度记录
      await db.progress_records.where('projectId').equals(confirmDeleteProjectId).delete();
      
      // 3. 删除相关的提醒（如果有的话）
      // 添加错误处理，以防reminders表不存在或没有projectId索引
      try {
        await db.reminders.where('projectId').equals(confirmDeleteProjectId).delete();
      } catch (reminderError) {
        console.warn('删除提醒数据时出错（可能是因为数据库版本问题）:', reminderError);
        // 继续执行，不中断删除流程
      }
      
      // 关闭确认对话框
      setConfirmDeleteProjectId(null);
      
      // 重新加载项目列表
      loadProjects();
      loadReminders();
    } catch (error) {
      console.error('删除项目失败:', error);
      // 这里可以添加错误提示
      setConfirmDeleteProjectId(null);
    }
  };

  const cancelDeleteProject = () => {
    setConfirmDeleteProjectId(null);
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

  return (
    <div className="home-page">
      {/* 删除确认对话框 */}
      {confirmDeleteProjectId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>确认删除</h3>
            <p>确定要删除此项目吗？此操作不可撤销。</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={cancelDeleteProject}>
                取消
              </button>
              <button className="primary-button delete-confirm-button" onClick={confirmDeleteProject}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="home-header">
        <h1>我的健身项目</h1>
        <Link to="/create" className="create-button">
          <AddButton />
        </Link>
      </header>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>还没有健身项目</p>
          <Link to="/create" className="create-project-button">
            创建第一个项目
          </Link>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDeleteProject}
              reminders={reminders}
              formatDeadline={formatDeadline}
              calculateTimeRemaining={calculateTimeRemaining}
            />
          ))}
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default Home;
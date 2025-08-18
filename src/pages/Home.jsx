import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import db from '../services/database';
import BottomNavigation from '../components/layout/BottomNavigation';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadProjects();
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
      setProjects(allProjects);
      setLoading(false);
    } catch (error) {
      console.error('加载项目失败:', error);
      console.error('错误详情:', error.message);
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await db.fitness_projects.delete(projectId);
      loadProjects(); // 重新加载项目列表
    } catch (error) {
      console.error('删除项目失败:', error);
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>我的健身项目</h1>
        <Link to="/create" className="create-button">
          +
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
            <div key={project.id} className="project-card">
              <Link to={`/project/${project.id}`} className="project-link">
                <h3>{project.name}</h3>
                <p>{project.description}</p>
                <div className="project-type">
                  {project.type === 'SETS_REPS' ? 'Sets×Reps' : 'Total count/weight'}
                </div>
                {/* 显示已完成状态 */}
                {project.type === 'SETS_REPS' && project.completedSets && project.completedSets.length >= project.sets && (
                  <div className="project-completed-home">
                    已完成
                  </div>
                )}
                {project.type === 'TOTAL_COUNT' && project.currentCount >= project.targetCount && (
                  <div className="project-completed-home">
                    已完成
                  </div>
                )}
              </Link>
              <button 
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project.id);
                }}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default Home;
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// 直接导入所有背景图片
import photo1 from '../../assets/images/card-backgrounds/photo1.png';
import photo2 from '../../assets/images/card-backgrounds/photo2.png';
import photo3 from '../../assets/images/card-backgrounds/photo3.png';
import photo4 from '../../assets/images/card-backgrounds/photo4.png';
import photo5 from '../../assets/images/card-backgrounds/photo5.png';
import photo6 from '../../assets/images/card-backgrounds/photo6.png';
import photo7 from '../../assets/images/card-backgrounds/photo7.png';

// 定义背景图片数组
const backgroundImages = [
  photo1,
  photo2,
  photo3,
  photo4,
  photo5,
  photo6,
  photo7
];

const ProjectCard = ({ project, onDelete, reminders, formatDeadline, calculateTimeRemaining }) => {
  // 判断项目是否已完成
  const isCompleted = 
    (project.type === 'SETS_REPS' && project.completedSets && 
     project.completedSets.reduce((sum, count) => sum + count, 0) >= project.sets) ||
    (project.type === 'TOTAL_COUNT' && project.currentCount >= project.targetCount);

  // 计算进度
  const calculateProgress = () => {
    if (project.type === 'SETS_REPS') {
      const totalCompletedSets = project.completedSets 
        ? project.completedSets.reduce((sum, count) => sum + count, 0) 
        : 0;
      return project.sets > 0 ? (totalCompletedSets / project.sets) * 100 : 0;
    } else {
      return project.targetCount > 0 ? (project.currentCount || 0) / project.targetCount * 100 : 0;
    }
  };

  const progress = calculateProgress();
  
  // 动态加载背景图片
  const [backgroundImage, setBackgroundImage] = useState('');
  
  useEffect(() => {
    // 随机选择一个背景图片
    const randomIndex = Math.floor(Math.random() * backgroundImages.length);
    const randomImage = backgroundImages[randomIndex];
    setBackgroundImage(randomImage);
  }, []);

  return (
    <StyledWrapper>
      <div className="card" style={{ 
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundColor: backgroundImage ? 'transparent' : '#f5f5f5'
      }}>
        <Link to={`/project/${project.id}`} className="card-link">
          <div className="card-content">
            <div className="card-header">
              <h3 className="project-name">{project.name}</h3>
              <div className="project-status">
                {isCompleted && (
                  <span className="completed-badge">已完成</span>
                )}
                <span className="progress-text">
                  {project.type === 'SETS_REPS' 
                    ? `${project.completedSets ? project.completedSets.reduce((sum, count) => sum + count, 0) : 0}/${project.sets}`
                    : `${project.currentCount || 0}/${project.targetCount}`}
                </span>
              </div>
            </div>
            <div className="project-type">
              {project.type === 'SETS_REPS' ? 'Sets×Reps' : 'Total count/weight'}
            </div>
            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Link>
        <button 
          className="delete-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(project.id);
          }}
        >
          删除
        </button>
        {/* 显示提醒信息 */}
        {reminders[project.id] && reminders[project.id].enabled && (
          <div className="reminder-info">
            截止: {formatDeadline(reminders[project.id].deadline, project.createdAt)} 
            (剩余: {calculateTimeRemaining(reminders[project.id].deadline)})
          </div>
        )}
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    width: 320px;
    height: 200px;
    color: white;
    position: relative;
    border-radius: 1em;
    padding: 1.5em;
    transition: transform 0.3s ease;
    margin-bottom: 1.5em;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 1em;
    z-index: 1;
  }

  .card-link {
    text-decoration: none;
    color: inherit;
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .card-header {
    display: flex;
    flex-direction: column;
  }

  .project-name {
    font-size: 1.4em;
    font-weight: bold;
    margin: 0 0 0.5em 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .project-status {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .completed-badge {
    background-color: #4CAF50;
    color: white;
    padding: 0.2em 0.6em;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .progress-text {
    font-size: 1em;
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  .project-type {
    font-size: 0.9em;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 0.3em 0.6em;
    border-radius: 12px;
    display: inline-block;
    margin-bottom: 1em;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  }

  .progress-section {
    margin-top: auto;
  }

  .progress-bar {
    width: 100%;
    height: 10px;
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 5px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF6B35, #FF8C42);
    border-radius: 5px;
    transition: width 0.3s ease;
  }

  .delete-button {
    position: absolute;
    top: 1em;
    right: 1em;
    background: rgba(255, 255, 255, 0.3);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    z-index: 3;
    color: white;
    backdrop-filter: blur(5px);
  }

  .delete-button:hover {
    background: rgba(255, 0, 0, 0.7);
    transform: scale(1.1);
  }

  .reminder-info {
    position: absolute;
    bottom: 1em;
    left: 1em;
    right: 1em;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.5em;
    border-radius: 0.5em;
    font-size: 0.8em;
    text-align: center;
    z-index: 3;
    backdrop-filter: blur(5px);
  }

  .card:hover {
    cursor: pointer;
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  .card:active {
    transform: translateY(-2px);
  }
`;

export default ProjectCard;

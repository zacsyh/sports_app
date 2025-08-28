import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import templateService from '../services/templateService';
import db from '../services/database';
import Toast from '../components/common/Toast';
import BottomNavigation from '../components/layout/BottomNavigation';
import BackButton from '../components/common/BackButton';
import styled from 'styled-components';

const CreateProjectFromTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    loadTemplate();
  }, [id]);

  const loadTemplate = async () => {
    try {
      const result = await templateService.getTemplateById(id);
      if (result.success) {
        setTemplate(result.template);
      } else {
        setToast({message: '模板加载失败', type: 'error'});
      }
    } catch (error) {
      console.error('加载模板失败:', error);
      setToast({message: '模板加载失败', type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSelect = (config) => {
    setSelectedConfig(config);
    setProjectName(config.name || '');
    setShowNameDialog(true);
  };

  const handleNameConfirm = async () => {
    if (projectName.trim() && selectedConfig) {
      setShowNameDialog(false);
      await createProjectFromConfig(selectedConfig, projectName.trim());
    }
  };

  const handleNameCancel = () => {
    setShowNameDialog(false);
    setSelectedConfig(null);
    setProjectName('');
  };

  const createProjectFromConfig = async (config, projectName) => {
    setIsSubmitting(true);
    
    try {
      // 准备项目数据 - 直接使用模板配置
      const projectData = {
        id: Date.now().toString(),
        name: projectName,
        description: config.description || `基于模板"${template.name}"创建`,
        type: config.type,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'ACTIVE'
      };
      
      // 根据项目类型添加相应字段
      if (config.type === 'SETS_REPS') {
        projectData.sets = parseInt(config.sets);
        projectData.repsPerSet = parseInt(config.repsPerSet);
        projectData.completedSets = [];
      } else {
        projectData.targetCount = parseInt(config.targetCount);
        projectData.targetWeight = config.targetWeight ? parseFloat(config.targetWeight) : null;
        projectData.currentCount = 0;
        projectData.history = [];
      }
      
      console.log('准备保存项目数据:', projectData);
      const result = await db.fitness_projects.add(projectData);
      console.log('项目保存结果:', result);
      
      setToast({message: '项目创建成功', type: 'success'});
      setTimeout(() => {
        navigate(`/project/${result}`);
      }, 1500);
    } catch (error) {
      console.error('保存项目失败:', error);
      setToast({message: '项目保存失败，请重试', type: 'error'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAllProjects = async () => {
    if (!template || !template.projectList || template.projectList.length === 0) {
      setToast({message: '模板中没有项目配置', type: 'error'});
      return;
    }

    setIsSubmitting(true);
    const successCount = [];
    const failedCount = [];

    try {
      // 逐一创建所有项目
      for (let i = 0; i < template.projectList.length; i++) {
        const config = template.projectList[i];
        try {
          const projectData = {
            id: Date.now().toString() + '_' + i, // 确保唯一ID
            name: config.name || `${template.name}_项目${i + 1}`,
            description: config.description || `基于模板"${template.name}"创建`,
            type: config.type,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: 'ACTIVE'
          };

          // 根据项目类型添加相应字段
          if (config.type === 'SETS_REPS') {
            projectData.sets = parseInt(config.sets);
            projectData.repsPerSet = parseInt(config.repsPerSet);
            projectData.completedSets = [];
          } else {
            projectData.targetCount = parseInt(config.targetCount);
            projectData.targetWeight = config.targetWeight ? parseFloat(config.targetWeight) : null;
            projectData.currentCount = 0;
            projectData.history = [];
          }

          const result = await db.fitness_projects.add(projectData);
          successCount.push({ name: projectData.name, id: result });
          
          // 添加小延迟防止并发问题
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`创建项目 "${config.name}" 失败:`, error);
          failedCount.push(config.name || `项目${i + 1}`);
        }
      }

      // 显示结果
      if (successCount.length === template.projectList.length) {
        setToast({message: `成功创建 ${successCount.length} 个项目！`, type: 'success'});
      } else if (successCount.length > 0) {
        setToast({message: `成功创建 ${successCount.length} 个项目，${failedCount.length} 个失败`, type: 'warning'});
      } else {
        setToast({message: '所有项目创建失败', type: 'error'});
      }

      // 如果有成功创建的项目，2秒后跳转到首页
      if (successCount.length > 0) {
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('批量创建项目失败:', error);
      setToast({message: '批量创建失败，请重试', type: 'error'});
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleRetry = () => {
    setToast(null);
  };

  const handleCancel = () => {
    navigate('/templates');
  };

  if (loading) {
    return (
      <StyledWrapper>
        <div className="create-project-page">
          <div className="loading">加载中...</div>
          <BottomNavigation />
        </div>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <div className="create-project-page create-project-from-template-page">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        {toast && toast.type === 'error' && (
          <div className="retry-button-container">
            <button 
              type="button" 
              className="retry-button" 
              onClick={handleRetry}
              disabled={isSubmitting}
            >
              {isSubmitting ? '重试中...' : '重试'}
            </button>
          </div>
        )}
        <header className="create-project-header">
          <BackButton onClick={handleCancel} text="返回" />
          <h1>基于模板创建项目</h1>
        </header>
        
        {template && (
          <>
            {template.projectList && template.projectList.length > 0 ? (
              <div className="template-configs-section">
                <div className="template-info">
                  <h2>{template.name}</h2>
                  <p className="template-description">该模板包含 {template.projectList.length} 个预设项目配置</p>
                  <div className="batch-create-section">
                    <button 
                      className="btn-create-all" 
                      onClick={handleCreateAllProjects}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? '创建中...' : `一键创建全部 ${template.projectList.length} 个项目`}
                    </button>
                    <p className="batch-description">点击后将基于模板一次性创建所有预设项目</p>
                  </div>
                </div>
                
                <div className="config-preview">
                  <h3>项目预览</h3>
                  <div className="config-grid">
                    {template.projectList.map((config, index) => (
                      <div 
                        key={index}
                        className="config-card preview-card"
                      >
                        <div className="config-header">
                          <h4>{config.name || `项目 ${index + 1}`}</h4>
                          <div className="config-type-badge">
                            {config.type === 'SETS_REPS' ? '组数模式' : '计数模式'}
                          </div>
                        </div>
                        <div className="config-details">
                          {config.type === 'SETS_REPS' ? (
                            <>
                              <div className="detail-item">
                                <span className="label">组数:</span>
                                <span className="value">{config.sets}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label">每组次数:</span>
                                <span className="value">{config.repsPerSet}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="detail-item">
                                <span className="label">目标次数:</span>
                                <span className="value">{config.targetCount}</span>
                              </div>
                              {config.targetWeight && (
                                <div className="detail-item">
                                  <span className="label">目标重量:</span>
                                  <span className="value">{config.targetWeight}kg</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="template-configs-section">
                <div className="empty-state">
                  <h2>模板暂无配置</h2>
                  <p>该模板还没有预设配置，请返回模板页面添加配置后再使用</p>
                  <button className="btn-return" onClick={() => navigate('/templates')}>返回模板页面</button>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* 项目名称输入对话框 */}
        {showNameDialog && (
          <div className="dialog-overlay">
            <div className="dialog-content">
              <h3>创建项目</h3>
              <p>基于配置：<strong>{selectedConfig?.name}</strong></p>
              <div className="input-group">
                <label>项目名称:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="请输入项目名称"
                  autoFocus
                />
              </div>
              <div className="dialog-buttons">
                <button className="btn-cancel" onClick={handleNameCancel}>
                  取消
                </button>
                <button 
                  className="btn-confirm" 
                  onClick={handleNameConfirm}
                  disabled={!projectName.trim() || isSubmitting}
                >
                  {isSubmitting ? '创建中...' : '确认创建'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <BottomNavigation />
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .create-project-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    padding-bottom: 100px;
  }

  .create-project-header {
    margin-bottom: 30px;
  }

  .create-project-header h1 {
    font-size: 28px;
    font-weight: 700;
    text-align: center;
    margin: 20px 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }

  .template-configs-section {
    max-width: 1200px;
    margin: 0 auto;
  }

  .template-info {
    text-align: center;
    margin-bottom: 30px;
  }

  .template-info h2 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #333;
  }

  .template-description {
    font-size: 16px;
    color: #666;
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .batch-create-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
    backdrop-filter: blur(10px);
    text-align: center;
  }

  .batch-create-section p {
    color: #666;
  }

  .btn-create-all {
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
    margin-bottom: 12px;
    min-width: 200px;
  }

  .btn-create-all:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }

  .btn-create-all:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  .batch-description {
    color: #666;
    margin: 0;
    font-size: 14px;
  }

  .config-preview h3 {
    color: #fff;
    font-size: 20px;
    margin-bottom: 20px;
    text-align: center;
  }

  .config-card.preview-card {
    cursor: default;
    opacity: 0.9;
  }

  .config-card.preview-card:hover {
    transform: none;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border-color: transparent;
  }

  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .config-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
    color: #333;
  }

  .config-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    border-color: #4CAF50;
  }

  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .config-header h3,
  .config-header h4 {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .config-type-badge {
    background: linear-gradient(45deg, #4CAF50, #45a049);
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .config-details {
    margin-bottom: 20px;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .detail-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .detail-item .label {
    font-weight: 500;
    color: #666;
    font-size: 14px;
  }

  .detail-item .value {
    font-weight: 600;
    color: #333;
    font-size: 16px;
  }

  .config-action {
    text-align: center;
    padding-top: 16px;
    border-top: 2px dashed rgba(0, 0, 0, 0.1);
  }

  .create-text {
    color: #4CAF50;
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .empty-state {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 40px;
    backdrop-filter: blur(10px);
  }

  .empty-state h2 {
    color: #fff;
    margin-bottom: 16px;
    font-size: 24px;
  }

  .empty-state p {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .btn-return {
    background: linear-gradient(45deg, #FF6B6B, #FF5252);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-return:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  }

  .retry-button-container {
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 1000;
  }

  .retry-button {
    background: #f44336;
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .retry-button:hover {
    background: #d32f2f;
  }

  .retry-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading {
    text-align: center;
    font-size: 18px;
    padding: 50px;
    color: rgba(255, 255, 255, 0.9);
  }

  /* 对话框样式 */
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .dialog-content {
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    color: #333;
  }

  .dialog-content h3 {
    margin: 0 0 16px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
    text-align: center;
  }

  .dialog-content p {
    margin: 0 0 24px 0;
    color: #666;
    text-align: center;
    line-height: 1.5;
  }

  .input-group {
    margin-bottom: 24px;
  }

  .input-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  .input-group input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    color: #333;
    background-color: #fff;
    box-sizing: border-box;
    transition: border-color 0.3s ease;
  }

  .input-group input::placeholder {
    color: #999;
    opacity: 1;
  }

  .input-group input:focus {
    outline: none;
    border-color: #4CAF50;
  }

  .dialog-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .dialog-buttons button {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 14px;
  }

  .dialog-buttons .btn-cancel {
    background: #f5f5f5;
    color: #666;
  }

  .dialog-buttons .btn-cancel:hover {
    background: #e0e0e0;
  }

  .dialog-buttons .btn-confirm {
    background: #4CAF50;
    color: white;
  }

  .dialog-buttons .btn-confirm:hover:not(:disabled) {
    background: #45a049;
  }

  .dialog-buttons .btn-confirm:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    .create-project-page {
      padding: 16px;
      padding-bottom: 100px;
    }

    .config-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .config-card {
      padding: 20px;
    }

    .create-project-header h1 {
      font-size: 24px;
    }

    .template-info h2 {
      font-size: 20px;
    }
  }
`;

export default CreateProjectFromTemplate;
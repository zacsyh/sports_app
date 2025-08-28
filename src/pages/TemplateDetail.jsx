import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import templateService from '../services/templateService';
import Toast from '../components/common/Toast';
import BackButton from '../components/common/BackButton';
import BottomNavigation from '../components/layout/BottomNavigation';

const TemplateDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectConfig, setNewProjectConfig] = useState({
    name: '',
    description: '',
    type: 'SETS_REPS',
    sets: '',
    repsPerSet: '',
    targetCount: '',
    targetWeight: ''
  });

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

  const handleBack = () => {
    navigate('/templates');
  };

  const handleAddProjectConfig = async () => {
    try {
      const projectConfig = {
        name: newProjectConfig.name,
        description: newProjectConfig.description || '',
        type: newProjectConfig.type,
        createdAt: Date.now()
      };

      if (newProjectConfig.type === 'SETS_REPS') {
        projectConfig.sets = parseInt(newProjectConfig.sets) || 0;
        projectConfig.repsPerSet = parseInt(newProjectConfig.repsPerSet) || 0;
      } else {
        projectConfig.targetCount = parseInt(newProjectConfig.targetCount) || 0;
        projectConfig.targetWeight = parseFloat(newProjectConfig.targetWeight) || 0;
      }

      const result = await templateService.addProjectToTemplate(id, projectConfig);
      if (result.success) {
        setTemplate(result.template);
        setToast({message: '项目配置添加成功', type: 'success'});
        setShowAddForm(false);
        setNewProjectConfig({
          name: '',
          description: '',
          type: 'SETS_REPS',
          sets: '',
          repsPerSet: '',
          targetCount: '',
          targetWeight: ''
        });
      } else {
        setToast({message: result.error || '添加项目配置失败', type: 'error'});
      }
    } catch (error) {
      console.error('添加项目配置失败:', error);
      setToast({message: '添加项目配置失败', type: 'error'});
    }
  };

  const handleRemoveProjectConfig = async (index) => {
    try {
      const result = await templateService.removeProjectFromTemplate(id, index);
      if (result.success) {
        setTemplate(result.template);
        setToast({message: '项目配置移除成功', type: 'success'});
      } else {
        setToast({message: result.error || '移除项目配置失败', type: 'error'});
      }
    } catch (error) {
      console.error('移除项目配置失败:', error);
      setToast({message: '移除项目配置失败', type: 'error'});
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProjectConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="template-detail-page">
        <div className="loading">加载中...</div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="template-detail-page">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <header className="template-detail-header">
        <BackButton onClick={handleBack} text="返回" />
        <h1>{template?.name || '模板详情'}</h1>
      </header>

      <main className="template-detail-content">
        {template && (
          <>
            <div className="template-info">
              <p className="template-description">{template.description}</p>
              <div className="template-meta">
                <span>创建时间: {new Date(template.createdAt).toLocaleString('zh-CN')}</span>
                <span>更新时间: {new Date(template.updatedAt).toLocaleString('zh-CN')}</span>
              </div>
            </div>

            <div className="project-configs-section">
              <div className="section-header">
                <h2>项目配置</h2>
                <button 
                  className="add-button"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  {showAddForm ? '取消' : '添加配置'}
                </button>
              </div>

              {showAddForm && (
                <div className="add-form">
                  <h3>添加项目配置</h3>
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      placeholder="配置名称"
                      value={newProjectConfig.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="text"
                      name="description"
                      placeholder="项目描述（可选）"
                      value={newProjectConfig.description || ''}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>项目类型:</label>
                    <div className="radio-group">
                      <label>
                        <input
                          type="radio"
                          name="type"
                          value="SETS_REPS"
                          checked={newProjectConfig.type === 'SETS_REPS'}
                          onChange={handleInputChange}
                        />
                        组数×次数模式
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="type"
                          value="TOTAL_COUNT"
                          checked={newProjectConfig.type === 'TOTAL_COUNT'}
                          onChange={handleInputChange}
                        />
                        总个数/重量模式
                      </label>
                    </div>
                  </div>

                  {newProjectConfig.type === 'SETS_REPS' ? (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="number"
                            name="sets"
                            placeholder="组数"
                            value={newProjectConfig.sets}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="number"
                            name="repsPerSet"
                            placeholder="每组次数"
                            value={newProjectConfig.repsPerSet}
                            onChange={handleInputChange}
                            className="form-input"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <input
                          type="number"
                          name="targetCount"
                          placeholder="目标次数"
                          value={newProjectConfig.targetCount}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <input
                          type="number"
                          name="targetWeight"
                          placeholder="目标重量(可选)"
                          step="0.1"
                          value={newProjectConfig.targetWeight}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                    </>
                  )}

                  <button 
                    className="submit-button"
                    onClick={handleAddProjectConfig}
                  >
                    添加配置
                  </button>
                </div>
              )}

              <div className="project-configs-list">
                {template.projectList && template.projectList.length > 0 ? (
                  template.projectList.map((config, index) => (
                    <div key={index} className="project-config-item">
                      <div className="config-header">
                        <div className="config-title-section">
                          <h3 className="config-name">{config.name || `项目配置 ${index + 1}`}</h3>
                          <span className="config-type">
                            {config.type === 'SETS_REPS' ? '组数×次数模式' : '总个数/重量模式'}
                          </span>
                        </div>
                        <div className="config-actions">
                          <button 
                            className="remove-button"
                            onClick={() => handleRemoveProjectConfig(index)}
                          >
                            移除
                          </button>
                        </div>
                      </div>
                      
                      <div className="config-details">
                        {config.description && (
                          <p className="config-description">描述: {config.description}</p>
                        )}
                        <div className="config-parameters">
                          {config.type === 'SETS_REPS' ? (
                            <>
                              <div className="parameter-item">
                                <span className="parameter-label">目标组数:</span>
                                <span className="parameter-value">{config.sets} 组</span>
                              </div>
                              <div className="parameter-item">
                                <span className="parameter-label">每组次数:</span>
                                <span className="parameter-value">{config.repsPerSet} 次</span>
                              </div>
                              <div className="parameter-item">
                                <span className="parameter-label">总计:</span>
                                <span className="parameter-value total-count">{config.sets * config.repsPerSet} 次</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="parameter-item">
                                <span className="parameter-label">目标次数:</span>
                                <span className="parameter-value">{config.targetCount} 次</span>
                              </div>
                              {config.targetWeight && (
                                <div className="parameter-item">
                                  <span className="parameter-label">目标重量:</span>
                                  <span className="parameter-value">{config.targetWeight} kg</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div className="config-meta">
                          <span className="created-time">创建时间: {new Date(config.createdAt).toLocaleString('zh-CN')}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-message">暂无项目配置</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default TemplateDetail;
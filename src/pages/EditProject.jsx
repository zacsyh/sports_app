import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import db from '../services/database';
import Toast from '../components/common/Toast';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sets: '',
    repsPerSet: '',
    targetCount: '',
    targetWeight: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isTouched, setIsTouched] = useState({});

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const projectData = await db.fitness_projects.get(id);
      if (projectData) {
        setProject(projectData);
        // 初始化表单数据
        setFormData({
          name: projectData.name || '',
          description: projectData.description || '',
          sets: projectData.sets || '',
          repsPerSet: projectData.repsPerSet || '',
          targetCount: projectData.targetCount || '',
          targetWeight: projectData.targetWeight || ''
        });
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

  const handleRetry = () => {
    setError(null);
    loadProject();
  };

  // 实时字段验证
  const validateField = (name, value) => {
    if (name === 'name') {
      if (!value.trim()) return '项目名称不能为空';
      if (value.length > 50) return '项目名称不能超过50个字符';
    }
    if (name === 'sets' && project && project.type === 'SETS_REPS') {
      if (!value || value <= 0 || !Number.isInteger(Number(value))) 
        return '组数必须为正整数';
    }
    if (name === 'repsPerSet' && project && project.type === 'SETS_REPS') {
      if (!value || value <= 0 || !Number.isInteger(Number(value))) 
        return '每组次数必须为正整数';
    }
    if (name === 'targetCount' && project && project.type === 'TOTAL_COUNT') {
      if (!value || value <= 0 || !Number.isInteger(Number(value))) 
        return '目标次数必须为正整数';
    }
    if (name === 'targetWeight' && project && project.type === 'TOTAL_COUNT' && value) {
      if (value <= 0 || isNaN(value)) return '目标重量必须为正数';
      if (!/^\d+(\.\d{1,2})?$/.test(value)) return '目标重量最多保留两位小数';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 实时验证字段
    const errorMsg = validateField(name, value);
    if (errorMsg) {
      setErrors({...errors, [name]: errorMsg});
    } else if (errors[name]) {
      const newErrors = {...errors};
      delete newErrors[name];
      setErrors(newErrors);
    }
    
    // 标记字段已被修改
    setIsTouched({...isTouched, [name]: true});
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // 失去焦点时验证字段
    const errorMsg = validateField(name, value);
    if (errorMsg) {
      setErrors({...errors, [name]: errorMsg});
    } else if (errors[name]) {
      const newErrors = {...errors};
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 验证项目名称
    if (!formData.name.trim()) {
      newErrors.name = '项目名称不能为空';
    } else if (formData.name.length > 50) {
      newErrors.name = '项目名称不能超过50个字符';
    }
    
    // 根据项目类型验证相应字段
    if (project && project.type === 'SETS_REPS') {
      if (!formData.sets || formData.sets <= 0 || !Number.isInteger(Number(formData.sets))) {
        newErrors.sets = '组数必须为正整数';
      }
      
      if (!formData.repsPerSet || formData.repsPerSet <= 0 || !Number.isInteger(Number(formData.repsPerSet))) {
        newErrors.repsPerSet = '每组次数必须为正整数';
      }
    } else if (project && project.type === 'TOTAL_COUNT') {
      if (!formData.targetCount || formData.targetCount <= 0 || !Number.isInteger(Number(formData.targetCount))) {
        newErrors.targetCount = '目标次数必须为正整数';
      }
      
      if (formData.targetWeight && (formData.targetWeight <= 0 || isNaN(formData.targetWeight))) {
        newErrors.targetWeight = '目标重量必须为正数';
      }
      
      // 验证目标重量最多保留两位小数
      if (formData.targetWeight && !/^\d+(\.\d{1,2})?$/.test(formData.targetWeight)) {
        newErrors.targetWeight = '目标重量最多保留两位小数';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 准备更新数据
      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        updatedAt: Date.now()
      };
      
      // 根据项目类型添加相应字段
      if (project.type === 'SETS_REPS') {
        updateData.sets = parseInt(formData.sets);
        updateData.repsPerSet = parseInt(formData.repsPerSet);
      } else {
        updateData.targetCount = parseInt(formData.targetCount);
        updateData.targetWeight = formData.targetWeight ? parseFloat(formData.targetWeight) : null;
      }
      
      // 更新数据库中的项目
      await db.fitness_projects.update(id, updateData);
      
      // 显示成功提示并返回项目详情界面
      setToast({message: '项目更新成功', type: 'success'});
      setTimeout(() => {
        navigate(`/project/${id}`);
      }, 1500);
    } catch (error) {
      console.error('更新项目失败:', error);
      setToast({message: '项目更新失败，请重试', type: 'error'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/project/${id}`);
  };

  if (loading) {
    return (
      <div className="edit-project-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-project-page">
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
      <div className="edit-project-page">
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
      <div className="edit-project-page">
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
        <header className="edit-project-header">
          <button className="back-button" onClick={handleCancel}>
            取消
          </button>
          <h1 className="page-title">编辑项目</h1>
          <button 
            className="save-button" 
            onClick={handleSubmit}
            disabled={Object.keys(errors).length > 0 || !formData.name.trim() || isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </header>
        
        <form className="edit-project-form" onSubmit={handleSubmit}>
          {/* 项目名称 */}
          <div className="form-group">
            <label htmlFor="name">项目名称 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="请输入项目名称"
              className={errors.name ? 'error' : (isTouched.name && !errors.name ? 'success' : '')}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
            {isTouched.name && !errors.name && formData.name.trim() && <span className="success-icon">✓</span>}
          </div>
          
          {/* 项目描述 */}
          <div className="form-group">
            <label htmlFor="description">项目描述</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="请输入项目描述（可选）"
              rows="3"
              className={isTouched.description && formData.description ? 'success' : ''}
            />
            {isTouched.description && formData.description && <span className="success-icon">✓</span>}
          </div>
          
          {/* 项目类型（只读显示） */}
          <div className="form-group">
            <label>项目类型</label>
            <div className="type-display">
              {project.type === 'SETS_REPS' ? 'Sets×Reps' : 'Total count/weight'}
            </div>
          </div>
          
          {/* 根据项目类型显示相应字段 */}
          <div className="mode-fields">
            {project.type === 'SETS_REPS' ? (
              <>
                <div className="form-group">
                  <label htmlFor="sets">组数 *</label>
                  <input
                    type="number"
                    id="sets"
                    name="sets"
                    value={formData.sets}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="组数"
                    min="1"
                    className={errors.sets ? 'error' : (isTouched.sets && !errors.sets ? 'success' : '')}
                  />
                  {errors.sets && <div className="error-message">{errors.sets}</div>}
                  {isTouched.sets && !errors.sets && formData.sets && <span className="success-icon">✓</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="repsPerSet">每组次数 *</label>
                  <input
                    type="number"
                    id="repsPerSet"
                    name="repsPerSet"
                    value={formData.repsPerSet}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="每组次数"
                    min="1"
                    className={errors.repsPerSet ? 'error' : (isTouched.repsPerSet && !errors.repsPerSet ? 'success' : '')}
                  />
                  {errors.repsPerSet && <div className="error-message">{errors.repsPerSet}</div>}
                  {isTouched.repsPerSet && !errors.repsPerSet && formData.repsPerSet && <span className="success-icon">✓</span>}
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="targetCount">目标次数 *</label>
                  <input
                    type="number"
                    id="targetCount"
                    name="targetCount"
                    value={formData.targetCount}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="目标次数"
                    min="1"
                    className={errors.targetCount ? 'error' : (isTouched.targetCount && !errors.targetCount ? 'success' : '')}
                  />
                  {errors.targetCount && <div className="error-message">{errors.targetCount}</div>}
                  {isTouched.targetCount && !errors.targetCount && formData.targetCount && <span className="success-icon">✓</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="targetWeight">目标重量（可选）</label>
                  <input
                    type="number"
                    id="targetWeight"
                    name="targetWeight"
                    value={formData.targetWeight}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="目标重量（可选）"
                    min="0"
                    step="0.01"
                    className={errors.targetWeight ? 'error' : (isTouched.targetWeight && !errors.targetWeight ? 'success' : '')}
                  />
                  {errors.targetWeight && <div className="error-message">{errors.targetWeight}</div>}
                  {isTouched.targetWeight && !errors.targetWeight && formData.targetWeight && <span className="success-icon">✓</span>}
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </CSSTransition>
  );
};

export default EditProject;
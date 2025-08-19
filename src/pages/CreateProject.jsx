import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import db from '../services/database';
import Toast from '../components/common/Toast';
import BottomNavigation from '../components/layout/BottomNavigation';

const CreateProject = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'SETS_REPS', // 默认选择Sets×Reps模式
    sets: '',
    repsPerSet: '',
    targetCount: '',
    targetWeight: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isTouched, setIsTouched] = useState({});
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageRef = useRef(null);
  
  // 实时字段验证
  const validateField = (name, value) => {
    if (name === 'name') {
      if (!value.trim()) return '项目名称不能为空';
      if (value.length > 50) return '项目名称不能超过50个字符';
    }
    if (name === 'sets' && formData.type === 'SETS_REPS') {
      if (!value || value <= 0 || !Number.isInteger(Number(value))) 
        return '组数必须为正整数';
    }
    if (name === 'repsPerSet' && formData.type === 'SETS_REPS') {
      if (!value || value <= 0 || !Number.isInteger(Number(value))) 
        return '每组次数必须为正整数';
    }
    if (name === 'targetCount' && formData.type === 'TOTAL_COUNT') {
      if (!value || value <= 0 || !Number.isInteger(Number(value))) 
        return '目标次数必须为正整数';
    }
    if (name === 'targetWeight' && formData.type === 'TOTAL_COUNT' && value) {
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
  
  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type
    });
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
    if (formData.type === 'SETS_REPS') {
      if (!formData.sets || formData.sets <= 0 || !Number.isInteger(Number(formData.sets))) {
        newErrors.sets = '组数必须为正整数';
      }
      
      if (!formData.repsPerSet || formData.repsPerSet <= 0 || !Number.isInteger(Number(formData.repsPerSet))) {
        newErrors.repsPerSet = '每组次数必须为正整数';
      }
    } else {
      // TOTAL_COUNT模式
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
      // 准备项目数据
      const projectData = {
        id: Date.now().toString(), // 使用时间戳作为简单ID
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'ACTIVE'
      };
      
      // 根据项目类型添加相应字段
      if (formData.type === 'SETS_REPS') {
        projectData.sets = parseInt(formData.sets);
        projectData.repsPerSet = parseInt(formData.repsPerSet);
        projectData.completedSets = []; // 初始化完成组数记录为空数组
      } else {
        projectData.targetCount = parseInt(formData.targetCount);
        projectData.targetWeight = formData.targetWeight ? parseFloat(formData.targetWeight) : null;
        projectData.currentCount = 0; // 初始化当前完成次数为0
        projectData.history = []; // 初始化历史记录为空数组
      }
      
      // 保存到数据库
      console.log('准备保存项目数据:', projectData);
      const result = await db.fitness_projects.add(projectData);
      console.log('项目保存结果:', result);
      
      // 验证数据是否正确保存
      const savedProject = await db.fitness_projects.get(result);
      console.log('保存后的项目数据:', savedProject);
      
      // 显示成功提示并返回首页
      setToast({message: '项目创建成功', type: 'success'});
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('保存项目失败:', error);
      setToast({message: '项目保存失败，请重试', type: 'error'});
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRetry = () => {
    setToast(null);
    handleSubmit({ preventDefault: () => {} });
  };
  
  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <CSSTransition in={true} timeout={300} classNames="page" appear nodeRef={pageRef}>
      <div className="create-project-page" ref={pageRef}>
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
        <button className="back-button" onClick={handleCancel}>
          ←
        </button>
        <h1>创建项目</h1>
      </header>
      
      <form className="create-project-form" onSubmit={handleSubmit}>
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
        
        {/* 项目类型选择 */}
        <div className="form-group">
          <label>项目类型</label>
          <div className="type-tabs">
            <button
              type="button"
              className={`tab ${formData.type === 'SETS_REPS' ? 'active' : ''}`}
              onClick={() => handleTypeChange('SETS_REPS')}
            >
              组数×次数
            </button>
            <button
              type="button"
              className={`tab ${formData.type === 'TOTAL_COUNT' ? 'active' : ''}`}
              onClick={() => handleTypeChange('TOTAL_COUNT')}
            >
              总个数/重量
            </button>
          </div>
        </div>
        
        {/* 根据项目类型显示相应字段 */}
        <div className="mode-fields">
          <TransitionGroup>
            <CSSTransition
              key={formData.type}
              timeout={300}
              classNames="fade"
            >
              <div className="mode-fields-inner">
                {formData.type === 'SETS_REPS' ? (
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
            </CSSTransition>
          </TransitionGroup>
        </div>
        
        {/* 操作按钮 */}
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={handleCancel}>
            取消
          </button>
          <button 
            type="submit" 
            className="primary-button"
            disabled={Object.keys(errors).length > 0 || !formData.name.trim()}
          >
            保存
          </button>
        </div>
      </form>
      
      <BottomNavigation />
      </div>
    </CSSTransition>
  );
};

export default CreateProject;

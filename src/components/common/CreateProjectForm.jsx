import React, { useState } from 'react';
import styled from 'styled-components';

const CreateProjectForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [isSetsRepsMode, setIsSetsRepsMode] = useState(initialData.type === 'TOTAL_COUNT' ? false : true);
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    sets: initialData.sets || '',
    reps: initialData.repsPerSet || '',
    targetCount: initialData.targetCount || '',
    targetWeight: initialData.targetWeight || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      type: isSetsRepsMode ? 'SETS_REPS' : 'TOTAL_COUNT'
    });
  };

  return (
    <StyledWrapper>
      <div className="container">
        {/* 顶部切换开关 */}
        <div className="switch-container">
          <div className="switch-option">
            <label className="switch-label">
              <input 
                type="radio" 
                name="mode" 
                checked={isSetsRepsMode}
                onChange={() => setIsSetsRepsMode(true)}
              />
              <span>组数模式</span>
            </label>
          </div>
          <div className="switch-option">
            <label className="switch-label">
              <input 
                type="radio" 
                name="mode" 
                checked={!isSetsRepsMode}
                onChange={() => setIsSetsRepsMode(false)}
              />
              <span>计数模式</span>
            </label>
          </div>
        </div>

        {/* 表单卡片 */}
        <div className="form-card">
          <div className="form-title">
            {isSetsRepsMode ? '组数×次数模式' : '总个数/重量模式'}
          </div>
          
          <form className="form" onSubmit={handleSubmit}>
            {/* 通用字段 */}
            <div className="form-group">
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="项目名称"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                className="form-input"
                type="text"
                name="description"
                placeholder="项目描述"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* 条件字段 */}
            {isSetsRepsMode ? (
              <>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="number"
                    name="sets"
                    placeholder="组数"
                    min="1"
                    value={formData.sets}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="number"
                    name="reps"
                    placeholder="每组次数"
                    min="1"
                    value={formData.reps}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="number"
                    name="targetCount"
                    placeholder="目标次数"
                    min="1"
                    value={formData.targetCount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    className="form-input"
                    type="number"
                    name="targetWeight"
                    placeholder="目标重量(可选)"
                    min="0"
                    step="0.1"
                    value={formData.targetWeight}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* 底部按钮 */}
            <div className="button-group">
              <button type="button" className="btn btn-cancel" onClick={onCancel}>
                取消
              </button>
              <button type="submit" className="btn btn-submit">
                创建项目
              </button>
            </div>
          </form>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    padding: 16px;
    gap: 24px;
    width: 100%;
  }

  .switch-container {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;
    justify-content: center;
    align-items: center;
    
    /* 确保一行显示 */
    @media (max-width: 480px) {
      gap: 16px;
      flex-wrap: nowrap;
    }
  }

  .switch-option {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .switch-label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    font-weight: 600;
    color: #323232;
    font-size: 15px;
    white-space: nowrap;
    
    /* 移动端适配 */
    @media (max-width: 480px) {
      font-size: 14px;
      gap: 5px;
    }
  }

  .switch-label input[type="radio"] {
    width: 18px;
    height: 18px;
    accent-color: #2d8cf0;
    
    /* 移动端适配 */
    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }

  .form-card {
    background: lightgrey;
    border: 3px solid #323232;
    border-radius: 12px;
    box-shadow: 6px 6px #323232;
    padding: 24px;
    width: 100%;
    max-width: 500px;
    min-height: 400px;
    
    /* 移动端适配 */
    @media (max-width: 768px) {
      max-width: 90vw;
      padding: 20px;
      border-radius: 10px;
    }
    
    @media (max-width: 480px) {
      max-width: 95vw;
      padding: 16px;
      border-radius: 8px;
      border-width: 2px;
      box-shadow: 4px 4px #323232;
    }
  }

  .form-title {
    font-size: 24px;
    font-weight: 900;
    text-align: center;
    color: #323232;
    margin-bottom: 24px;
    
    /* 移动端适配 */
    @media (max-width: 480px) {
      font-size: 20px;
      margin-bottom: 20px;
    }
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 18px;
    
    /* 移动端适配 */
    @media (max-width: 480px) {
      gap: 16px;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-input {
    width: 100%;
    height: 48px;
    border-radius: 8px;
    border: 3px solid #323232;
    background-color: white;
    box-shadow: 4px 4px #323232;
    font-size: 16px;
    font-weight: 600;
    color: #323232;
    padding: 12px 16px;
    outline: none;
    box-sizing: border-box;
    
    /* 移动端适配 */
    @media (max-width: 480px) {
      height: 44px;
      font-size: 16px; /* 保持16px避免iOS缩放 */
      padding: 10px 14px;
      border-width: 2px;
      box-shadow: 3px 3px #323232;
    }
  }

  .form-input::placeholder {
    color: #666;
    opacity: 0.8;
  }

  .form-input:focus {
    border-color: #2d8cf0;
    box-shadow: 4px 4px #2d8cf0;
    
    @media (max-width: 480px) {
      box-shadow: 3px 3px #2d8cf0;
    }
  }

  .button-group {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    justify-content: center;
    
    /* 移动端适配 */
    @media (max-width: 480px) {
      gap: 10px;
      margin-top: 16px;
    }
  }

  .btn {
    padding: 14px 20px;
    border-radius: 8px;
    border: 3px solid #323232;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    max-width: 140px;
    white-space: nowrap;
    min-width: 100px;
    
    /* 移动端适配 */
    @media (max-width: 480px) {
      padding: 12px 16px;
      font-size: 15px;
      border-width: 2px;
      max-width: 120px;
      min-width: 90px;
    }
  }

  .btn:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px #323232;
    
    @media (max-width: 480px) {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px #323232;
    }
  }

  .btn-cancel {
    background-color: #f44336;
    color: white;
    box-shadow: 4px 4px #323232;
    
    @media (max-width: 480px) {
      box-shadow: 3px 3px #323232;
    }
  }

  .btn-submit {
    background-color: #4caf50;
    color: white;
    box-shadow: 4px 4px #323232;
    
    @media (max-width: 480px) {
      box-shadow: 3px 3px #323232;
    }
  }

  .btn:hover {
    opacity: 0.9;
  }
`;

export default CreateProjectForm;
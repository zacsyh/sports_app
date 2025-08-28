import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BackButton from './BackButton';

const TemplateForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || ''
      });
    }
  }, [initialData]);

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
      id: isEditMode ? initialData.id : null
    });
  };

  return (
    <StyledWrapper>
      <div className="container">
        {/* 表单卡片 */}
        <div className="form-card">
          <div className="form-header">
            <BackButton onClick={onCancel} text="返回" />
            <div className="form-title">
              {isEditMode ? '编辑模板' : '创建模板'}
            </div>
          </div>
          
          <form className="form" onSubmit={handleSubmit}>
            {/* 模板名称 */}
            <div className="form-group">
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="模板名称"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            {/* 模板描述 */}
            <div className="form-group">
              <textarea
                className="form-textarea"
                name="description"
                placeholder="模板描述"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            {/* 项目配置说明 */}
            <div className="info-section">
              <p className="info-text">
                模板创建后，您可以添加项目配置到模板中。
              </p>
            </div>

            {/* 底部按钮 */}
            <div className="button-group">
              <button type="button" className="btn btn-cancel" onClick={onCancel}>
                取消
              </button>
              <button type="submit" className="btn btn-submit">
                {isEditMode ? '更新模板' : '创建模板'}
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

  .form-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .form-title {
    font-size: 24px;
    font-weight: 900;
    text-align: center;
    color: #323232;
    flex: 1;
    
    /* 移动端适配 */
    @media (max-width: 480px) {
      font-size: 20px;
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
      font-size: 16px;
      padding: 10px 14px;
      border-width: 2px;
      box-shadow: 3px 3px #323232;
    }
  }

  .form-textarea {
    width: 100%;
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
    resize: vertical;
    min-height: 100px;
    
    /* 移动端适配 */
    @media (max-width: 480px) {
      font-size: 16px;
      padding: 10px 14px;
      border-width: 2px;
      box-shadow: 3px 3px #323232;
    }
  }

  .form-input::placeholder,
  .form-textarea::placeholder {
    color: #666;
    opacity: 0.8;
  }

  .form-input:focus,
  .form-textarea:focus {
    border-color: #2d8cf0;
    box-shadow: 4px 4px #2d8cf0;
    
    @media (max-width: 480px) {
      box-shadow: 3px 3px #2d8cf0;
    }
  }

  .info-section {
    background-color: #e3f2fd;
    border: 2px solid #2196f3;
    border-radius: 8px;
    padding: 12px;
    margin: 10px 0;
  }

  .info-text {
    margin: 0;
    color: #1976d2;
    font-size: 14px;
    text-align: center;
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

export default TemplateForm;
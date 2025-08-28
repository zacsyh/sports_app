import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const TemplateCard = ({ template, onDelete, onEdit }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <Link to={`/template/${template.id}`} className="card-link">
          <div className="card-content">
            <div className="card-header">
              <h3 className="template-name">{template.name}</h3>
              <div className="template-meta">
                <span className="meta-item">
                  项目数: {template.projectList ? template.projectList.length : 0}
                </span>
                <span className="meta-item">
                  创建时间: {new Date(template.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
            
            {template.description && (
              <div className="template-description">
                {template.description}
              </div>
            )}
          </div>
        </Link>
        
        <div className="template-actions">
          <button 
            className="action-button edit-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(template);
            }}
          >
            编辑
          </button>
          <button 
            className="action-button delete-button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(template.id);
            }}
          >
            删除
          </button>
          <Link 
            to={`/template/${template.id}/create-project`}
            className="action-button use-button"
          >
            使用
          </Link>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    width: 100%;
    background: white;
    border: 2px solid #323232;
    border-radius: 12px;
    box-shadow: 4px 4px #323232;
    margin-bottom: 20px;
    transition: all 0.2s ease;
    
    @media (max-width: 480px) {
      border-width: 1px;
      box-shadow: 3px 3px #323232;
    }
  }

  .card-link {
    text-decoration: none;
    color: inherit;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px #323232;
  }

  .card-content {
    padding: 20px;
    
    @media (max-width: 480px) {
      padding: 16px;
    }
  }

  .card-header {
    margin-bottom: 15px;
  }

  .template-name {
    font-size: 20px;
    font-weight: 700;
    color: #323232;
    margin: 0 0 10px 0;
    
    @media (max-width: 480px) {
      font-size: 18px;
    }
  }

  .template-meta {
    display: flex;
    gap: 15px;
    font-size: 14px;
    color: #666;
    
    @media (max-width: 480px) {
      flex-direction: column;
      gap: 5px;
    }
  }

  .meta-item {
    display: flex;
    align-items: center;
    
    &::before {
      content: "•";
      margin-right: 5px;
      color: #999;
    }
  }

  .template-description {
    font-size: 15px;
    color: #555;
    line-height: 1.5;
    margin-bottom: 20px;
    white-space: pre-wrap;
    
    @media (max-width: 480px) {
      font-size: 14px;
      margin-bottom: 15px;
    }
  }

  .template-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 0 20px 20px 20px;
    
    @media (max-width: 480px) {
      padding: 0 16px 16px 16px;
      flex-direction: column;
      gap: 8px;
    }
  }

  .action-button {
    padding: 8px 16px;
    border-radius: 6px;
    border: 2px solid #323232;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    
    @media (max-width: 480px) {
      padding: 10px;
      font-size: 15px;
      border-width: 1px;
    }
  }

  .action-button:active {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px #323232;
  }

  .edit-button {
    background-color: #2196f3;
    color: white;
    box-shadow: 2px 2px #323232;
  }

  .delete-button {
    background-color: #f44336;
    color: white;
    box-shadow: 2px 2px #323232;
  }

  .use-button {
    background-color: #4caf50;
    color: white;
    box-shadow: 2px 2px #323232;
  }

  .action-button:hover {
    opacity: 0.9;
  }
`;

export default TemplateCard;
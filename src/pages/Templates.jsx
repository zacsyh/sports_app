import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import templateService from '../services/templateService';
import BottomNavigation from '../components/layout/BottomNavigation';
import TemplateCard from '../components/common/TemplateCard';
import Toast from '../components/common/Toast';
import AddButton from '../components/common/AddButton';

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDeleteTemplateId, setConfirmDeleteTemplateId] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const result = await templateService.getAllTemplates();
      if (result.success) {
        setTemplates(result.templates);
      } else {
        setToast({message: '加载模板失败', type: 'error'});
      }
    } catch (error) {
      console.error('加载模板失败:', error);
      setToast({message: '加载模板失败', type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    // 设置确认对话框状态
    setConfirmDeleteTemplateId(templateId);
  };

  const confirmDeleteTemplate = async () => {
    if (!confirmDeleteTemplateId) return;
    
    try {
      const result = await templateService.deleteTemplate(confirmDeleteTemplateId);
      if (result.success) {
        setToast({message: '模板删除成功', type: 'success'});
        // 重新加载模板列表
        loadTemplates();
      } else {
        setToast({message: result.error || '模板删除失败', type: 'error'});
      }
    } catch (error) {
      console.error('删除模板失败:', error);
      setToast({message: '模板删除失败', type: 'error'});
    } finally {
      setConfirmDeleteTemplateId(null);
    }
  };

  const cancelDeleteTemplate = () => {
    setConfirmDeleteTemplateId(null);
  };

  const handleEditTemplate = (template) => {
    // 导航到编辑页面
    navigate(`/template/${template.id}/edit`);
  };

  return (
    <div className="templates-page">
      {/* 删除确认对话框 */}
      {confirmDeleteTemplateId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>确认删除</h3>
            <p>确定要删除此模板吗？此操作不可撤销。</p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={cancelDeleteTemplate}>
                取消
              </button>
              <button className="primary-button delete-confirm-button" onClick={confirmDeleteTemplate}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <header className="templates-header">
        <h1>模板</h1>
        <Link to="/template/create" className="create-button">
          <AddButton />
        </Link>
      </header>

      <main className="templates-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : templates.length === 0 ? (
          <div className="empty-state">
            <p>还没有模板</p>
            <Link to="/template/create" className="create-template-button">
              创建第一个模板
            </Link>
          </div>
        ) : (
          <div className="templates-list">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onDelete={handleDeleteTemplate}
                onEdit={handleEditTemplate}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Templates;
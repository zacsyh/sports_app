import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import templateService from '../services/templateService';
import Toast from '../components/common/Toast';
import TemplateForm from '../components/common/TemplateForm';
import BottomNavigation from '../components/layout/BottomNavigation';

const EditTemplate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      const result = await templateService.updateTemplate(id, {
        name: formData.name,
        description: formData.description
      });
      
      if (result.success) {
        setToast({message: '模板更新成功', type: 'success'});
        setTimeout(() => {
          navigate('/templates');
        }, 1500);
      } else {
        setToast({message: result.error || '模板更新失败', type: 'error'});
      }
    } catch (error) {
      console.error('更新模板失败:', error);
      setToast({message: '模板更新失败，请重试', type: 'error'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/templates');
  };

  if (loading) {
    return (
      <div className="edit-template-page">
        <div className="loading">加载中...</div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="edit-template-page">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {template && (
        <TemplateForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={template}
        />
      )}
      
      <BottomNavigation />
    </div>
  );
};

export default EditTemplate;
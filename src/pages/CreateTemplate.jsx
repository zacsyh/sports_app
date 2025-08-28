import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import templateService from '../services/templateService';
import Toast from '../components/common/Toast';
import TemplateForm from '../components/common/TemplateForm';
import BottomNavigation from '../components/layout/BottomNavigation';

const CreateTemplate = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    try {
      const result = await templateService.createTemplate({
        name: formData.name,
        description: formData.description
      });
      
      if (result.success) {
        setToast({message: '模板创建成功', type: 'success'});
        setTimeout(() => {
          navigate('/templates');
        }, 1500);
      } else {
        setToast({message: result.error || '模板创建失败', type: 'error'});
      }
    } catch (error) {
      console.error('创建模板失败:', error);
      setToast({message: '模板创建失败，请重试', type: 'error'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/templates');
  };

  return (
    <div className="create-template-page">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <TemplateForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
      
      <BottomNavigation />
    </div>
  );
};

export default CreateTemplate;
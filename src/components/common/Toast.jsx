import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose, action, onAction }) => {
  useEffect(() => {
    // 只有在没有操作按钮时才自动关闭
    if (!action) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [onClose, action]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg z-50 flex items-center`}>
      <span className="flex-1">{message}</span>
      {action && (
        <button 
          className="ml-4 bg-white text-gray-800 px-2 py-1 rounded text-sm font-medium hover:bg-gray-100"
          onClick={() => {
            if (onAction) onAction();
            onClose();
          }}
        >
          {action === 'retry' ? '重试' : action}
        </button>
      )}
    </div>
  );
};

export default Toast;
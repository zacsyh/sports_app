import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { initializeUserPreferences } from './services/storage';

// 添加调试日志
console.log('App starting...');

// 初始化用户偏好设置
initializeUserPreferences()
  .then(() => {
    console.log('User preferences initialized');
  })
  .catch((error) => {
    console.error('Failed to initialize user preferences:', error);
  });

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

const root = ReactDOM.createRoot(rootElement);
root.render(
    <App />
);

console.log('App rendered');
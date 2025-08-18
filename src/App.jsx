import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import CreateProject from './pages/CreateProject';
import ProjectDetail from './pages/ProjectDetail';
import Tracking from './pages/Tracking';
import Settings from './pages/Settings';
import { SettingsProvider, useSettings } from './components/settings/SettingsContext';

// 创建路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/create',
    element: <CreateProject />,
  },
  {
    path: '/project/:id',
    element: <ProjectDetail />,
  },
  {
    path: '/tracking/:id',
    element: <Tracking />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
], {
  // 启用v7_startTransition标志
  future: {
    v7_startTransition: true
  }
});

// 应用组件包装器，用于应用主题
const AppWrapper = () => {
  const { preferences } = useSettings();

  useEffect(() => {
    // 应用主题到文档
    const applyTheme = (theme) => {
      const html = document.documentElement;
      
      // 清除现有的主题类
      html.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        // 根据系统偏好设置主题
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        html.classList.add(systemTheme);
      } else {
        // 应用指定的主题
        html.classList.add(theme);
      }
    };

    if (preferences && preferences.theme) {
      applyTheme(preferences.theme);
    }
  }, [preferences?.theme]);

  return (
    <div className="app">
      <RouterProvider router={router} />
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <AppWrapper />
    </SettingsProvider>
  );
}

export default App;
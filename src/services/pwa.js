// PWA功能支持

// 检查浏览器是否支持Service Worker
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator;
};

// 注册Service Worker
export const registerServiceWorker = () => {
  if (!isServiceWorkerSupported()) {
    console.log('Service Worker is not supported in this browser');
    return Promise.resolve();
  }

  return navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
      return registration;
    })
    .catch((error) => {
      console.log('Service Worker registration failed:', error);
      return Promise.reject(error);
    });
};

// 检查是否是PWA安装状态
export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
};

export default {
  isServiceWorkerSupported,
  registerServiceWorker,
  isPWAInstalled
};

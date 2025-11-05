import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import './styles/index.css';

// Initialize monitoring tools
import { initSentry, initLogRocket } from './utils/monitoring';
initSentry();
initLogRocket();

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  let themeToApply = savedTheme;

  if (!savedTheme || savedTheme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeToApply = prefersDark ? 'dark' : 'light';
  }

  // Set data-theme attribute for CSS variables
  document.documentElement.setAttribute('data-theme', themeToApply);
};

initializeTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
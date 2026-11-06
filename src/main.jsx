import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../tactyqal_labs_full_stack_suite.tsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

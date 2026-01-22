
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IncidentProvider } from './context/IncidentContext';
import App from './App';
import DemoPage from './pages/DemoPage';
import FeedPage from './components/FeedPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <IncidentProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/feed" element={<FeedPage />} />
        </Routes>
      </IncidentProvider>
    </BrowserRouter>
  </React.StrictMode>
);

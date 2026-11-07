import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {LanguageProvider} from './hooks/useLanguage.tsx';
import {AuthProvider} from './hooks/useAuth.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </LanguageProvider>
);

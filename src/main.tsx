import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import i18n from './i18n'; // Import the i18n configuration
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </AuthProvider>
);

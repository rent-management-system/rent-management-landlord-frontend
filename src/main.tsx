import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { I18nextProvider } from 'react-i18next';
// Import the i18n configuration
import i18n from './i18n';

// Type assertion for the i18n instance
const typedI18n = i18n as any; // Temporary workaround for type issues

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);

root.render(
  <I18nextProvider i18n={typedI18n}>
    <App />
  </I18nextProvider>
);

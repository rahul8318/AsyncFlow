import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { PricingPage } from './pages/public/PricingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { PrivacyPage, TermsPage } from './pages/public/LegalPages';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Authenticated Pages
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/app/DashboardPage';
import { SOPListPage } from './pages/app/SOPListPage';
import { SOPDetailPage } from './pages/app/SOPDetailPage';
import { SOPEditorPage } from './pages/app/SOPEditorPage';
import { WorkflowsPage } from './pages/app/WorkflowsPage';
import { WorkflowBoardPage } from './pages/app/WorkflowBoardPage';
import { TrainingPage } from './pages/app/TrainingPage';
import { LessonPlayerPage } from './pages/app/LessonPlayerPage';
import { QuizPlayerPage } from './pages/app/QuizPlayerPage';
import { WorkshopsPage } from './pages/app/WorkshopsPage';
import { TeamManagementPage } from './pages/app/TeamManagementPage';
import { AnalyticsPage } from './pages/app/AnalyticsPage';
import { NotificationsPage } from './pages/app/NotificationsPage';
import { SettingsPage } from './pages/app/SettingsPage';
import { ProfilePage } from './pages/app/ProfilePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Authenticated Workspace Routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="sops" element={<SOPListPage />} />
              <Route path="sops/new" element={<SOPEditorPage />} />
              <Route path="sops/:id" element={<SOPDetailPage />} />
              <Route path="sops/:id/edit" element={<SOPEditorPage />} />
              <Route path="workflows" element={<WorkflowsPage />} />
              <Route path="workflows/:id" element={<WorkflowBoardPage />} />
              <Route path="training" element={<TrainingPage />} />
              <Route path="training/:id" element={<LessonPlayerPage />} />
              <Route path="training/:id/quiz/:quizId" element={<QuizPlayerPage />} />
              <Route path="workshops" element={<WorkshopsPage />} />
              <Route path="teams" element={<TeamManagementPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

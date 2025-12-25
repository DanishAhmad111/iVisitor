import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import VisitorForm from './components/forms/VisitorForm';
import GuardDashboard from './components/dashboard/GuardDashboard';
import ApprovalPage from './components/forms/ApprovalPage';
import LoginForm from './components/forms/LoginForm';
import LandingPage from './components/pages/LandingPage';
import FrontendTester from './components/testing/FrontendTester';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Approval and Rejection routes without MainLayout */}
          <Route path="/approve/:id" element={<ApprovalPage action="approve" />} />
          <Route path="/reject/:id" element={<ApprovalPage action="reject" />} />
          
          {/* Main routes with layout */}
          <Route path="/" element={<LandingPage />} />
          {/* Visitor form without navigation */}
          <Route path="/visitor-form" element={<VisitorForm />} />
          <Route element={<MainLayout><Outlet /></MainLayout>}>
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/guard"
              element={
                <ProtectedRoute>
                  <GuardDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/test-api" element={<FrontendTester />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

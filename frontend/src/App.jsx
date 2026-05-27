import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './pages/LoginPage';
import BoardPage from './pages/BoardPage';
import InquiryPage from './pages/InquiryPage';
import ProtectedRoute from './components/shared/ProtectedRoute';

export default function App() {
  const token = useSelector(state => state.auth.token);
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/board" replace /> : <LoginPage />} />
      <Route path="/board" element={<ProtectedRoute><BoardPage /></ProtectedRoute>} />
      <Route path="/inquiry/:cardId" element={<ProtectedRoute><InquiryPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={token ? "/board" : "/login"} replace />} />
    </Routes>
  );
}

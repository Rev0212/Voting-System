import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ElectionsList from './pages/ElectionsList';
import PublicElectionResults from './pages/PublicElectionResults';
import ElectionDetails from './pages/ElectionDetails'; // Import the new ElectionDetails page

// User pages
import Dashboard from './pages/user/Dashboard';
import CandidateApplication from './pages/user/CandidateApplication';
import Voting from './pages/user/Voting';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageElections from './pages/admin/ManageElections';
import ManageCandidates from './pages/admin/ManageCandidates';
import ElectionResults from './pages/admin/ElectionResults';
import AdvancedAnalytics from './pages/admin/AdvancedAnalytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="elections" element={<ElectionsList />} />
            <Route path="elections/:id" element={<ElectionDetails />} />
            <Route path="elections/:id/results" element={<PublicElectionResults />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="apply" element={<CandidateApplication />} />
            <Route path="vote/:electionId" element={<Voting />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="elections" element={<ManageElections />} />
            <Route path="candidates" element={<ManageCandidates />} />
            <Route path="elections/:id/results" element={<ElectionResults />} />
            <Route path="analytics" element={<AdvancedAnalytics />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

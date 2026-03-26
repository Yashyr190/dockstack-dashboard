import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Overview from './pages/Overview';
import ContainersList from './pages/ContainersList';
import ContainerDetails from './pages/ContainerDetails';


const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
            <Route index element={<Overview />} />
            <Route path="containers" element={<ContainersList />} />
            <Route path="containers/:id" element={<ContainerDetails />} />
            
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

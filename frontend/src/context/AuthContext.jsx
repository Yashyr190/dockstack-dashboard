import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// 🔥 Attach token to all requests
const initAxios = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      initAxios(token); // ✅ APPLY TOKEN ON APP LOAD
    }

    setLoading(false);
  }, []);

  // Fake token generator (demo purpose)
  const generateToken = () => {
    return Math.random().toString(36).substring(2);
  };

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Please enter email and password");
    }

    // simulate API delay
    await new Promise((res) => setTimeout(res, 500));

    const fakeUser = { email };
    const fakeToken = generateToken();

    localStorage.setItem('token', fakeToken);
    localStorage.setItem('user', JSON.stringify(fakeUser));

    setUser(fakeUser);
    initAxios(fakeToken); // ✅ APPLY TOKEN AFTER LOGIN
  };

  const register = async (email, password) => {
    if (!email || !password) {
      throw new Error("Please enter email and password");
    }

    await new Promise((res) => setTimeout(res, 500));

    const fakeUser = { email };
    const fakeToken = generateToken();

    localStorage.setItem('token', fakeToken);
    localStorage.setItem('user', JSON.stringify(fakeUser));

    setUser(fakeUser);
    initAxios(fakeToken); // ✅ APPLY TOKEN AFTER REGISTER
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    initAxios(null); // ✅ REMOVE TOKEN
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial auth check

  useEffect(() => {
    // Check for a token in local storage when the app first loads
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Optional: Check if the token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setUser({
            mobileNo: decodedToken.sub,
            role: decodedToken.role,
          });
        } else {
          // Token is expired, remove it
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    // When a user logs in, save the token and decode it to set the user state
    localStorage.setItem('authToken', token);
    const decodedToken = jwtDecode(token);
    setUser({
      mobileNo: decodedToken.sub,
      role: decodedToken.role,
    });
  };

  const logout = () => {
    // When a user logs out, remove the token and clear the user state
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // The value provided to consuming components
  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


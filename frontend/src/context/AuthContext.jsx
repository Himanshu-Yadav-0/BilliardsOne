import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Context ko create karna
const AuthContext = createContext(null);

// 2. Provider Component banana jo poore app ko wrap karega
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Yeh helper function token se user ki details nikaalta hai
  const setupUserFromToken = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      // Token expire ho gaya hai ya nahi, check karein
      if (decodedToken.exp * 1000 > Date.now()) {
        setUser({
          mobileNo: decodedToken.sub,
          role: decodedToken.role,
          // Sabse important: "magic stamp" (is_owner) ko read karke save karein
          is_owner: decodedToken.is_owner || false 
        });
      } else {
        // Agar token expire ho gaya hai, toh use remove kar dein
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };
  
  // Jab app pehli baar load hota hai, yeh useEffect chalta hai
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setupUserFromToken(token);
    }
    setLoading(false);
  }, []);

  // Normal login ke liye
  const login = (token) => {
    localStorage.setItem('authToken', token);
    sessionStorage.removeItem('originalOwnerToken'); // Puraana switch token (agar ho) clear karein
    setupUserFromToken(token);
  };

  // Logout ke liye
  const logout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('originalOwnerToken'); // Dono storage clear karein
    setUser(null);
  };

  // --- Naya Logic: Role Switch Karne Ke Liye ---

  // Jab owner "Act as Staff" pe click karta hai
  const switchToStaff = (staffToken) => {
    const ownerToken = localStorage.getItem('authToken');
    // Original owner token ko sessionStorage mein save karein
    sessionStorage.setItem('originalOwnerToken', ownerToken); 
    // Naya, temporary staff token localStorage mein set karein
    localStorage.setItem('authToken', staffToken); 
    setupUserFromToken(staffToken);
  };

  // Jab owner "Switch Back to Owner" pe click karta hai
  const switchBackToOwner = () => {
    const ownerToken = sessionStorage.getItem('originalOwnerToken');
    if (ownerToken) {
      // Original owner token ko restore karein
      localStorage.setItem('authToken', ownerToken); 
      sessionStorage.removeItem('originalOwnerToken');
      setupUserFromToken(ownerToken);
    } else {
      // Agar kisi vajah se original token na mile, toh safety ke liye logout kar dein
      logout(); 
    }
  };

  // Yeh saari values poore app mein available hongi
  const value = { user, login, logout, loading, switchToStaff, switchBackToOwner };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook taaki context ko aasaani se use kar sakein
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};


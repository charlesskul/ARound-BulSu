import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingUser, setPendingUser] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const storedAuth = localStorage.getItem('isAuthenticated');
    
    if (storedUser && storedAuth === 'true') {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Login function - Step 1: Validate credentials
  const login = async (email, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock admin credentials
    const validAdmins = [
      { email: 'admin@bulsu.edu.ph', password: 'admin123', name: 'Security Office', role: 'Super Admin' },
      { email: 'security@bulsu.edu.ph', password: 'security123', name: 'Campus Security', role: 'Security Admin' },
    ];

    const admin = validAdmins.find(a => a.email === email && a.password === password);

    if (admin) {
      setPendingUser({
        id: Date.now(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        phone: '+63 912 345 6789',
        lastLogin: new Date().toISOString(),
      });
      return { success: true, requiresTwoFactor: true };
    }

    return { success: false, error: 'Invalid credentials. Please check your email and password.' };
  };

  // Verify 2FA OTP - Step 2
  const verifyOTP = async (otp) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Accept any 6-digit OTP for demo (in real app, verify with server)
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      const authenticatedUser = {
        ...pendingUser,
        sessionToken: 'mock-session-token-' + Date.now(),
      };

      setUser(authenticatedUser);
      setIsAuthenticated(true);
      setPendingUser(null);

      // Store in localStorage
      localStorage.setItem('adminUser', JSON.stringify(authenticatedUser));
      localStorage.setItem('isAuthenticated', 'true');

      // Log to audit trail
      logAuditTrail('LOGIN', `Admin ${authenticatedUser.name} logged in successfully`);

      return { success: true };
    }

    return { success: false, error: 'Invalid OTP. Please enter the correct 6-digit code.' };
  };

  // Logout function
  const logout = async () => {
    // Log to audit trail before clearing
    if (user) {
      logAuditTrail('LOGOUT', `Admin ${user.name} logged out`);
    }

    // Clear state
    setUser(null);
    setIsAuthenticated(false);
    setPendingUser(null);

    // Clear localStorage
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isAuthenticated');

    return { success: true };
  };

  // Audit trail logging
  const logAuditTrail = (action, description) => {
    const auditLog = JSON.parse(localStorage.getItem('auditTrail') || '[]');
    auditLog.unshift({
      id: Date.now(),
      action,
      description,
      timestamp: new Date().toISOString(),
      user: user?.name || pendingUser?.name || 'System',
    });
    // Keep only last 100 entries
    localStorage.setItem('auditTrail', JSON.stringify(auditLog.slice(0, 100)));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    pendingUser,
    login,
    verifyOTP,
    logout,
    logAuditTrail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

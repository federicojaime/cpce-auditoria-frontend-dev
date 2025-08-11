import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('cpce_token');
    const userData = localStorage.getItem('cpce_user');
    
    console.log('AuthContext - Verificando token existente:', !!token);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setLoginError('');
        console.log('AuthContext - Usuario cargado:', parsedUser.nombre, 'Rol:', parsedUser.rol);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('AuthContext - Enviando request de login...');
      
      setLoginError('');
      
      const response = await api.post('/auth/login', {
        username,
        password
      });

      console.log('AuthContext - Respuesta recibida:', response.data);

      if (response.data.success) {
        const { token, user: userData } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('cpce_token', token);
        localStorage.setItem('cpce_user', JSON.stringify(userData));
        
        // Actualizar estado
        setUser(userData);
        setIsAuthenticated(true);
        setLoginError('');
        
        console.log('AuthContext - Login exitoso para:', userData.nombre, 'Rol:', userData.rol);
        
        return { success: true, user: userData };
      } else {
        const errorMsg = response.data.message || 'Usuario y/o contraseña incorrectos';
        console.log('AuthContext - Login fallido:', errorMsg);
        setLoginError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('AuthContext - Error en login:', error);
      const errorMsg = error.response?.data?.message || 'Error de conexión';
      setLoginError(errorMsg);
      return { 
        success: false, 
        message: errorMsg
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      console.log('AuthContext - Logout exitoso');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('cpce_token');
      localStorage.removeItem('cpce_user');
      setUser(null);
      setIsAuthenticated(false);
      setLoginError('');
      console.log('AuthContext - Estado limpiado');
    }
  };

  const clearLoginError = () => {
    console.log('AuthContext - Limpiando error de login');
    setLoginError('');
  };

  // ===== NUEVAS FUNCIONES PARA MANEJO DE ROLES =====
  
  const hasRole = (role) => {
    if (!user) return false;
    return user.rol === role;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return getRolePermissions(user.rol).includes(permission);
  };

  const getUserDefaultRoute = () => {
    if (!user) return '/login';
    
    switch (user.rol) {
      case 1:
        return '/alto-costo/listado'; // Rol 1 - Alto Costo
      case 2:
        return '/pendientes'; // Rol 2 - Tratamientos Prolongados
      case 3:
        return '/estadisticas'; // Rol 3 - Estadísticas/Reportes
      case 5: // Administrativo
      default:
        return '/'; // Dashboard por defecto
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    loginError,
    login,
    logout,
    clearLoginError,
    // Nuevas funciones
    hasRole,
    hasPermission,
    getUserDefaultRoute
  };

  console.log('AuthContext - Estado actual:', { 
    isAuthenticated, 
    loading, 
    userName: user?.nombre,
    userRole: user?.rol,
    hasError: !!loginError
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ===== DEFINICIÓN DE PERMISOS POR ROL =====
const getRolePermissions = (role) => {
  const permissions = {
    1: ['view_alto_costo'], // Solo auditorías de alto costo
    2: ['view_tratamientos_prolongados'], // Solo auditorías de tratamientos prolongados
    3: ['view_estadisticas', 'view_vademecum', 'view_proveedores'], // Estadísticas, vademecum y proveedores
    5: ['view_all'], // Administrativo - acceso completo
    // Agregar más roles según necesidad
  };
  
  return permissions[role] || [];
};
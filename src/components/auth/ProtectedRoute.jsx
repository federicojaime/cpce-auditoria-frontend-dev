// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

const ProtectedRoute = ({ 
  children, 
  allowedRoles = null, 
  requiredPermission = null 
}) => {
  const { user, isAuthenticated, loading, hasRole, hasPermission, getUserDefaultRoute } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Verificando permisos..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar roles permitidos
  if (allowedRoles && !allowedRoles.includes(user?.rol)) {
    console.log(`Acceso denegado - Rol ${user?.rol} no permitido para esta ruta. Roles permitidos:`, allowedRoles);
    
    // Redirigir a la ruta por defecto del usuario
    const defaultRoute = getUserDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }

  // Verificar permiso específico
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log(`Acceso denegado - Permiso '${requiredPermission}' requerido`);
    
    const defaultRoute = getUserDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
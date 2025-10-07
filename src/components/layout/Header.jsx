// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import UserMenu from './UserMenu';
import { TrialBadge } from '../common/TrialCounter';
import NotificationsPanel from '../common/NotificationsPanel';
import {
  Bars3Icon,
  BellIcon
} from '@heroicons/react/24/outline';

const Header = ({ onMenuToggle, user }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const { logout, trialInfo } = useAuth();
  const { unreadCount } = useNotifications();

  // Cerrar user menu al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  // Obtener título de página según la ruta
  const getPageTitle = () => {
    const routes = {
      '/': 'ESCRITORIO',
      '/pendientes': 'AUDITORÍAS PENDIENTES',
      '/historicos': 'AUDITORÍAS HISTÓRICAS',
      '/listado': 'LISTADO DE AUDITORÍAS',
      '/historial-paciente': 'HISTORIAL DE PACIENTE',
      '/descargar-excel': 'DESCARGAR REPORTES',
      '/vademecum': 'VADEMÉCUM'
    };
    
    return routes[location.pathname] || 'Sistema de Auditorías';
  };

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
    <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-sm border-b border-gray-200">
      {/* Botón menú móvil */}
      <button
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden hover:bg-gray-50 transition-colors duration-200"
        onClick={onMenuToggle}
        type="button"
      >
        <span className="sr-only">Abrir sidebar</span>
        <Bars3Icon className="h-6 w-6" />
      </button>
      
      <div className="flex-1 px-4 flex justify-between items-center">
        {/* Título de página */}
        <div className="flex-1 flex">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {getPageTitle()}
          </h1>
        </div>
        
        {/* Acciones del header */}
        <div className="ml-4 flex items-center space-x-4">
          {/* Badge de período de prueba */}
          {trialInfo && trialInfo.diasRestantes >= 0 && user?.esPrueba && (
            <>
              <TrialBadge diasRestantes={trialInfo.diasRestantes} />
              <div className="h-6 w-px bg-gray-300" />
            </>
          )}

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setNotificationsPanelOpen(!notificationsPanelOpen)}
              className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              type="button"
            >
              <span className="sr-only">Ver notificaciones</span>
              <BellIcon className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationsPanel
              isOpen={notificationsPanelOpen}
              onClose={() => setNotificationsPanelOpen(false)}
            />
          </div>

          {/* Separador */}
          <div className="h-6 w-px bg-gray-300" />

          {/* Menu usuario */}
          <UserMenu
            user={user}
            isOpen={userMenuOpen}
            onToggle={() => setUserMenuOpen(!userMenuOpen)}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </header>

    {/* Modal de confirmación de cerrar sesión */}
    {showLogoutModal && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={cancelLogout}
          ></div>

          {/* Centrador */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          {/* Modal */}
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Cerrar sesión
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      ¿Está seguro que desea cerrar sesión?
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={confirmLogout}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
              >
                Aceptar
              </button>
              <button
                type="button"
                onClick={cancelLogout}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;
import React, { useEffect, useRef } from 'react';
import { useNotifications } from '../../context/NotificationsContext';
import {
  XMarkIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const panelRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getIconByType = (type) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XMarkIcon className="h-5 w-5 text-red-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'trial':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundByType = (type, read) => {
    const opacity = read ? 'bg-opacity-30' : 'bg-opacity-50';
    switch (type) {
      case 'warning':
        return `bg-amber-50 ${opacity}`;
      case 'error':
        return `bg-red-50 ${opacity}`;
      case 'success':
        return `bg-green-50 ${opacity}`;
      case 'trial':
        return `bg-blue-50 ${opacity}`;
      default:
        return `bg-gray-50 ${opacity}`;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Marcar todas leídas
              </button>
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Limpiar todo
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <InformationCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 text-center">
              No tienes notificaciones
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-blue-50 bg-opacity-20' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIconByType(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {notification.title && (
                          <p className={`text-sm font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                        )}
                        <p className={`text-sm ${
                          !notification.read ? 'text-gray-800' : 'text-gray-600'
                        } mt-1`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(notification.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="ml-2 p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0"
                      >
                        <TrashIcon className="h-4 w-4 text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                    {!notification.read && (
                      <div className="mt-2">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;

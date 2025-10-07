import React from 'react';
import { ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Componente para mostrar el contador de días de prueba
 * Se puede usar en el header, sidebar o donde sea necesario
 */
const TrialCounter = ({ diasRestantes, fechaExpiracion, compact = false, className = '' }) => {
  // Determinar el estado según días restantes
  const getStatus = () => {
    if (diasRestantes <= 0) return 'expired';
    if (diasRestantes <= 3) return 'critical';
    if (diasRestantes <= 7) return 'warning';
    return 'active';
  };

  const status = getStatus();

  // Configuración de estilos según el estado
  const statusConfig = {
    active: {
      bg: 'bg-blue-50 border-blue-400',
      icon: ClockIcon,
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-400',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-amber-600',
      textColor: 'text-amber-800',
      badgeColor: 'bg-amber-100 text-amber-700'
    },
    critical: {
      bg: 'bg-red-50 border-red-400',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      badgeColor: 'bg-red-100 text-red-700'
    },
    expired: {
      bg: 'bg-gray-50 border-gray-400',
      icon: ClockIcon,
      iconColor: 'text-gray-600',
      textColor: 'text-gray-800',
      badgeColor: 'bg-gray-100 text-gray-700'
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  // Formato de fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Versión compacta (para header/sidebar)
  if (compact) {
    return (
      <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border-2 ${config.bg} ${className}`}>
        <IconComponent className={`h-4 w-4 ${config.iconColor} mr-2`} />
        <span className={`text-xs font-semibold ${config.textColor}`}>
          {diasRestantes > 0 ? `${diasRestantes} días` : 'Expirado'}
        </span>
      </div>
    );
  }

  // Versión completa (para dashboard/perfil)
  return (
    <div className={`${config.bg} border-l-4 rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-semibold ${config.textColor}`}>
            {status === 'expired' && 'Período de Prueba Expirado'}
            {status === 'critical' && '¡Atención! Tu prueba está por vencer'}
            {status === 'warning' && 'Tu período de prueba está por finalizar'}
            {status === 'active' && 'Cuenta en Período de Prueba'}
          </h3>

          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${config.textColor}`}>Días restantes:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.badgeColor}`}>
                {diasRestantes > 0 ? diasRestantes : 0} {diasRestantes === 1 ? 'día' : 'días'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs ${config.textColor} opacity-80`}>Fecha de expiración:</span>
              <span className={`text-xs font-medium ${config.textColor}`}>
                {formatDate(fechaExpiracion)}
              </span>
            </div>
          </div>

          {status === 'expired' && (
            <p className="mt-2 text-xs text-gray-700">
              Contacta al administrador para activar tu cuenta.
            </p>
          )}

          {(status === 'critical' || status === 'warning') && (
            <p className="mt-2 text-xs text-gray-700">
              Contacta al administrador para extender tu período de prueba o activar tu cuenta definitiva.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Badge simple para mostrar en cualquier parte
 */
export const TrialBadge = ({ diasRestantes, className = '' }) => {
  const getColor = () => {
    if (diasRestantes <= 0) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (diasRestantes <= 3) return 'bg-red-100 text-red-700 border-red-300';
    if (diasRestantes <= 7) return 'bg-amber-100 text-amber-700 border-amber-300';
    return 'bg-blue-100 text-blue-700 border-blue-300';
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColor()} ${className}`}>
      <ClockIcon className="h-3 w-3 mr-1" />
      Prueba: {diasRestantes > 0 ? `${diasRestantes}d` : 'Expirado'}
    </span>
  );
};

/**
 * Banner para mostrar en la parte superior de la app
 */
export const TrialBanner = ({ diasRestantes, fechaExpiracion, onDismiss }) => {
  if (diasRestantes > 7) return null; // No mostrar si faltan más de 7 días

  const isExpired = diasRestantes <= 0;
  const isCritical = diasRestantes <= 3 && diasRestantes > 0;

  return (
    <div className={`${
      isExpired ? 'bg-gray-600' :
      isCritical ? 'bg-red-600' : 'bg-amber-500'
    } shadow-lg`}>
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center flex-1">
            <span className="flex p-2 rounded-lg bg-white/10">
              {isExpired ? (
                <ClockIcon className="h-5 w-5 text-white" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-white" />
              )}
            </span>
            <p className="ml-3 text-sm font-medium text-white">
              {isExpired ? (
                'Tu período de prueba ha expirado. Contacta al administrador para activar tu cuenta.'
              ) : (
                `¡Atención! Tu período de prueba vence en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'} (${new Date(fechaExpiracion).toLocaleDateString('es-AR')})`
              )}
            </p>
          </div>

          {onDismiss && !isExpired && (
            <button
              type="button"
              onClick={onDismiss}
              className="flex-shrink-0 ml-3 inline-flex text-white hover:bg-white/10 rounded-md p-1.5 transition-colors"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Modal para mostrar detalles completos del período de prueba
 */
export const TrialDetailsModal = ({
  isOpen,
  onClose,
  diasRestantes,
  fechaExpiracion,
  fechaInicio,
  diasPrueba
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const porcentajeUsado = Math.max(0, Math.min(100, ((diasPrueba - diasRestantes) / diasPrueba) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Detalles del Período de Prueba
                </h3>
                <div className="mt-4 space-y-4">
                  {/* Barra de progreso */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-medium text-gray-900">{Math.round(porcentajeUsado)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          diasRestantes <= 3 ? 'bg-red-600' :
                          diasRestantes <= 7 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${porcentajeUsado}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fecha de inicio:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(fechaInicio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fecha de expiración:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(fechaExpiracion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Días totales:</span>
                      <span className="text-sm font-medium text-gray-900">{diasPrueba} días</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-sm font-semibold text-gray-700">Días restantes:</span>
                      <span className={`text-sm font-bold ${
                        diasRestantes <= 3 ? 'text-red-600' :
                        diasRestantes <= 7 ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        {diasRestantes > 0 ? diasRestantes : 0} {diasRestantes === 1 ? 'día' : 'días'}
                      </span>
                    </div>
                  </div>

                  {/* Mensaje de ayuda */}
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>¿Necesitas más tiempo?</strong> Contacta al administrador del sistema para extender tu período de prueba o activar tu cuenta definitiva.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialCounter;

import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

/**
 * Componente Alert personalizado con estilos modernos
 *
 * @param {Object} props
 * @param {'success' | 'error' | 'warning' | 'info'} props.type - Tipo de alerta
 * @param {string} props.title - Título de la alerta
 * @param {string} props.message - Mensaje principal
 * @param {Array<string>} props.details - Lista opcional de detalles adicionales
 * @param {boolean} props.dismissible - Si la alerta puede cerrarse
 * @param {Function} props.onDismiss - Callback al cerrar la alerta
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.compact - Versión compacta de la alerta
 */
const Alert = ({
  type = 'info',
  title,
  message,
  details = [],
  dismissible = false,
  onDismiss,
  className = '',
  compact = false
}) => {
  // Configuración de estilos según el tipo
  const configs = {
    success: {
      container: 'bg-green-50 border-green-400',
      icon: CheckCircleIcon,
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      buttonColor: 'text-green-500 hover:text-green-600'
    },
    error: {
      container: 'bg-red-50 border-red-400',
      icon: XCircleIcon,
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      buttonColor: 'text-red-500 hover:text-red-600'
    },
    warning: {
      container: 'bg-amber-50 border-amber-400',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-800',
      messageColor: 'text-amber-700',
      buttonColor: 'text-amber-500 hover:text-amber-600'
    },
    info: {
      container: 'bg-blue-50 border-blue-400',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
      buttonColor: 'text-blue-500 hover:text-blue-600'
    }
  };

  const config = configs[type] || configs.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`
        ${config.container}
        border-l-4
        rounded-lg
        shadow-sm
        ${compact ? 'p-3' : 'p-4'}
        ${className}
        transition-all duration-300 ease-in-out
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`${compact ? 'h-5 w-5' : 'h-6 w-6'} ${config.iconColor}`} />
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold ${config.titleColor}`}>
              {title}
            </h3>
          )}

          {message && (
            <p className={`${title ? 'mt-1' : ''} ${compact ? 'text-xs' : 'text-sm'} ${config.messageColor}`}>
              {message}
            </p>
          )}

          {details && details.length > 0 && (
            <ul className={`${compact ? 'mt-1' : 'mt-2'} list-disc list-inside space-y-1`}>
              {details.map((detail, index) => (
                <li key={index} className={`${compact ? 'text-xs' : 'text-sm'} ${config.messageColor}`}>
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>

        {dismissible && onDismiss && (
          <div className="ml-3 flex-shrink-0">
            <button
              type="button"
              onClick={onDismiss}
              className={`
                inline-flex
                rounded-md
                p-1.5
                ${config.buttonColor}
                hover:bg-white/20
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                transition-colors
              `}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Alert con acción
export const AlertWithAction = ({
  type = 'info',
  title,
  message,
  actionLabel,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionOnClick,
  className = ''
}) => {
  const configs = {
    success: {
      container: 'bg-green-50 border-green-400',
      icon: CheckCircleIcon,
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700',
      buttonBg: 'bg-green-600 hover:bg-green-700',
      secondaryButtonBg: 'bg-green-100 hover:bg-green-200 text-green-700'
    },
    error: {
      container: 'bg-red-50 border-red-400',
      icon: XCircleIcon,
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700',
      buttonBg: 'bg-red-600 hover:bg-red-700',
      secondaryButtonBg: 'bg-red-100 hover:bg-red-200 text-red-700'
    },
    warning: {
      container: 'bg-amber-50 border-amber-400',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-amber-400',
      titleColor: 'text-amber-800',
      messageColor: 'text-amber-700',
      buttonBg: 'bg-amber-600 hover:bg-amber-700',
      secondaryButtonBg: 'bg-amber-100 hover:bg-amber-200 text-amber-700'
    },
    info: {
      container: 'bg-blue-50 border-blue-400',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
      secondaryButtonBg: 'bg-blue-100 hover:bg-blue-200 text-blue-700'
    }
  };

  const config = configs[type] || configs.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`
        ${config.container}
        border-l-4
        rounded-lg
        shadow-sm
        p-4
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-6 w-6 ${config.iconColor}`} />
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-base font-semibold ${config.titleColor}`}>
              {title}
            </h3>
          )}

          {message && (
            <p className={`${title ? 'mt-1' : ''} text-sm ${config.messageColor}`}>
              {message}
            </p>
          )}

          {(actionLabel || secondaryActionLabel) && (
            <div className="mt-4 flex gap-3">
              {actionLabel && actionOnClick && (
                <button
                  type="button"
                  onClick={actionOnClick}
                  className={`
                    px-4 py-2
                    ${config.buttonBg}
                    text-white
                    rounded-lg
                    text-sm
                    font-medium
                    transition-colors
                    focus:outline-none
                    focus:ring-2
                    focus:ring-offset-2
                  `}
                >
                  {actionLabel}
                </button>
              )}

              {secondaryActionLabel && secondaryActionOnClick && (
                <button
                  type="button"
                  onClick={secondaryActionOnClick}
                  className={`
                    px-4 py-2
                    ${config.secondaryButtonBg}
                    rounded-lg
                    text-sm
                    font-medium
                    transition-colors
                    focus:outline-none
                    focus:ring-2
                    focus:ring-offset-2
                  `}
                >
                  {secondaryActionLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Alert tipo Banner (ocupa todo el ancho)
export const AlertBanner = ({
  type = 'info',
  message,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const configs = {
    success: {
      container: 'bg-green-600',
      icon: CheckCircleIcon,
      iconColor: 'text-white',
      textColor: 'text-white'
    },
    error: {
      container: 'bg-red-600',
      icon: XCircleIcon,
      iconColor: 'text-white',
      textColor: 'text-white'
    },
    warning: {
      container: 'bg-amber-500',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-white',
      textColor: 'text-white'
    },
    info: {
      container: 'bg-blue-600',
      icon: InformationCircleIcon,
      iconColor: 'text-white',
      textColor: 'text-white'
    }
  };

  const config = configs[type] || configs.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`
        ${config.container}
        shadow-lg
        ${className}
      `}
      role="alert"
    >
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center flex-1">
            <span className="flex p-2 rounded-lg bg-white/10">
              <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
            </span>
            <p className={`ml-3 text-sm font-medium ${config.textColor}`}>
              {message}
            </p>
          </div>

          {dismissible && onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="flex-shrink-0 ml-3 inline-flex text-white hover:bg-white/10 rounded-md p-1.5 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;

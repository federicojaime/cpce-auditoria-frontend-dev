// src/components/common/ConfirmModal.jsx
import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    type = 'warning', // 'warning', 'danger', 'success', 'info'
    confirmButtonColor = 'blue',
    showCancelButton = true
}) => {
    if (!isOpen) return null;

    // Configuración de colores según el tipo
    const typeConfig = {
        warning: {
            icon: ExclamationTriangleIcon,
            iconColor: 'text-orange-600',
            iconBgColor: 'bg-orange-100',
            borderColor: 'border-orange-200'
        },
        danger: {
            icon: ExclamationTriangleIcon,
            iconColor: 'text-red-600',
            iconBgColor: 'bg-red-100',
            borderColor: 'border-red-200'
        },
        success: {
            icon: CheckCircleIcon,
            iconColor: 'text-green-600',
            iconBgColor: 'bg-green-100',
            borderColor: 'border-green-200'
        },
        info: {
            icon: InformationCircleIcon,
            iconColor: 'text-blue-600',
            iconBgColor: 'bg-blue-100',
            borderColor: 'border-blue-200'
        }
    };

    const config = typeConfig[type] || typeConfig.warning;
    const IconComponent = config.icon;

    // Configuración de colores de botón
    const buttonColors = {
        blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        red: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    // Prevenir cierre al hacer clic en el contenido del modal
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Overlay con blur */}
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Fondo oscuro con blur */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75 backdrop-blur-sm"
                    aria-hidden="true"
                    onClick={handleCancel}
                ></div>

                {/* Espaciador para centrar el modal */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                    &#8203;
                </span>

                {/* Modal */}
                <div
                    className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-2xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                    onClick={handleModalClick}
                >
                    {/* Header con icono */}
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex items-start">
                            <div className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${config.iconBgColor}`}>
                                <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                                    {title}
                                </h3>
                            </div>
                            {/* Botón cerrar */}
                            <button
                                onClick={handleCancel}
                                className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-full p-1 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="px-6 pb-6">
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Footer con botones */}
                    <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse gap-3">
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-5 py-2.5 text-sm font-medium text-white ${buttonColors[confirmButtonColor]} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors sm:w-auto`}
                        >
                            {confirmText}
                        </button>
                        {showCancelButton && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors sm:mt-0 sm:w-auto"
                            >
                                {cancelText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

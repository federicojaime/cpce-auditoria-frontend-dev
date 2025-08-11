import React from 'react';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const ModalProgresoFarmalink = ({ 
    visible, 
    progreso, 
    mensaje, 
    procesando, 
    errores, 
    onCerrar 
}) => {
    if (!visible) return null;

    const getIconoProgreso = () => {
        if (procesando) {
            return (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            );
        } else if (errores.length > 0) {
            return (
                <div className="flex justify-center">
                    <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
                </div>
            );
        } else if (progreso === 100) {
            return (
                <div className="flex justify-center">
                    <CheckCircleIcon className="h-12 w-12 text-green-500" />
                </div>
            );
        }
        return null;
    };

    const getClaseProgreso = () => {
        if (errores.length > 0) return 'bg-yellow-500';
        if (progreso === 100) return 'bg-green-500';
        return 'bg-blue-500';
    };

    const getColorTexto = () => {
        if (errores.length > 0) return 'text-yellow-800';
        if (progreso === 100) return 'text-green-800';
        return 'text-blue-800';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                    <h2 className="text-lg font-semibold flex items-center">
                        <span className="mr-2">💊</span>
                        Procesando Autorizaciones Farmalink
                    </h2>
                    {!procesando && (
                        <button 
                            onClick={onCerrar}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Icono de estado */}
                    <div className="mb-4">
                        {getIconoProgreso()}
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                        <div 
                            className={`h-4 rounded-full transition-all duration-300 ${getClaseProgreso()}`}
                            style={{ width: `${progreso}%` }}
                        ></div>
                    </div>

                    {/* Porcentaje */}
                    <div className="text-center mb-2">
                        <span className={`text-2xl font-bold ${getColorTexto()}`}>
                            {progreso}%
                        </span>
                    </div>

                    {/* Mensaje de estado */}
                    <p className={`text-center mb-4 ${getColorTexto()}`}>
                        {mensaje}
                    </p>

                    {/* Lista de errores */}
                    {errores.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                                Errores encontrados:
                            </h3>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                                {errores.map((error, index) => (
                                    <div key={index} className="text-sm text-yellow-800 mb-1 last:mb-0">
                                        <span className="font-medium">{error.medicamento}:</span> {error.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mensaje de éxito */}
                    {progreso === 100 && errores.length === 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                            <div className="flex items-center text-green-800">
                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                <div>
                                    <p className="font-medium">¡Procesamiento completado exitosamente!</p>
                                    <p className="text-sm">Redirigiendo automáticamente...</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                {!procesando && (
                    <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end space-x-3">
                        <button 
                            onClick={onCerrar}
                            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                        >
                            Cerrar
                        </button>
                        {progreso === 100 && (
                            <button 
                                onClick={() => window.location.href = '/pendientes'}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <span className="mr-2">📋</span>
                                Ver Auditorías
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalProgresoFarmalink;
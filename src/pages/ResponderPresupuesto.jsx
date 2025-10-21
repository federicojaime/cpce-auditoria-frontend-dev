// src/pages/ResponderPresupuesto.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    CalendarIcon,
    PaperAirplaneIcon,
    BuildingOffice2Icon,
    UserIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const ResponderPresupuesto = () => {
    const { token } = useParams();

    // Estados principales
    const [solicitud, setSolicitud] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [sending, setSending] = useState(false);
    const [expirado, setExpirado] = useState(false);
    const [yaRespondio, setYaRespondio] = useState(false);

    // Cargar solicitud cuando se monta el componente
    useEffect(() => {
        cargarSolicitud();
    }, [token]);

    const cargarSolicitud = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/presupuestos/solicitud/${token}`
            );

            setSolicitud(response.data);

            // Inicializar respuestas vacías para cada medicamento
            const respuestasIniciales = {};
            response.data.auditorias.forEach(auditoria => {
                auditoria.medicamentos.forEach(medicamento => {
                    const key = `${auditoria.id}_${medicamento.id}`;
                    respuestasIniciales[key] = {
                        auditoriaId: auditoria.id,
                        medicamentoId: medicamento.id,
                        acepta: false,
                        precio: '',
                        fechaRetiro: '',
                        fechaVencimiento: '',
                        comentarios: ''
                    };
                });
            });

            setRespuestas(respuestasIniciales);
            setLoading(false);

        } catch (err) {
            setLoading(false);

            // Manejar diferentes tipos de error
            if (err.response) {
                const status = err.response.status;
                const errorMsg = err.response.data?.error || 'Error al cargar la solicitud';

                if (status === 410) {
                    setExpirado(true);
                    setError('Esta solicitud ha expirado. Por favor contacte con CPCE Salud.');
                } else if (status === 400) {
                    setYaRespondio(true);
                    setError('Ya ha respondido a esta solicitud anteriormente.');
                } else if (status === 404) {
                    setError('Solicitud no encontrada. Verifique el enlace recibido.');
                } else {
                    setError(errorMsg);
                }
            } else {
                setError('Error de conexión. Verifique su conexión a internet.');
            }
        }
    };

    // Manejar cambios en los campos del formulario
    const handleChange = (auditoriaId, medicamentoId, field, value) => {
        const key = `${auditoriaId}_${medicamentoId}`;

        setRespuestas(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    // Manejar cambio de checkbox "Acepta"
    const handleAceptaChange = (auditoriaId, medicamentoId, acepta) => {
        const key = `${auditoriaId}_${medicamentoId}`;

        // Si no acepta, limpiar campos de precio y fechas
        if (!acepta) {
            setRespuestas(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    acepta: false,
                    precio: '',
                    fechaRetiro: '',
                    fechaVencimiento: ''
                }
            }));
        } else {
            setRespuestas(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    acepta: true
                }
            }));
        }
    };

    // Validar formulario antes de enviar
    const validarFormulario = () => {
        const errores = [];

        Object.values(respuestas).forEach((respuesta, index) => {
            if (respuesta.acepta) {
                if (!respuesta.precio || parseFloat(respuesta.precio) <= 0) {
                    errores.push(`Debe ingresar un precio válido para el medicamento ${index + 1}`);
                }
                if (!respuesta.fechaRetiro) {
                    errores.push(`Debe ingresar una fecha de retiro para el medicamento ${index + 1}`);
                }
                if (!respuesta.fechaVencimiento) {
                    errores.push(`Debe ingresar una fecha de vencimiento para el medicamento ${index + 1}`);
                }

                // Validar que la fecha de vencimiento sea posterior a la fecha de retiro
                if (respuesta.fechaRetiro && respuesta.fechaVencimiento) {
                    if (new Date(respuesta.fechaVencimiento) <= new Date(respuesta.fechaRetiro)) {
                        errores.push(`La fecha de vencimiento debe ser posterior a la fecha de retiro (medicamento ${index + 1})`);
                    }
                }
            }
        });

        // Validar que al menos haya una respuesta (aceptada o rechazada)
        const hayAlgunaRespuesta = Object.values(respuestas).some(r => r.acepta || r.comentarios);
        if (!hayAlgunaRespuesta) {
            errores.push('Debe aceptar o rechazar al menos un medicamento');
        }

        return errores;
    };

    // Enviar respuesta
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar formulario
        const errores = validarFormulario();
        if (errores.length > 0) {
            setError(errores.join('\n'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Confirmar envío
        if (!window.confirm('¿Está seguro de enviar esta respuesta? No podrá modificarla después.')) {
            return;
        }

        try {
            setSending(true);
            setError(null);

            // Convertir objeto de respuestas a array
            const respuestasArray = Object.values(respuestas);

            await axios.post(
                `${import.meta.env.VITE_API_URL}/presupuestos/responder/${token}`,
                { respuestas: respuestasArray }
            );

            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err) {
            setSending(false);
            const errorMsg = err.response?.data?.error || 'Error al enviar la respuesta';
            setError(errorMsg);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Calcular tiempo restante
    const calcularTiempoRestante = () => {
        if (!solicitud) return '';

        const ahora = new Date();
        const expira = new Date(solicitud.solicitud.fechaExpiracion);
        const diferencia = expira - ahora;

        if (diferencia <= 0) return 'Expirado';

        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const dias = Math.floor(horas / 24);

        if (dias > 0) {
            return `${dias} día${dias > 1 ? 's' : ''} restante${dias > 1 ? 's' : ''}`;
        } else {
            return `${horas} hora${horas > 1 ? 's' : ''} restante${horas > 1 ? 's' : ''}`;
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando solicitud...</p>
                </div>
            </div>
        );
    }

    // Error / Expirado / Ya respondió
    if (error && !solicitud) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center">
                        {expirado ? (
                            <ClockIcon className="mx-auto h-12 w-12 text-orange-500" />
                        ) : yaRespondio ? (
                            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                        ) : (
                            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                        )}
                        <h2 className="mt-4 text-xl font-semibold text-gray-900">
                            {expirado ? 'Solicitud Expirada' : yaRespondio ? 'Ya Respondió' : 'Error'}
                        </h2>
                        <p className="mt-2 text-gray-600 whitespace-pre-line">{error}</p>
                        <div className="mt-6">
                            <p className="text-sm text-gray-500">
                                Para más información, contacte al SISTEMA DE AUDITORIA
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success
    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                    <div className="text-center">
                        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-900">
                            ¡Respuesta Enviada!
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Su presupuesto ha sido enviado exitosamente al SISTEMA DE AUDITORIA.
                        </p>
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Lote:</strong> {solicitud.solicitud.loteNumero}
                            </p>
                            <p className="text-sm text-blue-800 mt-1">
                                Recibirá un email de confirmación en breve.
                            </p>
                        </div>
                        <div className="mt-6">
                            <p className="text-sm text-gray-500">
                                Gracias por su colaboración
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Formulario principal
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Solicitud de Presupuesto - SISTEMA DE AUDITORIA
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Complete el formulario con los precios y disponibilidad de los medicamentos solicitados
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start space-x-3">
                            <BuildingOffice2Icon className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Proveedor</p>
                                <p className="text-sm text-gray-600">{solicitud.solicitud.proveedor.nombre}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <DocumentTextIcon className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">N° Lote</p>
                                <p className="text-sm text-gray-600">{solicitud.solicitud.loteNumero}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3">
                            <ClockIcon className="h-5 w-5 text-orange-600 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">Tiempo Restante</p>
                                <p className="text-sm text-orange-600 font-semibold">{calcularTiempoRestante()}</p>
                            </div>
                        </div>
                    </div>

                    {solicitud.solicitud.observaciones && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm font-medium text-yellow-800">Observaciones:</p>
                            <p className="text-sm text-yellow-700 mt-1">{solicitud.solicitud.observaciones}</p>
                        </div>
                    )}
                </div>

                {/* Mensajes de error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                            <div className="ml-3">
                                <p className="text-sm text-red-800 whitespace-pre-line">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    {solicitud.auditorias.map((auditoria) => (
                        <div key={auditoria.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                            {/* Header de auditoría */}
                            <div className="border-b border-gray-200 pb-4 mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Auditoría #{auditoria.id}
                                </h3>
                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                        <UserIcon className="h-4 w-4 mr-1" />
                                        {auditoria.paciente_nombre}
                                    </span>
                                    <span>DNI: {auditoria.paciente_dni}</span>
                                </div>
                            </div>

                            {/* Medicamentos */}
                            <div className="space-y-6">
                                {auditoria.medicamentos.map((medicamento) => {
                                    const key = `${auditoria.id}_${medicamento.id}`;
                                    const resp = respuestas[key];

                                    return (
                                        <div key={medicamento.id} className="border border-gray-200 rounded-lg p-4">
                                            {/* Info del medicamento */}
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-gray-900">{medicamento.nombre}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Presentación: {medicamento.presentacion} | Cantidad: {medicamento.cantidad}
                                                </p>
                                            </div>

                                            {/* Checkbox Acepta */}
                                            <div className="mb-4">
                                                <label className="flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={resp.acepta}
                                                        onChange={(e) => handleAceptaChange(
                                                            auditoria.id,
                                                            medicamento.id,
                                                            e.target.checked
                                                        )}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                                        Acepto proporcionar este medicamento
                                                    </span>
                                                </label>
                                            </div>

                                            {/* Campos si acepta */}
                                            {resp.acepta && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-green-50 p-4 rounded-lg">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Precio * <CurrencyDollarIcon className="inline h-4 w-4" />
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={resp.precio}
                                                            onChange={(e) => handleChange(
                                                                auditoria.id,
                                                                medicamento.id,
                                                                'precio',
                                                                e.target.value
                                                            )}
                                                            required
                                                            placeholder="0.00"
                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Fecha de Retiro * <CalendarIcon className="inline h-4 w-4" />
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={resp.fechaRetiro}
                                                            onChange={(e) => handleChange(
                                                                auditoria.id,
                                                                medicamento.id,
                                                                'fechaRetiro',
                                                                e.target.value
                                                            )}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            required
                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Fecha de Vencimiento * <CalendarIcon className="inline h-4 w-4" />
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={resp.fechaVencimiento}
                                                            onChange={(e) => handleChange(
                                                                auditoria.id,
                                                                medicamento.id,
                                                                'fechaVencimiento',
                                                                e.target.value
                                                            )}
                                                            min={new Date().toISOString().split('T')[0]}
                                                            required
                                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Campo de comentarios (siempre visible) */}
                                            <div className="mt-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Comentarios {!resp.acepta && '(Indique motivo de rechazo)'}
                                                </label>
                                                <textarea
                                                    value={resp.comentarios}
                                                    onChange={(e) => handleChange(
                                                        auditoria.id,
                                                        medicamento.id,
                                                        'comentarios',
                                                        e.target.value
                                                    )}
                                                    rows="2"
                                                    placeholder={resp.acepta ? 'Ej: Stock disponible, entrega inmediata' : 'Ej: No disponible en stock actualmente'}
                                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Botones */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-center space-x-4">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                disabled={sending}
                                className="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={sending}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                                        Enviar Respuesta
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="mt-4 text-xs text-center text-gray-500">
                            * Los campos marcados con asterisco son obligatorios cuando acepta el medicamento
                        </p>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>SISTEMA DE AUDITORIA - Solicitud de Presupuestos</p>
                    <p className="mt-1">
                        Para consultas: <a href="https://wa.me/5492657218215" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">WhatsApp Soporte</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResponderPresupuesto;

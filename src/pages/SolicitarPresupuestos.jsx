// src/pages/SolicitarPresupuestos.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import * as presupuestosService from '../services/presupuestosService';
import * as proveedoresService from '../services/proveedoresService';
import { toast } from 'react-toastify';
import {
    ShoppingCartIcon,
    BuildingOffice2Icon,
    CurrencyDollarIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    UserIcon,
    ClockIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

const SolicitarPresupuestos = () => {
    const { user } = useAuth();

    // Estados principales
    const [auditorias, setAuditorias] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados de selección
    const [auditoriasSeleccionadas, setAuditoriasSeleccionadas] = useState(new Set());
    const [proveedoresSeleccionados, setProveedoresSeleccionados] = useState(new Set());
    const [mostrarDetalle, setMostrarDetalle] = useState(null);
    const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Compras', href: '/compras' },
        { name: 'Solicitar Presupuestos', href: '/solicitar-presupuestos', current: true }
    ];

    // Cargar datos desde la API
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError('');

            // Cargar auditorías aprobadas y proveedores en paralelo
            const [auditoriasResponse, proveedoresResponse] = await Promise.all([
                presupuestosService.getAuditoriasAprobadas(),
                proveedoresService.getProveedores({ activo: true })
            ]);

            // Procesar auditorías - mapear campos del API al formato del componente
            if (auditoriasResponse.success && auditoriasResponse.data) {
                const auditoriasFormateadas = auditoriasResponse.data.map(auditoria => ({
                    id: auditoria.id || auditoria.idauditoria,
                    paciente: {
                        nombre: `${auditoria.apellido || ''}, ${auditoria.nombre || ''}`.trim(),
                        dni: auditoria.dni || 'N/A'
                    },
                    auditor: auditoria.medico || 'No asignado',
                    fechaAprobacion: auditoria.fecha ? new Date(auditoria.fecha).toLocaleDateString('es-AR') : 'N/A',
                    medicamentos: Array(auditoria.renglones || 1).fill({ nombre: 'Medicamento de alto costo', costoEstimado: 0 }),
                    costoTotal: auditoria.costo_estimado || 0,
                    prioridad: auditoria.prioridad || 'MEDIA',
                    observaciones: auditoria.observaciones || '',
                    meses: auditoria.meses || 0,
                    renglones: auditoria.renglones || 0
                }));
                setAuditorias(auditoriasFormateadas);
            }

            // Procesar proveedores - mapear campos del API al formato del componente
            if (proveedoresResponse.success && proveedoresResponse.data) {
                const proveedoresFormateados = proveedoresResponse.data.map(proveedor => ({
                    id: proveedor.id_proveedor || proveedor.id,
                    id_proveedor: proveedor.id_proveedor || proveedor.id,
                    razon_social: proveedor.razon_social || 'Sin nombre',
                    nombre: proveedor.razon_social || 'Sin nombre',
                    tipo_proveedor: proveedor.tipo_proveedor || 'Proveedor general',
                    especialidad: proveedor.tipo_proveedor || 'Proveedor general',
                    email: proveedor.email_general || proveedor.email || 'Sin email',
                    telefono: proveedor.telefono_general || proveedor.telefono || 'Sin teléfono',
                    direccion: proveedor.direccion || 'Sin dirección',
                    cuit: proveedor.cuit || 'Sin CUIT',
                    activo: proveedor.activo || 1
                }));
                setProveedores(proveedoresFormateados);
            }

        } catch (error) {
            console.error('Error cargando datos:', error);
            setError(error.message || 'Error al cargar los datos');
            toast.error('Error al cargar auditorías y proveedores');
        } finally {
            setLoading(false);
        }
    };

    // Manejar selección de auditorías
    const handleAuditoriaSelect = (auditoriaId) => {
        const nuevasSeleccionadas = new Set(auditoriasSeleccionadas);
        if (nuevasSeleccionadas.has(auditoriaId)) {
            nuevasSeleccionadas.delete(auditoriaId);
        } else {
            nuevasSeleccionadas.add(auditoriaId);
        }
        setAuditoriasSeleccionadas(nuevasSeleccionadas);
    };

    // Seleccionar todas las auditorías
    const handleSelectAllAuditorias = () => {
        if (auditoriasSeleccionadas.size === auditorias.length) {
            setAuditoriasSeleccionadas(new Set());
        } else {
            setAuditoriasSeleccionadas(new Set(auditorias.map(a => a.id)));
        }
    };

    // Manejar selección de proveedores
    const handleProveedorSelect = (proveedorId) => {
        const nuevosSeleccionados = new Set(proveedoresSeleccionados);
        if (nuevosSeleccionados.has(proveedorId)) {
            nuevosSeleccionados.delete(proveedorId);
        } else {
            nuevosSeleccionados.add(proveedorId);
        }
        setProveedoresSeleccionados(nuevosSeleccionados);
    };

    // Seleccionar todos los proveedores
    const handleSelectAllProveedores = () => {
        if (proveedoresSeleccionados.size === proveedores.length) {
            setProveedoresSeleccionados(new Set());
        } else {
            setProveedoresSeleccionados(new Set(proveedores.map(p => p.id_proveedor || p.id)));
        }
    };

    // Mostrar modal de confirmación
    const handleMostrarConfirmacion = () => {
        if (auditoriasSeleccionadas.size === 0) {
            setError('Debe seleccionar al menos una auditoría');
            toast.error('Debe seleccionar al menos una auditoría');
            return;
        }

        if (proveedoresSeleccionados.size === 0) {
            setError('Debe seleccionar al menos un proveedor');
            toast.error('Debe seleccionar al menos un proveedor');
            return;
        }

        setMostrarModalConfirmacion(true);
    };

    // Enviar solicitudes en lote
    const handleEnviarSolicitudes = async () => {
        setMostrarModalConfirmacion(false);

        try {
            setSending(true);
            setError('');

            // Obtener auditorías seleccionadas
            const auditoriasArray = Array.from(auditoriasSeleccionadas)
                .map(id => auditorias.find(a => a.id === id))
                .filter(Boolean);

            // Preparar medicamentos de todas las auditorías
            const medicamentos = [];
            auditoriasArray.forEach(auditoria => {
                if (auditoria.medicamentos && Array.isArray(auditoria.medicamentos)) {
                    auditoria.medicamentos.forEach(med => {
                        medicamentos.push({
                            nombre: med.nombre,
                            cantidad: med.cantidad,
                            unidad: 'unidad'
                        });
                    });
                }
            });

            // Preparar datos para la solicitud
            const datos = {
                descripcion: `Solicitud masiva para ${auditoriasArray.length} auditoría(s) de alto costo`,
                id_auditoria_asociada: auditoriasArray[0]?.id || null,
                proveedores: Array.from(proveedoresSeleccionados),
                medicamentos: medicamentos,
                fecha_limite_respuesta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días
                observaciones: `Incluye auditorías: ${Array.from(auditoriasSeleccionadas).join(', ')}`
            };

            // Enviar solicitud
            const response = await presupuestosService.solicitarPresupuesto(datos);

            if (response.success) {
                setSuccess(`✅ Solicitud creada exitosamente: ${response.data.numero_solicitud}`);
                toast.success(`Solicitud ${response.data.numero_solicitud} enviada a ${proveedoresSeleccionados.size} proveedores`, {
                    autoClose: 5000
                });

                // Limpiar selecciones
                setAuditoriasSeleccionadas(new Set());
                setProveedoresSeleccionados(new Set());

                // Recargar datos
                setTimeout(() => {
                    cargarDatos();
                }, 2000);
            }

        } catch (error) {
            console.error('Error al enviar solicitud:', error);
            setError(error.message || 'Error al enviar las solicitudes de presupuesto');
            toast.error(error.message || 'Error al enviar las solicitudes');
        } finally {
            setSending(false);
        }
    };

    // Calcular totales
    const calcularTotales = () => {
        const auditoriasArray = Array.from(auditoriasSeleccionadas)
            .map(id => auditorias.find(a => a.id === id))
            .filter(Boolean);

        const costoTotal = auditoriasArray.reduce((total, auditoria) => total + (auditoria.costoTotal || 0), 0);
        const medicamentosTotal = auditoriasArray.reduce((total, auditoria) =>
            total + (auditoria.medicamentos?.length || 0), 0);

        return { costoTotal, medicamentosTotal, auditoriasCount: auditoriasArray.length };
    };

    const { costoTotal, medicamentosTotal, auditoriasCount } = calcularTotales();

    if (loading) {
        return (
            <div className="p-4 lg:p-6">
                <Loading text="Cargando auditorías aprobadas..." />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <ShoppingCartIcon className="h-6 w-6 mr-2 text-blue-600" />
                                Solicitar Presupuestos - Alto Costo
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Enviar auditorías aprobadas a proveedores para cotización en lote
                            </p>
                        </div>
                        <button
                            onClick={cargarDatos}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Mensajes */}
            {error && (
                <ErrorMessage message={error} />
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resumen de selección */}
            {(auditoriasSeleccionadas.size > 0 || proveedoresSeleccionados.size > 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Resumen de Selección</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-xl font-bold text-blue-600">{auditoriasCount}</div>
                            <div className="text-sm text-gray-600">Auditorías</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-xl font-bold text-green-600">{medicamentosTotal}</div>
                            <div className="text-sm text-gray-600">Medicamentos</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-xl font-bold text-orange-600">${costoTotal.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Costo Total</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-xl font-bold text-purple-600">{proveedoresSeleccionados.size}</div>
                            <div className="text-sm text-gray-600">Proveedores</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Auditorías Aprobadas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-orange-600" />
                                Auditorías Aprobadas ({auditorias.length})
                            </h2>
                            <button
                                onClick={handleSelectAllAuditorias}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {auditoriasSeleccionadas.size === auditorias.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                            </button>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {auditorias.length === 0 ? (
                            <div className="text-center py-8">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">No hay auditorías aprobadas pendientes</p>
                            </div>
                        ) : (
                            auditorias.map((auditoria) => {
                                const isSelected = auditoriasSeleccionadas.has(auditoria.id);

                                return (
                                    <div
                                        key={auditoria.id}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => handleAuditoriaSelect(auditoria.id)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">#{auditoria.id}</h3>
                                                <p className="text-sm text-gray-600">{auditoria.paciente?.nombre}</p>
                                                <p className="text-xs text-gray-500">DNI: {auditoria.paciente?.dni}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-orange-600">
                                                    ${(auditoria.costoTotal || 0).toLocaleString()}
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${auditoria.prioridad === 'ALTA'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {auditoria.prioridad}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-sm">
                                                <strong>Auditor:</strong> {auditoria.auditor}
                                            </div>
                                            <div className="text-sm">
                                                <strong>Fecha:</strong> {auditoria.fechaAprobacion}
                                            </div>
                                            <div className="text-sm">
                                                <strong>Medicamentos:</strong> {auditoria.medicamentos?.length || 0}
                                            </div>
                                        </div>

                                        {mostrarDetalle === auditoria.id && auditoria.medicamentos && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <h4 className="font-medium mb-2">Medicamentos:</h4>
                                                {auditoria.medicamentos.map((med, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm mb-1">
                                                        <span>{med.nombre}</span>
                                                        <span>${(med.costoEstimado || 0).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                {auditoria.observaciones && (
                                                    <div className="mt-2">
                                                        <strong className="text-sm">Observaciones:</strong>
                                                        <p className="text-sm text-gray-600">{auditoria.observaciones}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-3 flex justify-between items-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMostrarDetalle(mostrarDetalle === auditoria.id ? null : auditoria.id);
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-800"
                                            >
                                                {mostrarDetalle === auditoria.id ? 'Ocultar' : 'Ver'} Detalle
                                            </button>

                                            {isSelected && (
                                                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Proveedores */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <BuildingOffice2Icon className="h-5 w-5 mr-2 text-green-600" />
                                Proveedores Disponibles ({proveedores.length})
                            </h2>
                            <button
                                onClick={handleSelectAllProveedores}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {proveedoresSeleccionados.size === proveedores.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                            </button>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {proveedores.length === 0 ? (
                            <div className="text-center py-8">
                                <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">No hay proveedores disponibles</p>
                            </div>
                        ) : (
                            proveedores.map((proveedor) => {
                                const proveedorId = proveedor.id_proveedor || proveedor.id;
                                const isSelected = proveedoresSeleccionados.has(proveedorId);

                                return (
                                    <div
                                        key={proveedorId}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${isSelected
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => handleProveedorSelect(proveedorId)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{proveedor.razon_social || proveedor.nombre}</h3>
                                                <p className="text-sm text-gray-600">{proveedor.tipo_proveedor || proveedor.especialidad}</p>
                                                <div className="mt-2 space-y-1">
                                                    <div className="text-xs text-gray-500">
                                                        <strong>Email:</strong> {proveedor.email}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        <strong>Teléfono:</strong> {proveedor.telefono}
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Botón de envío */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Enviar Solicitudes de Presupuesto
                    </h3>
                    <p className="text-sm text-gray-600">
                        Las auditorías seleccionadas serán enviadas a todos los proveedores seleccionados para cotización
                    </p>
                </div>

                <button
                    onClick={handleEnviarSolicitudes}
                    disabled={sending || auditoriasSeleccionadas.size === 0 || proveedoresSeleccionados.size === 0}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Enviando Solicitudes...
                        </>
                    ) : (
                        <>
                            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                            Enviar Solicitudes ({auditoriasSeleccionadas.size} auditorías a {proveedoresSeleccionados.size} proveedores)
                        </>
                    )}
                </button>

                {(auditoriasSeleccionadas.size === 0 || proveedoresSeleccionados.size === 0) && (
                    <p className="mt-2 text-sm text-red-600">
                        Debe seleccionar al menos una auditoría y un proveedor
                    </p>
                )}
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Información sobre Solicitudes de Presupuesto
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Las solicitudes incluyen todos los datos de la auditoría y medicamentos</li>
                                <li>Los proveedores recibirán un email con la información detallada</li>
                                <li>El seguimiento de respuestas se puede ver en "Seguimiento Presupuestos"</li>
                                <li>Los proveedores tienen 7 días para responder por defecto</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolicitarPresupuestos;

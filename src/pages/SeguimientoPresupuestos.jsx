// src/pages/SeguimientoPresupuestos.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import * as presupuestosService from '../services/presupuestosService';
import { toast } from 'react-toastify';
import {
    ClockIcon,
    BuildingOffice2Icon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    ChartBarIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    PaperAirplaneIcon,
    XMarkIcon,
    MapPinIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const SeguimientoPresupuestos = () => {
    const { user } = useAuth();

    // Estados principales
    const [estadisticas, setEstadisticas] = useState(null);
    const [solicitudes, setSolicitudes] = useState([]);
    const [solicitudesFiltradas, setSolicitudesFiltradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');
    const [busqueda, setBusqueda] = useState('');
    const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
    const [detalleSolicitud, setDetalleSolicitud] = useState(null);
    const [comparacion, setComparacion] = useState(null);
    const [mostrarDetalle, setMostrarDetalle] = useState(false);
    const [mostrarComparador, setMostrarComparador] = useState(false);
    const [procesando, setProcesando] = useState(false);

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Compras', href: '/compras' },
        { name: 'Seguimiento Presupuestos', href: '/seguimiento-presupuestos', current: true }
    ];

    // Cargar datos al montar componente
    useEffect(() => {
        cargarDatos();
    }, [filtroEstado]);

    // Filtrar solicitudes cuando cambia la búsqueda
    useEffect(() => {
        if (!busqueda.trim()) {
            setSolicitudesFiltradas(solicitudes);
        } else {
            const termino = busqueda.toLowerCase();
            const filtradas = solicitudes.filter(sol =>
                sol.lote_numero?.toLowerCase().includes(termino) ||
                sol.estado?.toLowerCase().includes(termino) ||
                new Date(sol.fecha_envio).toLocaleDateString('es-AR').includes(termino) ||
                new Date(sol.fecha_expiracion || sol.fecha_envio).toLocaleDateString('es-AR').includes(termino)
            );
            setSolicitudesFiltradas(filtradas);
        }
    }, [busqueda, solicitudes]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            setError('');

            // Cargar estadísticas y solicitudes en paralelo
            const [statsResponse, solicitudesResponse] = await Promise.all([
                presupuestosService.getEstadisticasPresupuestos(),
                presupuestosService.getSolicitudesEmail(
                    filtroEstado !== 'TODOS' ? { estado: filtroEstado } : {}
                )
            ]);

            setEstadisticas(statsResponse);

            // Ordenar solicitudes por fecha de vencimiento (más cercanas primero)
            const solicitudesOrdenadas = (solicitudesResponse.solicitudes || []).sort((a, b) => {
                const fechaA = new Date(a.fecha_expiracion || a.fecha_envio);
                const fechaB = new Date(b.fecha_expiracion || b.fecha_envio);
                return fechaA - fechaB; // Ascendente: las que vencen primero arriba
            });

            setSolicitudes(solicitudesOrdenadas);
            setSolicitudesFiltradas(solicitudesOrdenadas);

        } catch (error) {
            console.error('Error cargando datos:', error);
            setError(error.message || 'Error al cargar los datos');
            toast.error('Error al cargar seguimiento de presupuestos');
        } finally {
            setLoading(false);
        }
    };

    // Ver detalle de solicitud
    const verDetalle = async (solicitudId) => {
        try {
            setProcesando(true);
            const response = await presupuestosService.getSolicitudEmailDetalle(solicitudId);
            setDetalleSolicitud(response);
            setSolicitudSeleccionada(solicitudId);
            setMostrarDetalle(true);
            setMostrarComparador(false);
        } catch (error) {
            console.error('Error cargando detalle:', error);
            toast.error('Error al cargar detalle de solicitud');
        } finally {
            setProcesando(false);
        }
    };

    // Ver comparador
    const verComparador = async (solicitudId) => {
        try {
            setProcesando(true);
            const response = await presupuestosService.compararPresupuestos(solicitudId);

            // 🔍 DEBUG: Ver qué datos está retornando el backend
            console.log('📊 Comparación recibida:', response);
            if (response.comparacion) {
                Object.keys(response.comparacion).forEach(auditoriaKey => {
                    const auditoria = response.comparacion[auditoriaKey];
                    if (auditoria.medicamentos) {
                        Object.keys(auditoria.medicamentos).forEach(medKey => {
                            const med = auditoria.medicamentos[medKey];
                            console.log(`📋 Medicamento ${med.medicamento_nombre}:`, med.ofertas);
                        });
                    }
                });
            }

            setComparacion(response);
            setSolicitudSeleccionada(solicitudId);
            setMostrarComparador(true);
            setMostrarDetalle(false);
        } catch (error) {
            console.error('Error cargando comparación:', error);
            toast.error('Error al comparar presupuestos');
        } finally {
            setProcesando(false);
        }
    };

    // Cerrar modales
    const cerrarModal = () => {
        setMostrarDetalle(false);
        setMostrarComparador(false);
        setSolicitudSeleccionada(null);
        setDetalleSolicitud(null);
        setComparacion(null);
    };

    // Actualizar estado manualmente
    const cambiarEstado = async (solicitudId, nuevoEstado) => {
        try {
            setProcesando(true);
            await presupuestosService.actualizarEstadoSolicitud(solicitudId, nuevoEstado);
            toast.success(`Estado actualizado a ${nuevoEstado}`);
            cargarDatos();
            cerrarModal();
        } catch (error) {
            console.error('Error actualizando estado:', error);
            toast.error('Error al actualizar estado');
        } finally {
            setProcesando(false);
        }
    };

    // Badge de estado
    const getEstadoBadge = (estado) => {
        const badges = {
            'ENVIADO': { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '📤', text: 'Enviado' },
            'PARCIAL': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳', text: 'Parcial' },
            'COMPLETADO': { color: 'bg-green-100 text-green-800 border-green-300', icon: '✅', text: 'Completado' },
            'VENCIDO': { color: 'bg-red-100 text-red-800 border-red-300', icon: '⚠️', text: 'Vencido' },
            'ADJUDICADO': { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🏆', text: 'Adjudicado' },
            'CANCELADO': { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: '❌', text: 'Cancelado' }
        };
        const badge = badges[estado] || badges['ENVIADO'];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
                <span className="mr-1">{badge.icon}</span>
                {badge.text}
            </span>
        );
    };

    // Calcular estado de vencimiento y urgencia
    const getEstadoVencimiento = (solicitud) => {
        const ahora = new Date();
        const fechaExpiracion = new Date(solicitud.fecha_expiracion || solicitud.fecha_envio);
        const horasRestantes = (fechaExpiracion - ahora) / (1000 * 60 * 60);

        if (horasRestantes < 0) {
            // Ya venció
            const fechaVencStr = fechaExpiracion.toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            return {
                tipo: 'VENCIDO',
                color: 'bg-red-100 border-red-500 text-red-900',
                icon: '🚨',
                mensaje: `VENCIDO - ${fechaVencStr}`,
                urgente: true
            };
        } else if (horasRestantes < 24) {
            // Vence en menos de 24 horas
            return {
                tipo: 'URGENTE',
                color: 'bg-orange-100 border-orange-500 text-orange-900',
                icon: '⚠️',
                mensaje: `Vence en ${Math.floor(horasRestantes)}h`,
                urgente: true
            };
        } else if (horasRestantes < 48) {
            // Vence en menos de 48 horas
            return {
                tipo: 'PROXIMO',
                color: 'bg-yellow-100 border-yellow-500 text-yellow-900',
                icon: '⏰',
                mensaje: `Vence en ${Math.floor(horasRestantes / 24)} día(s)`,
                urgente: false
            };
        } else {
            return null; // No mostrar alerta
        }
    };

    // Contar solicitudes urgentes (para notificación)
    const getSolicitudesUrgentes = () => {
        return solicitudes.filter(sol => {
            const estado = getEstadoVencimiento(sol);
            return estado && estado.urgente && sol.estado_general !== 'ADJUDICADO' && sol.estado_general !== 'CANCELADO';
        }).length;
    };

    // Badge de estado de proveedor
    const getEstadoProveedorBadge = (estado) => {
        const badges = {
            'ENVIADO': { color: 'bg-blue-100 text-blue-800', icon: '📤', text: 'Enviado' },
            'RESPONDIDO': { color: 'bg-green-100 text-green-800', icon: '✅', text: 'Respondió' },
            'VENCIDO': { color: 'bg-red-100 text-red-800', icon: '⚠️', text: 'Vencido' },
        };
        const badge = badges[estado] || badges['ENVIADO'];
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <span className="mr-1">{badge.icon}</span>
                {badge.text}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-6">
                <Loading text="Cargando seguimiento de presupuestos..." />
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
                                <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
                                Seguimiento de Presupuestos
                                {/* Badge de Notificación de Solicitudes Urgentes */}
                                {getSolicitudesUrgentes() > 0 && (
                                    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse shadow-lg">
                                        <span className="mr-1">🚨</span>
                                        {getSolicitudesUrgentes()} urgente{getSolicitudesUrgentes() > 1 ? 's' : ''}
                                    </span>
                                )}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Monitoreo de solicitudes enviadas y respuestas de proveedores
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
            {error && <ErrorMessage message={error} />}

            {/* Dashboard de Estadísticas */}
            {estadisticas && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard
                        title="Total"
                        value={estadisticas.total}
                        color="gray"
                        icon={<DocumentTextIcon className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Enviados"
                        value={estadisticas.enviados}
                        color="blue"
                        icon={<PaperAirplaneIcon className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Recibidos"
                        value={estadisticas.recibidos}
                        color="green"
                        icon={<CheckCircleIcon className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Pendientes"
                        value={estadisticas.pendientes}
                        color="yellow"
                        icon={<ClockIcon className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Vencidos"
                        value={estadisticas.vencidos}
                        color="red"
                        icon={<ExclamationTriangleIcon className="h-6 w-6" />}
                    />
                    <StatCard
                        title="Adjudicados"
                        value={estadisticas.adjudicados}
                        color="purple"
                        icon={<HandThumbUpIcon className="h-6 w-6" />}
                    />
                </div>
            )}

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center space-x-2 overflow-x-auto">
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filtrar por:</span>
                    {['TODOS', 'ENVIADO', 'PARCIAL', 'COMPLETADO', 'VENCIDO', 'ADJUDICADO', 'CANCELADO'].map((estado) => (
                        <button
                            key={estado}
                            onClick={() => setFiltroEstado(estado)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                                filtroEstado === estado
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {estado === 'TODOS' ? 'Todos' : estado.charAt(0) + estado.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Solicitudes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Solicitudes ({solicitudesFiltradas.length} {busqueda && `de ${solicitudes.length}`})
                        </h2>

                        {/* Buscador */}
                        <div className="relative w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar por lote, fecha o estado..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            {busqueda && (
                                <button
                                    onClick={() => setBusqueda('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {solicitudesFiltradas.length === 0 ? (
                        <div className="text-center py-12">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                                No hay solicitudes {filtroEstado !== 'TODOS' ? `en estado ${filtroEstado}` : ''}
                            </p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lote
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha Envío
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Auditorías
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Proveedores
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Respuestas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progreso
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {solicitudesFiltradas.map((solicitud) => {
                                    const estadoVencimiento = getEstadoVencimiento(solicitud);
                                    return (
                                        <tr
                                            key={solicitud.id}
                                            className={`hover:bg-gray-50 ${estadoVencimiento ? 'border-l-4 ' + estadoVencimiento.color.split(' ')[1] : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {solicitud.lote_numero}
                                                </div>
                                                {/* Alerta de Vencimiento */}
                                                {estadoVencimiento && (
                                                    <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border-l-2 ${estadoVencimiento.color} animate-pulse`}>
                                                        <span className="mr-1">{estadoVencimiento.icon}</span>
                                                        {estadoVencimiento.mensaje}
                                                    </div>
                                                )}
                                            </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(solicitud.fecha_envio).toLocaleDateString('es-AR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(solicitud.fecha_envio).toLocaleTimeString('es-AR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getEstadoBadge(solicitud.estado)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{solicitud.total_auditorias}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{solicitud.total_proveedores}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {solicitud.respuestas_recibidas} / {solicitud.total_proveedores}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <ProgressBar
                                                current={solicitud.respuestas_recibidas}
                                                total={solicitud.total_proveedores}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => verDetalle(solicitud.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Ver detalle"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                {(solicitud.estado === 'COMPLETADO' || solicitud.estado === 'PARCIAL') && (
                                                    <button
                                                        onClick={() => verComparador(solicitud.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Comparar presupuestos"
                                                    >
                                                        <ChartBarIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal de Detalle */}
            {mostrarDetalle && detalleSolicitud && (
                <ModalDetalle
                    detalle={detalleSolicitud}
                    onClose={cerrarModal}
                    onCambiarEstado={cambiarEstado}
                    procesando={procesando}
                    getEstadoBadge={getEstadoBadge}
                    getEstadoProveedorBadge={getEstadoProveedorBadge}
                />
            )}

            {/* Modal de Comparador */}
            {mostrarComparador && comparacion && (
                <ModalComparador
                    comparacion={comparacion}
                    onClose={cerrarModal}
                    procesando={procesando}
                />
            )}
        </div>
    );
};

// Componente StatCard
const StatCard = ({ title, value, color, icon }) => {
    const colorClasses = {
        gray: 'border-gray-400 bg-gray-50',
        blue: 'border-blue-400 bg-blue-50',
        green: 'border-green-400 bg-green-50',
        yellow: 'border-yellow-400 bg-yellow-50',
        red: 'border-red-400 bg-red-50',
        purple: 'border-purple-400 bg-purple-50'
    };

    const iconColorClasses = {
        gray: 'text-gray-600',
        blue: 'text-blue-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        red: 'text-red-600',
        purple: 'text-purple-600'
    };

    return (
        <div className={`border-l-4 rounded-lg p-4 ${colorClasses[color]} shadow-sm`}>
            <div className={`flex items-center justify-center mb-2 ${iconColorClasses[color]}`}>
                {icon}
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-600 mt-1">{title}</div>
            </div>
        </div>
    );
};

// Componente ProgressBar
const ProgressBar = ({ current, total }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    return (
        <div className="w-full">
            <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="text-xs text-gray-600 text-center mt-1">
                {Math.round(percentage)}%
            </div>
        </div>
    );
};

// Componente Modal de Detalle
const ModalDetalle = ({ detalle, onClose, onCambiarEstado, procesando, getEstadoBadge, getEstadoProveedorBadge }) => {
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay */}
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

                {/* Modal */}
                <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Detalle de Solicitud: {detalle.solicitud.lote_numero}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                        {/* Información General */}
                        <div className="mb-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-3">Información General</h4>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Estado:</span>
                                    <div className="mt-1">{getEstadoBadge(detalle.solicitud.estado)}</div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Fecha Envío:</span>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {new Date(detalle.solicitud.fecha_envio).toLocaleString('es-AR')}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-600">Creado por:</span>
                                    <div className="mt-1 text-sm text-gray-900">
                                        {detalle.solicitud.usuario_envia_nombre}
                                    </div>
                                </div>
                                {detalle.solicitud.observaciones && (
                                    <div className="col-span-2">
                                        <span className="text-sm font-medium text-gray-600">Observaciones:</span>
                                        <div className="mt-1 text-sm text-gray-900">
                                            {detalle.solicitud.observaciones}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Auditorías Incluidas */}
                        <div className="mb-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-3">
                                Auditorías Incluidas ({detalle.auditorias.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {detalle.auditorias.map((aud) => (
                                    <div key={aud.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                        <div className="font-medium text-gray-900">#{aud.id}</div>
                                        <div className="text-sm text-gray-600">{aud.paciente_nombre}</div>
                                        <div className="text-xs text-gray-500">DNI: {aud.paciente_dni}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Respuestas de Proveedores */}
                        <div>
                            <h4 className="text-md font-semibold text-gray-900 mb-3">
                                Respuestas de Proveedores ({detalle.proveedores.length})
                            </h4>
                            <div className="space-y-4">
                                {detalle.proveedores.map((proveedor) => (
                                    <div key={proveedor.proveedor_id} className="border border-gray-200 rounded-lg p-4">
                                        {/* Header del Proveedor */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h5 className="font-semibold text-gray-900">{proveedor.proveedor_nombre}</h5>
                                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                                    <div className="flex items-center">
                                                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                                                        {proveedor.proveedor_email}
                                                    </div>
                                                    {proveedor.proveedor_telefono && (
                                                        <div className="flex items-center">
                                                            <PhoneIcon className="h-4 w-4 mr-2" />
                                                            {proveedor.proveedor_telefono}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {getEstadoProveedorBadge(proveedor.estado)}
                                        </div>

                                        {/* Información de Fechas */}
                                        <div className="bg-gray-50 rounded p-3 mb-3 text-sm">
                                            <div className="flex items-center text-gray-600">
                                                <CalendarIcon className="h-4 w-4 mr-2" />
                                                <span>Expira: {new Date(proveedor.fecha_expiracion).toLocaleString('es-AR')}</span>
                                            </div>
                                            {proveedor.fecha_respuesta && (
                                                <div className="flex items-center text-green-600 mt-1">
                                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                    <span>Respondió: {new Date(proveedor.fecha_respuesta).toLocaleString('es-AR')}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Respuestas de Medicamentos */}
                                        {proveedor.respuestas.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-sm">
                                                    <thead className="bg-gray-100">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Medicamento</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Acepta</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Precio</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">F. Retiro</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">F. Vencimiento</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Lugar de Retiro</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Comentarios</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {proveedor.respuestas.map((resp, idx) => (
                                                            <tr key={idx} className={resp.acepta ? 'bg-green-50' : 'bg-red-50'}>
                                                                <td className="px-3 py-2">
                                                                    <div className="font-medium">{resp.medicamento_nombre}</div>
                                                                    <div className="text-xs text-gray-500">{resp.medicamento_presentacion}</div>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {resp.acepta ? (
                                                                        <span className="text-green-600 font-medium">✅ Sí</span>
                                                                    ) : (
                                                                        <span className="text-red-600 font-medium">❌ No</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {resp.precio ? `$${parseFloat(resp.precio).toLocaleString('es-AR')}` : '-'}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {resp.fecha_retiro ? new Date(resp.fecha_retiro).toLocaleDateString('es-AR') : '-'}
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {resp.fecha_vencimiento ? new Date(resp.fecha_vencimiento).toLocaleDateString('es-AR') : '-'}
                                                                </td>
                                                                <td className="px-3 py-2 text-xs text-gray-600">
                                                                    {resp.lugar_retiro || '-'}
                                                                </td>
                                                                <td className="px-3 py-2 text-xs text-gray-600">
                                                                    {resp.comentarios || '-'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded">
                                                ⏳ Aún no ha respondido
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente Modal Comparador
const ModalComparador = ({ comparacion, onClose, procesando }) => {
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [observaciones, setObservaciones] = useState('');
    const [adjudicando, setAdjudicando] = useState(false);

    const abrirConfirmacion = (proveedorId, proveedorNombre) => {
        setProveedorSeleccionado({ id: proveedorId, nombre: proveedorNombre });
        setMostrarConfirmacion(true);
    };

    const confirmarAdjudicacion = async () => {
        if (!proveedorSeleccionado) return;

        try {
            setAdjudicando(true);
            const response = await presupuestosService.adjudicarPresupuestoEmail(
                comparacion.solicitudId,
                proveedorSeleccionado.id,
                observaciones
            );

            toast.success(
                `🏆 Presupuesto adjudicado a ${proveedorSeleccionado.nombre}\n` +
                `📋 ${response.cantidadOrdenes} órdenes creadas\n` +
                `💰 Monto total: $${response.montoTotal.toLocaleString('es-AR')}`,
                { autoClose: 7000 }
            );

            setMostrarConfirmacion(false);
            setTimeout(() => {
                onClose();
                window.location.reload(); // Recargar para actualizar estados
            }, 2000);

        } catch (error) {
            toast.error(`Error al adjudicar: ${error.message}`);
        } finally {
            setAdjudicando(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                    {/* Overlay */}
                    <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

                    {/* Modal */}
                    <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white flex items-center">
                                    <ChartBarIcon className="h-6 w-6 mr-2" />
                                    Comparador de Presupuestos
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="text-white hover:text-gray-200"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                            {/* 🔥 Mensaje cuando no hay presupuestos para comparar */}
                            {!comparacion.comparacion || comparacion.comparacion.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-yellow-100">
                                        <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No hay presupuestos para comparar
                                    </h3>
                                    <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                                        Los proveedores contactados no enviaron cotizaciones o cancelaron su participación.
                                    </p>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto text-left">
                                        <p className="text-sm text-gray-700 mb-2">
                                            <strong>Posibles razones:</strong>
                                        </p>
                                        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                            <li>Los proveedores indicaron que no pueden cotizar este producto</li>
                                            <li>El plazo de respuesta venció sin recibir ofertas</li>
                                            <li>Los proveedores cancelaron su participación</li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {comparacion.comparacion.map((item, idx) => (
                                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        {/* Header del Medicamento */}
                                        <div className="mb-4">
                                            <h4 className="text-lg font-semibold text-gray-900">{item.medicamento.nombre}</h4>
                                            <p className="text-sm text-gray-600">{item.medicamento.presentacion}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Paciente: {item.auditoria.paciente_nombre} (DNI: {item.auditoria.paciente_dni})
                                            </p>
                                        </div>

                                        {/* Grid de Ofertas */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {item.ofertas.map((oferta, oIdx) => {
                                                const esMejorOferta = item.mejorOferta &&
                                                    oferta.proveedor_id === item.mejorOferta.proveedor_id;

                                                return (
                                                    <div
                                                        key={oIdx}
                                                        className={`relative border-2 rounded-lg p-4 ${
                                                            esMejorOferta
                                                                ? 'border-green-500 bg-green-50'
                                                                : oferta.acepta
                                                                ? 'border-gray-300 bg-white'
                                                                : 'border-gray-200 bg-gray-50 opacity-60'
                                                        }`}
                                                    >
                                                        {esMejorOferta && (
                                                            <div className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                                🏆 MEJOR PRECIO
                                                            </div>
                                                        )}

                                                        <h5 className="font-semibold text-gray-900 mb-3">
                                                            {oferta.proveedor_nombre}
                                                        </h5>

                                                        {oferta.acepta ? (
                                                            <>
                                                                <div className="space-y-2 mb-4">
                                                                    <div className="text-3xl font-bold text-blue-600">
                                                                        ${parseFloat(oferta.precio).toLocaleString('es-AR')}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 space-y-1 mb-2">
                                                                        <div className="flex items-center">
                                                                            <CalendarIcon className="h-4 w-4 mr-2" />
                                                                            Retiro: {new Date(oferta.fecha_retiro).toLocaleDateString('es-AR')}
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <ClockIcon className="h-4 w-4 mr-2" />
                                                                            Vence: {new Date(oferta.fecha_vencimiento).toLocaleDateString('es-AR')}
                                                                        </div>
                                                                    </div>

                                                                    {/* Lugar de Retiro - Destacado */}
                                                                    {oferta.lugar_retiro && (
                                                                        <div className="p-3 bg-green-50 border-l-4 border-green-500 text-sm mb-3">
                                                                            <div className="flex items-start">
                                                                                <MapPinIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
                                                                                <div>
                                                                                    <div className="font-semibold text-green-900 mb-1">Lugar de Retiro:</div>
                                                                                    <div className="text-gray-700">{oferta.lugar_retiro}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {oferta.comentarios && (
                                                                        <div className="p-2 bg-blue-50 border-l-4 border-blue-400 text-sm text-gray-700 mb-3">
                                                                            💬 {oferta.comentarios}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Botón de Adjudicación */}
                                                                <button
                                                                    onClick={() => abrirConfirmacion(oferta.proveedor_id, oferta.proveedor_nombre)}
                                                                    className={`w-full px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-md hover:shadow-lg ${
                                                                        esMejorOferta
                                                                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    }`}
                                                                >
                                                                    {esMejorOferta ? '🏆 Adjudicar (Recomendado)' : 'Adjudicar'}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <div className="text-red-600 font-medium mb-2">❌ No acepta</div>
                                                                {oferta.comentarios && (
                                                                    <div className="text-sm text-gray-600">{oferta.comentarios}</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Resumen */}
                                        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                                            <span className="font-medium">Resumen:</span> {item.totalOfertas} ofertas recibidas, {item.ofertasAceptadas} aceptadas
                                        </div>
                                    </div>
                                ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Confirmación de Adjudicación */}
            {mostrarConfirmacion && proveedorSeleccionado && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Overlay */}
                        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />

                        {/* Modal */}
                        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                            {/* Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500">
                                <div className="flex items-center justify-center">
                                    <HandThumbUpIcon className="h-12 w-12 text-white" />
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-6 py-5">
                                <h3 className="text-lg font-semibold text-gray-900 text-center mb-3">
                                    ¿Adjudicar presupuesto?
                                </h3>
                                <p className="text-sm text-gray-600 text-center mb-4">
                                    Está por adjudicar el presupuesto a:
                                </p>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-center font-bold text-blue-900 text-lg">
                                        {proveedorSeleccionado.nombre}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Observaciones (opcional):
                                    </label>
                                    <textarea
                                        value={observaciones}
                                        onChange={(e) => setObservaciones(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Ej: Mejor precio y fecha de entrega..."
                                    />
                                </div>

                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                <strong>Se crearán órdenes de compra automáticamente</strong> y se notificará al proveedor ganador.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setMostrarConfirmacion(false);
                                        setObservaciones('');
                                    }}
                                    disabled={adjudicando}
                                    className="px-4 py-2 border-2 border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarAdjudicacion}
                                    disabled={adjudicando}
                                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md text-sm font-medium hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                >
                                    {adjudicando ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                                            Procesando...
                                        </>
                                    ) : (
                                        '🏆 Confirmar Adjudicación'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SeguimientoPresupuestos;

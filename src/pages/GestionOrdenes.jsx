// src/pages/GestionOrdenes.jsx - COMPLETO CON NOTIFICACIÓN AL PACIENTE
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import * as presupuestosService from '../services/presupuestosService';
import { toast } from 'react-toastify';
import {
    ClipboardDocumentCheckIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    PaperAirplaneIcon,
    BuildingOffice2Icon,
    UserIcon,
    ClockIcon,
    BellIcon
} from '@heroicons/react/24/outline';

const GestionOrdenes = () => {
    const { user } = useAuth();

    // Estados principales
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODAS');
    const [mostrarDetalle, setMostrarDetalle] = useState(null);
    const [procesando, setProcesando] = useState(false);

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Compras', href: '/compras' },
        { name: 'Gestión de Órdenes', href: '/gestion-ordenes', current: true }
    ];

    // Estados posibles de órdenes
    const estados = [
        { value: 'TODAS', label: 'Todas las Órdenes', color: 'gray' },
        { value: 'BORRADOR', label: 'Borrador', color: 'gray' },
        { value: 'ENVIADA', label: 'Enviada', color: 'blue' },
        { value: 'CONFIRMADA', label: 'Confirmada', color: 'green' },
        { value: 'EN_PREPARACION', label: 'En Preparación', color: 'yellow' },
        { value: 'ENVIADO', label: 'Enviado', color: 'purple' },
        { value: 'ENTREGADO', label: 'Entregado', color: 'emerald' },
        { value: 'CANCELADA', label: 'Cancelada', color: 'red' }
    ];

    // Datos demo de órdenes de compra
    const ordenesDemo = [
        {
            id: 'OC-2025-001',
            numeroOrden: 'OC-2025-001',
            fechaCreacion: '2025-01-16T10:00:00Z',
            fechaEnvio: '2025-01-16T14:30:00Z',
            fechaEntregaEstimada: '2025-01-18T10:00:00Z',
            estado: 'CONFIRMADA',
            proveedor: {
                id: 2,
                nombre: 'ONCOMED DISTRIBUCIONES',
                contacto: 'Dr. Miguel Torres',
                email: 'm.torres@oncomed.com.ar',
                telefono: '351-7891234'
            },
            solicitudOrigen: 'SOL-2025-001',
            auditorias: ['AC-2024-001', 'AC-2024-002'],
            pacientes: [
                {
                    nombre: 'María Elena González',
                    dni: '32456789',
                    telefono: '351-1234567',
                    email: 'maria.gonzalez@email.com'
                },
                {
                    nombre: 'Carlos Roberto Mendez',
                    dni: '28765432',
                    telefono: '351-7654321',
                    email: 'carlos.mendez@email.com'
                }
            ],
            medicamentos: [
                {
                    nombre: 'KEYTRUDA 100MG',
                    cantidad: 6,
                    precioUnitario: 120000,
                    total: 720000,
                    paciente: 'María Elena González'
                },
                {
                    nombre: 'REVLIMID 25MG',
                    cantidad: 4,
                    precioUnitario: 90000,
                    total: 360000,
                    paciente: 'Carlos Roberto Mendez'
                }
            ],
            subtotal: 1080000,
            descuento: 50000,
            total: 1030000,
            observaciones: 'Entrega urgente solicitada. Coordinación previa requerida.',
            tracking: {
                numero: 'TRK-001-2025',
                empresa: 'Logística Médica SA',
                estado: 'En tránsito'
            },
            historial: [
                {
                    fecha: '2025-01-16T10:00:00Z',
                    estado: 'BORRADOR',
                    descripcion: 'Orden creada automáticamente desde presupuesto',
                    usuario: 'Sistema'
                },
                {
                    fecha: '2025-01-16T14:30:00Z',
                    estado: 'ENVIADA',
                    descripcion: 'Orden enviada al proveedor por email',
                    usuario: user?.nombre
                },
                {
                    fecha: '2025-01-16T16:45:00Z',
                    estado: 'CONFIRMADA',
                    descripcion: 'Proveedor confirmó recepción y disponibilidad',
                    usuario: 'Dr. Miguel Torres'
                }
            ]
        },
        {
            id: 'OC-2025-002',
            numeroOrden: 'OC-2025-002',
            fechaCreacion: '2025-01-15T09:15:00Z',
            fechaEnvio: '2025-01-15T11:30:00Z',
            fechaEntregaEstimada: '2025-01-17T14:00:00Z',
            fechaEntregaReal: '2025-01-17T13:45:00Z',
            estado: 'ENTREGADO',
            proveedor: {
                id: 1,
                nombre: 'FARMACORP S.A.',
                contacto: 'Lic. Patricia Vega',
                email: 'pvega@farmacorp.com.ar',
                telefono: '351-4567890'
            },
            solicitudOrigen: 'SOL-2025-002',
            auditorias: ['AC-2024-003'],
            pacientes: [
                {
                    nombre: 'Ana Lucía Torres',
                    dni: '35123456',
                    telefono: '351-9876543',
                    email: 'ana.torres@email.com'
                }
            ],
            medicamentos: [
                {
                    nombre: 'RITUXIMAB 500MG',
                    cantidad: 4,
                    precioUnitario: 95000,
                    total: 380000,
                    paciente: 'Ana Lucía Torres'
                }
            ],
            subtotal: 380000,
            descuento: 0,
            total: 380000,
            observaciones: 'Entrega realizada sin inconvenientes.',
            tracking: {
                numero: 'TRK-002-2025',
                empresa: 'Express Pharma',
                estado: 'Entregado'
            },
            notificacionEnviada: true,
            historial: [
                {
                    fecha: '2025-01-15T09:15:00Z',
                    estado: 'BORRADOR',
                    descripcion: 'Orden creada desde adjudicación',
                    usuario: 'Sistema'
                },
                {
                    fecha: '2025-01-15T11:30:00Z',
                    estado: 'ENVIADA',
                    descripcion: 'Orden enviada al proveedor',
                    usuario: user?.nombre
                },
                {
                    fecha: '2025-01-15T14:20:00Z',
                    estado: 'CONFIRMADA',
                    descripcion: 'Proveedor confirmó orden',
                    usuario: 'Lic. Patricia Vega'
                },
                {
                    fecha: '2025-01-16T08:00:00Z',
                    estado: 'EN_PREPARACION',
                    descripcion: 'Medicamentos en preparación',
                    usuario: 'Lic. Patricia Vega'
                },
                {
                    fecha: '2025-01-17T09:30:00Z',
                    estado: 'ENVIADO',
                    descripcion: 'Medicamentos despachados - TRK-002-2025',
                    usuario: 'Express Pharma'
                },
                {
                    fecha: '2025-01-17T13:45:00Z',
                    estado: 'ENTREGADO',
                    descripcion: 'Entrega completada y paciente notificado',
                    usuario: 'CPCE Recepción'
                }
            ]
        },
        {
            id: 'OC-2025-003',
            numeroOrden: 'OC-2025-003',
            fechaCreacion: '2025-01-17T15:20:00Z',
            estado: 'ENVIADO',
            proveedor: {
                id: 3,
                nombre: 'GLOBAL PHARMA SOLUTIONS',
                contacto: 'Ing. Carlos Ruiz',
                email: 'c.ruiz@globalpharma.com.ar',
                telefono: '351-3456789'
            },
            solicitudOrigen: 'SOL-2025-003',
            auditorias: ['AC-2024-004'],
            pacientes: [
                {
                    nombre: 'Roberto Silva',
                    dni: '30987654',
                    telefono: '351-5555555',
                    email: 'roberto.silva@email.com'
                }
            ],
            medicamentos: [
                {
                    nombre: 'BEVACIZUMAB 400MG',
                    cantidad: 8,
                    precioUnitario: 85000,
                    total: 680000,
                    paciente: 'Roberto Silva'
                }
            ],
            subtotal: 680000,
            descuento: 0,
            total: 680000,
            observaciones: 'En tránsito - Entrega estimada para mañana.',
            tracking: {
                numero: 'TRK-003-2025',
                empresa: 'Global Express',
                estado: 'En tránsito'
            },
            historial: [
                {
                    fecha: '2025-01-17T15:20:00Z',
                    estado: 'BORRADOR',
                    descripcion: 'Orden creada desde presupuesto seleccionado',
                    usuario: user?.nombre
                },
                {
                    fecha: '2025-01-17T16:30:00Z',
                    estado: 'ENVIADA',
                    descripcion: 'Orden enviada al proveedor',
                    usuario: user?.nombre
                },
                {
                    fecha: '2025-01-17T18:45:00Z',
                    estado: 'CONFIRMADA',
                    descripcion: 'Proveedor confirmó orden',
                    usuario: 'Ing. Carlos Ruiz'
                },
                {
                    fecha: '2025-01-18T08:00:00Z',
                    estado: 'EN_PREPARACION',
                    descripcion: 'Medicamentos en preparación',
                    usuario: 'Ing. Carlos Ruiz'
                },
                {
                    fecha: '2025-01-18T14:30:00Z',
                    estado: 'ENVIADO',
                    descripcion: 'Medicamentos despachados - TRK-003-2025',
                    usuario: 'Global Express'
                }
            ]
        }
    ];

    // Cargar órdenes desde la API
    useEffect(() => {
        cargarOrdenes();
    }, [filtroEstado]);

    const cargarOrdenes = async () => {
        try {
            setLoading(true);
            setError('');

            const params = filtroEstado !== 'TODAS' ? { estado: filtroEstado } : {};
            const response = await presupuestosService.getOrdenesCompra(params);

            if (response.success && response.data) {
                setOrdenes(response.data);
            }

        } catch (error) {
            console.error('Error cargando órdenes:', error);
            setError(error.message || 'Error al cargar las órdenes');
            toast.error('Error al cargar órdenes de compra');
        } finally {
            setLoading(false);
        }
    };

    // 🔥 FUNCIÓN PARA ENVIAR NOTIFICACIÓN AL PACIENTE
    const enviarNotificacionPaciente = async (orden, tipoNotificacion) => {
        try {
            console.log('🔔 Enviando notificación al paciente...', { orden: orden.id, tipo: tipoNotificacion });

            // Llamar a la API real para enviar notificación
            const response = await presupuestosService.notificarPacientes({
                ordenId: orden.id,
                pacientes: orden.pacientes,
                medicamentos: orden.medicamentos,
                tipo: tipoNotificacion,
                canal: 'EMAIL_SMS', // Enviar por ambos canales
                urgencia: 'ALTA',
                datosOrden: {
                    numero: orden.numeroOrden || orden.numero_orden,
                    proveedor: orden.proveedor?.nombre || orden.razon_social,
                    fechaEntrega: new Date().toISOString(),
                    tracking: orden.tracking?.numero
                }
            });

            console.log('✅ Notificación enviada exitosamente:', response);

            // Toast de éxito con información detallada
            toast.success(
                <div className="toast-content">
                    <div className="toast-icon">📧</div>
                    <div className="toast-message">
                        <div className="toast-title">Paciente(s) notificado(s) exitosamente</div>
                        <div className="toast-details">
                            {orden.pacientes.map((paciente, index) => (
                                <div key={index} className="toast-detail-item">
                                    <span className="toast-detail-label">📱 {paciente.nombre}:</span>
                                    <span className="toast-detail-value">SMS + Email enviados</span>
                                </div>
                            ))}
                            <div className="toast-detail-item">
                                <span className="toast-detail-label">📦 Orden:</span>
                                <span className="toast-detail-value">{orden.numeroOrden}</span>
                            </div>
                        </div>
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 8000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    className: "toast-glow-success",
                }
            );

            return { success: true };

        } catch (error) {
            console.error('❌ Error enviando notificación:', error);

            toast.error(
                <div className="toast-content">
                    <div className="toast-icon">❌</div>
                    <div className="toast-message">
                        <div className="toast-title">Error al notificar paciente</div>
                        <div className="toast-description">
                            No se pudo enviar la notificación. Intente nuevamente.
                        </div>
                    </div>
                </div>,
                {
                    position: "top-right",
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    className: "toast-glow-error",
                }
            );

            return { success: false, error: error.message };
        }
    };

    // Filtrar órdenes por estado
    const ordenesFiltradas = ordenes.filter(orden => {
        if (filtroEstado === 'TODAS') return true;
        return orden.estado === filtroEstado;
    });

    // Calcular estadísticas
    const calcularEstadisticas = () => {
        const stats = {
            total: ordenes.length,
            borradores: 0,
            enviadas: 0,
            confirmadas: 0,
            enPreparacion: 0,
            enviados: 0,
            entregados: 0,
            canceladas: 0,
            montoTotal: 0,
            pacientesNotificados: 0
        };

        ordenes.forEach(orden => {
            stats.montoTotal += orden.total;

            if (orden.notificacionEnviada) {
                stats.pacientesNotificados += orden.pacientes.length;
            }

            switch (orden.estado) {
                case 'BORRADOR': stats.borradores++; break;
                case 'ENVIADA': stats.enviadas++; break;
                case 'CONFIRMADA': stats.confirmadas++; break;
                case 'EN_PREPARACION': stats.enPreparacion++; break;
                case 'ENVIADO': stats.enviados++; break;
                case 'ENTREGADO': stats.entregados++; break;
                case 'CANCELADA': stats.canceladas++; break;
                default: break;
            }
        });

        return stats;
    };

    const estadisticas = calcularEstadisticas();

    // Obtener color del estado
    const getEstadoColor = (estado) => {
        const colores = {
            'BORRADOR': 'bg-gray-100 text-gray-800',
            'ENVIADA': 'bg-blue-100 text-blue-800',
            'CONFIRMADA': 'bg-green-100 text-green-800',
            'EN_PREPARACION': 'bg-yellow-100 text-yellow-800',
            'ENVIADO': 'bg-purple-100 text-purple-800',
            'ENTREGADO': 'bg-emerald-100 text-emerald-800',
            'CANCELADA': 'bg-red-100 text-red-800'
        };
        return colores[estado] || 'bg-gray-100 text-gray-800';
    };

    // Obtener icono del estado
    const getEstadoIcon = (estado) => {
        switch (estado) {
            case 'BORRADOR':
                return <DocumentTextIcon className="h-4 w-4" />;
            case 'ENVIADA':
                return <PaperAirplaneIcon className="h-4 w-4" />;
            case 'CONFIRMADA':
                return <CheckCircleIcon className="h-4 w-4" />;
            case 'EN_PREPARACION':
                return <ClockIcon className="h-4 w-4" />;
            case 'ENVIADO':
                return <TruckIcon className="h-4 w-4" />;
            case 'ENTREGADO':
                return <HandThumbUpIcon className="h-4 w-4" />;
            case 'CANCELADA':
                return <XCircleIcon className="h-4 w-4" />;
            default:
                return <DocumentTextIcon className="h-4 w-4" />;
        }
    };

    // Formatear fecha
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Acciones sobre órdenes
    const handleEnviarOrden = async (ordenId) => {
        if (!window.confirm('¿Está seguro de enviar esta orden al proveedor?')) {
            return;
        }

        try {
            setProcesando(true);

            const response = await presupuestosService.cambiarEstadoOrden(ordenId, {
                nuevo_estado: 'CONFIRMADO',
                observaciones: 'Orden enviada al proveedor por email'
            });

            if (response.success) {
                toast.success('Orden enviada exitosamente al proveedor');
                setTimeout(() => cargarOrdenes(), 1500);
            }

        } catch (error) {
            console.error('Error al enviar orden:', error);
            toast.error(error.message || 'Error al enviar la orden');
        } finally {
            setProcesando(false);
        }
    };

    const handleCancelarOrden = async (ordenId) => {
        const motivo = prompt('Ingrese el motivo de cancelación:');
        if (!motivo || motivo.trim() === '') {
            toast.warning('Debe ingresar un motivo de cancelación');
            return;
        }

        try {
            setProcesando(true);

            const response = await presupuestosService.cancelarOrden(ordenId, motivo);

            if (response.success) {
                toast.success('Orden cancelada correctamente');
                setTimeout(() => cargarOrdenes(), 1500);
            }

        } catch (error) {
            console.error('Error al cancelar orden:', error);
            toast.error(error.message || 'Error al cancelar la orden');
        } finally {
            setProcesando(false);
        }
    };

    // 🔥 FUNCIÓN PRINCIPAL - CONFIRMAR ENTREGA Y NOTIFICAR PACIENTE
    const handleConfirmarEntrega = async (ordenId) => {
        if (!window.confirm('¿Confirma que la orden ha sido entregada correctamente? Se notificará automáticamente al paciente.')) {
            return;
        }

        try {
            setProcesando(true);

            // Encontrar la orden
            const orden = ordenes.find(o => o.id === ordenId);
            if (!orden) {
                throw new Error('Orden no encontrada');
            }

            // Toast de inicio del proceso
            const toastId = toast.info('🔄 Confirmando entrega y notificando paciente...', {
                position: "top-right",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
            });

            // 1. 🔥 CONFIRMAR ENTREGA EN EL BACKEND (esto notifica automáticamente)
            const response = await presupuestosService.confirmarEntrega(ordenId, {
                fecha_entrega_real: new Date().toISOString().split('T')[0],
                observaciones: 'Entrega confirmada y paciente notificado automáticamente',
                recibido_por: user?.nombre || 'CPCE Recepción'
            });

            // Cerrar toast de carga
            toast.dismiss(toastId);

            if (response.success) {
                const { notificaciones_enviadas } = response.data;

                toast.success(
                    `🎉 Entrega confirmada - ${notificaciones_enviadas?.exitosas || 0} paciente(s) notificado(s) por Email`,
                    {
                        position: "top-right",
                        autoClose: 5000,
                    }
                );

                // Recargar órdenes para obtener datos actualizados
                setTimeout(() => {
                    cargarOrdenes();
                }, 2000);

            } else {
                toast.warning('⚠️ Entrega confirmada, pero hubo problemas con las notificaciones');

                // Recargar órdenes de todos modos
                setTimeout(() => {
                    cargarOrdenes();
                }, 2000);
            }

        } catch (error) {
            console.error('Error confirmando entrega:', error);
            toast.error('❌ Error al confirmar la entrega');
        } finally {
            setProcesando(false);
        }
    };

    // 🔥 FUNCIÓN PARA REENVIAR NOTIFICACIÓN MANUALMENTE
    const handleReenviarNotificacion = async (ordenId) => {
        if (!window.confirm('¿Desea reenviar la notificación al paciente?')) {
            return;
        }

        try {
            setProcesando(true);

            const orden = ordenes.find(o => o.id === ordenId);
            if (!orden) {
                throw new Error('Orden no encontrada');
            }

            // Enviar notificación usando el servicio
            const result = await enviarNotificacionPaciente(orden, 'REENVIO_NOTIFICACION');

            if (result.success) {
                toast.success('Notificación reenviada exitosamente');
                setTimeout(() => cargarOrdenes(), 2000);
            }

        } catch (error) {
            console.error('Error reenviando notificación:', error);
            toast.error(error.message || 'Error al reenviar la notificación');
        } finally {
            setProcesando(false);
        }
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-6">
                <Loading text="Cargando órdenes de compra..." />
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
                                <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2 text-blue-600" />
                                Gestión de Órdenes de Compra
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Control, seguimiento y notificación a pacientes
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <select
                                value={filtroEstado}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {estados.map(estado => (
                                    <option key={estado.value} value={estado.value}>
                                        {estado.label}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={cargarOrdenes}
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">{estadisticas.borradores}</div>
                    <div className="text-sm text-gray-600">Borradores</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{estadisticas.enviadas}</div>
                    <div className="text-sm text-gray-600">Enviadas</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{estadisticas.confirmadas}</div>
                    <div className="text-sm text-gray-600">Confirmadas</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{estadisticas.enPreparacion}</div>
                    <div className="text-sm text-gray-600">En Prep.</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{estadisticas.enviados}</div>
                    <div className="text-sm text-gray-600">Enviados</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{estadisticas.entregados}</div>
                    <div className="text-sm text-gray-600">Entregados</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{estadisticas.canceladas}</div>
                    <div className="text-sm text-gray-600">Canceladas</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
                    <div className="text-2xl font-bold text-teal-600">{estadisticas.pacientesNotificados}</div>
                    <div className="text-sm text-gray-600">Notificados</div>
                </div>
            </div>

            {/* Lista de órdenes */}
            <div className="space-y-4">
                {ordenesFiltradas.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <ClipboardDocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {filtroEstado === 'TODAS'
                                ? 'No se han creado órdenes de compra aún'
                                : `No hay órdenes con estado: ${estados.find(e => e.value === filtroEstado)?.label}`
                            }
                        </p>
                    </div>
                ) : (
                    ordenesFiltradas.map((orden) => (
                        <div key={orden.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                            {/* Header de orden */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                                            {orden.numeroOrden}
                                            {orden.notificacionEnviada && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <BellIcon className="h-3 w-3 mr-1" />
                                                    Paciente notificado
                                                </span>
                                            )}
                                        </h3>
                                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <CalendarIcon className="h-4 w-4 mr-1" />
                                                Creada: {formatearFecha(orden.fechaCreacion)}
                                            </span>
                                            {orden.fechaEnvio && (
                                                <span>
                                                    Enviada: {formatearFecha(orden.fechaEnvio)}
                                                </span>
                                            )}
                                            <span className="font-medium text-green-600">
                                                ${orden.total.toLocaleString()}
                                            </span>
                                            <span className="text-blue-600">
                                                {orden.pacientes.length} paciente(s)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(orden.estado)}`}>
                                            {getEstadoIcon(orden.estado)}
                                            <span className="ml-1">{orden.estado.replace('_', ' ')}</span>
                                        </span>
                                        <button
                                            onClick={() => setMostrarDetalle(mostrarDetalle === orden.id ? null : orden.id)}
                                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <EyeIcon className="h-4 w-4 mr-1" />
                                            {mostrarDetalle === orden.id ? 'Ocultar' : 'Ver'} Detalle
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Información de proveedor y pacientes */}
                            <div className="px-6 py-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-900 flex items-center mb-2">
                                            <BuildingOffice2Icon className="h-4 w-4 mr-2" />
                                            Proveedor: {orden.proveedor.nombre}
                                        </h4>
                                        <p className="text-sm text-gray-600">{orden.proveedor.contacto}</p>
                                        <div className="text-sm text-gray-600">
                                            <div className="flex items-center mt-1">
                                                <PhoneIcon className="h-4 w-4 mr-2" />
                                                {orden.proveedor.telefono}
                                            </div>
                                            <div className="flex items-center mt-1">
                                                <EnvelopeIcon className="h-4 w-4 mr-2" />
                                                {orden.proveedor.email}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 flex items-center mb-2">
                                            <UserIcon className="h-4 w-4 mr-2" />
                                            Pacientes ({orden.pacientes.length})
                                        </h4>
                                        {orden.pacientes.map((paciente, index) => (
                                            <div key={index} className="text-sm text-gray-600 mb-1">
                                                <div className="font-medium">{paciente.nombre}</div>
                                                <div className="text-xs">DNI: {paciente.dni} | 📱 {paciente.telefono}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Detalle expandido */}
                            {mostrarDetalle === orden.id && (
                                <div className="border-t border-gray-200 px-6 py-4">
                                    <div className="space-y-6">
                                        {/* Medicamentos por paciente */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Medicamentos por Paciente</h4>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Paciente
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Medicamento
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Cantidad
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Precio Unit.
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Total
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {orden.medicamentos.map((med, index) => (
                                                            <tr key={index}>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                                    {med.paciente}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {med.nombre}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    {med.cantidad}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                    ${med.precioUnitario.toLocaleString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    ${med.total.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                    <tfoot className="bg-gray-50">
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                                                                Subtotal:
                                                            </td>
                                                            <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                                                ${orden.subtotal.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                        {orden.descuento > 0 && (
                                                            <tr>
                                                                <td colSpan="4" className="px-6 py-3 text-sm font-medium text-gray-900 text-right">
                                                                    Descuento:
                                                                </td>
                                                                <td className="px-6 py-3 text-sm font-medium text-red-600">
                                                                    -${orden.descuento.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td colSpan="4" className="px-6 py-3 text-sm font-bold text-gray-900 text-right">
                                                                TOTAL:
                                                            </td>
                                                            <td className="px-6 py-3 text-sm font-bold text-gray-900">
                                                                ${orden.total.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Tracking y fechas */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Fechas Importantes</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div><strong>Creación:</strong> {formatearFecha(orden.fechaCreacion)}</div>
                                                    {orden.fechaEnvio && (
                                                        <div><strong>Enviada:</strong> {formatearFecha(orden.fechaEnvio)}</div>
                                                    )}
                                                    {orden.fechaEntregaEstimada && (
                                                        <div><strong>Entrega Estimada:</strong> {formatearFecha(orden.fechaEntregaEstimada)}</div>
                                                    )}
                                                    {orden.fechaEntregaReal && (
                                                        <div className="text-green-600"><strong>Entrega Real:</strong> {formatearFecha(orden.fechaEntregaReal)}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {orden.tracking && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-3">Información de Envío</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div><strong>Número de Tracking:</strong> {orden.tracking.numero}</div>
                                                        <div><strong>Empresa:</strong> {orden.tracking.empresa}</div>
                                                        <div><strong>Estado:</strong>
                                                            <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                                {orden.tracking.estado}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Historial de cambios */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Historial de Estados</h4>
                                            <div className="space-y-3">
                                                {orden.historial.map((evento, index) => (
                                                    <div key={index} className="flex items-start space-x-3">
                                                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getEstadoColor(evento.estado).split(' ')[0]}`}></div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {evento.estado.replace('_', ' ')}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {formatearFecha(evento.fecha)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-600">{evento.descripcion}</p>
                                                            <p className="text-xs text-gray-500">Por: {evento.usuario}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Observaciones */}
                                        {orden.observaciones && (
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Observaciones</h4>
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                    <p className="text-sm text-yellow-800">{orden.observaciones}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* 🔥 INFORMACIÓN DE NOTIFICACIÓN AL PACIENTE */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                                <BellIcon className="h-4 w-4 mr-2" />
                                                Estado de Notificación al Paciente
                                            </h4>
                                            <div className={`p-4 rounded-lg border ${orden.notificacionEnviada
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-yellow-50 border-yellow-200'
                                                }`}>
                                                {orden.notificacionEnviada ? (
                                                    <div className="flex items-start space-x-3">
                                                        <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-green-800">
                                                                ✅ Paciente(s) notificado(s) exitosamente
                                                            </p>
                                                            <p className="text-sm text-green-600 mt-1">
                                                                Se enviaron notificaciones por SMS y Email a {orden.pacientes.length} paciente(s)
                                                                informando que sus medicamentos están disponibles para retiro.
                                                            </p>
                                                            <div className="mt-2">
                                                                {orden.pacientes.map((paciente, index) => (
                                                                    <div key={index} className="text-xs text-green-600">
                                                                        📧 {paciente.email} | 📱 {paciente.telefono}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start space-x-3">
                                                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-yellow-800">
                                                                ⚠️ Paciente pendiente de notificación
                                                            </p>
                                                            <p className="text-sm text-yellow-600 mt-1">
                                                                Una vez confirmada la entrega, se notificará automáticamente al paciente
                                                                que sus medicamentos están listos para retiro.
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex flex-wrap gap-2">
                                                {orden.estado === 'BORRADOR' && (
                                                    <button
                                                        onClick={() => handleEnviarOrden(orden.id)}
                                                        disabled={procesando}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                                    >
                                                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                                                        Enviar Orden
                                                    </button>
                                                )}

                                                {['BORRADOR', 'ENVIADA', 'CONFIRMADA'].includes(orden.estado) && (
                                                    <button
                                                        onClick={() => handleCancelarOrden(orden.id)}
                                                        disabled={procesando}
                                                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        <XCircleIcon className="h-4 w-4 mr-2" />
                                                        Cancelar
                                                    </button>
                                                )}

                                                {/* 🔥 BOTÓN PRINCIPAL - CONFIRMAR ENTREGA Y NOTIFICAR */}
                                                {orden.estado === 'ENVIADO' && (
                                                    <button
                                                        onClick={() => handleConfirmarEntrega(orden.id)}
                                                        disabled={procesando}
                                                        className="inline-flex items-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 shadow-lg"
                                                    >
                                                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                        <BellIcon className="h-4 w-4 mr-2" />
                                                        Confirmar Entrega & Notificar Paciente
                                                    </button>
                                                )}

                                                {/* 🔥 BOTÓN PARA REENVIAR NOTIFICACIÓN */}
                                                {orden.estado === 'ENTREGADO' && !orden.notificacionEnviada && (
                                                    <button
                                                        onClick={() => handleReenviarNotificacion(orden.id)}
                                                        disabled={procesando}
                                                        className="inline-flex items-center px-3 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50"
                                                    >
                                                        <BellIcon className="h-4 w-4 mr-2" />
                                                        Notificar Paciente
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => window.print()}
                                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                                                    Imprimir
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Información adicional sobre el flujo completo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex">
                    <ExclamationTriangleIcon className="h-6 w-6 text-blue-400" />
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-blue-800 mb-3">
                            🔄 Flujo Completo: Desde Auditoría hasta Notificación al Paciente
                        </h3>
                        <div className="text-sm text-blue-700 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold mb-2">📋 Proceso de Compras:</h4>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>Auditoría aprobada → Solicitud de presupuesto</li>
                                        <li>Proveedores envían cotizaciones</li>
                                        <li>Adjudicación → Creación de orden de compra</li>
                                        <li>Envío de orden → Confirmación del proveedor</li>
                                        <li>Preparación → Envío → Entrega en CPCE</li>
                                    </ol>
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2">🔔 Notificación al Paciente:</h4>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>✅ Confirmación de entrega en CPCE</li>
                                        <li>📧 Envío automático de Email</li>
                                        <li>📱 Envío automático de SMS</li>
                                        <li>✉️ Mensaje: "Sus medicamentos están listos"</li>
                                        <li>🏥 Paciente puede retirar en farmacia</li>
                                    </ol>
                                </div>
                            </div>
                            <div className="mt-4 p-4 bg-white/50 rounded-lg">
                                <p className="font-semibold text-blue-900">
                                    🎯 El proceso se completa cuando el paciente recibe la notificación de que sus medicamentos están disponibles para retiro.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GestionOrdenes;    
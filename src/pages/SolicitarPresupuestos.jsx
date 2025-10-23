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
    EyeIcon,
    CalendarIcon  // 🔥 AGREGADO
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
    const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
    const [mostrarDetalle, setMostrarDetalle] = useState(null); // 🔥 Para expandir/colapsar medicamentos

    // 🔥 NUEVO: Estado para horas de expiración
    const [horasExpiracion, setHorasExpiracion] = useState(72);
    const [modoExpiracionPersonalizado, setModoExpiracionPersonalizado] = useState(false);
    const [fechaHoraExpiracion, setFechaHoraExpiracion] = useState('');
    const [usarFechaEspecifica, setUsarFechaEspecifica] = useState(true); // 🔥 Por defecto usar fecha/hora específica

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Compras', href: '/compras' },
        { name: 'Solicitar Presupuestos', href: '/solicitar-presupuestos', current: true }
    ];

    // Cargar datos desde la API
    useEffect(() => {
        cargarDatos();
    }, []);

    // 🔥 NUEVO: Establecer fecha/hora por defecto (72 horas desde ahora)
    useEffect(() => {
        const ahora = new Date();
        ahora.setHours(ahora.getHours() + 72); // 72 horas (3 días) por defecto
        const fechaHoraStr = ahora.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
        setFechaHoraExpiracion(fechaHoraStr);
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
            // 🔥 Las auditorías ya vienen ORDENADAS del backend por prioridad (ALTA → MEDIA → NORMAL) y fecha más antigua primero
            if (auditoriasResponse.success && auditoriasResponse.data) {
                const auditoriasFormateadas = auditoriasResponse.data.map(auditoria => ({
                    id: auditoria.id || auditoria.idauditoria,
                    paciente: {
                        nombre: `${auditoria.apellido || ''}, ${auditoria.nombre || ''}`.trim(),
                        dni: auditoria.dni || 'N/A'
                    },
                    auditor: auditoria.medico || 'No asignado',
                    // 🔥 NUEVOS CAMPOS DEL BACKEND
                    fechaEmision: auditoria.fecha_emision || 'N/A', // Formato dd-mm-yyyy
                    fechaEmisionRaw: auditoria.fecha_emision_raw, // Para ordenamiento
                    fechaAprobacion: auditoria.fecha ? new Date(auditoria.fecha).toLocaleDateString('es-AR') : 'N/A',
                    precioTotal: auditoria.precio_total || 0, // 🔥 PRECIO TOTAL REAL
                    diasDesdeEmision: auditoria.dias_desde_emision || 0, // 🔥 DÍAS TRANSCURRIDOS
                    prioridad: auditoria.prioridad || 'NORMAL', // 🔥 PRIORIDAD CALCULADA (ALTA/MEDIA/NORMAL)
                    fechaRecepcion: auditoria.fecha_recepcion || 'N/A',
                    estadoCompra: auditoria.estado_compra || 'pendiente',
                    // 🔥 MEDICAMENTOS COMPLETOS del backend
                    medicamentos: auditoria.medicamentos || [],
                    // Campos legacy
                    observaciones: auditoria.observaciones || '',
                    meses: auditoria.meses || 0,
                    renglones: auditoria.medicamentos_aprobados || auditoria.renglones || 0
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

        // Validar fecha/hora específica si está seleccionada
        if (usarFechaEspecifica && !fechaHoraExpiracion) {
            setError('Debe seleccionar una fecha y hora de vencimiento');
            toast.error('Debe seleccionar una fecha y hora de vencimiento');
            return;
        }

        // Validar que la fecha sea futura
        if (usarFechaEspecifica && horasExpiracion <= 0) {
            setError('La fecha y hora de vencimiento debe ser futura');
            toast.error('La fecha y hora de vencimiento debe ser futura');
            return;
        }

        setMostrarModalConfirmacion(true);
    };

    // 🔥 ENVIAR SOLICITUDES CON SISTEMA DE TOKENS
    const handleEnviarSolicitudes = async () => {
        setMostrarModalConfirmacion(false);

        try {
            setSending(true);
            setError('');

            // Preparar datos para el NUEVO endpoint con tokens
            const datos = {
                auditoriaIds: Array.from(auditoriasSeleccionadas),
                proveedorIds: Array.from(proveedoresSeleccionados),
                observaciones: `Solicitud de cotización para ${auditoriasSeleccionadas.size} auditoría(s) de alto costo`,
                horasExpiracion: parseInt(horasExpiracion) // 🔥 NUEVO: Incluir horas de expiración
            };

            console.log('🔥 Usando NUEVO sistema con tokens:', datos);

            // Llamar al NUEVO endpoint que genera tokens y envía emails
            const response = await presupuestosService.solicitarPresupuestoConToken(datos);

            console.log('✅ Respuesta del servidor:', response);

            // Verificar respuesta exitosa
            if (response.mensaje || response.solicitudId) {
                // Mensaje de éxito detallado
                const loteNumero = response.loteNumero || 'N/A';
                const proveedoresEnviados = response.resultadosEnvio?.filter(r => r.enviado).length || proveedoresSeleccionados.size;
                const proveedoresFallados = response.resultadosEnvio?.filter(r => !r.enviado).length || 0;

                setSuccess(
                    `✅ Solicitud creada exitosamente!\n\n` +
                    `📋 Lote: ${loteNumero}\n` +
                    `✉️ Emails enviados: ${proveedoresEnviados} de ${proveedoresSeleccionados.size} proveedores\n` +
                    `⏰ Expiración: 72 horas\n` +
                    `📦 Auditorías: ${auditoriasSeleccionadas.size}`
                );

                toast.success(
                    `🎉 Solicitud ${loteNumero} enviada a ${proveedoresEnviados} proveedores con enlaces de respuesta`,
                    { autoClose: 7000 }
                );

                // Mostrar advertencia si algunos emails fallaron
                if (proveedoresFallados > 0) {
                    toast.warning(
                        `⚠️ ${proveedoresFallados} email(s) no pudieron ser enviados. Revise los detalles.`,
                        { autoClose: 5000 }
                    );
                    console.warn('Emails fallados:', response.resultadosEnvio?.filter(r => !r.enviado));
                }

                // Limpiar selecciones
                setAuditoriasSeleccionadas(new Set());
                setProveedoresSeleccionados(new Set());

                // Recargar datos después de 2 segundos
                setTimeout(() => {
                    cargarDatos();
                }, 2000);
            } else {
                throw new Error('Respuesta inesperada del servidor');
            }

        } catch (error) {
            console.error('❌ Error al enviar solicitudes con tokens:', error);
            setError(error.message || 'Error al enviar las solicitudes de presupuesto');
            toast.error(error.message || 'Error al enviar las solicitudes', { autoClose: 5000 });
        } finally {
            setSending(false);
        }
    };

    // 🔥 NUEVO: Calcular fecha de expiración
    const calcularFechaExpiracion = () => {
        const fecha = new Date();
        fecha.setHours(fecha.getHours() + parseInt(horasExpiracion));
        return fecha.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // 🔥 Formato 24 horas
        });
    };

    // 🔥 NUEVO: Calcular días y horas equivalentes
    const calcularDiasYHoras = () => {
        const horas = parseInt(horasExpiracion);
        const dias = Math.floor(horas / 24);
        const horasRestantes = horas % 24;
        return { dias, horasRestantes };
    };

    // 🔥 NUEVO: Calcular horas desde ahora hasta fecha específica
    const calcularHorasHastaFecha = (fechaHoraStr) => {
        if (!fechaHoraStr) return 0;
        const ahora = new Date();
        const fechaObjetivo = new Date(fechaHoraStr);
        const diferenciaMs = fechaObjetivo - ahora;
        const horas = Math.ceil(diferenciaMs / (1000 * 60 * 60)); // Redondear hacia arriba
        return horas > 0 ? horas : 0;
    };

    // 🔥 NUEVO: Manejar cambio de fecha/hora específica
    const handleFechaHoraChange = (fechaHoraStr) => {
        setFechaHoraExpiracion(fechaHoraStr);
        const horasCalculadas = calcularHorasHastaFecha(fechaHoraStr);
        setHorasExpiracion(horasCalculadas);
    };

    // 🔥 NUEVO: Obtener fecha/hora mínima (ahora + 1 hora)
    const getFechaHoraMinima = () => {
        const ahora = new Date();
        ahora.setHours(ahora.getHours() + 1);
        return ahora.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:mm
    };

    // 🔥 Función para formatear precio con puntos de miles y coma decimal
    const formatearPrecioResumen = (precio) => {
        if (!precio && precio !== 0) return '$0,00';

        // Asegurarse de que sea un número
        let numero = precio;
        if (typeof precio === 'string') {
            // Remover cualquier formato existente
            numero = parseFloat(precio.replace(/[^\d.-]/g, ''));
        }

        if (isNaN(numero)) return '$0,00';

        // Formatear con 2 decimales
        const partes = numero.toFixed(2).split('.');
        const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimal = partes[1];
        return `$${entero},${decimal}`;
    };

    // Calcular totales
    const calcularTotales = () => {
        const auditoriasArray = Array.from(auditoriasSeleccionadas)
            .map(id => auditorias.find(a => a.id === id))
            .filter(Boolean);

        // 🔥 Usar precioTotal y asegurar que sea número con parseFloat
        const costoTotal = auditoriasArray.reduce((total, auditoria) => {
            const precio = parseFloat(auditoria.precioTotal) || 0;
            return total + precio;
        }, 0);

        // 🔥 Usar renglones en lugar de medicamentos.length
        const medicamentosTotal = auditoriasArray.reduce((total, auditoria) =>
            total + (auditoria.renglones || 0), 0);

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

            {/* 🔥 RESUMEN GENERAL (siempre visible) */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">📊 Resumen General</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                        <div className="text-3xl font-bold text-blue-600">{auditorias.length}</div>
                        <div className="text-sm text-gray-600 mt-1">Auditorías</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                        <div className="text-3xl font-bold text-green-600">
                            {auditorias.reduce((total, a) => total + (a.renglones || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Medicamentos</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
                        <div className="text-3xl font-bold text-orange-600">
                            {formatearPrecioResumen(auditorias.reduce((total, a) => total + (parseFloat(a.precioTotal) || 0), 0))}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Costo Total</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                        <div className="text-3xl font-bold text-purple-600">{proveedores.length}</div>
                        <div className="text-sm text-gray-600 mt-1">Proveedores</div>
                    </div>
                </div>
            </div>

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
                            <div className="text-xl font-bold text-orange-600">{formatearPrecioResumen(costoTotal)}</div>
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

                                // 🔥 Función para obtener el badge de prioridad con colores
                                const getPrioridadBadge = (prioridad) => {
                                    switch (prioridad) {
                                        case 'ALTA':
                                            return 'bg-red-100 text-red-800 border border-red-300';
                                        case 'MEDIA':
                                            return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
                                        case 'NORMAL':
                                            return 'bg-green-100 text-green-800 border border-green-300';
                                        default:
                                            return 'bg-gray-100 text-gray-800 border border-gray-300';
                                    }
                                };

                                // 🔥 Función para formatear precio con puntos de miles y coma decimal
                                const formatearPrecio = (precio) => {
                                    if (!precio && precio !== 0) return '$0,00';
                                    const numero = parseFloat(precio);
                                    const partes = numero.toFixed(2).split('.');
                                    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                                    const decimal = partes[1];
                                    return `$${entero},${decimal}`;
                                };

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
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-900">#{auditoria.id}</h3>
                                                    {/* 🔥 BADGE DE PRIORIDAD */}
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getPrioridadBadge(auditoria.prioridad)}`}>
                                                        {auditoria.prioridad === 'ALTA' && '🔴 '}
                                                        {auditoria.prioridad === 'MEDIA' && '🟡 '}
                                                        {auditoria.prioridad === 'NORMAL' && '🟢 '}
                                                        {auditoria.prioridad}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">{auditoria.paciente?.nombre}</p>
                                                <p className="text-xs text-gray-500">DNI: {auditoria.paciente?.dni}</p>

                                                {/* 🔥 FECHA DE EMISIÓN Y DÍAS TRANSCURRIDOS */}
                                                <div className="mt-2 flex items-center gap-3 text-xs">
                                                    <span className="text-gray-600">
                                                        📅 Emisión: <strong>{auditoria.fechaEmision}</strong>
                                                    </span>
                                                    <span className={`font-semibold ${auditoria.diasDesdeEmision > 15 ? 'text-red-600' : auditoria.diasDesdeEmision > 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                        ⏰ {auditoria.diasDesdeEmision} día{auditoria.diasDesdeEmision !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                {/* 🔥 PRECIO TOTAL REAL */}
                                                <div className="text-xl font-bold text-orange-600">
                                                    {formatearPrecio(auditoria.precioTotal)}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Precio Total</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <strong className="text-gray-700">Auditor:</strong>
                                                <p className="text-gray-600">{auditoria.auditor}</p>
                                            </div>
                                            <div>
                                                <strong className="text-gray-700">Medicamentos:</strong>
                                                <p className="text-gray-600">{auditoria.renglones || 0} aprobado{auditoria.renglones !== 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        {/* 🔥 DETALLE DE MEDICAMENTOS - Tabla Profesional */}
                                        {mostrarDetalle === auditoria.id && auditoria.medicamentos && auditoria.medicamentos.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-md">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                                                                    #
                                                                </th>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                                                                    Medicamento
                                                                </th>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                                                                    Monodroga
                                                                </th>
                                                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                                                                    Presentación
                                                                </th>
                                                                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                                                                    Cant.
                                                                </th>
                                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                                                                    P. Unit.
                                                                </th>
                                                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                    P. Total
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {auditoria.medicamentos.map((med, idx) => (
                                                                <tr key={idx} className="hover:bg-gray-50">
                                                                    <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 font-medium">
                                                                        {med.nro_orden}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-sm border-r border-gray-200">
                                                                        <div className="font-medium text-gray-900">{med.nombre_comercial || 'Sin nombre'}</div>
                                                                        {med.codigo && <div className="text-xs text-gray-500">Cód: {med.codigo}</div>}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-sm text-gray-700 border-r border-gray-200">
                                                                        {med.monodroga || '-'}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-sm text-gray-700 border-r border-gray-200">
                                                                        {med.presentacion || '-'}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-sm text-center text-gray-900 border-r border-gray-200 font-medium">
                                                                        {med.cantidad || 0}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-sm text-right text-gray-900 border-r border-gray-200 font-medium">
                                                                        {formatearPrecio(med.precio_unitario)}
                                                                    </td>
                                                                    <td className="px-3 py-2 text-sm text-right font-semibold text-orange-600">
                                                                        {formatearPrecio(med.precio_total)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot className="bg-gray-50">
                                                            <tr>
                                                                <td colSpan="6" className="px-3 py-2 text-sm font-semibold text-right text-gray-900 border-t-2 border-gray-300">
                                                                    Total Auditoría:
                                                                </td>
                                                                <td className="px-3 py-2 text-sm text-right font-bold text-orange-600 border-t-2 border-gray-300">
                                                                    {formatearPrecio(auditoria.precioTotal)}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-3 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500">
                                                    📦 Recepción: {auditoria.fechaRecepcion}
                                                </span>

                                                {/* 🔥 BOTÓN VER DETALLE */}
                                                {auditoria.medicamentos && auditoria.medicamentos.length > 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMostrarDetalle(mostrarDetalle === auditoria.id ? null : auditoria.id);
                                                        }}
                                                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                    >
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            {mostrarDetalle === auditoria.id ? (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                            ) : (
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            )}
                                                        </svg>
                                                        {mostrarDetalle === auditoria.id ? 'Ocultar' : 'Ver'} Detalle
                                                    </button>
                                                )}
                                            </div>

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

            {/* 🔥 NUEVO: Configuración de Expiración */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-orange-600" />
                        Tiempo de Expiración
                    </h3>
                    <p className="text-sm text-gray-600">
                        Configure cuánto tiempo tendrán los proveedores para responder
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Select con opciones predefinidas O fecha específica */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccione un plazo
                        </label>
                        <select
                            value={usarFechaEspecifica ? 'fecha-especifica' : (modoExpiracionPersonalizado ? 'personalizado' : horasExpiracion)}
                            onChange={(e) => {
                                const valor = e.target.value;
                                if (valor === 'fecha-especifica') {
                                    setUsarFechaEspecifica(true);
                                    setModoExpiracionPersonalizado(false);
                                } else if (valor === 'personalizado') {
                                    setUsarFechaEspecifica(false);
                                    setModoExpiracionPersonalizado(true);
                                } else {
                                    setUsarFechaEspecifica(false);
                                    setModoExpiracionPersonalizado(false);
                                    setHorasExpiracion(parseInt(valor));
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="12">12 horas (medio día) - Urgente</option>
                            <option value="24">24 horas (1 día) - Muy urgente</option>
                            <option value="48">48 horas (2 días) - Urgente</option>
                            <option value="72">72 horas (3 días) - Recomendado</option>
                            <option value="96">96 horas (4 días)</option>
                            <option value="120">120 horas (5 días)</option>
                            <option value="168">168 horas (1 semana)</option>
                            <option value="336">336 horas (2 semanas)</option>
                            <option value="720">720 horas (30 días / máximo)</option>
                            <option value="personalizado">⚙️ Personalizado...</option>
                            <option value="fecha-especifica">📅 Fecha y Hora Específica</option>
                        </select>
                    </div>

                    {/* Input de Fecha y Hora Específica */}
                    {usarFechaEspecifica && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha y Hora de Vencimiento
                            </label>
                            <input
                                type="datetime-local"
                                value={fechaHoraExpiracion}
                                onChange={(e) => handleFechaHoraChange(e.target.value)}
                                min={getFechaHoraMinima()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}

                    {/* Input personalizado de horas (si está en modo personalizado) */}
                    {modoExpiracionPersonalizado && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Horas personalizadas
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="720"
                                value={horasExpiracion}
                                onChange={(e) => {
                                    const valor = parseInt(e.target.value) || 1;
                                    if (valor >= 1 && valor <= 720) {
                                        setHorasExpiracion(valor);
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ej: 48"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Mínimo: 1 hora | Máximo: 720 horas (30 días)
                            </p>
                        </div>
                    )}

                    {/* Información de expiración calculada */}
                    <div className="md:col-span-2">
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-orange-500 p-4 rounded-lg">
                            <div className="flex items-start">
                                <CalendarIcon className="h-5 w-5 text-orange-600 mt-0.5 mr-3" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        📅 Los proveedores podrán responder hasta:
                                    </p>
                                    <p className="text-lg font-bold text-orange-700 mt-1">
                                        {calcularFechaExpiracion()}
                                    </p>
                                </div>
                            </div>
                        </div>
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
                                <li>Los proveedores recibirán un email con un enlace único para responder</li>
                                <li>El seguimiento de respuestas se puede ver en "Seguimiento Presupuestos"</li>
                                <li>El tiempo de expiración es configurable (por defecto: 72 horas / 3 días)</li>
                                <li>Los proveedores NO necesitan ingresar al sistema para responder</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolicitarPresupuestos;

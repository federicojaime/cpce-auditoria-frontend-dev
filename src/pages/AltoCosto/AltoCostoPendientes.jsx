// src/pages/AltoCosto/AltoCostoPendientes.jsx - COMPLETO DESDE CERO
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
    EyeIcon,
    DocumentArrowDownIcon,
    ArrowPathIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    XMarkIcon,
    CheckCircleIcon,
    ClockIcon,
    UserIcon,
    CalendarIcon,
    ChartBarIcon,
    ShieldExclamationIcon,
    HeartIcon
} from '@heroicons/react/24/outline';

const AltoCostoPendientes = () => {
    const { user } = useAuth();

    // Estados principales
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados de filtros y búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [filtros, setFiltros] = useState({
        fechaDesde: '',
        fechaHasta: '',
        rangoCosto: '',
        tipoTratamiento: ''
    });

    // Estados de paginación
    const [paginacion, setPaginacion] = useState({
        paginaActual: 1,
        totalPaginas: 0,
        totalRegistros: 0,
        registrosPorPagina: 15
    });

    // Estados de estadísticas
    const [estadisticas, setEstadisticas] = useState({
        totalPendientes: 0,
        altoCostoPromedio: 0,
        medicamentosEspecializados: 0,
        requierenAutorizacion: 0
    });

    // Configuración de breadcrumb
    const breadcrumbItems = [
        { name: 'Auditoría Alto Costo', href: '/alto-costo' },
        { name: 'Pendientes', href: '/alto-costo/pendientes', current: true }
    ];

    // Opciones de rango de costo
    const rangosCosto = [
        { value: '', label: 'Todos los rangos' },
        { value: 'MEDIO', label: '$50K - $100K/mes' },
        { value: 'ALTO', label: '$100K - $200K/mes' },
        { value: 'CRITICO', label: '> $200K/mes' }
    ];

    // Opciones de tipo de tratamiento
    const tiposTratamiento = [
        { value: '', label: 'Todos los tipos' },
        { value: 'ONC', label: 'Oncológico' },
        { value: 'HO', label: 'Medicamento Huérfano' },
        { value: 'BIAC', label: 'Biotecnología Avanzada' },
        { value: 'INM', label: 'Inmunosupresor' },
        { value: 'NEU', label: 'Neurológico Especializado' }
    ];

    // Configuración de columnas de la tabla
    const columnas = [
        {
            key: 'prioridad',
            label: 'Prioridad',
            className: 'w-16 text-center',
            render: (row) => {
                const prioridad = row.prioridad || getPrioridadPorCosto(row.costo_estimado);
                const colores = {
                    'CRITICA': 'bg-red-100 text-red-800 border-red-200',
                    'ALTA': 'bg-orange-100 text-orange-800 border-orange-200',
                    'MEDIA': 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    'BAJA': 'bg-green-100 text-green-800 border-green-200'
                };
                return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${colores[prioridad] || colores['MEDIA']}`}>
                        {prioridad === 'CRITICA' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                        {prioridad}
                    </span>
                );
            }
        },
        {
            key: 'paciente',
            label: 'Paciente',
            className: 'min-w-[200px]',
            render: (row) => (
                <div className="space-y-1">
                    <div className="font-semibold text-gray-900">
                        {row.apellido}, {row.nombre}
                    </div>
                    <div className="text-sm text-gray-600 font-mono">
                        DNI: {row.dni}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <UserIcon className="h-3 w-3 mr-1" />
                        {row.edad ? `${row.edad} años` : 'Edad no registrada'} • {row.sexo || 'N/E'}
                    </div>
                </div>
            )
        },
        {
            key: 'fecha',
            label: 'Fecha Prescripción',
            className: 'w-32',
            render: (row) => (
                <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">
                        {formatearFecha(row.fecha)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {calcularDiasTranscurridos(row.fecha)} días
                    </div>
                </div>
            )
        },
        {
            key: 'medico',
            label: 'Médico Especialista',
            className: 'min-w-[180px]',
            render: (row) => (
                <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900 truncate" title={row.medico}>
                        {row.medico}
                    </div>
                    <div className="text-xs text-blue-600">
                        {row.especialidad || 'Especialista'}
                    </div>
                    <div className="text-xs text-gray-500">
                        MP: {row.matricula || 'No disponible'}
                    </div>
                </div>
            )
        },
        {
            key: 'medicamentos',
            label: 'Medicamentos',
            className: 'w-24 text-center',
            render: (row) => (
                <div className="space-y-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-800 rounded-full text-sm font-bold">
                        {row.renglones || row.total_medicamentos || 1}
                    </span>
                    <div className="text-xs text-gray-600">
                        {row.meses || 6} meses
                    </div>
                </div>
            )
        },
        {
            key: 'tipo_tratamiento',
            label: 'Tipo',
            className: 'w-20 text-center',
            render: (row) => {
                const tipo = row.tipo_tratamiento || row.categoria || 'ONC';
                const colores = {
                    'ONC': 'bg-red-100 text-red-800',
                    'HO': 'bg-purple-100 text-purple-800',
                    'BIAC': 'bg-blue-100 text-blue-800',
                    'INM': 'bg-indigo-100 text-indigo-800',
                    'NEU': 'bg-pink-100 text-pink-800',
                    'CE': 'bg-green-100 text-green-800'
                };
                return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${colores[tipo] || colores['ONC']}`}>
                        {tipo}
                    </span>
                );
            }
        },
        {
            key: 'costo_estimado',
            label: 'Costo Estimado',
            className: 'w-32 text-center',
            render: (row) => {
                const costo = row.costo_estimado || row.costo_total || 'ALTO';
                const costoNumerico = parsearCosto(costo);
                return (
                    <div className="space-y-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                            {formatearCosto(costoNumerico)}
                        </span>
                        <div className="text-xs text-gray-600">
                            /mes
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'autorizacion',
            label: 'Autorización',
            className: 'w-24 text-center',
            render: (row) => {
                const requiere = row.requiere_autorizacion || row.necesita_autorizacion || true;
                return (
                    <div className="space-y-1">
                        {requiere ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <ShieldExclamationIcon className="h-3 w-3 mr-1" />
                                REQUERIDA
                            </span>
                        ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                                NO REQUERIDA
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'estado',
            label: 'Estado',
            className: 'w-24 text-center',
            render: (row) => {
                const diasTranscurridos = calcularDiasTranscurridos(row.fecha);
                let estado = 'NORMAL';
                let color = 'bg-blue-100 text-blue-800';

                if (diasTranscurridos > 7) {
                    estado = 'URGENTE';
                    color = 'bg-red-100 text-red-800';
                } else if (diasTranscurridos > 3) {
                    estado = 'ATENCIÓN';
                    color = 'bg-yellow-100 text-yellow-800';
                }

                return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${color}`}>
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {estado}
                    </span>
                );
            }
        },
        {
            key: 'acciones',
            label: 'Acciones',
            className: 'w-28 text-center',
            render: (row) => {
                const auditoriaId = row.id || row.idauditoria || row.idAuditoria;

                if (!auditoriaId) {
                    return (
                        <span className="text-xs text-gray-400">Sin ID</span>
                    );
                }

                return (
                    <div className="flex justify-center space-x-2">
                        <Link
                            to={`/alto-costo/auditoria/demo`}
                            className="inline-flex items-center px-3 py-1 border-2 border-orange-300 rounded-md shadow-sm text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 transition-all duration-200"
                            title="Procesar auditoría de alto costo"
                        >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Auditar
                        </Link>
                    </div>
                );
            }
        }
    ];

    // ===== FUNCIONES AUXILIARES =====

    // Formatear fecha
    const formatearFecha = (fecha) => {
        if (!fecha) return 'Sin fecha';
        try {
            return new Date(fecha).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    // Calcular días transcurridos
    const calcularDiasTranscurridos = (fecha) => {
        if (!fecha) return 0;
        try {
            const fechaObj = new Date(fecha);
            const hoy = new Date();
            const diferencia = hoy - fechaObj;
            return Math.floor(diferencia / (1000 * 60 * 60 * 24));
        } catch {
            return 0;
        }
    };

    // Obtener prioridad por costo
    const getPrioridadPorCosto = (costo) => {
        const costoNum = parsearCosto(costo);
        if (costoNum > 200000) return 'CRITICA';
        if (costoNum > 100000) return 'ALTA';
        if (costoNum > 50000) return 'MEDIA';
        return 'BAJA';
    };

    // Parsear costo desde string
    const parsearCosto = (costo) => {
        if (typeof costo === 'number') return costo;
        if (typeof costo === 'string') {
            const numero = parseFloat(costo.replace(/[^0-9.-]+/g, ''));
            return isNaN(numero) ? 75000 : numero; // Valor por defecto
        }
        return 75000;
    };

    // Formatear costo para mostrar
    const formatearCosto = (costo) => {
        if (costo >= 1000000) {
            return `$${(costo / 1000000).toFixed(1)}M`;
        } else if (costo >= 1000) {
            return `$${(costo / 1000).toFixed(0)}K`;
        }
        return `$${costo}`;
    };

    // ===== EFECTOS Y CARGA DE DATOS =====

    // Cargar auditorías de alto costo
    const cargarAuditorias = useCallback(async (mostrarLoading = true) => {
        try {
            if (mostrarLoading) setLoading(true);
            setError('');

            // Construir parámetros de consulta
            const parametros = new URLSearchParams();
            parametros.append('tipo', 'alto-costo');
            parametros.append('page', paginacion.paginaActual);
            parametros.append('limit', paginacion.registrosPorPagina);

            if (searchTerm) parametros.append('search', searchTerm);
            if (filtros.fechaDesde) parametros.append('fechaDesde', filtros.fechaDesde);
            if (filtros.fechaHasta) parametros.append('fechaHasta', filtros.fechaHasta);
            if (filtros.rangoCosto) parametros.append('rangoCosto', filtros.rangoCosto);
            if (filtros.tipoTratamiento) parametros.append('tipoTratamiento', filtros.tipoTratamiento);

            const url = `/auditorias/pendientes?${parametros.toString()}`;

            console.log('🔍 Cargando auditorías de alto costo:', {
                url: `${import.meta.env.VITE_API_URL}${url}`,
                parametros: Object.fromEntries(parametros)
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const resultado = await response.json();

            console.log('📊 Respuesta del servidor:', {
                success: resultado.success,
                totalRegistros: resultado.total,
                registrosRecibidos: resultado.data?.length,
                pagina: resultado.page
            });

            if (resultado.success) {
                // Procesar datos recibidos
                const datosLimpios = Array.isArray(resultado.data)
                    ? resultado.data.filter(item => item != null)
                    : [];

                // Enriquecer datos con información específica de alto costo
                const datosEnriquecidos = datosLimpios.map(item => ({
                    ...item,
                    costo_estimado: item.costo_estimado || calcularCostoEstimado(item),
                    prioridad: item.prioridad || getPrioridadPorCosto(item.costo_estimado),
                    requiere_autorizacion: item.requiere_autorizacion ?? true,
                    tipo_tratamiento: item.tipo_tratamiento || determinarTipoTratamiento(item),
                    especialidad: item.especialidad || 'Oncólogo'
                }));

                setAuditorias(datosEnriquecidos);

                // Actualizar paginación
                setPaginacion(prev => ({
                    ...prev,
                    totalRegistros: resultado.total || 0,
                    totalPaginas: resultado.totalPages || Math.ceil((resultado.total || 0) / prev.registrosPorPagina),
                    paginaActual: resultado.page || prev.paginaActual
                }));

                // Actualizar estadísticas
                actualizarEstadisticas(datosEnriquecidos, resultado.total || 0);

                setError('');
            } else {
                setError(resultado.message || 'Error al cargar auditorías de alto costo');
                setAuditorias([]);
            }
        } catch (error) {
            console.error('💥 Error cargando auditorías de alto costo:', error);
            setError('Error inesperado al cargar las auditorías de alto costo');
            setAuditorias([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filtros, paginacion.paginaActual, paginacion.registrosPorPagina]);

    // Calcular costo estimado si no viene del servidor
    const calcularCostoEstimado = (item) => {
        // Lógica para estimar costo basada en tipo de medicamento
        const medicamentos = item.renglones || 1;
        const baseOncologico = 85000;
        const baseBiotecnologia = 120000;
        const baseHuerfano = 150000;

        const tipo = item.tipo_tratamiento || item.categoria;
        switch (tipo) {
            case 'HO': return baseHuerfano * medicamentos;
            case 'BIAC': return baseBiotecnologia * medicamentos;
            case 'INM': return 95000 * medicamentos;
            case 'NEU': return 110000 * medicamentos;
            default: return baseOncologico * medicamentos;
        }
    };

    // Determinar tipo de tratamiento
    const determinarTipoTratamiento = (item) => {
        // Lógica para determinar tipo basada en otros campos
        if (item.medico?.toLowerCase().includes('onco')) return 'ONC';
        if (item.diagnostico?.toLowerCase().includes('huerfan')) return 'HO';
        if (item.medicamento?.toLowerCase().includes('bio')) return 'BIAC';
        return 'ONC'; // Por defecto oncológico
    };

    // Actualizar estadísticas
    const actualizarEstadisticas = (datos, total) => {
        const costoPromedio = datos.reduce((acc, item) =>
            acc + parsearCosto(item.costo_estimado), 0) / (datos.length || 1);

        const especializados = datos.filter(item =>
            ['HO', 'BIAC', 'INM', 'NEU'].includes(item.tipo_tratamiento)).length;

        const conAutorizacion = datos.filter(item =>
            item.requiere_autorizacion).length;

        setEstadisticas({
            totalPendientes: total,
            altoCostoPromedio: costoPromedio,
            medicamentosEspecializados: especializados,
            requierenAutorizacion: conAutorizacion
        });
    };

    // Efecto para cargar datos
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            cargarAuditorias();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [cargarAuditorias]);

    // ===== MANEJADORES DE EVENTOS =====

    // Manejar búsqueda
    const manejarCambioBusqueda = (valor) => {
        setSearchTerm(valor);
        setPaginacion(prev => ({ ...prev, paginaActual: 1 }));
    };

    // Manejar cambio de filtros
    const manejarCambioFiltro = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
        setPaginacion(prev => ({ ...prev, paginaActual: 1 }));
    };

    // Limpiar filtros
    const limpiarFiltros = () => {
        setSearchTerm('');
        setFiltros({
            fechaDesde: '',
            fechaHasta: '',
            rangoCosto: '',
            tipoTratamiento: ''
        });
        setPaginacion(prev => ({ ...prev, paginaActual: 1 }));
    };

    // Refrescar datos
    const refrescarDatos = async () => {
        setRefreshing(true);
        await cargarAuditorias(false);
    };

    // Cambiar página
    const cambiarPagina = (nuevaPagina) => {
        if (nuevaPagina >= 1 && nuevaPagina <= paginacion.totalPaginas) {
            setPaginacion(prev => ({ ...prev, paginaActual: nuevaPagina }));
        }
    };

    // Cambiar registros por página
    const cambiarRegistrosPorPagina = (nuevoTamaño) => {
        setPaginacion(prev => ({
            ...prev,
            registrosPorPagina: parseInt(nuevoTamaño),
            paginaActual: 1
        }));
    };

    // Exportar a Excel
    const exportarExcel = async () => {
        try {
            setRefreshing(true);

            const parametros = new URLSearchParams();
            parametros.append('tipo', 'alto-costo');
            if (searchTerm) parametros.append('search', searchTerm);
            if (filtros.fechaDesde) parametros.append('fechaDesde', filtros.fechaDesde);
            if (filtros.fechaHasta) parametros.append('fechaHasta', filtros.fechaHasta);

            const url = `/auditorias/pendientes/excel?${parametros.toString()}`;
            const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `auditorias-alto-costo-pendientes-${new Date().toISOString().slice(0, 10)}.xlsx`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(downloadUrl);

                setSuccess('✅ Archivo Excel de alto costo descargado correctamente');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const resultado = await response.json();
                setError(resultado.message || 'Error al generar el archivo Excel');
            }
        } catch (error) {
            console.error('💥 Error exportando Excel:', error);
            setError('Error al generar el archivo Excel de alto costo');
        } finally {
            setRefreshing(false);
        }
    };

    // ===== RENDERIZADO =====

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            {/* Breadcrumb */}
            <div className="mb-6">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Header principal */}
            <div className="bg-white rounded-lg shadow-sm border-2 border-orange-300 mb-6">
                <div className="px-6 py-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <CurrencyDollarIcon className="h-7 w-7 mr-3 text-orange-600" />
                                Auditorías de Alto Costo Pendientes
                                <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                    Evaluación Especializada
                                </span>
                            </h1>
                            <p className="mt-2 text-sm text-gray-600">
                                Gestión de medicamentos de alto costo que requieren autorización y evaluación especializada
                            </p>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                            <button
                                onClick={refrescarDatos}
                                disabled={refreshing}
                                className="inline-flex items-center px-4 py-2 border-2 border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200"
                            >
                                <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Actualizando...' : 'Actualizar'}
                            </button>

                            <button
                                onClick={exportarExcel}
                                disabled={refreshing}
                                className="inline-flex items-center px-4 py-2 border-2 border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-all duration-200"
                            >
                                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                Exportar Excel
                            </button>
                        </div>
                    </div>
                </div>

                {/* Estadísticas rápidas */}
                <div className="px-6 py-4 bg-white">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {estadisticas.totalPendientes}
                            </div>
                            <div className="text-sm text-gray-600">Total Pendientes</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {formatearCosto(estadisticas.altoCostoPromedio)}
                            </div>
                            <div className="text-sm text-gray-600">Costo Promedio</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {estadisticas.medicamentosEspecializados}
                            </div>
                            <div className="text-sm text-gray-600">Especializados</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {estadisticas.requierenAutorizacion}
                            </div>
                            <div className="text-sm text-gray-600">Req. Autorización</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Filtros y Búsqueda
                    </h3>
                </div>

                <div className="px-6 py-4 space-y-4">
                    {/* Búsqueda principal */}
                    <div>
                        <div className="relative">
                            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => manejarCambioBusqueda(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Buscar por paciente, médico, DNI o medicamento..."
                            />
                        </div>
                    </div>

                    {/* Filtros adicionales */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Fecha desde */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha desde
                            </label>
                            <input
                                type="date"
                                value={filtros.fechaDesde}
                                onChange={(e) => manejarCambioFiltro('fechaDesde', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* Fecha hasta */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha hasta
                            </label>
                            <input
                                type="date"
                                value={filtros.fechaHasta}
                                onChange={(e) => manejarCambioFiltro('fechaHasta', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* Rango de costo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rango de costo
                            </label>
                            <select
                                value={filtros.rangoCosto}
                                onChange={(e) => manejarCambioFiltro('rangoCosto', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                {rangosCosto.map(rango => (
                                    <option key={rango.value} value={rango.value}>
                                        {rango.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo de tratamiento */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo tratamiento
                            </label>
                            <select
                                value={filtros.tipoTratamiento}
                                onChange={(e) => manejarCambioFiltro('tipoTratamiento', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                {tiposTratamiento.map(tipo => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Botones */}
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={limpiarFiltros}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600 transition-colors flex items-center"
                            >
                                <XMarkIcon className="h-4 w-4 mr-2" />
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mensajes de estado */}
            {error && (
                <div className="mb-6">
                    <ErrorMessage
                        message={error}
                        onRetry={refrescarDatos}
                        showRetry={true}
                    />
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading inicial */}
            {loading && auditorias.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <Loading text="Cargando auditorías de alto costo..." />
                </div>
            )}

            {/* Tabla de auditorías */}
            {!loading || auditorias.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header de tabla */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Auditorías Pendientes - Alto Costo
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {auditorias.length} de {paginacion.totalRegistros} auditorías mostradas
                                </p>
                            </div>

                            {/* Indicador de carga */}
                            {refreshing && (
                                <div className="flex items-center text-orange-600">
                                    <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm">Actualizando...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabla con scroll horizontal */}
                    <div className="overflow-x-auto">
                        <table className="w-full" style={{ minWidth: '1400px' }}>
                            <thead className="bg-orange-100">
                                <tr>
                                    {columnas.map((col) => (
                                        <th
                                            key={col.key}
                                            className={`px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-orange-200 last:border-r-0 ${col.className || ''}`}
                                        >
                                            {col.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {auditorias.length === 0 ? (
                                    <tr>
                                        <td colSpan={columnas.length} className="px-6 py-12 text-center">
                                            <div className="space-y-3">
                                                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    No hay auditorías de alto costo pendientes
                                                </h3>
                                                <p className="text-gray-500">
                                                    {searchTerm || Object.values(filtros).some(f => f)
                                                        ? 'No se encontraron auditorías que coincidan con los filtros aplicados.'
                                                        : 'Todas las auditorías de alto costo han sido procesadas.'
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    auditorias.map((auditoria, index) => (
                                        <tr
                                            key={auditoria.id || index}
                                            className="hover:bg-orange-50 transition-colors duration-150"
                                        >
                                            {columnas.map((col) => (
                                                <td
                                                    key={`${auditoria.id || index}-${col.key}`}
                                                    className={`px-4 py-4 border-r border-gray-200 last:border-r-0 ${col.className || ''}`}
                                                >
                                                    {col.render ? col.render(auditoria) : auditoria[col.key] || '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {auditorias.length > 0 && paginacion.totalPaginas > 1 && (
                        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
                            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">

                                {/* Información de registros */}
                                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                    <div className="text-sm text-gray-700">
                                        Mostrando{' '}
                                        <span className="font-medium">
                                            {Math.max(1, (paginacion.paginaActual - 1) * paginacion.registrosPorPagina + 1)}
                                        </span>{' '}
                                        al{' '}
                                        <span className="font-medium">
                                            {Math.min(paginacion.paginaActual * paginacion.registrosPorPagina, paginacion.totalRegistros)}
                                        </span>{' '}
                                        de{' '}
                                        <span className="font-medium">{paginacion.totalRegistros}</span> auditorías de alto costo
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700">Mostrar</span>
                                        <select
                                            value={paginacion.registrosPorPagina}
                                            onChange={(e) => cambiarRegistrosPorPagina(e.target.value)}
                                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        >
                                            <option value={10}>10</option>
                                            <option value={15}>15</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                        <span className="text-sm text-gray-700">por página</span>
                                    </div>
                                </div>

                                {/* Controles de paginación */}
                                <div className="flex items-center space-x-1">
                                    {/* Botón anterior */}
                                    <button
                                        onClick={() => cambiarPagina(paginacion.paginaActual - 1)}
                                        disabled={paginacion.paginaActual === 1}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        Anterior
                                    </button>

                                    {/* Números de página */}
                                    {Array.from({ length: Math.min(5, paginacion.totalPaginas) }, (_, i) => {
                                        let pageNum;
                                        if (paginacion.totalPaginas <= 5) {
                                            pageNum = i + 1;
                                        } else if (paginacion.paginaActual <= 3) {
                                            pageNum = i + 1;
                                        } else if (paginacion.paginaActual >= paginacion.totalPaginas - 2) {
                                            pageNum = paginacion.totalPaginas - 4 + i;
                                        } else {
                                            pageNum = paginacion.paginaActual - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => cambiarPagina(pageNum)}
                                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${pageNum === paginacion.paginaActual
                                                    ? 'bg-orange-600 text-white border border-orange-600'
                                                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {/* Botón siguiente */}
                                    <button
                                        onClick={() => cambiarPagina(paginacion.paginaActual + 1)}
                                        disabled={paginacion.paginaActual === paginacion.totalPaginas}
                                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : null}

            {/* Información adicional */}
            {auditorias.length > 0 && (
                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <ExclamationTriangleIcon className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-orange-800">
                                Información importante sobre auditorías de alto costo
                            </h3>
                            <div className="mt-2 text-sm text-orange-700">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Los medicamentos de <strong>alto costo</strong> requieren evaluación especializada y autorización previa</li>
                                    <li>Las auditorías marcadas como <strong>CRÍTICA</strong> deben procesarse con máxima prioridad</li>
                                    <li>Los tratamientos <strong>huérfanos (HO)</strong> y <strong>biotecnología (BIAC)</strong> tienen protocolos especiales</li>
                                    <li>Verifique siempre la documentación clínica y justificación médica antes de aprobar</li>
                                    <li>Los costos promedio mostrados son estimaciones basadas en datos históricos</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Estado vacío inicial */}
            {!loading && auditorias.length === 0 && !searchTerm && !Object.values(filtros).some(f => f) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="space-y-4">
                        <div className="mx-auto h-24 w-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                            <CurrencyDollarIcon className="h-12 w-12 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Sistema de Auditorías de Alto Costo
                            </h3>
                            <p className="mt-2 text-gray-600 max-w-md mx-auto">
                                Actualmente no hay auditorías de alto costo pendientes de procesamiento.
                                El sistema está funcionando correctamente y todas las auditorías han sido procesadas.
                            </p>
                        </div>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={refrescarDatos}
                                className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
                            >
                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                Verificar nuevamente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AltoCostoPendientes;
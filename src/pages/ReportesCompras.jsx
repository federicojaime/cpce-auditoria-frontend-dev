import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart, FiClock, FiCheckCircle, FiAlertCircle, FiTruck, FiMapPin, FiCalendar } from 'react-icons/fi';
import { ChartBarIcon, PresentationChartLineIcon, TruckIcon as TruckIconHero, CurrencyDollarIcon as CurrencyIconHero } from '@heroicons/react/24/outline';
import * as reportesService from '../services/reportesService';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ReportesCompras = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para cada tipo de reporte
    const [reporteGeneral, setReporteGeneral] = useState(null);
    const [dashboardEjecutivo, setDashboardEjecutivo] = useState(null);
    const [analisisLogistica, setAnalisisLogistica] = useState(null);
    const [proyeccionCostos, setProyeccionCostos] = useState(null);

    const [filtros, setFiltros] = useState({
        fechaInicio: '',
        fechaFin: ''
    });

    useEffect(() => {
        cargarDatosTab(activeTab);
    }, [activeTab]);

    const cargarDatosTab = async (tab) => {
        try {
            setLoading(true);
            setError(null);

            const filtrosAPI = {};
            if (filtros.fechaInicio) filtrosAPI.fechaInicio = filtros.fechaInicio;
            if (filtros.fechaFin) filtrosAPI.fechaFin = filtros.fechaFin;

            if (tab === 'general' && !reporteGeneral) {
                const data = await reportesService.getEstadisticas(filtrosAPI);
                console.log('📊 Estadísticas recibidas:', data);

                const resumen = data.resumen || {};
                const ranking = data.ranking || [];
                const distribucion = data.distribucion || [];
                const cumplimiento = data.cumplimiento || {};

                const datosReporte = {
                    resumenGeneral: {
                        periodo: `${filtros.fechaDesde} al ${filtros.fechaHasta}`,
                        totalOrdenes: resumen.totalOrdenes || 0,
                        montoTotal: resumen.montoTotal || 0,
                        tiempoPromedioEntrega: parseFloat(data.cumplimiento?.dias_promedio_entrega || 0).toFixed(1),
                        proveedoresActivos: resumen.proveedoresActivos || 0,
                        ordenesEntregadas: cumplimiento.total_ordenes_entregadas || 0,
                        ordenesPendientes: resumen.ordenesPendientes || 0
                    },
                    distribucionEstados: distribucion
                        .filter(item => item.estado_compra || item.estado)
                        .map(item => {
                            const estadoNombre = item.estado_compra || item.estado || 'sin_estado';
                            return {
                                estado: formatearNombreEstado(estadoNombre),
                                cantidad: item.cantidad || 0,
                                monto: parseFloat(item.monto_total || 0),
                                porcentaje: parseFloat(item.porcentaje || 0),
                                color: getColorEstadoCompra(estadoNombre)
                            };
                        }),
                    topProveedores: ranking.map(prov => ({
                        nombre: prov.razon_social || prov.id_proveedor || 'Sin nombre',
                        ordenes: prov.total_ordenes || 0,
                        monto: parseFloat(prov.monto_total || 0),
                        tiempoPromedio: parseFloat(prov.tiempo_promedio || 0),
                        cumplimiento: parseFloat(prov.porcentaje_cumplimiento || 0)
                    }))
                };

                setReporteGeneral(datosReporte);
            } else if (tab === 'ejecutivo' && !dashboardEjecutivo) {
                const data = await reportesService.getDashboardEjecutivo(filtrosAPI);
                console.log('📊 Dashboard Ejecutivo:', data);
                setDashboardEjecutivo(data);
            } else if (tab === 'logistica' && !analisisLogistica) {
                const data = await reportesService.getAnalisisLogistica(filtrosAPI);
                console.log('🚚 Análisis Logística:', data);
                setAnalisisLogistica(data);
            } else if (tab === 'proyeccion' && !proyeccionCostos) {
                const data = await reportesService.getProyeccionCostos(filtrosAPI);
                console.log('📈 Proyección Costos:', data);
                setProyeccionCostos(data);
            }
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar los datos. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = (e) => {
        e.preventDefault();
        // Limpiar todos los estados para forzar recarga
        setReporteGeneral(null);
        setDashboardEjecutivo(null);
        setAnalisisLogistica(null);
        setProyeccionCostos(null);
        cargarDatosTab(activeTab);
    };

    const limpiarFiltros = () => {
        setFiltros({ fechaInicio: '', fechaFin: '' });
        setReporteGeneral(null);
        setDashboardEjecutivo(null);
        setAnalisisLogistica(null);
        setProyeccionCostos(null);
        setTimeout(() => cargarDatosTab(activeTab), 100);
    };

    // Funciones de formato
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '$0';
        const numero = parseFloat(amount);
        if (isNaN(numero)) return '$0';
        if (numero >= 1000000) return `$${(numero / 1000000).toFixed(1)}M`;
        else if (numero >= 1000) return `$${(numero / 1000).toFixed(0)}K`;
        return `$${numero.toFixed(0)}`;
    };

    const formatCurrencyFull = (amount) => {
        if (!amount && amount !== 0) return '$0,00';
        const numero = parseFloat(amount);
        if (isNaN(numero)) return '$0,00';
        const partes = numero.toFixed(2).split('.');
        const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const decimal = partes[1];
        return `$${entero},${decimal}`;
    };

    const formatearNombreEstado = (estado) => {
        const nombres = {
            'enviado_proveedores': 'Enviado a Proveedores',
            'pendiente_envio': 'Pendiente de Envío',
            'adjudicado': 'Adjudicado',
            'entregado': 'Entregado',
            'cancelado': 'Cancelado',
            'en_proceso': 'En Proceso'
        };
        return nombres[estado] || estado.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getColorEstadoCompra = (estado) => {
        const colores = {
            'enviado_proveedores': '#F59E0B',
            'pendiente_envio': '#FCD34D',
            'adjudicado': '#34D399',
            'entregado': '#10B981',
            'cancelado': '#EF4444',
            'en_proceso': '#3B82F6'
        };
        return colores[estado] || '#9CA3AF';
    };

    const tabs = [
        { id: 'general', name: 'Reporte General', icon: ChartBarIcon },
        { id: 'ejecutivo', name: 'Dashboard Ejecutivo', icon: PresentationChartLineIcon },
        { id: 'logistica', name: 'Análisis Logística', icon: TruckIconHero },
        { id: 'proyeccion', name: 'Proyección Costos', icon: CurrencyIconHero }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando reportes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Reportes de Compras</h1>
                    <p className="text-sm text-gray-600 mt-1">Análisis completo de órdenes y presupuestos</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex flex-wrap -mb-px">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="hidden sm:inline">{tab.name}</span>
                                    <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Filtros */}
                <div className="p-4">
                    <form onSubmit={aplicarFiltros} className="flex flex-col sm:flex-row gap-3 sm:items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Inicio
                            </label>
                            <input
                                type="date"
                                value={filtros.fechaInicio}
                                onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Fin
                            </label>
                            <input
                                type="date"
                                value={filtros.fechaFin}
                                onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 sm:flex-initial px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                Aplicar
                            </button>
                            <button
                                type="button"
                                onClick={limpiarFiltros}
                                className="flex-1 sm:flex-initial px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                                Limpiar
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Content */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {activeTab === 'general' && reporteGeneral && (
                <ReporteGeneralContent data={reporteGeneral} formatCurrency={formatCurrency} formatCurrencyFull={formatCurrencyFull} />
            )}

            {activeTab === 'ejecutivo' && dashboardEjecutivo && (
                <DashboardEjecutivoContent data={dashboardEjecutivo} formatCurrency={formatCurrency} formatCurrencyFull={formatCurrencyFull} />
            )}

            {activeTab === 'logistica' && analisisLogistica && (
                <AnalisisLogisticaContent data={analisisLogistica} formatCurrency={formatCurrency} formatCurrencyFull={formatCurrencyFull} />
            )}

            {activeTab === 'proyeccion' && proyeccionCostos && (
                <ProyeccionCostosContent data={proyeccionCostos} formatCurrency={formatCurrency} formatCurrencyFull={formatCurrencyFull} />
            )}
        </div>
    );
};

// ========== COMPONENTE: REPORTE GENERAL ==========
const ReporteGeneralContent = ({ data, formatCurrency, formatCurrencyFull }) => {
    const distribucionData = {
        labels: data.distribucionEstados?.map(e => e.estado) || [],
        datasets: [{
            data: data.distribucionEstados?.map(e => e.cantidad) || [],
            backgroundColor: data.distribucionEstados?.map(e => e.color || '#9CA3AF') || [],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    const topProveedoresData = {
        labels: data.topProveedores?.map(p => p.nombre) || [],
        datasets: [{
            label: 'Órdenes Completadas',
            data: data.topProveedores?.map(p => p.ordenes) || [],
            backgroundColor: '#3B82F6',
            borderRadius: 6
        }]
    };

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                        {data.resumenGeneral?.totalOrdenes || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Órdenes</div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-100 hover:shadow-md transition-shadow">
                    <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1"
                         title={formatCurrencyFull(data.resumenGeneral?.montoTotal)}>
                        {formatCurrency(data.resumenGeneral?.montoTotal || 0)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Monto Total</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100 hover:shadow-md transition-shadow">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                        {data.resumenGeneral?.ordenesEntregadas || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Entregadas</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-100 hover:shadow-md transition-shadow">
                    <div className="text-xl sm:text-2xl font-bold text-orange-600 mb-1">
                        {data.resumenGeneral?.ordenesPendientes || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Pendientes</div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 border border-indigo-100 hover:shadow-md transition-shadow">
                    <div className="text-xl sm:text-2xl font-bold text-indigo-600 mb-1">
                        {data.resumenGeneral?.tiempoPromedioEntrega || 0} días
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Tiempo Promedio</div>
                </div>

                <div className="bg-pink-50 rounded-lg p-3 sm:p-4 border border-pink-100 hover:shadow-md transition-shadow">
                    <div className="text-xl sm:text-2xl font-bold text-pink-600 mb-1">
                        {data.resumenGeneral?.proveedoresActivos || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Proveedores</div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Estado</h2>
                    <div className="h-72 sm:h-80">
                        {data.distribucionEstados?.length > 0 ? (
                            <Pie data={distribucionData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'right' }
                                }
                            }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Sin datos disponibles
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Proveedores</h2>
                    <div className="h-72 sm:h-80">
                        {data.topProveedores?.length > 0 ? (
                            <Bar data={topProveedoresData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                indexAxis: 'y',
                                plugins: { legend: { display: false } }
                            }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Sin datos disponibles
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ========== COMPONENTE: DASHBOARD EJECUTIVO ==========
const DashboardEjecutivoContent = ({ data, formatCurrency, formatCurrencyFull }) => {
    const evolucionData = {
        labels: data.evolucionMensual?.map(m => m.mes) || [],
        datasets: [
            {
                label: 'Órdenes',
                data: data.evolucionMensual?.map(m => m.cantidad_ordenes) || [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y'
            },
            {
                label: 'Monto (M)',
                data: data.evolucionMensual?.map(m => (m.monto_total / 1000000).toFixed(2)) || [],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }
        ]
    };

    const topProveedoresData = {
        labels: data.topProveedores?.map(p => p.razon_social || 'Sin nombre') || [],
        datasets: [{
            data: data.topProveedores?.map(p => p.monto_total) || [],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Total Órdenes</p>
                            <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                                {data.kpis?.totalOrdenes || 0}
                            </p>
                        </div>
                        <div className="bg-blue-200 p-2 rounded-lg">
                            <FiShoppingCart className="text-blue-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">Monto Total</p>
                            <p className="text-2xl sm:text-3xl font-bold text-green-700"
                               title={formatCurrencyFull(data.kpis?.montoTotal)}>
                                {formatCurrency(data.kpis?.montoTotal || 0)}
                            </p>
                        </div>
                        <div className="bg-green-200 p-2 rounded-lg">
                            <FiDollarSign className="text-green-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-purple-600 font-medium mb-1">Promedio/Orden</p>
                            <p className="text-2xl sm:text-3xl font-bold text-purple-700"
                               title={formatCurrencyFull(data.kpis?.promedioPorOrden)}>
                                {formatCurrency(data.kpis?.promedioPorOrden || 0)}
                            </p>
                        </div>
                        <div className="bg-purple-200 p-2 rounded-lg">
                            <FiTrendingUp className="text-purple-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-orange-600 font-medium mb-1">Tiempo Promedio</p>
                            <p className="text-2xl sm:text-3xl font-bold text-orange-700">
                                {parseFloat(data.kpis?.tiempoPromedioEntrega || 0).toFixed(1)} días
                            </p>
                        </div>
                        <div className="bg-orange-200 p-2 rounded-lg">
                            <FiClock className="text-orange-600 text-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Evolución Mensual</h2>
                    <div className="h-72 sm:h-80">
                        {data.evolucionMensual?.length > 0 ? (
                            <Line data={evolucionData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: { type: 'linear', position: 'left', title: { display: true, text: 'Órdenes' } },
                                    y1: { type: 'linear', position: 'right', title: { display: true, text: 'Monto (M)' }, grid: { drawOnChartArea: false } }
                                }
                            }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Sin datos</div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Proveedores</h2>
                    <div className="h-72 sm:h-80">
                        {data.topProveedores?.length > 0 ? (
                            <Doughnut data={topProveedoresData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'right' } }
                            }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Sin datos</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla */}
            {data.topProveedores?.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Detalle Top Proveedores</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto Total</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Promedio/Orden</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% del Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.topProveedores.map((prov, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{prov.razon_social || 'Sin nombre'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{prov.total_ordenes || 0}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrencyFull(prov.monto_total || 0)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrencyFull(prov.promedio_por_orden || 0)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{parseFloat(prov.porcentaje_total || 0).toFixed(2)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// ========== COMPONENTE: ANÁLISIS LOGÍSTICA ==========
const AnalisisLogisticaContent = ({ data, formatCurrency, formatCurrencyFull }) => {
    const tiemposData = {
        labels: data.tiemposPorEstado?.map(t => t.estado_compra) || [],
        datasets: [{
            label: 'Días Promedio',
            data: data.tiemposPorEstado?.map(t => parseFloat(t.dias_promedio || 0)) || [],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 1
        }]
    };

    const puntosData = {
        labels: data.puntosRetiro?.map(p => p.punto_retiro || 'Sin especificar') || [],
        datasets: [{
            data: data.puntosRetiro?.map(p => p.cantidad) || [],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">Entregadas</p>
                            <p className="text-2xl sm:text-3xl font-bold text-green-700">{data.cumplimiento?.totalEntregadas || 0}</p>
                        </div>
                        <div className="bg-green-200 p-2 rounded-lg">
                            <FiCheckCircle className="text-green-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">En Tiempo</p>
                            <p className="text-2xl sm:text-3xl font-bold text-blue-700">{data.cumplimiento?.enTiempo || 0}</p>
                        </div>
                        <div className="bg-blue-200 p-2 rounded-lg">
                            <FiClock className="text-blue-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-orange-600 font-medium mb-1">Con Retraso</p>
                            <p className="text-2xl sm:text-3xl font-bold text-orange-700">{data.cumplimiento?.conRetraso || 0}</p>
                        </div>
                        <div className="bg-orange-200 p-2 rounded-lg">
                            <FiAlertCircle className="text-orange-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-purple-600 font-medium mb-1">% Cumplimiento</p>
                            <p className="text-2xl sm:text-3xl font-bold text-purple-700">{parseFloat(data.cumplimiento?.porcentajeCumplimiento || 0).toFixed(1)}%</p>
                        </div>
                        <div className="bg-purple-200 p-2 rounded-lg">
                            <FiTruck className="text-purple-600 text-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Tiempo Promedio por Estado</h2>
                    <div className="h-72 sm:h-80">
                        {data.tiemposPorEstado?.length > 0 ? (
                            <Bar data={tiemposData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true, title: { display: true, text: 'Días' } } }
                            }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Sin datos</div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Punto de Retiro</h2>
                    <div className="h-72 sm:h-80">
                        {data.puntosRetiro?.length > 0 ? (
                            <Doughnut data={puntosData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { position: 'right' } }
                            }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Sin datos</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ========== COMPONENTE: PROYECCIÓN COSTOS ==========
const ProyeccionCostosContent = ({ data, formatCurrency, formatCurrencyFull }) => {
    const tendenciaData = {
        labels: data.tendenciaMensual?.map(t => t.mes) || [],
        datasets: [
            {
                label: 'Histórico',
                data: data.tendenciaMensual?.map(t => t.monto_total) || [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Proyección',
                data: data.tendenciaMensual?.map(t => t.proyeccion) || [],
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderDash: [5, 5],
                fill: false,
                tension: 0.4
            }
        ]
    };

    const costosData = {
        labels: data.costosPorCategoria?.map(c => c.categoria || 'Sin categoría') || [],
        datasets: [{
            label: 'Monto Total',
            data: data.costosPorCategoria?.map(c => c.monto_total) || [],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 1
        }]
    };

    const tendencia = data.resumen?.tendencia || 'neutral';
    const variacion = parseFloat(data.resumen?.variacionPorcentaje || 0);

    return (
        <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Promedio Mensual</p>
                            <p className="text-2xl sm:text-3xl font-bold text-blue-700"
                               title={formatCurrencyFull(data.resumen?.promedioMensual)}>
                                {formatCurrency(data.resumen?.promedioMensual || 0)}
                            </p>
                        </div>
                        <div className="bg-blue-200 p-2 rounded-lg">
                            <FiCalendar className="text-blue-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">Proyección Próx. Mes</p>
                            <p className="text-2xl sm:text-3xl font-bold text-green-700"
                               title={formatCurrencyFull(data.resumen?.proyeccionProximoMes)}>
                                {formatCurrency(data.resumen?.proyeccionProximoMes || 0)}
                            </p>
                        </div>
                        <div className="bg-green-200 p-2 rounded-lg">
                            <FiDollarSign className="text-green-600 text-lg" />
                        </div>
                    </div>
                </div>

                <div className={`bg-gradient-to-br ${tendencia === 'creciente' ? 'from-orange-50 to-orange-100' : 'from-purple-50 to-purple-100'} rounded-lg p-4 border ${tendencia === 'creciente' ? 'border-orange-200' : 'border-purple-200'}`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`text-xs sm:text-sm ${tendencia === 'creciente' ? 'text-orange-600' : 'text-purple-600'} font-medium mb-1`}>Tendencia</p>
                            <p className={`text-xl sm:text-2xl font-bold ${tendencia === 'creciente' ? 'text-orange-700' : 'text-purple-700'} capitalize`}>{tendencia}</p>
                        </div>
                        <div className={`${tendencia === 'creciente' ? 'bg-orange-200' : 'bg-purple-200'} p-2 rounded-lg`}>
                            {tendencia === 'creciente' ? <FiTrendingUp className="text-orange-600 text-lg" /> : <FiTrendingDown className="text-purple-600 text-lg" />}
                        </div>
                    </div>
                </div>

                <div className={`bg-gradient-to-br ${variacion >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'} rounded-lg p-4 border ${variacion >= 0 ? 'border-green-200' : 'border-red-200'}`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`text-xs sm:text-sm ${variacion >= 0 ? 'text-green-600' : 'text-red-600'} font-medium mb-1`}>Variación</p>
                            <p className={`text-2xl sm:text-3xl font-bold ${variacion >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {variacion >= 0 ? '+' : ''}{variacion.toFixed(1)}%
                            </p>
                        </div>
                        <div className={`${variacion >= 0 ? 'bg-green-200' : 'bg-red-200'} p-2 rounded-lg`}>
                            {variacion >= 0 ? <FiTrendingUp className="text-green-600 text-lg" /> : <FiTrendingDown className="text-red-600 text-lg" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Tendencia y Proyección Mensual</h2>
                    <div className="h-72 sm:h-80">
                        {data.tendenciaMensual?.length > 0 ? (
                            <Line data={tendenciaData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: { y: { beginAtZero: true } }
                            }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Sin datos</div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Costos por Categoría</h2>
                    <div className="h-72 sm:h-80">
                        {data.costosPorCategoria?.length > 0 ? (
                            <Bar data={costosData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                indexAxis: 'y',
                                plugins: { legend: { display: false } }
                            }} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Sin datos</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportesCompras;

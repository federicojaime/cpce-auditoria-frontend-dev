import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    ChartBarIcon,
    UsersIcon,
    ClockIcon,
    DocumentCheckIcon,
    ExclamationTriangleIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    StarIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    EyeIcon,
    BeakerIcon,
    HeartIcon
} from '@heroicons/react/24/outline';

// Datos de estadísticas demo
const statsData = {
    resumenGeneral: {
        totalAuditorias: 2847,
        pendientes: 156,
        completadas: 2691,
        aprobadas: 2602,
        rechazadas: 89,
        tasaAprobacion: 91.4,
        tiempoPromedio: "2.1 días",
        tendencia: "+12%"
    },

    altoCosto: {
        totalSolicitudes: 486,
        aprobadas: 427,
        rechazadas: 35,
        pendientes: 24,
        montoTotal: 45600000,
        montoPromedio: 156000,
        tasaAprobacion: 87.8,
        tiempoPromedio: "3.2 días",
        crecimiento: "+18%"
    },

    tendenciaMensual: [
        { mes: "Ene", auditorias: 389, aprobadas: 356, rechazadas: 33, ingresos: 2840000 },
        { mes: "Feb", auditorias: 412, aprobadas: 378, rechazadas: 34, ingresos: 3120000 },
        { mes: "Mar", auditorias: 485, aprobadas: 441, rechazadas: 44, ingresos: 3680000 },
        { mes: "Abr", auditorias: 523, aprobadas: 489, rechazadas: 34, ingresos: 4020000 },
        { mes: "May", auditorias: 467, aprobadas: 425, rechazadas: 42, ingresos: 3540000 },
        { mes: "Jun", auditorias: 398, aprobadas: 362, rechazadas: 36, ingresos: 3010000 },
        { mes: "Jul", auditorias: 562, aprobadas: 507, rechazadas: 55, ingresos: 4250000 }
    ],

    tendenciaAltoCosto: [
        { mes: "Ene", solicitudes: 64, aprobadas: 58, rechazadas: 6, monto: 5200000 },
        { mes: "Feb", solicitudes: 68, aprobadas: 61, rechazadas: 7, monto: 5800000 },
        { mes: "Mar", solicitudes: 72, aprobadas: 63, rechazadas: 9, monto: 6100000 },
        { mes: "Abr", solicitudes: 78, aprobadas: 69, rechazadas: 9, monto: 6900000 },
        { mes: "May", solicitudes: 71, aprobadas: 62, rechazadas: 9, monto: 5900000 },
        { mes: "Jun", solicitudes: 69, aprobadas: 60, rechazadas: 9, monto: 5700000 },
        { mes: "Jul", solicitudes: 84, aprobadas: 75, rechazadas: 9, monto: 7400000 }
    ],

    topAuditores: [
        { nombre: "Dr. María González", auditorias: 387, aprobadas: 351, tasa: 90.7, tiempo: "2.3d", estrella: true },
        { nombre: "Dr. Carlos Mendoza", auditorias: 342, aprobadas: 318, tasa: 92.9, tiempo: "1.8d", estrella: true },
        { nombre: "Dra. Ana Rodríguez", auditorias: 298, aprobadas: 269, tasa: 90.2, tiempo: "2.1d", estrella: false },
        { nombre: "Dr. Luis Fernández", auditorias: 289, aprobadas: 262, tasa: 90.7, tiempo: "2.5d", estrella: false },
        { nombre: "Dra. Patricia Silva", auditorias: 267, aprobadas: 243, tasa: 91.0, tiempo: "2.0d", estrella: true }
    ],

    medicamentosAltoCosto: [
        { 
            nombre: "Adalimumab", 
            solicitudes: 89, 
            aprobadas: 78, 
            tasa: 87.6, 
            montoPromedio: 125000,
            indicacion: "Artritis Reumatoide",
            crecimiento: 15
        },
        { 
            nombre: "Trastuzumab", 
            solicitudes: 67, 
            aprobadas: 61, 
            tasa: 91.0, 
            montoPromedio: 85000,
            indicacion: "Cáncer de Mama HER2+",
            crecimiento: 8
        },
        { 
            nombre: "Rituximab", 
            solicitudes: 54, 
            aprobadas: 49, 
            tasa: 90.7, 
            montoPromedio: 95000,
            indicacion: "Linfoma No Hodgkin",
            crecimiento: -3
        },
        { 
            nombre: "Infliximab", 
            solicitudes: 48, 
            aprobadas: 44, 
            tasa: 91.7, 
            montoPromedio: 105000,
            indicacion: "Enfermedad de Crohn",
            crecimiento: 22
        },
        { 
            nombre: "Bevacizumab", 
            solicitudes: 42, 
            aprobadas: 38, 
            tasa: 90.5, 
            montoPromedio: 150000,
            indicacion: "Cáncer Colorrectal",
            crecimiento: 12
        },
        { 
            nombre: "Etanercept", 
            solicitudes: 38, 
            aprobadas: 32, 
            tasa: 84.2, 
            montoPromedio: 78000,
            indicacion: "Psoriasis Severa",
            crecimiento: 5
        }
    ],

    especialidades: [
        { nombre: "Cardiología", auditorias: 432, tasa: 91.2, tiempo: "2.3d", complejidad: "Alta" },
        { nombre: "Traumatología", auditorias: 389, tasa: 89.7, tiempo: "1.9d", complejidad: "Media" },
        { nombre: "Neurología", auditorias: 367, tasa: 93.4, tiempo: "3.1d", complejidad: "Alta" },
        { nombre: "Oncología", auditorias: 298, tasa: 95.3, tiempo: "2.8d", complejidad: "Muy Alta" },
        { nombre: "Pediatría", auditorias: 287, tasa: 88.9, tiempo: "1.6d", complejidad: "Media" }
    ],

    motivosRechazo: [
        { motivo: "Documentación incompleta", cantidad: 32, porcentaje: 35.9 },
        { motivo: "Prescripción vencida", cantidad: 18, porcentaje: 20.2 },
        { motivo: "Datos incorrectos del paciente", cantidad: 15, porcentaje: 16.9 },
        { motivo: "Medicamento no cubierto", cantidad: 12, porcentaje: 13.5 },
        { motivo: "Duplicado de solicitud", cantidad: 8, porcentaje: 9.0 },
        { motivo: "Otros", cantidad: 4, porcentaje: 4.5 }
    ],

    motivosRechazoAltoCosto: [
        { motivo: "Falta historia clínica detallada", cantidad: 12, porcentaje: 34.3 },
        { motivo: "Tratamientos previos insuficientes", cantidad: 8, porcentaje: 22.9 },
        { motivo: "Estudios complementarios faltantes", cantidad: 6, porcentaje: 17.1 },
        { motivo: "Indicación no protocolizada", cantidad: 5, porcentaje: 14.3 },
        { motivo: "Contraindicaciones presentes", cantidad: 3, porcentaje: 8.6 },
        { motivo: "Otros", cantidad: 1, porcentaje: 2.8 }
    ]
};

const Estadisticas = () => {
    const { user } = useAuth();
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [selectedView, setSelectedView] = useState('general');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simular carga de datos
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, trendValue }) => {
        const colorClasses = {
            blue: { border: 'border-blue-500', bg: 'bg-blue-100', text: 'text-blue-600' },
            green: { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-600' },
            yellow: { border: 'border-yellow-500', bg: 'bg-yellow-100', text: 'text-yellow-600' },
            red: { border: 'border-red-500', bg: 'bg-red-100', text: 'text-red-600' },
            purple: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600' }
        };

        const colorClass = colorClasses[color] || colorClasses.blue;

        return (
            <div className={`bg-white rounded-xl shadow-sm border-l-4 ${colorClass.border} p-6 hover:shadow-md transition-all duration-300`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    <div className={`h-12 w-12 ${colorClass.bg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${colorClass.text}`} />
                    </div>
                </div>
                {trend && (
                    <div className="mt-4 flex items-center">
                        {trend === 'up' ? (
                            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                            <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {trendValue}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
                    </div>
                )}
            </div>
        );
    };

    // Componente de gráfico de barras que FUNCIONA
    const ChartBar = ({ data, maxValue, color = 'blue', dataKey = 'auditorias', title }) => {
        const getBarColor = (color) => {
            const colors = {
                blue: '#3b82f6',
                purple: '#8b5cf6',
                green: '#10b981',
                red: '#ef4444',
                yellow: '#f59e0b'
            };
            return colors[color] || colors.blue;
        };

        return (
            <div className="w-full">
                {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
                <div className="flex items-end justify-between space-x-1 h-32 mb-4">
                    {data.map((item, index) => {
                        const height = Math.max((item[dataKey] / maxValue) * 100, 5);
                        return (
                            <div key={index} className="flex-1 flex flex-col items-center group relative">
                                <div 
                                    className="w-full rounded-t transition-all duration-700 hover:opacity-80 relative cursor-pointer"
                                    style={{ 
                                        height: `${height}%`,
                                        backgroundColor: getBarColor(color),
                                        minHeight: '8px'
                                    }}
                                    title={`${item.mes}: ${item[dataKey]}`}
                                >
                                </div>
                                <span className="text-xs text-gray-600 mt-2 font-medium">{item.mes}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Componente de gráfico circular FUNCIONAL
    const DonutChart = ({ data, title, colors }) => {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let cumulativePercentage = 0;

        return (
            <div className="flex flex-col items-center">
                {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
                <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        {/* Círculo de fondo */}
                        <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb" 
                            strokeWidth="3"
                        />
                        {/* Segmentos de datos */}
                        {data.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const strokeDasharray = `${percentage} ${100 - percentage}`;
                            const strokeDashoffset = -cumulativePercentage;
                            cumulativePercentage += percentage;
                            
                            return (
                                <path
                                    key={index}
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={colors[index]}
                                    strokeWidth="3"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    style={{ 
                                        transition: 'all 1s ease-in-out'
                                    }}
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-800">{total}</span>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between space-x-4">
                            <div className="flex items-center space-x-2">
                                <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: colors[index] }}
                                ></div>
                                <span className="text-sm text-gray-600">{item.label}</span>
                            </div>
                            <span className="text-sm font-medium">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Componente de barra de progreso simple
    const ProgressBar = ({ label, value, maxValue, color = '#3b82f6', showPercentage = true }) => {
        const percentage = (value / maxValue) * 100;
        
        return (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className="text-sm font-bold">{showPercentage ? `${percentage.toFixed(1)}%` : value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                        className="h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: color
                        }}
                    ></div>
                </div>
            </div>
        );
    };

    // Componente de métricas con animación
    const AnimatedMetric = ({ title, value, subtitle, color = '#3b82f6', trend, trendValue }) => {
        return (
            <div className="p-4 rounded-xl" style={{ backgroundColor: `${color}15` }}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: color }}>{title}</span>
                    <span className="text-2xl font-bold" style={{ color: color }}>{value}</span>
                </div>
                {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
                {trend && (
                    <div className="flex items-center mt-2">
                        <span style={{ color: trend === 'up' ? '#10b981' : '#ef4444' }}>
                            {trend === 'up' ? '↗' : '↘'} {trendValue}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">vs anterior</span>
                    </div>
                )}
            </div>
        );
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-xl text-white p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">📊 Estadísticas Avanzadas</h1>
                            <p className="text-blue-100 text-lg">Panel de métricas y análisis del sistema CPCE</p>
                            <div className="mt-4 flex items-center space-x-4">
                                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                                    Actualizado hace 5 min
                                </span>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <ChartBarIcon className="h-10 w-10 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros de período y vista */}
            <div className="mb-8">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-center space-x-4">
                            <h3 className="text-lg font-semibold text-gray-900">Vista de análisis</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setSelectedView('general')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedView === 'general'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    📋 General
                                </button>
                                <button
                                    onClick={() => setSelectedView('altocosto')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedView === 'altocosto'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    💊 Alto Costo
                                </button>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {['7d', '30d', '90d', '1y'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === period
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {period === '7d' && 'Última semana'}
                                    {period === '30d' && 'Último mes'}
                                    {period === '90d' && 'Últimos 3 meses'}
                                    {period === '1y' && 'Último año'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Métricas principales - Vista condicional */}
            {selectedView === 'general' ? (
                <>
                    {/* Métricas generales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Auditorías"
                            value="2,847"
                            subtitle="Todas las auditorías"
                            icon={DocumentCheckIcon}
                            color="blue"
                            trend="up"
                            trendValue="+12%"
                        />
                        <StatCard
                            title="Tasa de Aprobación"
                            value="91.4%"
                            subtitle="Promedio general"
                            icon={UsersIcon}
                            color="green"
                            trend="up"
                            trendValue="+1.7%"
                        />
                        <StatCard
                            title="Tiempo Promedio"
                            value="2.1"
                            subtitle="días por auditoría"
                            icon={ClockIcon}
                            color="yellow"
                            trend="down"
                            trendValue="-25%"
                        />
                        <StatCard
                            title="Pendientes"
                            value="156"
                            subtitle="En revisión"
                            icon={ExclamationTriangleIcon}
                            color="red"
                            trend="down"
                            trendValue="-8%"
                        />
                    </div>

                    {/* Gráficos generales */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Tendencia mensual general */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">📈 Tendencia Mensual 2025</h3>
                                <EyeIcon className="h-6 w-6 text-gray-400" />
                            </div>
                            <ChartBar 
                                data={statsData.tendenciaMensual} 
                                maxValue={600} 
                                color="blue" 
                                dataKey="auditorias"
                            />
                            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">562</p>
                                    <p className="text-sm text-gray-600">Este mes</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">507</p>
                                    <p className="text-sm text-gray-600">Aprobadas</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-600">55</p>
                                    <p className="text-sm text-gray-600">Rechazadas</p>
                                </div>
                            </div>
                        </div>

                        {/* Distribución por estado con gráfico circular */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">🎯 Distribución por Estado</h3>
                            <div className="flex justify-center">
                                <DonutChart 
                                    data={[
                                        { label: 'Aprobadas', value: 2602 },
                                        { label: 'Pendientes', value: 156 },
                                        { label: 'Rechazadas', value: 89 }
                                    ]}
                                    colors={['#10b981', '#f59e0b', '#ef4444']}
                                />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Métricas de Alto Costo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Solicitudes Alto Costo"
                            value="486"
                            subtitle="Total solicitudes"
                            icon={BeakerIcon}
                            color="purple"
                            trend="up"
                            trendValue="+18%"
                        />
                        <StatCard
                            title="Tasa de Aprobación"
                            value="87.8%"
                            subtitle="Alto costo"
                            icon={HeartIcon}
                            color="green"
                            trend="up"
                            trendValue="+2.3%"
                        />
                        <StatCard
                            title="Monto Total"
                            value={formatMoney(statsData.altoCosto.montoTotal)}
                            subtitle="En medicamentos"
                            icon={CurrencyDollarIcon}
                            color="yellow"
                            trend="up"
                            trendValue="+22%"
                        />
                        <StatCard
                            title="Tiempo Promedio"
                            value="3.2"
                            subtitle="días por auditoría"
                            icon={ClockIcon}
                            color="red"
                            trend="down"
                            trendValue="-15%"
                        />
                    </div>

                    {/* Gráficos de Alto Costo */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Tendencia mensual alto costo */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">💊 Tendencia Alto Costo 2025</h3>
                                <BeakerIcon className="h-6 w-6 text-purple-500" />
                            </div>
                            <ChartBar 
                                data={statsData.tendenciaAltoCosto} 
                                maxValue={90} 
                                color="purple" 
                                dataKey="solicitudes"
                            />
                            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-purple-600">84</p>
                                    <p className="text-sm text-gray-600">Este mes</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">75</p>
                                    <p className="text-sm text-gray-600">Aprobadas</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-yellow-600">{formatMoney(7400000)}</p>
                                    <p className="text-sm text-gray-600">Monto</p>
                                </div>
                            </div>
                        </div>

                        {/* Distribución por estado alto costo con circular */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">🔍 Estado Alto Costo</h3>
                            <div className="flex justify-center">
                                <DonutChart 
                                    data={[
                                        { label: 'Aprobadas', value: 427 },
                                        { label: 'Pendientes', value: 24 },
                                        { label: 'Rechazadas', value: 35 }
                                    ]}
                                    colors={['#8b5cf6', '#f59e0b', '#ef4444']}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Gráficos adicionales para Alto Costo */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Evolución de montos */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Evolución de Montos</h3>
                            <div className="space-y-4">
                                {statsData.tendenciaAltoCosto.slice(-4).map((item, index) => (
                                    <ProgressBar 
                                        key={index}
                                        label={item.mes}
                                        value={item.monto}
                                        maxValue={8000000}
                                        color="#10b981"
                                        showPercentage={false}
                                    />
                                ))}
                            </div>
                            <AnimatedMetric 
                                title="Crecimiento Mensual"
                                value="+22%"
                                subtitle="Tendencia positiva"
                                color="#10b981"
                                trend="up"
                                trendValue="+5% vs anterior"
                            />
                        </div>

                        {/* Top 5 medicamentos más costosos */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Top Medicamentos</h3>
                            <div className="space-y-3">
                                {statsData.medicamentosAltoCosto.slice(0, 5).map((med, index) => {
                                    const colors = ['#eab308', '#9ca3af', '#f97316', '#3b82f6', '#6366f1'];
                                    return (
                                        <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div 
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                style={{ backgroundColor: colors[index] }}
                                            >
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">{med.nombre}</div>
                                                <div className="text-xs text-gray-500">{med.solicitudes} solicitudes</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-purple-600">{formatMoney(med.montoPromedio)}</div>
                                                <div className="text-xs text-gray-500">{med.tasa}%</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Indicadores de rendimiento */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 KPIs Clave</h3>
                            <div className="space-y-4">
                                <AnimatedMetric 
                                    title="Eficiencia"
                                    value="94%"
                                    subtitle="Procesos optimizados"
                                    color="#3b82f6"
                                    trend="up"
                                    trendValue="+3%"
                                />
                                
                                <AnimatedMetric 
                                    title="Adherencia"
                                    value="89%"
                                    subtitle="Cumplimiento protocolos"
                                    color="#8b5cf6"
                                    trend="up"
                                    trendValue="+1%"
                                />
                                
                                <AnimatedMetric 
                                    title="Satisfacción"
                                    value="92%"
                                    subtitle="Médicos y pacientes"
                                    color="#10b981"
                                    trend="up"
                                    trendValue="+2%"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Rankings y tablas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Top Auditores */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">🏆 Top Auditores</h3>
                        <UsersIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="space-y-4">
                        {statsData.topAuditores.map((auditor, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                        index === 0 ? 'bg-yellow-500' : 
                                        index === 1 ? 'bg-gray-400' : 
                                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="ml-3">
                                        <div className="flex items-center">
                                            <span className="font-semibold text-gray-900">{auditor.nombre}</span>
                                            {auditor.estrella && <StarIcon className="h-4 w-4 text-yellow-500 ml-1" />}
                                        </div>
                                        <span className="text-sm text-gray-500">{auditor.auditorias} auditorías</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg text-green-600">{auditor.tasa}%</div>
                                    <div className="text-sm text-gray-500">{auditor.tiempo}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Medicamentos de Alto Costo o Especialidades según la vista */}
                {selectedView === 'altocosto' ? (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">💊 Top Medicamentos Alto Costo</h3>
                            <BeakerIcon className="h-6 w-6 text-purple-500" />
                        </div>
                        <div className="space-y-4">
                            {statsData.medicamentosAltoCosto.map((medicamento, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all">
                                    <div>
                                        <div className="flex items-center">
                                            <div className="font-semibold text-gray-900">{medicamento.nombre}</div>
                                            {medicamento.crecimiento > 10 && (
                                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                    Trending
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">{medicamento.indicacion}</div>
                                        <div className="text-sm text-blue-600 font-medium">{medicamento.solicitudes} solicitudes</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center">
                                            <span className="font-bold text-lg">{medicamento.tasa}%</span>
                                            {medicamento.crecimiento > 0 ? (
                                                <ArrowUpIcon className="h-4 w-4 text-green-500 ml-1" />
                                            ) : (
                                                <ArrowDownIcon className="h-4 w-4 text-red-500 ml-1" />
                                            )}
                                        </div>
                                        <div className="text-sm text-green-600 font-medium">
                                            {formatMoney(medicamento.montoPromedio)}
                                        </div>
                                        <div className="text-xs text-gray-500">promedio</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">🩺 Por Especialidad</h3>
                        <div className="space-y-3">
                            {statsData.especialidades.map((esp, index) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                    <div>
                                        <span className="font-medium text-gray-900">{esp.nombre}</span>
                                        <div className="flex items-center mt-1">
                                            <span className="text-sm text-gray-500">{esp.auditorias} casos</span>
                                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                                esp.complejidad === 'Muy Alta' ? 'bg-red-100 text-red-800' :
                                                esp.complejidad === 'Alta' ? 'bg-orange-100 text-orange-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {esp.complejidad}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-lg">{esp.tasa}%</div>
                                        <div className="text-sm text-gray-500">{esp.tiempo}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Análisis detallado y motivos de rechazo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Análisis de costos por especialidad (solo en vista alto costo) */}
                {selectedView === 'altocosto' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">💰 Análisis de Costos</h3>
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-green-800">Monto Promedio</span>
                                    <span className="text-2xl font-bold text-green-700">{formatMoney(statsData.altoCosto.montoPromedio)}</span>
                                </div>
                                <div className="text-sm text-green-600">Por medicamento aprobado</div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-blue-800">Ahorro Estimado</span>
                                    <span className="text-2xl font-bold text-blue-700">{formatMoney(statsData.altoCosto.montoTotal * 0.15)}</span>
                                </div>
                                <div className="text-sm text-blue-600">Por auditorías efectivas</div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-purple-800">ROI del Sistema</span>
                                    <span className="text-2xl font-bold text-purple-700">347%</span>
                                </div>
                                <div className="text-sm text-purple-600">Retorno de inversión</div>
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                <h4 className="font-semibold text-gray-800 mb-3">📈 Tendencias del Mes</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="font-bold text-green-600 text-lg">+18%</div>
                                        <div className="text-gray-600">Solicitudes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-blue-600 text-lg">+22%</div>
                                        <div className="text-gray-600">Monto Total</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Motivos de rechazo */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                        ❌ Motivos de Rechazo {selectedView === 'altocosto' ? '(Alto Costo)' : '(General)'}
                    </h3>
                    <div className="space-y-4">
                        {(selectedView === 'altocosto' ? statsData.motivosRechazoAltoCosto : statsData.motivosRechazo).map((motivo, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-900 text-sm">{motivo.motivo}</span>
                                    <span className="font-bold text-lg">{motivo.cantidad}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-700 ${
                                                selectedView === 'altocosto' ? 'bg-purple-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${motivo.porcentaje}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">{motivo.porcentaje}%</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedView === 'altocosto' && (
                        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <h4 className="font-semibold text-purple-800 mb-2">💡 Recomendaciones</h4>
                            <ul className="text-sm text-purple-700 space-y-1">
                                <li>• Reforzar capacitación en historia clínica completa</li>
                                <li>• Implementar checklist de tratamientos previos</li>
                                <li>• Mejorar comunicación médico-auditor</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* Vista especialidades solo cuando no es alto costo */}
                {selectedView !== 'altocosto' && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">🩺 Rendimiento por Especialidad</h3>
                        <div className="space-y-4">
                            {statsData.especialidades.map((esp, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <span className="font-medium text-gray-900">{esp.nombre}</span>
                                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                                esp.complejidad === 'Muy Alta' ? 'bg-red-100 text-red-800' :
                                                esp.complejidad === 'Alta' ? 'bg-orange-100 text-orange-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {esp.complejidad}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-lg">{esp.tasa}%</div>
                                            <div className="text-sm text-gray-500">{esp.tiempo}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>{esp.auditorias} casos</span>
                                        <span>Tasa de aprobación</span>
                                    </div>
                                    
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                                            style={{ width: `${esp.tasa}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer con información adicional */}
            <div className="mt-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
                <div className="text-center">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                        📈 Resumen del Período {selectedView === 'altocosto' ? '(Alto Costo)' : '(General)'}
                    </h4>
                    {selectedView === 'altocosto' ? (
                        <p className="text-gray-600 mb-4">
                            En los últimos 30 días se procesaron <strong>{statsData.altoCosto.totalSolicitudes} solicitudes de alto costo</strong> por un monto de <strong>{formatMoney(statsData.altoCosto.montoTotal)}</strong> con una tasa de aprobación del <strong>{statsData.altoCosto.tasaAprobacion}%</strong>
                        </p>
                    ) : (
                        <p className="text-gray-600 mb-4">
                            En los últimos 30 días se procesaron <strong>2,847 auditorías</strong> con una tasa de aprobación del <strong>91.4%</strong>
                        </p>
                    )}
                    <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
                        <span>🕒 Actualizado: {new Date().toLocaleString()}</span>
                        <span>👨‍⚕️ Usuario: {user?.nombre}</span>
                        <span>🏥 CPCE Córdoba</span>
                    </div>
                </div>
            </div>
        </div> 
    );
};

export default Estadisticas;
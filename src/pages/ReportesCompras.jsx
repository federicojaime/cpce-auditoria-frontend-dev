// src/pages/ReportesCompras.jsx - REPORTES Y ANÁLISIS DE COMPRAS
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import * as presupuestosService from '../services/presupuestosService';
import { toast } from 'react-toastify';
import {
    ChartBarIcon,
    DocumentArrowDownIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    TruckIcon,
    BuildingOffice2Icon,
    ArrowPathIcon,
    FunnelIcon,
    EyeIcon,
    PresentationChartLineIcon,
    ClipboardDocumentListIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ReportesCompras = () => {
    const { user } = useAuth();

    // Estados principales
    const [reportes, setReportes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtros, setFiltros] = useState({
        fechaDesde: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0],
        fechaHasta: new Date().toISOString().split('T')[0],
        proveedor: 'TODOS',
        estado: 'TODOS'
    });
    const [generandoReporte, setGenerandoReporte] = useState(false);

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Compras', href: '/compras' },
        { name: 'Reportes de Compras', href: '/reportes-compras', current: true }
    ];

    // Datos demo de reportes
    const reportesDemo = {
        resumenGeneral: {
            periodo: `${filtros.fechaDesde} al ${filtros.fechaHasta}`,
            totalOrdenes: 24,
            montoTotal: 8750000,
            ordenesEntregadas: 18,
            ordenesPendientes: 4,
            ordenesVencidas: 2,
            proveedoresActivos: 6,
            tiempoPromedioEntrega: 2.3,
            ahorroPorNegociacion: 425000
        },
        
        // Estadísticas por estado
        distribucionEstados: [
            { estado: 'ENTREGADO', cantidad: 18, porcentaje: 75, monto: 6580000, color: '#10B981' },
            { estado: 'EN_PREPARACION', cantidad: 3, porcentaje: 12.5, monto: 1200000, color: '#F59E0B' },
            { estado: 'CONFIRMADA', cantidad: 2, porcentaje: 8.3, monto: 700000, color: '#3B82F6' },
            { estado: 'CANCELADA', cantidad: 1, porcentaje: 4.2, monto: 270000, color: '#EF4444' }
        ],

        // Top proveedores
        topProveedores: [
            {
                nombre: 'FARMACORP S.A.',
                ordenes: 8,
                monto: 3200000,
                tiempoPromedio: 1.8,
                cumplimiento: 95.5,
                ahorro: 180000
            },
            {
                nombre: 'ONCOMED DISTRIBUCIONES',
                ordenes: 6,
                monto: 2450000,
                tiempoPromedio: 2.1,
                cumplimiento: 92.3,
                ahorro: 125000
            },
            {
                nombre: 'GLOBAL PHARMA SOLUTIONS',
                ordenes: 5,
                monto: 1850000,
                tiempoPromedio: 2.8,
                cumplimiento: 88.7,
                ahorro: 75000
            },
            {
                nombre: 'BIOTECH MEDICAMENTOS',
                ordenes: 3,
                monto: 1100000,
                tiempoPromedio: 2.0,
                cumplimiento: 96.2,
                ahorro: 45000
            },
            {
                nombre: 'MEDIC SUPPLY',
                ordenes: 2,
                monto: 150000,
                tiempoPromedio: 1.5,
                cumplimiento: 100,
                ahorro: 0
            }
        ],

        // Evolución mensual
        evolucionMensual: [
            { mes: 'Oct 2024', ordenes: 7, monto: 2800000, tiempoPromedio: 2.5 },
            { mes: 'Nov 2024', ordenes: 9, monto: 3150000, tiempoPromedio: 2.2 },
            { mes: 'Dic 2024', ordenes: 8, monto: 2800000, tiempoPromedio: 2.1 },
            { mes: 'Ene 2025', ordenes: 12, monto: 4200000, tiempoPromedio: 2.0 }
        ],

        // Medicamentos más solicitados
        topMedicamentos: [
            { nombre: 'KEYTRUDA 100MG', ordenes: 12, cantidad: 68, monto: 2850000, categoria: 'Oncología' },
            { nombre: 'REVLIMID 25MG', ordenes: 8, cantidad: 45, monto: 1980000, categoria: 'Hematología' },
            { nombre: 'HERCEPTIN 440MG', ordenes: 6, cantidad: 32, monto: 1560000, categoria: 'Oncología' },
            { nombre: 'RITUXIMAB 500MG', ordenes: 5, cantidad: 28, monto: 1200000, categoria: 'Inmunología' },
            { nombre: 'BEVACIZUMAB 400MG', ordenes: 4, cantidad: 22, monto: 980000, categoria: 'Oncología' }
        ],

        // Análisis de cumplimiento
        analisisCumplimiento: {
            entregaEnTiempo: 85.2,
            entregaTarde: 12.4,
            noEntregado: 2.4,
            tiempoPromedio: 2.3,
            metaTiempo: 2.0,
            desviacionEstandar: 0.8
        },

        // Alertas y observaciones
        alertas: [
            {
                tipo: 'warning',
                titulo: 'Retraso en entregas',
                mensaje: '2 órdenes han superado el tiempo estimado de entrega',
                prioridad: 'media'
            },
            {
                tipo: 'info',
                titulo: 'Nuevo proveedor',
                mensaje: 'MEDIC SUPPLY completó su primera orden con éxito',
                prioridad: 'baja'
            },
            {
                tipo: 'success',
                titulo: 'Ahorro significativo',
                mensaje: 'Se logró un ahorro del 12% en negociaciones este mes',
                prioridad: 'alta'
            }
        ]
    };

    // Lista de proveedores para filtro
    const proveedores = [
        'TODOS',
        'FARMACORP S.A.',
        'ONCOMED DISTRIBUCIONES',
        'GLOBAL PHARMA SOLUTIONS',
        'BIOTECH MEDICAMENTOS',
        'MEDIC SUPPLY'
    ];

    // Estados para filtro
    const estados = [
        'TODOS',
        'BORRADOR',
        'ENVIADA',
        'CONFIRMADA',
        'EN_PREPARACION',
        'ENVIADO',
        'ENTREGADO',
        'CANCELADA'
    ];

    // Cargar reportes desde la API
    useEffect(() => {
        cargarReportes();
    }, []);

    const cargarReportes = async () => {
        try {
            setLoading(true);
            setError('');

            const params = {
                desde: filtros.fechaDesde,
                hasta: filtros.fechaHasta
            };

            if (filtros.proveedor !== 'TODOS') {
                params.proveedor = filtros.proveedor;
            }

            if (filtros.estado !== 'TODOS') {
                params.estado = filtros.estado;
            }

            const response = await presupuestosService.getReporteCompras(params);

            if (response.success && response.data) {
                setReportes(response.data);
            }

        } catch (error) {
            console.error('Error cargando reportes:', error);
            setError(error.message || 'Error al cargar los reportes');
            toast.error('Error al cargar reportes de compras');
        } finally {
            setLoading(false);
        }
    };

    // Manejar cambio de filtros
    const handleFiltroChange = (campo, valor) => {
        setFiltros(prev => ({
            ...prev,
            [campo]: valor
        }));
    };

    // Aplicar filtros
    const aplicarFiltros = () => {
        cargarReportes();
    };

    // Generar reporte Excel
    const generarReporteExcel = async () => {
        try {
            setGenerandoReporte(true);

            await presupuestosService.exportarReporteExcel(filtros);

            toast.success('Reporte Excel descargado correctamente');
        } catch (error) {
            console.error('Error al generar reporte:', error);
            setError(error.message || 'Error al generar el reporte Excel');
            toast.error('Error al generar el reporte Excel');
        } finally {
            setGenerandoReporte(false);
        }
    };

    // Obtener color de alerta
    const getAlertColor = (tipo) => {
        const colores = {
            success: 'bg-green-50 border-green-200 text-green-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            error: 'bg-red-50 border-red-200 text-red-800'
        };
        return colores[tipo] || colores.info;
    };

    // Formatear moneda
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="p-4 lg:p-6">
                <Loading text="Generando reportes de compras..." />
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
                                <ChartBarIcon className="h-6 w-6 mr-2 text-purple-600" />
                                Reportes de Compras & Análisis
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Análisis detallado de compras, proveedores y rendimiento del proceso
                            </p>
                        </div>
                        <button
                            onClick={generarReporteExcel}
                            disabled={generandoReporte}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            {generandoReporte ? 'Generando...' : 'Exportar Excel'}
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Desde:
                            </label>
                            <input
                                type="date"
                                value={filtros.fechaDesde}
                                onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha Hasta:
                            </label>
                            <input
                                type="date"
                                value={filtros.fechaHasta}
                                onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Proveedor:
                            </label>
                            <select
                                value={filtros.proveedor}
                                onChange={(e) => handleFiltroChange('proveedor', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {proveedores.map(prov => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estado:
                            </label>
                            <select
                                value={filtros.estado}
                                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                {estados.map(est => (
                                    <option key={est} value={est}>{est}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={aplicarFiltros}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 flex items-center"
                            >
                                <FunnelIcon className="h-4 w-4 mr-2" />
                                Aplicar
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600"
                            >
                                <ArrowPathIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen General */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <PresentationChartLineIcon className="h-5 w-5 mr-2" />
                        Resumen Ejecutivo - {reportes?.resumenGeneral.periodo}
                    </h2>
                </div>
                
                <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{reportes?.resumenGeneral.totalOrdenes}</div>
                            <div className="text-sm text-gray-600">Total Órdenes</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(reportes?.resumenGeneral.montoTotal)}</div>
                            <div className="text-sm text-gray-600">Monto Total</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{reportes?.resumenGeneral.ordenesEntregadas}</div>
                            <div className="text-sm text-gray-600">Entregadas</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{reportes?.resumenGeneral.ordenesPendientes}</div>
                            <div className="text-sm text-gray-600">Pendientes</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{reportes?.resumenGeneral.ordenesVencidas}</div>
                            <div className="text-sm text-gray-600">Vencidas</div>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                            <div className="text-2xl font-bold text-indigo-600">{reportes?.resumenGeneral.proveedoresActivos}</div>
                            <div className="text-sm text-gray-600">Proveedores</div>
                        </div>
                        <div className="text-center p-4 bg-teal-50 rounded-lg">
                            <div className="text-2xl font-bold text-teal-600">{reportes?.resumenGeneral.tiempoPromedioEntrega}d</div>
                            <div className="text-sm text-gray-600">Tiempo Prom.</div>
                        </div>
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(reportes?.resumenGeneral.ahorroPorNegociacion)}</div>
                            <div className="text-sm text-gray-600">Ahorro</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alertas */}
            {reportes?.alertas && reportes.alertas.length > 0 && (
                <div className="space-y-3">
                    {reportes.alertas.map((alerta, index) => (
                        <div key={index} className={`border rounded-lg p-4 ${getAlertColor(alerta.tipo)}`}>
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                <h3 className="font-medium">{alerta.titulo}</h3>
                                <span className="ml-auto text-xs px-2 py-1 bg-white/50 rounded">
                                    {alerta.prioridad.toUpperCase()}
                                </span>
                            </div>
                            <p className="mt-1 text-sm">{alerta.mensaje}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Gráficos y análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Distribución por Estados */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Distribución por Estados</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {reportes?.distribucionEstados.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div 
                                            className="w-4 h-4 rounded"
                                            style={{ backgroundColor: item.color }}
                                        ></div>
                                        <span className="text-sm font-medium">{item.estado}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">{item.cantidad} órdenes</span>
                                        <span className="text-sm font-medium">{formatCurrency(item.monto)}</span>
                                        <span className="text-sm text-gray-500">{item.porcentaje}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Análisis de Cumplimiento */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Análisis de Cumplimiento</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Entrega en tiempo:</span>
                                <span className="text-sm font-medium text-green-600">{reportes?.analisisCumplimiento.entregaEnTiempo}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Entrega tardía:</span>
                                <span className="text-sm font-medium text-yellow-600">{reportes?.analisisCumplimiento.entregaTarde}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">No entregado:</span>
                                <span className="text-sm font-medium text-red-600">{reportes?.analisisCumplimiento.noEntregado}%</span>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Tiempo promedio:</span>
                                    <span className="text-sm font-medium">{reportes?.analisisCumplimiento.tiempoPromedio} días</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Meta objetivo:</span>
                                    <span className="text-sm font-medium text-blue-600">{reportes?.analisisCumplimiento.metaTiempo} días</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Proveedores */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <BuildingOffice2Icon className="h-5 w-5 mr-2" />
                        Ranking de Proveedores
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo Prom.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cumplimiento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ahorro</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportes?.topProveedores.map((proveedor, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-gray-900">{proveedor.nombre}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proveedor.ordenes}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(proveedor.monto)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proveedor.tiempoPromedio}d</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            proveedor.cumplimiento >= 95 ? 'bg-green-100 text-green-800' :
                                            proveedor.cumplimiento >= 90 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {proveedor.cumplimiento}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                        {formatCurrency(proveedor.ahorro)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Medicamentos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                        Medicamentos Más Solicitados
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicamento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reportes?.topMedicamentos.map((medicamento, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{medicamento.nombre}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {medicamento.categoria}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicamento.ordenes}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{medicamento.cantidad}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(medicamento.monto)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Evolución Mensual */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        Evolución Mensual
                    </h3>
                </div>
                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-sm font-medium text-gray-600">Mes</th>
                                    <th className="text-center py-2 text-sm font-medium text-gray-600">Órdenes</th>
                                    <th className="text-right py-2 text-sm font-medium text-gray-600">Monto</th>
                                    <th className="text-center py-2 text-sm font-medium text-gray-600">Tiempo Prom.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportes?.evolucionMensual.map((mes, index) => (
                                    <tr key={index} className="border-b border-gray-100">
                                        <td className="py-3 text-sm font-medium text-gray-900">{mes.mes}</td>
                                        <td className="py-3 text-sm text-center text-gray-900">{mes.ordenes}</td>
                                        <td className="py-3 text-sm text-right font-medium text-gray-900">
                                            {formatCurrency(mes.monto)}
                                        </td>
                                        <td className="py-3 text-sm text-center text-gray-900">{mes.tiempoPromedio}d</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Información adicional */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-purple-400" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-purple-800">
                            Información sobre los Reportes
                        </h3>
                        <div className="mt-2 text-sm text-purple-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li><strong>Tiempo Promedio:</strong> Días desde envío de orden hasta entrega</li>
                                <li><strong>Cumplimiento:</strong> Porcentaje de órdenes entregadas en tiempo</li>
                                <li><strong>Ahorro:</strong> Monto ahorrado por negociaciones con proveedores</li>
                                <li><strong>Estados:</strong> Seguimiento completo del ciclo de vida de cada orden</li>
                                <li><strong>Filtros:</strong> Los datos se actualizan según los filtros seleccionados</li>
                                <li><strong>Exportación:</strong> Todos los reportes pueden exportarse a Excel</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botones de acción adicionales */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Adicionales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => alert('Funcionalidad en desarrollo')}
                        className="inline-flex items-center justify-center px-4 py-3 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                        <ChartBarIcon className="h-5 w-5 mr-2" />
                        Generar Dashboard Ejecutivo
                    </button>
                    <button
                        onClick={() => alert('Funcionalidad en desarrollo')}
                        className="inline-flex items-center justify-center px-4 py-3 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                    >
                        <TruckIcon className="h-5 w-5 mr-2" />
                        Análisis de Logística
                    </button>
                    <button
                        onClick={() => alert('Funcionalidad en desarrollo')}
                        className="inline-flex items-center justify-center px-4 py-3 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100"
                    >
                        <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                        Proyección de Costos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportesCompras;
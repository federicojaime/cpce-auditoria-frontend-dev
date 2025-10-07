// src/pages/AltoCosto/AltoCostoHistoricas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auditoriasService } from '../../services/auditoriasService';
import TableWithFilters from '../../components/common/TableWithFilters';
import {
    EyeIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AltoCostoHistoricas = () => {
    const { user } = useAuth();
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10
    });

    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1
    });

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Auditoría Alto Costo', href: '/alto-costo' },
        { name: 'Históricas', href: '/alto-costo/historicas', current: true }
    ];

    // Columnas de la tabla
    const columns = [
        { key: 'apellido', label: 'Apellido', className: 'whitespace-nowrap text-sm font-medium text-gray-900' },
        { key: 'nombre', label: 'Nombre', className: 'whitespace-nowrap text-sm text-gray-900' },
        { key: 'dni', label: 'DNI', className: 'whitespace-nowrap text-sm text-gray-900 font-mono' },
        { key: 'fecha', label: 'Fecha', className: 'whitespace-nowrap text-sm text-gray-900' },
        {
            key: 'medico',
            label: 'Médico',
            className: 'text-sm text-gray-900 max-w-xs truncate',
            render: (row) => (
                <span title={row.medico} className="truncate block">
                    {row.medico}
                </span>
            )
        },
        {
            key: 'fechaAuditoria',
            label: 'Fecha Auditoría',
            className: 'whitespace-nowrap text-sm text-gray-900',
            render: (row) => row.fechaAuditoria || '-'
        },
        {
            key: 'auditor',
            label: 'Auditor',
            className: 'text-sm text-gray-900',
            render: (row) => row.auditor || '-'
        },
        {
            key: 'costo_total',
            label: 'Costo Total',
            align: 'center',
            className: 'whitespace-nowrap text-center',
            render: (row) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                    {row.costo_total || 'Alto'}
                </span>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'center',
            className: 'whitespace-nowrap text-center',
            render: (row) => (
                <Link
                    to={`/alto-costo/auditoria/demo`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    title="Ver auditoría"
                >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Ver
                </Link>
            )
        }
    ];

    // Cargar auditorías históricas
    const loadAuditorias = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError('');

            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            queryParams.append('page', filters.page);
            queryParams.append('limit', filters.limit);
            queryParams.append('tipo', 'alto-costo'); // Diferenciador para alto costo

            const url = `/auditorias/historicas?${queryParams.toString()}`;

            console.log('URL completa Alto Costo:', `${import.meta.env.VITE_API_URL}${url}`);
            console.log('Parámetros enviados:', {
                page: filters.page,
                limit: filters.limit,
                search: searchTerm,
                tipo: 'alto-costo'
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`
                }
            });

            const result = await response.json();

            console.log('Respuesta de la API Alto Costo:', {
                success: result.success,
                dataLength: result.data?.length,
                total: result.total,
                totalPages: result.totalPages,
                page: result.page,
                limit: result.limit
            });

            if (result.success) {
                setAuditorias(result.data || []);
                setPagination({
                    total: result.total || 0,
                    totalPages: result.totalPages || 0,
                    currentPage: result.page || filters.page
                });
            } else {
                setError(result.message || 'Error al cargar auditorías históricas de alto costo');
                setAuditorias([]);
            }
        } catch (error) {
            console.error('Error cargando auditorías históricas alto costo:', error);
            setError('Error inesperado al cargar las auditorías históricas de alto costo');
            setAuditorias([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadAuditorias();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [loadAuditorias]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAuditorias(false);
    };

    const handleExportExcel = async () => {
        try {
            setError('');

            // Validar que hay datos para exportar
            if (!auditorias || auditorias.length === 0) {
                setError('No hay datos para exportar');
                return;
            }

            console.log('Exportando auditorías alto costo históricas:', auditorias.length);

            // Usar exportarExcelConDatos para exportar los datos actuales
            const result = await auditoriasService.exportarExcelConDatos(auditorias, {
                tipo: 'alto-costo-historicas',
                fecha: new Date().toISOString().split('T')[0],
                searchTerm: searchTerm || null
            });

            if (!result.success) {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error exportando Excel:', error);
            setError('Error al generar el archivo Excel');
        }
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setFilters(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handlePageSizeChange = (newSize) => {
        setFilters(prev => ({ ...prev, limit: newSize, page: 1 }));
    };

    // Acciones personalizadas
    const actions = (
        <>
            <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>

            <button
                onClick={handleExportExcel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Excel
            </button>
        </>
    );

    // Información adicional
    const additionalInfo = pagination.total > 0 ? (
        <div className="flex">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                    Información sobre las auditorías históricas de alto costo
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                    <p>
                        Se encontraron <strong>{pagination.total}</strong> auditorías de alto costo procesadas.
                        Puedes buscar por apellido, nombre, DNI, médico o auditor.
                    </p>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <TableWithFilters
            title="Auditorías Históricas - Alto Costo"
            subtitle="Consultar auditorías de tratamientos de alto costo procesadas anteriormente"
            breadcrumbItems={breadcrumbItems}
            data={auditorias}
            columns={columns}
            loading={loading}
            error={error}
            refreshing={refreshing}
            searchValue={searchTerm}
            searchPlaceholder="Buscar por apellido, nombre, DNI, médico o auditor..."
            onSearchChange={handleSearchChange}
            pagination={pagination}
            pageSize={filters.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            actions={actions}
            onRefresh={handleRefresh}
            emptyMessage="No hay auditorías históricas de alto costo"
            emptySearchMessage="No se encontraron auditorías históricas de alto costo que coincidan con la búsqueda"
            additionalInfo={additionalInfo}
        />
    );
};

export default AltoCostoHistoricas;
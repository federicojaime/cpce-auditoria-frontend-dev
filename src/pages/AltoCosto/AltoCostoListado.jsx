// src/pages/AltoCosto/AltoCostoListado.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auditoriasService } from '../../services/auditoriasService';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Breadcrumb from '../../components/common/Breadcrumb';
import Pagination from '../../components/common/Pagination';
import {
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  EyeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const AltoCostoListado = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    dni: '',
    fechaDesde: '',
    fechaHasta: '',
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
    { name: 'Listado', href: '/alto-costo/listado', current: true }
  ];

  // Cargar auditorías con paginación
  const loadAuditorias = useCallback(async (showLoading = true) => {
    if (!filters.dni && !filters.fechaDesde) {
      setError('Debe completar al menos el DNI o fecha desde');
      return;
    }

    try {
      if (showLoading) setLoading(true);
      setError('');

      const filtersWithType = {
        ...filters,
        tipo: 'alto-costo' // Diferenciador para alto costo
      };

      console.log('Enviando filtros Alto Costo:', filtersWithType);

      const result = await auditoriasService.buscarAuditorias(filtersWithType);

      console.log('Resultado del servicio Alto Costo:', result);

      if (result.success) {
        setAuditorias(result.data);
        setPagination({
          total: result.total || 0,
          totalPages: result.totalPages || Math.ceil((result.total || 0) / filters.limit),
          currentPage: filters.page
        });

        if (result.data.length === 0) {
          setError('No se encontraron auditorías de alto costo con los criterios especificados');
        }
      } else {
        setError(result.message);
        setAuditorias([]);
      }
    } catch (error) {
      console.error('Error en búsqueda Alto Costo:', error);
      setError('Error inesperado en la búsqueda de alto costo');
      setAuditorias([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Efecto para cargar datos cuando cambian los filtros (excepto la primera vez)
  useEffect(() => {
    if (hasSearched) {
      const timeoutId = setTimeout(() => {
        loadAuditorias(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [loadAuditorias, hasSearched]);

  // Realizar búsqueda inicial
  const handleSearch = async () => {
    if (!filters.dni && !filters.fechaDesde) {
      setError('Debe completar al menos el DNI o fecha desde');
      return;
    }

    setHasSearched(true);
    setFilters(prev => ({ ...prev, page: 1 }));
    await loadAuditorias(true);
  };

  // Limpiar formulario
  const handleClear = () => {
    setFilters({
      dni: '',
      fechaDesde: '',
      fechaHasta: '',
      page: 1,
      limit: 10
    });
    setAuditorias([]);
    setError('');
    setHasSearched(false);
    setPagination({
      total: 0,
      totalPages: 0,
      currentPage: 1
    });
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Manejar cambio de tamaño de página
  const handlePageSizeChange = (newSize) => {
    setFilters(prev => ({ ...prev, limit: newSize, page: 1 }));
  };

  // Exportar resultados
  const handleExport = async () => {
    try {
      const fecha = new Date().toISOString().slice(0, 7);
      const result = await auditoriasService.generarExcel(fecha, 'alto-costo');

      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error exportando:', error);
      setError('Error al generar el archivo Excel');
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 mr-2 text-orange-600" />
            AUDITORÍA ALTO COSTO
          </h1>
        </div>

        {/* Filtros de búsqueda - Estilo legacy */}
        <div className="px-6 py-4 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Listado de Pendientes e Históricos - Alto Costo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DNI del Paciente:
              </label>
              <input
                type="text"
                value={filters.dni}
                onChange={(e) => setFilters(prev => ({ ...prev, dni: e.target.value.replace(/\D/g, '') }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="16410809"
                maxLength="8"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde:
              </label>
              <input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta:
              </label>
              <input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                Filtrar
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-600"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleSearch}
          showRetry={hasSearched}
        />
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Loading text="Realizando búsqueda de alto costo..." />
        </div>
      )}

      {/* Tabla de resultados - Estilo legacy */}
      {!loading && hasSearched && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header de resultados */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {auditorias.length} registros de alto costo encontrados
              </p>
            </div>

            {auditorias.length > 0 && (
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Excel
              </button>
            )}
          </div>

          {/* Tabla responsive */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left border-r border-gray-200">Apellido</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200">Nombre</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200">DNI</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200">Fecha</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200">Médico</th>
                  <th className="px-3 py-3 text-center border-r border-gray-200">Cant</th>
                  <th className="px-3 py-3 text-center border-r border-gray-200">Meses</th>
                  <th className="px-3 py-3 text-center border-r border-gray-200">Costo</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200">Auditor</th>
                  <th className="px-4 py-3 text-left border-r border-gray-200">FecAudi</th>
                  <th className="px-3 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditorias.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                      No se encontraron auditorías de alto costo con los criterios especificados
                    </td>
                  </tr>
                ) : (
                  auditorias.map((auditoria, index) => (
                    <tr key={auditoria.id || index} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 border-r border-gray-200">
                        <span className="text-orange-600 font-medium">
                          {auditoria.apellido}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <span className="text-orange-600">
                          {auditoria.nombre}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200 font-mono">
                        {auditoria.dni}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {auditoria.fecha}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200 max-w-xs truncate">
                        <span title={auditoria.medico}>
                          {auditoria.medico}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center border-r border-gray-200">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                          {auditoria.renglones || auditoria.cant || '1'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center border-r border-gray-200">
                        {auditoria.meses || auditoria.cantmeses || '6'}
                      </td>
                      <td className="px-3 py-3 text-center border-r border-gray-200">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                          Alto
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        <span className="text-orange-600">
                          {auditoria.auditor || auditoria.auditadoX || 'José Garrido'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-200">
                        {auditoria.fechaAuditoria || auditoria.fecha_auditoria || auditoria.fecha}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {auditoria.auditado || auditoria.estado_auditoria ? (
                          // Auditoría histórica
                          <Link
                            to={`/alto-costo/auditoria/${auditoria.id}/historica`}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                            title="Ver auditoría histórica"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Ver
                          </Link>
                        ) : (
                          // Auditoría pendiente
                          <Link
                            to={`/alto-costo/auditoria/demo`}
                            className="inline-flex items-center px-2 py-1 border border-orange-300 rounded-md text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100"
                            title="Procesar auditoría"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Auditar
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {auditorias.length > 0 && (
            <div className="border-t border-gray-200">
              <Pagination
                current={pagination.currentPage}
                total={pagination.total}
                pageSize={filters.limit}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showSizeChanger={true}
                showTotal={true}
              />
            </div>
          )}
        </div>
      )}

      {/* Instrucciones iniciales */}
      {!hasSearched && !loading && (
        <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">
                Búsqueda de auditorías de alto costo pendientes e históricas
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  Complete al menos el DNI o fecha desde para obtener resultados.
                  Este listado muestra tanto auditorías pendientes como procesadas de tratamientos de alto costo.
                </p>
                <ul className="mt-2 list-disc list-inside">
                  <li>Use el DNI para búsquedas exactas de un paciente</li>
                  <li>Las fechas permiten filtrar por rango temporal</li>
                  <li>Los resultados incluyen auditorías pendientes e históricas de alto costo</li>
                  <li>Use "Auditar" para procesar pendientes o "Ver" para históricos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AltoCostoListado;
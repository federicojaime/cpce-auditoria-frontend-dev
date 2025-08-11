// src/pages/Proveedores.jsx - VERSIÓN MEJORADA CON MEJOR ESTÉTICA
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { getProveedores, deleteProveedor, exportProveedoresToExcel } from '../services/proveedoresService';
import Loading from '../components/common/Loading';
import DataTable from '../components/common/DataTable';
import Pagination from '../components/common/Pagination';
import ErrorMessage from '../components/common/ErrorMessage';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tipo: '',
    activo: 'true'
  });
  
  const searchTimeoutRef = useRef(null);

  // Columnas de la tabla con mejor diseño
  const columns = [
    { 
      key: 'razon_social', 
      label: 'Proveedor', 
      className: 'text-sm font-medium text-gray-900',
      render: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <BuildingOfficeIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-4">
            <Link
              to={`/proveedores/${row.id_proveedor}`}
              className="text-gray-900 font-medium hover:text-blue-600 transition-colors duration-200"
            >
              {row.razon_social}
            </Link>
            <div className="text-sm text-gray-500">{row.cuit}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'tipo_proveedor', 
      label: 'Tipo', 
      className: 'text-sm text-gray-900',
      render: (row) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
          row.tipo_proveedor === 'Laboratorio' ? 'bg-blue-100 text-blue-800' :
          row.tipo_proveedor === 'Droguería' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {row.tipo_proveedor}
        </span>
      )
    },
    { 
      key: 'contacto', 
      label: 'Contacto', 
      className: 'text-sm text-gray-900',
      render: (row) => (
        <div>
          {row.email_general && (
            <div className="text-sm text-gray-900 truncate max-w-xs" title={row.email_general}>
              {row.email_general}
            </div>
          )}
          {row.telefono_general && (
            <div className="text-sm text-gray-500">
              {row.telefono_general}
            </div>
          )}
          {!row.email_general && !row.telefono_general && (
            <span className="text-gray-400 text-sm">Sin contacto</span>
          )}
        </div>
      )
    },
    { 
      key: 'total_contactos', 
      label: 'Contactos', 
      align: 'center',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <UserGroupIcon className="h-3 w-3 mr-1" />
            {row.total_contactos || 0}
          </span>
        </div>
      )
    },
    { 
      key: 'activo', 
      label: 'Estado', 
      align: 'center',
      className: 'text-center',
      render: (row) => (
        <div className="flex items-center justify-center">
          {row.activo ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Activo
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
              <XCircleIcon className="h-3 w-3 mr-1" />
              Inactivo
            </span>
          )}
        </div>
      )
    },
    {
      key: 'acciones',
      label: 'Acciones',
      align: 'center',
      className: 'text-center',
      render: (row) => (
        <div className="flex justify-center space-x-1">
          <Link
            to={`/proveedores/${row.id_proveedor}`}
            className="inline-flex items-center p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200"
            title="Ver proveedor"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          <Link
            to={`/proveedores/${row.id_proveedor}/contactos`}
            className="inline-flex items-center p-2 rounded-lg text-gray-500 hover:text-green-600 hover:bg-gray-100 transition-all duration-200"
            title="Gestionar contactos"
          >
            <UserGroupIcon className="h-4 w-4" />
          </Link>
          <Link
            to={`/proveedores/${row.id_proveedor}/editar`}
            className="inline-flex items-center p-2 rounded-lg text-gray-500 hover:text-yellow-600 hover:bg-gray-100 transition-all duration-200"
            title="Editar proveedor"
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(row.id_proveedor, row.razon_social)}
            className="inline-flex items-center p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-gray-100 transition-all duration-200"
            title="Desactivar proveedor"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  // Cargar proveedores
  const loadProveedores = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: debouncedSearchTerm,
        tipo: filters.tipo || undefined,
        activo: filters.activo === '' ? undefined : filters.activo === 'true'
      };

      const response = await getProveedores(params);
      
      if (response.success) {
        setProveedores(response.data);
        setTotalPages(response.totalPages);
        setTotalCount(response.total);
      } else {
        setError(response.message || 'Error al cargar proveedores');
      }
    } catch (err) {
      setError('Error al cargar los proveedores');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filters, currentPage]);

  // Cargar proveedores cuando cambian las dependencias
  useEffect(() => {
    loadProveedores();
  }, [loadProveedores]);

  // Debounce para búsqueda
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Configurar nuevo timeout
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Resetear a página 1 cuando se busca
    }, 500); // Esperar 500ms después de que el usuario deje de escribir

    // Limpiar timeout al desmontar
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Manejar eliminación
  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de desactivar el proveedor "${nombre}"?`)) {
      return;
    }

    try {
      await deleteProveedor(id);
      await loadProveedores(false);
    } catch (err) {
      setError('Error al desactivar el proveedor');
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await exportProveedoresToExcel(filters);
    } catch (err) {
      setError('Error al exportar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ tipo: '', activo: 'true' });
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setCurrentPage(1);
  };

  if (loading && proveedores.length === 0) return <Loading text="Cargando proveedores..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con acciones */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestión de proveedores de medicación de alto costo
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Exportar
              </button>
              <Link
                to="/proveedores/nuevo"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </Link>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="mt-6 bg-white shadow rounded-lg border border-gray-200">
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Buscar por razón social, CUIT o email..."
                  />
                </div>
              </div>

              {/* Botón de filtros */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
                  showFilters 
                    ? 'border-blue-500 text-blue-600 bg-blue-50' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtros
              </button>
            </div>

            {/* Panel de filtros expandible */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Proveedor
                    </label>
                    <select
                      id="tipo"
                      value={filters.tipo}
                      onChange={(e) => handleFilterChange('tipo', e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="Laboratorio">Laboratorio</option>
                      <option value="Droguería">Droguería</option>
                      <option value="Ambos">Ambos</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="activo" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      id="activo"
                      value={filters.activo}
                      onChange={(e) => handleFilterChange('activo', e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="true">Activos</option>
                      <option value="false">Inactivos</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Resultados */}
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Buscando proveedores...</div>
            </div>
          ) : proveedores.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-8 text-center">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin resultados</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron proveedores con los criterios especificados.
              </p>
            </div>
          ) : (
            <>
              <DataTable 
                columns={columns} 
                data={proveedores}
                className="shadow-sm"
              />
              
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalCount}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Proveedores;
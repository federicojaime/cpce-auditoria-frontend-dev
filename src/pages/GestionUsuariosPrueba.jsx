import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  ArrowPathIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Alert from '../components/common/Alert';

const GestionUsuariosPrueba = () => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Estados para modales
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [diasAdicionales, setDiasAdicionales] = useState(15);

  // Verificar que el usuario sea administrador
  useEffect(() => {
    if (user && user.rol !== 5) {
      toast.error('No tienes permisos para acceder a esta página');
    }
  }, [user]);

  // Cargar lista de usuarios de prueba
  useEffect(() => {
    loadTrialUsers();
  }, []);

  const loadTrialUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trial/users');

      if (response.data.success) {
        setUsuarios(response.data.users || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios de prueba:', error);
      toast.error('Error al cargar usuarios de prueba');
    } finally {
      setLoading(false);
    }
  };

  // Extender período de prueba
  const handleExtend = async () => {
    if (!selectedUser || !diasAdicionales) return;

    try {
      setActionLoading('extend');
      const response = await api.post('/trial/extend', {
        userId: selectedUser.id,
        diasAdicionales: parseInt(diasAdicionales)
      });

      if (response.data.success) {
        toast.success(
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
            <div>
              <div className="font-semibold">Período extendido</div>
              <div className="text-sm opacity-90">{response.data.message}</div>
            </div>
          </div>
        );
        setShowExtendModal(false);
        setSelectedUser(null);
        setDiasAdicionales(15);
        loadTrialUsers();
      }
    } catch (error) {
      console.error('Error extendiendo prueba:', error);
      toast.error(error.response?.data?.message || 'Error al extender período de prueba');
    } finally {
      setActionLoading(null);
    }
  };

  // Convertir a usuario permanente
  const handleConvert = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading('convert');
      const response = await api.post('/trial/convert-permanent', {
        userId: selectedUser.id
      });

      if (response.data.success) {
        toast.success(
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
            <div>
              <div className="font-semibold">Usuario convertido</div>
              <div className="text-sm opacity-90">El usuario ahora tiene acceso permanente</div>
            </div>
          </div>
        );
        setShowConvertModal(false);
        setSelectedUser(null);
        loadTrialUsers();
      }
    } catch (error) {
      console.error('Error convirtiendo usuario:', error);
      toast.error(error.response?.data?.message || 'Error al convertir usuario');
    } finally {
      setActionLoading(null);
    }
  };

  // Suspender usuario
  const handleSuspend = async (userId) => {
    if (!window.confirm('¿Estás seguro de suspender este usuario?')) return;

    try {
      setActionLoading(`suspend-${userId}`);
      const response = await api.post('/trial/suspend', { userId });

      if (response.data.success) {
        toast.success('Usuario suspendido exitosamente');
        loadTrialUsers();
      }
    } catch (error) {
      console.error('Error suspendiendo usuario:', error);
      toast.error(error.response?.data?.message || 'Error al suspender usuario');
    } finally {
      setActionLoading(null);
    }
  };

  // Reactivar usuario
  const handleReactivate = async (userId) => {
    try {
      setActionLoading(`reactivate-${userId}`);
      const response = await api.post('/trial/reactivate', { userId });

      if (response.data.success) {
        toast.success('Usuario reactivado exitosamente');
        loadTrialUsers();
      }
    } catch (error) {
      console.error('Error reactivando usuario:', error);
      toast.error(error.response?.data?.message || 'Error al reactivar usuario');
    } finally {
      setActionLoading(null);
    }
  };

  // Formato de fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Obtener color según días restantes
  const getDiasColor = (dias) => {
    if (dias < 0) return 'text-gray-600';
    if (dias <= 3) return 'text-red-600';
    if (dias <= 7) return 'text-amber-600';
    return 'text-blue-600';
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado, expirado) => {
    if (expirado) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expirado
        </span>
      );
    }

    const badges = {
      prueba_activa: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Activo
        </span>
      ),
      suspendida: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Suspendido
        </span>
      )
    };

    return badges[estado] || null;
  };

  if (user && user.rol !== 5) {
    return (
      <div className="p-6">
        <Alert
          type="error"
          title="Acceso Denegado"
          message="No tienes permisos para acceder a esta página"
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg text-white">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-white" />
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold">Gestión de Usuarios de Prueba</h1>
                <p className="mt-1 text-indigo-100">Administra los períodos de prueba de los usuarios</p>
              </div>
            </div>
            <button
              onClick={loadTrialUsers}
              disabled={loading}
              className="p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm text-gray-600">Total Usuarios</div>
          <div className="text-2xl font-bold text-gray-900">{usuarios.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm text-gray-600">Activos</div>
          <div className="text-2xl font-bold text-gray-900">
            {usuarios.filter(u => !u.expirado && u.estadoCuenta !== 'suspendida').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600">Expirados</div>
          <div className="text-2xl font-bold text-gray-900">
            {usuarios.filter(u => u.expirado).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
          <div className="text-sm text-gray-600">Por Vencer (&lt;7d)</div>
          <div className="text-2xl font-bold text-gray-900">
            {usuarios.filter(u => u.diasRestantes > 0 && u.diasRestantes <= 7).length}
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Lista de Usuarios</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div>
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No hay usuarios de prueba registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Expiración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Restantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.nombre} {usuario.apellido}
                          </div>
                          <div className="text-sm text-gray-500">{usuario.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(usuario.fechaInicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(usuario.fechaExpiracion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${getDiasColor(usuario.diasRestantes)}`}>
                        {usuario.diasRestantes > 0 ? usuario.diasRestantes : 0} días
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(usuario.estadoCuenta, usuario.expirado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {usuario.estadoCuenta === 'suspendida' ? (
                        <button
                          onClick={() => handleReactivate(usuario.id)}
                          disabled={actionLoading === `reactivate-${usuario.id}`}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Reactivar
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(usuario);
                              setShowExtendModal(true);
                            }}
                            disabled={actionLoading}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          >
                            Extender
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(usuario);
                              setShowConvertModal(true);
                            }}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            Hacer Permanente
                          </button>
                          <button
                            onClick={() => handleSuspend(usuario.id)}
                            disabled={actionLoading === `suspend-${usuario.id}`}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Suspender
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Extender Período */}
      {showExtendModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowExtendModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ClockIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Extender Período de Prueba
                    </h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Usuario: <strong>{selectedUser.nombre} {selectedUser.apellido}</strong>
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Días restantes actuales: <strong className={getDiasColor(selectedUser.diasRestantes)}>
                          {selectedUser.diasRestantes > 0 ? selectedUser.diasRestantes : 0} días
                        </strong>
                      </p>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Días adicionales a agregar:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={diasAdicionales}
                        onChange={(e) => setDiasAdicionales(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleExtend}
                  disabled={actionLoading === 'extend'}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading === 'extend' ? 'Extendiendo...' : 'Extender'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExtendModal(false);
                    setSelectedUser(null);
                    setDiasAdicionales(15);
                  }}
                  disabled={actionLoading === 'extend'}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Convertir a Permanente */}
      {showConvertModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowConvertModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Convertir a Usuario Permanente
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Estás seguro que deseas convertir a <strong>{selectedUser.nombre} {selectedUser.apellido}</strong> en un usuario permanente?
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Esta acción eliminará el período de prueba y el usuario tendrá acceso completo sin limitaciones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={actionLoading === 'convert'}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {actionLoading === 'convert' ? 'Convirtiendo...' : 'Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConvertModal(false);
                    setSelectedUser(null);
                  }}
                  disabled={actionLoading === 'convert'}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuariosPrueba;

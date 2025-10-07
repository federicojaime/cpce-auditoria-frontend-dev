import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const Perfil = () => {
  const { user } = useAuth();
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Mapeo de roles a nombres descriptivos
  const getRoleName = (rol) => {
    const roles = {
      1: 'Auditor Alto Costo',
      2: 'Auditor Tratamiento Prolongado',
      3: 'Estadísticas y Reportes',
      5: 'Administrativo'
    };
    return roles[rol] || 'Usuario';
  };

  // Obtener permisos del usuario según su rol
  const getUserPermissions = (rol) => {
    const permissions = {
      1: [
        'Ver auditorías de alto costo pendientes',
        'Procesar auditorías de alto costo',
        'Consultar histórico de auditorías de alto costo',
        'Buscar historial de pacientes (alto costo)'
      ],
      2: [
        'Ver auditorías de tratamiento prolongado pendientes',
        'Procesar auditorías de tratamiento prolongado',
        'Consultar histórico de tratamientos prolongados',
        'Buscar historial de pacientes (tratamiento prolongado)',
        'Descargar reportes Excel'
      ],
      3: [
        'Ver estadísticas y métricas',
        'Gestionar vademecum',
        'Administrar proveedores',
        'Solicitar presupuestos',
        'Hacer seguimiento de presupuestos',
        'Gestionar órdenes de compra',
        'Ver reportes de compras'
      ],
      5: [
        'Acceso completo al sistema',
        'Administrar todos los módulos',
        'Gestionar usuarios y permisos',
        'Ver todas las auditorías',
        'Acceder a todos los reportes'
      ]
    };
    return permissions[rol] || [];
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    // Validaciones
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      // Aquí iría la llamada al API para cambiar la contraseña
      // await api.post('/auth/change-password', passwordData);

      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setIsEditingPassword(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Error al cambiar la contraseña');
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">No se pudo cargar la información del usuario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg text-white">
        <div className="px-6 py-8">
          <div className="flex items-center">
            <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-white" />
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold">{user.nombre}</h1>
              <p className="mt-1 text-blue-100">{getRoleName(user.rol)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Usuario */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="text-base font-medium text-gray-900">{user.nombre}</p>
                </div>
              </div>

              <div className="flex items-center">
                <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Usuario</p>
                  <p className="text-base font-medium text-gray-900">{user.username || 'No disponible'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Correo electrónico</p>
                  <p className="text-base font-medium text-gray-900">{user.email || 'No disponible'}</p>
                </div>
              </div>

              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="text-base font-medium text-gray-900">{user.telefono || 'No disponible'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
              {!isEditingPassword && (
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cambiar Contraseña
                </button>
              )}
            </div>

            {isEditingPassword ? (
              <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                    <p className="text-sm text-green-700">Contraseña actualizada exitosamente</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPassword(false);
                      setPasswordError('');
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6">
                <div className="flex items-center text-gray-600">
                  <KeyIcon className="h-5 w-5 mr-3" />
                  <p className="text-sm">Última actualización: No disponible</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral con permisos */}
        <div className="space-y-6">
          {/* Rol y Permisos */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Rol y Permisos</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {getRoleName(user.rol)}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Permisos disponibles:</h3>
                <ul className="space-y-2">
                  {getUserPermissions(user.rol).map((permission, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{permission}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Estadísticas del Usuario */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Actividad</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Última sesión</p>
                <p className="text-base font-medium text-gray-900">Hoy</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Activo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;

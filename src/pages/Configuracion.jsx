import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Cog6ToothIcon,
  BellIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Configuracion = () => {
  const { user } = useAuth();

  // Estados para configuraciones
  const [config, setConfig] = useState({
    notificaciones: {
      auditoriasPendientes: true,
      auditoriasCompletadas: true,
      recordatorios: true,
      emailNotifications: false,
      pushNotifications: true
    },
    apariencia: {
      tema: 'light',
      compactMode: false,
      showAvatars: true,
      animaciones: true
    },
    privacidad: {
      mostrarPerfil: true,
      mostrarEstadisticas: true,
      permitirAnalytics: true
    },
    idioma: 'es',
    timezone: 'America/Argentina/Buenos_Aires'
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar configuración del usuario (simulado)
  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('user_config');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (error) {
          console.error('Error cargando configuración:', error);
        }
      }
    };
    loadConfig();
  }, []);

  // Detectar cambios
  const handleConfigChange = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  // Guardar configuración
  const handleSave = async () => {
    setSaving(true);

    try {
      // Simular guardado en el servidor
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Guardar en localStorage
      localStorage.setItem('user_config', JSON.stringify(config));

      setHasChanges(false);

      // Toast personalizado de éxito
      toast.success(
        <div className="flex items-start">
          <CheckCircleIcon className="h-6 w-6 text-green-400 mr-3 flex-shrink-0" />
          <div>
            <div className="font-semibold">Configuración guardada</div>
            <div className="text-sm opacity-90">Los cambios se han aplicado correctamente</div>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } catch (error) {
      toast.error(
        <div className="flex items-start">
          <XCircleIcon className="h-6 w-6 text-red-400 mr-3 flex-shrink-0" />
          <div>
            <div className="font-semibold">Error al guardar</div>
            <div className="text-sm opacity-90">No se pudieron guardar los cambios</div>
          </div>
        </div>
      );
    } finally {
      setSaving(false);
    }
  };

  // Restablecer a valores por defecto
  const handleReset = () => {
    const defaultConfig = {
      notificaciones: {
        auditoriasPendientes: true,
        auditoriasCompletadas: true,
        recordatorios: true,
        emailNotifications: false,
        pushNotifications: true
      },
      apariencia: {
        tema: 'light',
        compactMode: false,
        showAvatars: true,
        animaciones: true
      },
      privacidad: {
        mostrarPerfil: true,
        mostrarEstadisticas: true,
        permitirAnalytics: true
      },
      idioma: 'es',
      timezone: 'America/Argentina/Buenos_Aires'
    };

    setConfig(defaultConfig);
    setHasChanges(true);

    toast.info(
      <div className="flex items-start">
        <InformationCircleIcon className="h-6 w-6 text-blue-400 mr-3 flex-shrink-0" />
        <div>
          <div className="font-semibold">Configuración restablecida</div>
          <div className="text-sm opacity-90">Se han restaurado los valores por defecto</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg shadow-lg text-white">
        <div className="px-6 py-8">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Cog6ToothIcon className="h-8 w-8 text-white" />
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold">Configuración</h1>
              <p className="mt-1 text-indigo-100">Personaliza tu experiencia en el sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de cambios pendientes */}
      {hasChanges && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg shadow-sm">
          <div className="p-4 flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-400 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">Cambios sin guardar</h3>
              <p className="mt-1 text-sm text-amber-700">
                Tienes cambios pendientes. No olvides guardar tu configuración.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="ml-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Ahora'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notificaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <BellIcon className="h-6 w-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auditorías Pendientes</p>
                <p className="text-sm text-gray-500">Recibir alertas de nuevas auditorías</p>
              </div>
              <button
                onClick={() => handleConfigChange('notificaciones', 'auditoriasPendientes', !config.notificaciones.auditoriasPendientes)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificaciones.auditoriasPendientes ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificaciones.auditoriasPendientes ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auditorías Completadas</p>
                <p className="text-sm text-gray-500">Notificaciones de auditorías finalizadas</p>
              </div>
              <button
                onClick={() => handleConfigChange('notificaciones', 'auditoriasCompletadas', !config.notificaciones.auditoriasCompletadas)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificaciones.auditoriasCompletadas ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificaciones.auditoriasCompletadas ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Recordatorios</p>
                <p className="text-sm text-gray-500">Recordatorios de tareas pendientes</p>
              </div>
              <button
                onClick={() => handleConfigChange('notificaciones', 'recordatorios', !config.notificaciones.recordatorios)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificaciones.recordatorios ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificaciones.recordatorios ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notificaciones por Email</p>
                <p className="text-sm text-gray-500">Recibir emails con resúmenes diarios</p>
              </div>
              <button
                onClick={() => handleConfigChange('notificaciones', 'emailNotifications', !config.notificaciones.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificaciones.emailNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificaciones.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notificaciones Push</p>
                <p className="text-sm text-gray-500">Alertas en tiempo real en el navegador</p>
              </div>
              <button
                onClick={() => handleConfigChange('notificaciones', 'pushNotifications', !config.notificaciones.pushNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.notificaciones.pushNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.notificaciones.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <PaintBrushIcon className="h-6 w-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Apariencia</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block font-medium text-gray-900 mb-2">Tema</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleConfigChange('apariencia', 'tema', 'light')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.apariencia.tema === 'light'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">☀️</div>
                    <div className="text-sm font-medium">Claro</div>
                  </div>
                </button>
                <button
                  onClick={() => handleConfigChange('apariencia', 'tema', 'dark')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    config.apariencia.tema === 'dark'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">🌙</div>
                    <div className="text-sm font-medium">Oscuro</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Modo Compacto</p>
                <p className="text-sm text-gray-500">Reducir espacios entre elementos</p>
              </div>
              <button
                onClick={() => handleConfigChange('apariencia', 'compactMode', !config.apariencia.compactMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.apariencia.compactMode ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.apariencia.compactMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Mostrar Avatares</p>
                <p className="text-sm text-gray-500">Iconos de usuario en listados</p>
              </div>
              <button
                onClick={() => handleConfigChange('apariencia', 'showAvatars', !config.apariencia.showAvatars)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.apariencia.showAvatars ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.apariencia.showAvatars ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Animaciones</p>
                <p className="text-sm text-gray-500">Efectos de transición suaves</p>
              </div>
              <button
                onClick={() => handleConfigChange('apariencia', 'animaciones', !config.apariencia.animaciones)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.apariencia.animaciones ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.apariencia.animaciones ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Privacidad */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Privacidad</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Mostrar Perfil</p>
                <p className="text-sm text-gray-500">Hacer visible tu perfil a otros usuarios</p>
              </div>
              <button
                onClick={() => handleConfigChange('privacidad', 'mostrarPerfil', !config.privacidad.mostrarPerfil)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.privacidad.mostrarPerfil ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.privacidad.mostrarPerfil ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Mostrar Estadísticas</p>
                <p className="text-sm text-gray-500">Compartir tus métricas de auditoría</p>
              </div>
              <button
                onClick={() => handleConfigChange('privacidad', 'mostrarEstadisticas', !config.privacidad.mostrarEstadisticas)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.privacidad.mostrarEstadisticas ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.privacidad.mostrarEstadisticas ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Permitir Analytics</p>
                <p className="text-sm text-gray-500">Ayudar a mejorar el sistema con datos anónimos</p>
              </div>
              <button
                onClick={() => handleConfigChange('privacidad', 'permitirAnalytics', !config.privacidad.permitirAnalytics)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.privacidad.permitirAnalytics ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.privacidad.permitirAnalytics ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4 mt-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800">Privacidad de datos</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Tus datos están protegidos y solo se usan para mejorar tu experiencia.
                    Nunca compartimos información personal con terceros.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regional */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <GlobeAltIcon className="h-6 w-6 text-indigo-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Regional</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block font-medium text-gray-900 mb-2">Idioma</label>
              <select
                value={config.idioma}
                onChange={(e) => {
                  setConfig(prev => ({ ...prev, idioma: e.target.value }));
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">Zona Horaria</label>
              <select
                value={config.timezone}
                onChange={(e) => {
                  setConfig(prev => ({ ...prev, timezone: e.target.value }));
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                <option value="America/Santiago">Santiago (GMT-3)</option>
                <option value="America/Montevideo">Montevideo (GMT-3)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de información del sistema */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">Información del Sistema</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Versión</p>
              <p className="text-base font-medium text-gray-900">2.0.1</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Última actualización</p>
              <p className="text-base font-medium text-gray-900">Septiembre 2025</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Usuario</p>
              <p className="text-base font-medium text-gray-900">{user?.nombre}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={handleReset}
          disabled={saving}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Restablecer valores por defecto
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            'Guardar cambios'
          )}
        </button>
      </div>
    </div>
  );
};

export default Configuracion;

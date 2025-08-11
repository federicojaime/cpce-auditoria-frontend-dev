import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  UserGroupIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  UserIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import { getProveedor } from '../services/proveedoresService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ProveedorDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProveedor();
  }, [id]);

  const fetchProveedor = async () => {
    try {
      setLoading(true);
      const response = await getProveedor(id);

      // Manejar la respuesta según la estructura de la API
      const data = response.data || response;

      // Asegurar que los contactos sean un array
      if (data.contactos && !Array.isArray(data.contactos)) {
        data.contactos = [];
      }

      // Calcular el total de contactos si no viene del backend
      if (!data.total_contactos && data.contactos) {
        data.total_contactos = data.contactos.length;
      }

      setProveedor(data);
    } catch (err) {
      setError('Error al cargar los datos del proveedor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading text="Cargando información del proveedor..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!proveedor) return <ErrorMessage message="Proveedor no encontrado" />;

  // Calcular el total de contactos actual
  const totalContactos = proveedor.contactos?.length || proveedor.total_contactos || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/proveedores')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{proveedor.razon_social}</h1>
                <p className="text-sm text-gray-500 mt-1">CUIT: {proveedor.cuit}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/proveedores/${id}/contactos`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <UserGroupIcon className="h-4 w-4 mr-2" />
                Contactos
              </Link>
              <Link
                to={`/proveedores/${id}/editar`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal - Información General */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Información General */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Información General</h2>
              </div>
              <div className="px-6 py-5">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Razón Social</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{proveedor.razon_social}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">CUIT</dt>
                    <dd className="mt-1 text-sm text-gray-900">{proveedor.cuit}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${proveedor.tipo_proveedor === 'Laboratorio' ? 'bg-blue-100 text-blue-800' :
                        proveedor.tipo_proveedor === 'Droguería' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                        {proveedor.tipo_proveedor}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Estado</dt>
                    <dd className="mt-1">
                      {proveedor.activo ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <XCircleIcon className="h-3 w-3 mr-1" />
                          Inactivo
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Card de Información de Contacto */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Información de Contacto</h2>
              </div>
              <div className="px-6 py-5">
                <dl className="space-y-5">
                  {proveedor.telefono_general && (
                    <div className="flex items-start">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                        <dd className="mt-1 text-sm text-gray-900">{proveedor.telefono_general}</dd>
                      </div>
                    </div>
                  )}

                  {proveedor.email_general && (
                    <div className="flex items-start">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          <a href={`mailto:${proveedor.email_general}`} className="text-blue-600 hover:text-blue-500">
                            {proveedor.email_general}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}

                  {(proveedor.direccion_calle || proveedor.localidad || proveedor.provincia) && (
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="ml-3">
                        <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {proveedor.direccion_calle && (
                            <div>{proveedor.direccion_calle} {proveedor.direccion_numero}</div>
                          )}
                          {proveedor.barrio && <div>Barrio: {proveedor.barrio}</div>}
                          {(proveedor.localidad || proveedor.provincia) && (
                            <div>
                              {proveedor.localidad}{proveedor.localidad && proveedor.provincia && ', '}{proveedor.provincia}
                            </div>
                          )}
                        </dd>
                      </div>
                    </div>
                  )}

                  {!proveedor.telefono_general && !proveedor.email_general && !proveedor.direccion_calle && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">No hay información de contacto disponible</p>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Columna Lateral - Resumen y Acciones */}
          <div className="space-y-6">
            {/* Card de Resumen */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center text-gray-500">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      <span className="text-sm">Total Contactos</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{totalContactos}</span>
                  </div>

                  {proveedor.fecha_registro && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div className="flex items-center text-gray-500">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm">Fecha Registro</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {new Date(proveedor.fecha_registro).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  )}

                  {proveedor.fecha_modificacion && (
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center text-gray-500">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm">Última Modificación</span>
                      </div>
                      <span className="text-sm text-gray-900">
                        {new Date(proveedor.fecha_modificacion).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card de Contactos Principales */}
            {proveedor.contactos && proveedor.contactos.length > 0 && (
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Contactos Principales</h2>
                  <Link
                    to={`/proveedores/${id}/contactos`}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Ver todos
                  </Link>
                </div>
                <div className="px-6 py-5">
                  <div className="space-y-4">
                    {proveedor.contactos.slice(0, 3).map((contacto, index) => (
                      <div key={contacto.id_contacto || index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {contacto.nombre} {contacto.apellido}
                          </p>
                          {contacto.cargo && (
                            <p className="text-xs text-gray-500 flex items-center mt-1">
                              <BriefcaseIcon className="h-3 w-3 mr-1" />
                              {contacto.cargo}
                            </p>
                          )}
                          {!!contacto.principal && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              Principal
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProveedorDetalle;
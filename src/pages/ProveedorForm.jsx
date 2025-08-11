import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { getProveedor, createProveedor, updateProveedor, getTiposProveedores } from '../services/proveedoresService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ProveedorForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tiposProveedor, setTiposProveedor] = useState([]);
  const [formData, setFormData] = useState({
    razon_social: '',
    cuit: '',
    tipo_proveedor: 'Laboratorio',
    direccion_calle: '',
    direccion_numero: '',
    barrio: '',
    localidad: '',
    provincia: '',
    telefono_general: '',
    email_general: '',
    activo: true,
    contactos: []
  });

  const [nuevoContacto, setNuevoContacto] = useState({
    nombre: '',
    apellido: '',
    cargo: '',
    email: '',
    telefono: '',
    principal: false
  });

  useEffect(() => {
    loadTiposProveedor();
    if (isEditMode) {
      fetchProveedor();
    }
  }, [id]);

  const loadTiposProveedor = async () => {
    try {
      const tipos = await getTiposProveedores();
      setTiposProveedor(tipos);
    } catch (err) {
      console.error('Error cargando tipos:', err);
      // Usar tipos por defecto
      setTiposProveedor([
        { value: 'Laboratorio', label: 'Laboratorio' },
        { value: 'Droguería', label: 'Droguería' },
        { value: 'Ambos', label: 'Ambos' }
      ]);
    }
  };

  const fetchProveedor = async () => {
    try {
      setLoading(true);
      const data = await getProveedor(id);
      setFormData({
        razon_social: data.razon_social || '',
        cuit: data.cuit || '',
        tipo_proveedor: data.tipo_proveedor || 'Laboratorio',
        direccion_calle: data.direccion_calle || '',
        direccion_numero: data.direccion_numero || '',
        barrio: data.barrio || '',
        localidad: data.localidad || '',
        provincia: data.provincia || '',
        telefono_general: data.telefono_general || '',
        email_general: data.email_general || '',
        activo: data.activo ?? true,
        contactos: data.contactos || []
      });
    } catch (err) {
      setError('Error al cargar los datos del proveedor');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContactoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoContacto(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const agregarContacto = () => {
    if (!nuevoContacto.nombre.trim() || !nuevoContacto.apellido.trim()) {
      setError('El nombre y apellido del contacto son obligatorios');
      return;
    }

    // Si es principal, desmarcar otros contactos principales
    const contactosActualizados = formData.contactos.map(c => ({
      ...c,
      principal: nuevoContacto.principal ? false : c.principal
    }));

    setFormData(prev => ({
      ...prev,
      contactos: [...contactosActualizados, { ...nuevoContacto, id: Date.now() }]
    }));

    // Limpiar formulario de contacto
    setNuevoContacto({
      nombre: '',
      apellido: '',
      cargo: '',
      email: '',
      telefono: '',
      principal: false
    });
    setError(null);
  };

  const eliminarContacto = (index) => {
    setFormData(prev => ({
      ...prev,
      contactos: prev.contactos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar CUIT
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitRegex.test(formData.cuit)) {
      setError('El CUIT debe tener el formato XX-XXXXXXXX-X');
      return;
    }

    try {
      setLoading(true);
      
      // Preparar datos según la API
      const proveedorData = {
        razon_social: formData.razon_social,
        cuit: formData.cuit,
        tipo_proveedor: formData.tipo_proveedor,
        email_general: formData.email_general,
        telefono_general: formData.telefono_general,
        direccion_calle: formData.direccion_calle,
        direccion_numero: formData.direccion_numero,
        barrio: formData.barrio,
        localidad: formData.localidad,
        provincia: formData.provincia,
        activo: formData.activo
      };

      // Solo incluir contactos en creación
      if (!isEditMode && formData.contactos.length > 0) {
        proveedorData.contactos = formData.contactos.map(({ id, ...contacto }) => contacto);
      }

      if (isEditMode) {
        await updateProveedor(id, proveedorData);
      } else {
        await createProveedor(proveedorData);
      }
      
      navigate('/proveedores');
    } catch (err) {
      setError(err.message || (isEditMode ? 'Error al actualizar el proveedor' : 'Error al crear el proveedor'));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <Loading text="Cargando proveedor..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/proveedores')}
            className="text-gray-400 hover:text-gray-500"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h1>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Información básica */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="razon_social" className="block text-sm font-medium text-gray-700">
                  Razón Social *
                </label>
                <input
                  type="text"
                  id="razon_social"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="cuit" className="block text-sm font-medium text-gray-700">
                  CUIT *
                </label>
                <input
                  type="text"
                  id="cuit"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleInputChange}
                  required
                  placeholder="XX-XXXXXXXX-X"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="tipo_proveedor" className="block text-sm font-medium text-gray-700">
                  Tipo *
                </label>
                <select
                  id="tipo_proveedor"
                  name="tipo_proveedor"
                  value={formData.tipo_proveedor}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {tiposProveedor.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email_general" className="block text-sm font-medium text-gray-700">
                  Email General
                </label>
                <input
                  type="email"
                  id="email_general"
                  name="email_general"
                  value={formData.email_general}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="telefono_general" className="block text-sm font-medium text-gray-700">
                  Teléfono General
                </label>
                <input
                  type="tel"
                  id="telefono_general"
                  name="telefono_general"
                  value={formData.telefono_general}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="direccion_calle" className="block text-sm font-medium text-gray-700">
                  Calle
                </label>
                <input
                  type="text"
                  id="direccion_calle"
                  name="direccion_calle"
                  value={formData.direccion_calle}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="direccion_numero" className="block text-sm font-medium text-gray-700">
                  Número
                </label>
                <input
                  type="text"
                  id="direccion_numero"
                  name="direccion_numero"
                  value={formData.direccion_numero}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="barrio" className="block text-sm font-medium text-gray-700">
                  Barrio
                </label>
                <input
                  type="text"
                  id="barrio"
                  name="barrio"
                  value={formData.barrio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="localidad" className="block text-sm font-medium text-gray-700">
                  Localidad
                </label>
                <input
                  type="text"
                  id="localidad"
                  name="localidad"
                  value={formData.localidad}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="provincia" className="block text-sm font-medium text-gray-700">
                  Provincia
                </label>
                <input
                  type="text"
                  id="provincia"
                  name="provincia"
                  value={formData.provincia}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contactos - Solo para creación */}
          {!isEditMode && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contactos</h2>
              
              {/* Lista de contactos agregados */}
              {formData.contactos.length > 0 && (
                <div className="mb-4 space-y-2">
                  {formData.contactos.map((contacto, index) => (
                    <div key={contacto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <span className="font-medium">{contacto.nombre} {contacto.apellido}</span>
                        {contacto.cargo && <span className="text-gray-500 ml-2">- {contacto.cargo}</span>}
                        {contacto.principal && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Principal</span>}
                        <div className="text-sm text-gray-500">
                          {contacto.email && <span className="mr-4">{contacto.email}</span>}
                          {contacto.telefono && <span>{contacto.telefono}</span>}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarContacto(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formulario para agregar contacto */}
              <div className="border-t pt-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Agregar Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contacto_nombre" className="block text-sm font-medium text-gray-700">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="contacto_nombre"
                      name="nombre"
                      value={nuevoContacto.nombre}
                      onChange={handleContactoChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="contacto_apellido" className="block text-sm font-medium text-gray-700">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="contacto_apellido"
                      name="apellido"
                      value={nuevoContacto.apellido}
                      onChange={handleContactoChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="contacto_cargo" className="block text-sm font-medium text-gray-700">
                      Cargo
                    </label>
                    <input
                      type="text"
                      id="contacto_cargo"
                      name="cargo"
                      value={nuevoContacto.cargo}
                      onChange={handleContactoChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="contacto_email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="contacto_email"
                      name="email"
                      value={nuevoContacto.email}
                      onChange={handleContactoChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="contacto_telefono" className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="contacto_telefono"
                      name="telefono"
                      value={nuevoContacto.telefono}
                      onChange={handleContactoChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="contacto_principal"
                      name="principal"
                      checked={nuevoContacto.principal}
                      onChange={handleContactoChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="contacto_principal" className="ml-2 block text-sm text-gray-900">
                      Contacto principal
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={agregarContacto}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar Contacto
                </button>
              </div>
            </div>
          )}

          {/* Estado */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                Proveedor activo
              </label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/proveedores')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProveedorForm;
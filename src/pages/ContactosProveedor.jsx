import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import * as proveedoresService from '../services/proveedoresService';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const ContactosProveedor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proveedor, setProveedor] = useState(null);
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedContacto, setSelectedContacto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cargo: '',
    telefono: '',
    email: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Convertir ID a número
      const proveedorId = parseInt(id);
      
      // Cargar proveedor
      const proveedorData = await proveedoresService.getProveedor(proveedorId);
      setProveedor(proveedorData);
      
      // Los contactos pueden venir dentro del proveedor o necesitar una llamada separada
      if (proveedorData.contactos && Array.isArray(proveedorData.contactos)) {
        setContactos(proveedorData.contactos);
      } else {
        // Si no vienen con el proveedor, intentar cargarlos por separado
        try {
          const contactosData = await proveedoresService.getContactosByProveedorId(proveedorId);
          // Asegurarse de que sea un array
          if (Array.isArray(contactosData)) {
            setContactos(contactosData);
          } else if (contactosData && Array.isArray(contactosData.data)) {
            setContactos(contactosData.data);
          } else {
            setContactos([]);
          }
        } catch (error) {
          console.error('Error cargando contactos:', error);
          setContactos([]);
        }
      }
    } catch (error) {
      setError('Error al cargar los datos');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, contacto = null) => {
    setModalMode(mode);
    setSelectedContacto(contacto);
    
    if (mode === 'edit' && contacto) {
      setFormData({
        nombre: contacto.nombre || '',
        apellido: contacto.apellido || '',
        cargo: contacto.cargo || '',
        telefono: contacto.telefono || '',
        email: contacto.email || ''
      });
    } else if (mode === 'create') {
      setFormData({
        nombre: '',
        apellido: '',
        cargo: '',
        telefono: '',
        email: ''
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContacto(null);
    setFormData({
      nombre: '',
      apellido: '',
      cargo: '',
      telefono: '',
      email: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Convertir IDs a números
      const proveedorId = parseInt(id);
      
      if (modalMode === 'create') {
        await proveedoresService.createContacto(proveedorId, formData);
      } else if (modalMode === 'edit' && selectedContacto) {
        // Usar id_contacto en lugar de id
        const contactoIdNum = parseInt(selectedContacto.id_contacto);
        
        if (isNaN(contactoIdNum)) {
          throw new Error('ID de contacto inválido');
        }
        
        await proveedoresService.updateContacto(proveedorId, contactoIdNum, formData);
      }
      
      await cargarDatos();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar contacto:', error);
      alert(error.message || 'Error al guardar el contacto');
    }
  };

  const handleDelete = async () => {
    try {
      // Convertir IDs a números
      const proveedorId = parseInt(id);
      
      // Usar id_contacto en lugar de id
      const contactoIdNum = parseInt(selectedContacto.id_contacto);
      
      if (isNaN(contactoIdNum)) {
        throw new Error('ID de contacto inválido');
      }
      
      await proveedoresService.deleteContacto(proveedorId, contactoIdNum);
      await cargarDatos();
      handleCloseModal();
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      alert(error.message || 'Error al eliminar el contacto');
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/proveedores')}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Volver a Proveedores
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">Contactos de {proveedor?.razon_social}</h1>
            <p className="text-gray-600">Gestión de personas de contacto</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Lista de Contactos</h2>
            <button
              onClick={() => handleOpenModal('create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FiPlus /> Nuevo Contacto
            </button>
          </div>

          {!Array.isArray(contactos) || contactos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay contactos registrados</p>
          ) : (
            <div className="grid gap-4">
              {contactos.map((contacto) => (
                <div key={contacto.id_contacto} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{contacto.nombre} {contacto.apellido}</h3>
                      <p className="text-gray-600">{contacto.cargo}</p>
                      <div className="mt-2 space-y-1">
                        {contacto.telefono && (
                          <p className="text-sm text-gray-700">
                            📞 {contacto.telefono}
                          </p>
                        )}
                        {contacto.email && (
                          <p className="text-sm text-gray-700">
                            ✉️ {contacto.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal('edit', contacto)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                        title="Editar"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleOpenModal('delete', contacto)}
                        className="text-red-600 hover:text-red-800 p-2"
                        title="Eliminar"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          modalMode === 'create' ? 'Nuevo Contacto' :
          modalMode === 'edit' ? 'Editar Contacto' :
          'Eliminar Contacto'
        }
      >
        {modalMode === 'delete' ? (
          <div>
            <p className="mb-4">¿Está seguro que desea eliminar este contacto?</p>
            <p className="font-semibold mb-6">{selectedContacto?.nombre} {selectedContacto?.apellido}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Ej: Juan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Ej: Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Gerente Comercial"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 011-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: contacto@empresa.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {modalMode === 'create' ? 'Crear' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default ContactosProveedor;
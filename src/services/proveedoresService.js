// src/services/proveedoresService.js - VERSIÓN CORREGIDA FUNCIONAL
import api from './api';

// Constantes para paginación y límites
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Clase de servicio para manejar errores de manera consistente
class ProveedoresAPIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ProveedoresAPIError';
    this.status = status;
    this.data = data;
  }
}

// Utilitario para manejar respuestas de API
const handleAPIResponse = (response) => {
  // Si la respuesta tiene success: false, es un error controlado
  if (response.data && response.data.success === false) {
    throw new ProveedoresAPIError(
      response.data.message || 'Error en la API',
      response.status,
      response.data
    );
  }
  return response.data;
};

// Utilitario para crear parámetros de consulta
const createQueryParams = (params) => {
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return new URLSearchParams(cleanParams);
};

// ===== SERVICIOS PRINCIPALES =====

/**
 * Obtener lista de proveedores con filtros avanzados
 * @param {Object} params - Parámetros de búsqueda y paginación
 * @returns {Promise<Object>} Respuesta con datos paginados
 */
export const getProveedores = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = DEFAULT_PAGE_SIZE,
      search = '',
      activo = null,
      tipo = '',
      sortBy = 'razon_social',
      sortOrder = 'asc'
    } = params;

    // Validar límites
    const validLimit = Math.min(Math.max(1, parseInt(limit)), MAX_PAGE_SIZE);
    const validPage = Math.max(1, parseInt(page));

    const queryParams = createQueryParams({
      page: validPage,
      limit: validLimit,
      search: search.trim(),
      activo,
      tipo,
      sortBy,
      sortOrder
    });

    console.log('🔍 Buscando proveedores:', queryParams.toString());

    const response = await api.get(`/proveedores?${queryParams.toString()}`);
    const data = handleAPIResponse(response);

    return {
      success: true,
      data: data.data || [],
      page: data.page || validPage,
      totalPages: data.totalPages || 1,
      total: data.total || 0,
      limit: validLimit,
      message: 'Proveedores obtenidos correctamente'
    };
  } catch (error) {
    console.error('❌ Error obteniendo proveedores:', error);

    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message,
        data: [],
        page: 1,
        totalPages: 0,
        total: 0,
        limit: DEFAULT_PAGE_SIZE
      };
    }

    // Error de conexión o red
    return {
      success: false,
      message: 'Error de conexión al obtener proveedores. Verificar que el servidor esté disponible.',
      data: [],
      page: 1,
      totalPages: 0,
      total: 0,
      limit: DEFAULT_PAGE_SIZE
    };
  }
};

/**
 * Obtener un proveedor específico por ID
 * @param {string|number} id - ID del proveedor
 * @returns {Promise<Object>} Datos del proveedor con contactos
 */
export const getProveedor = async (id) => {
  try {
    if (!id) {
      throw new ProveedoresAPIError('ID de proveedor requerido', 400);
    }

    console.log(`🔍 Obteniendo proveedor ID: ${id}`);

    const response = await api.get(`/proveedores/${id}`);
    const data = handleAPIResponse(response);

    return data; // Retornar toda la respuesta de la API
  } catch (error) {
    console.error(`❌ Error obteniendo proveedor ${id}:`, error);

    if (error instanceof ProveedoresAPIError) {
      throw new Error(error.message);
    }

    // Error de conexión
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Error de conexión con el servidor. Verifique que el backend esté ejecutándose.');
    }

    throw new Error('Error al obtener datos del proveedor');
  }
};

/**
 * Crear un nuevo proveedor
 * @param {Object} proveedorData - Datos del proveedor
 * @returns {Promise<Object>} Resultado de la creación
 */
export const createProveedor = async (proveedorData) => {
  try {
    // Validaciones básicas
    if (!proveedorData.razon_social?.trim()) {
      throw new ProveedoresAPIError('La razón social es obligatoria', 400);
    }

    if (!proveedorData.cuit?.trim()) {
      throw new ProveedoresAPIError('El CUIT es obligatorio', 400);
    }

    // Validar formato CUIT
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitRegex.test(proveedorData.cuit)) {
      throw new ProveedoresAPIError('Formato de CUIT inválido (XX-XXXXXXXX-X)', 400);
    }

    console.log('📝 Creando proveedor:', proveedorData.razon_social);

    // Los datos ya están en el formato correcto
    const apiData = {
      ...proveedorData,
      activo: proveedorData.activo !== false
    };

    const response = await api.post('/proveedores', apiData);
    const data = handleAPIResponse(response);

    return data;
  } catch (error) {
    console.error('❌ Error creando proveedor:', error);

    if (error instanceof ProveedoresAPIError) {
      throw new Error(error.message);
    }

    const errorMessage = error.response?.data?.message || 'Error al crear el proveedor';
    throw new Error(errorMessage);
  }
};

/**
 * Actualizar un proveedor existente
 * @param {string|number} id - ID del proveedor
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Resultado de la actualización
 */
export const updateProveedor = async (id, updateData) => {
  try {
    if (!id) {
      throw new ProveedoresAPIError('ID de proveedor requerido', 400);
    }

    // Validar CUIT si se proporciona
    if (updateData.cuit) {
      const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
      if (!cuitRegex.test(updateData.cuit)) {
        throw new ProveedoresAPIError('Formato de CUIT inválido (XX-XXXXXXXX-X)', 400);
      }
    }

    console.log(`📝 Actualizando proveedor ID: ${id}`);

    const response = await api.put(`/proveedores/${id}`, updateData);
    const data = handleAPIResponse(response);

    return data;
  } catch (error) {
    console.error(`❌ Error actualizando proveedor ${id}:`, error);

    if (error instanceof ProveedoresAPIError) {
      throw new Error(error.message);
    }

    const errorMessage = error.response?.data?.message || 'Error al actualizar el proveedor';
    throw new Error(errorMessage);
  }
};

/**
 * Desactivar un proveedor (soft delete)
 * @param {string|number} id - ID del proveedor
 * @returns {Promise<Object>} Resultado de la desactivación
 */
export const deleteProveedor = async (id) => {
  try {
    if (!id) {
      throw new ProveedoresAPIError('ID de proveedor requerido', 400);
    }

    console.log(`🗑️ Desactivando proveedor ID: ${id}`);

    const response = await api.delete(`/proveedores/${id}`);
    const data = handleAPIResponse(response);

    return {
      success: true,
      message: 'Proveedor desactivado exitosamente'
    };
  } catch (error) {
    console.error(`❌ Error desactivando proveedor ${id}:`, error);

    if (error instanceof ProveedoresAPIError) {
      return {
        success: false,
        message: error.message
      };
    }

    return {
      success: false,
      message: 'Error al desactivar el proveedor'
    };
  }
};

// ===== SERVICIOS DE CONTACTOS =====

/**
 * Obtener contactos por ID de proveedor
 * @param {string|number} proveedorId - ID del proveedor
 * @returns {Promise<Array>} Lista de contactos
 */
export const getContactosByProveedorId = async (proveedorId) => {
  try {
    const response = await api.get(`/proveedores/${proveedorId}/contactos`);
    return handleAPIResponse(response);
  } catch (error) {
    console.error('Error fetching contactos:', error);
    throw new ProveedoresAPIError('No se pudieron obtener los contactos', error);
  }
};

/**
 * Crear nuevo contacto
 * @param {string|number} proveedorId - ID del proveedor
 * @param {Object} contactoData - Datos del contacto
 * @returns {Promise<Object>} Contacto creado
 */
export const createContacto = async (proveedorId, contactoData) => {
  try {
    console.log('📝 Creando contacto para proveedor:', proveedorId, contactoData);
    const response = await api.post(`/proveedores/${proveedorId}/contactos`, contactoData);
    const data = handleAPIResponse(response);
    console.log('✅ Contacto creado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error creando contacto:', error);

    // Extraer mensaje de error del backend
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo crear el contacto';

    throw new Error(errorMessage);
  }
};

/**
 * Actualizar contacto
 * @param {string|number} proveedorId - ID del proveedor
 * @param {string|number} contactoId - ID del contacto
 * @param {Object} contactoData - Datos actualizados del contacto
 * @returns {Promise<Object>} Contacto actualizado
 */
export const updateContacto = async (proveedorId, contactoId, contactoData) => {
  try {
    console.log('✏️ Actualizando contacto:', proveedorId, contactoId, contactoData);
    const response = await api.put(`/proveedores/${proveedorId}/contactos/${contactoId}`, contactoData);
    const data = handleAPIResponse(response);
    console.log('✅ Contacto actualizado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error actualizando contacto:', error);

    // Extraer mensaje de error del backend
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo actualizar el contacto';

    throw new Error(errorMessage);
  }
};

/**
 * Eliminar contacto
 * @param {string|number} proveedorId - ID del proveedor
 * @param {string|number} contactoId - ID del contacto
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const deleteContacto = async (proveedorId, contactoId) => {
  try {
    console.log('🗑️ Eliminando contacto:', proveedorId, contactoId);
    const response = await api.delete(`/proveedores/${proveedorId}/contactos/${contactoId}`);
    const data = handleAPIResponse(response);
    console.log('✅ Contacto eliminado exitosamente');
    return data;
  } catch (error) {
    console.error('❌ Error eliminando contacto:', error);

    // Extraer mensaje de error del backend
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo eliminar el contacto';

    throw new Error(errorMessage);
  }
};

// ===== SERVICIOS AUXILIARES =====

/**
 * Obtener tipos de proveedores disponibles
 * @returns {Promise<Array>} Lista de tipos
 */
export const getTiposProveedores = async () => {
  try {
    console.log('🔍 Obteniendo tipos de proveedores');

    // CORREGIDO: Usar el endpoint correcto según tu documentación
    const response = await api.get('/proveedores/tipos');
    const data = handleAPIResponse(response);

    return data.data || [];
  } catch (error) {
    console.error('❌ Error obteniendo tipos de proveedores:', error);
    console.log('⚠️ Usando tipos predefinidos como fallback');

    // Fallback con tipos predefinidos
    return [
      { value: 'Laboratorio', label: 'Laboratorio' },
      { value: 'Droguería', label: 'Droguería' },
      { value: 'Ambos', label: 'Ambos' }
    ];
  }
};

/**
 * Obtener estadísticas de proveedores
 * @returns {Promise<Object>} Estadísticas
 */
export const getEstadisticasProveedores = async () => {
  try {
    console.log('📊 Obteniendo estadísticas de proveedores');

    const response = await api.get('/proveedores/estadisticas');
    const data = handleAPIResponse(response);

    return data.data;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);

    return {
      total_proveedores: 0,
      proveedores_activos: 0,
      proveedores_inactivos: 0,
      laboratorios: 0,
      droguerias: 0,
      ambos: 0,
      total_contactos: 0
    };
  }
};

/**
 * Búsqueda rápida de proveedores (para autocompletar)
 * @param {string} query - Término de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} Resultados de búsqueda
 */
export const searchProveedores = async (query, limit = 10) => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const queryParams = createQueryParams({
      q: query.trim(),
      limit: Math.min(limit, 50)
    });

    console.log(`🔍 Búsqueda rápida: "${query}"`);

    const response = await api.get(`/proveedores/buscar?${queryParams.toString()}`);
    const data = handleAPIResponse(response);

    return data.data || [];
  } catch (error) {
    console.error('❌ Error en búsqueda rápida:', error);
    return [];
  }
};

/**
 * Exportar proveedores a Excel
 * @param {Object} filters - Filtros para la exportación
 * @returns {Promise<Object>} Resultado de la exportación
 */
export const exportProveedoresToExcel = async (filters = {}) => {
  try {
    console.log('📄 Exportando proveedores a Excel');

    const queryParams = createQueryParams(filters);

    const response = await api.get(`/proveedores/excel?${queryParams.toString()}`, {
      responseType: 'blob'
    });

    // Crear enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `proveedores_${timestamp}.xlsx`);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Archivo Excel descargado correctamente'
    };
  } catch (error) {
    console.error('❌ Error exportando a Excel:', error);

    return {
      success: false,
      message: 'Error al generar el archivo Excel'
    };
  }
};

// ===== UTILITARIOS =====

/**
 * Validar datos de proveedor
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de validación
 */
export const validateProveedorData = (data) => {
  const errors = [];

  if (!data.razon_social?.trim()) {
    errors.push('La razón social es obligatoria');
  }

  if (!data.cuit?.trim()) {
    errors.push('El CUIT es obligatorio');
  } else {
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitRegex.test(data.cuit)) {
      errors.push('Formato de CUIT inválido (XX-XXXXXXXX-X)');
    }
  }

  if (!data.tipo_proveedor) {
    errors.push('El tipo de proveedor es obligatorio');
  }

  if (data.email_general && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email_general)) {
    errors.push('Formato de email inválido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formatear datos de proveedor para mostrar
 * @param {Object} proveedor - Datos del proveedor
 * @returns {Object} Datos formateados
 */
export const formatProveedorData = (proveedor) => {
  if (!proveedor) return null;

  return {
    ...proveedor,
    direccion_completa: [
      proveedor.direccion_calle,
      proveedor.direccion_numero,
      proveedor.barrio,
      proveedor.localidad,
      proveedor.provincia
    ].filter(Boolean).join(', '),

    contacto_principal: proveedor.contactos?.find(c => c.principal) || null,

    fecha_alta_formatted: proveedor.fecha_alta ?
      new Date(proveedor.fecha_alta).toLocaleDateString('es-AR') :
      'Sin fecha',

    estado_text: proveedor.activo ? 'Activo' : 'Inactivo',
    estado_color: proveedor.activo ? 'green' : 'red'
  };
};

// Exportar todo como objeto por defecto
const proveedoresService = {
  // CRUD Principal
  getProveedores,
  getProveedor,
  createProveedor,
  updateProveedor,
  deleteProveedor,

  // Contactos
  getContactosByProveedorId,
  createContacto,
  updateContacto,
  deleteContacto,

  // Auxiliares
  getTiposProveedores,
  getEstadisticasProveedores,
  searchProveedores,
  exportProveedoresToExcel,

  // Utilitarios
  validateProveedorData,
  formatProveedorData
};

export default proveedoresService;
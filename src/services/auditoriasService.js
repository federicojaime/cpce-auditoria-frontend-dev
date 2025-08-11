// src/services/auditoriasService.js CORREGIDO
import api from './api';

export const auditoriasService = {
  // Obtener auditorías pendientes
  getPendientes: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      // Agregar parámetros de filtro si existen
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `/auditorias/pendientes${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        message: response.data.message || 'Auditorías cargadas correctamente'
      };
    } catch (error) {
      console.error('Error en getPendientes:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Error al obtener auditorías pendientes'
      };
    }
  },
   // Reenviar email de auditoría procesada
  reenviarEmail: async (id) => {
    try {
      console.log(`Reenviando email para auditoría ${id}`);
      
      const response = await api.post(`/auditorias/${id}/reenviar-email`);

      console.log('Email reenviado exitosamente:', response.data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Email reenviado correctamente'
      };
    } catch (error) {
      console.error('Error en reenviarEmail:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al reenviar email'
      };
    }
  },

  // Obtener auditorías históricas
  getHistoricas: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
      if (params.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);

      const url = `/auditorias/historicas${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        message: response.data.message || 'Auditorías históricas cargadas correctamente'
      };
    } catch (error) {
      console.error('Error en getHistoricas:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Error al obtener auditorías históricas'
      };
    }
  },

  // Obtener auditoría específica para procesar
  getAuditoria: async (id) => {
    try {
      const response = await api.get(`/auditorias/${id}`);

      return {
        success: true,
        data: response.data.auditoria || {},
        message: response.data.message || 'Auditoría cargada correctamente'
      };
    } catch (error) {
      console.error('Error en getAuditoria:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al obtener datos de la auditoría'
      };
    }
  },

  // ⭐ NUEVA FUNCIÓN - Obtener auditoría desde historial (solo lectura)
  getAuditoriaHistorial: async (id) => {
    try {
      console.log('Obteniendo auditoría historial ID:', id);
      
      const response = await api.get(`/auditorias/historial/${id}`);
      
      console.log('Respuesta auditoría historial:', response.data);
      
      if (response.data.success) {
        return {
          success: true,
          auditoria: response.data.auditoria
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Error al obtener la auditoría'
        };
      }
    } catch (error) {
      console.error('Error en getAuditoriaHistorial:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Auditoría no encontrada'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Error al obtener la auditoría desde historial'
      };
    }
  },

  // Procesar auditoría (aprobar/denegar medicamentos)
  procesarAuditoria: async (id, datos) => {
    try {
      const response = await api.post(`/auditorias/${id}/procesar`, datos);

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Auditoría procesada correctamente'
      };
    } catch (error) {
      console.error('Error en procesarAuditoria:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al procesar la auditoría'
      };
    }
  },

  // Enviar a médico auditor
  enviarMedicoAuditor: async (id) => {
    try {
      const response = await api.post(`/auditorias/${id}/enviar-medico`);

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Auditoría enviada a médico auditor'
      };
    } catch (error) {
      console.error('Error en enviarMedicoAuditor:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al enviar a médico auditor'
      };
    }
  },

  // Revertir auditoría
  revertirAuditoria: async (id, nota = '') => {
    try {
      const response = await api.post(`/auditorias/${id}/revertir-borrar`, {
        accion: '1', // 1 = revertir
        nota
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Auditoría revertida correctamente'
      };
    } catch (error) {
      console.error('Error en revertirAuditoria:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al revertir la auditoría'
      };
    }
  },

  // Buscar auditorías con filtros
  buscarAuditorias: async (filters) => {
    try {
      console.log('Enviando filtros al backend:', filters);

      // Preparar datos para enviar al backend
      const requestData = {
        dni: filters.dni || null,
        fechaDesde: filters.fechaDesde || null,
        fechaHasta: filters.fechaHasta || null
      };

      // Llamar al endpoint correcto
      const response = await api.post('/auditorias/historicos-pendientes', requestData);

      console.log('Respuesta del backend:', response.data);

      // Validar estructura de respuesta
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data || [],
          total: response.data.total || 0,
          recordsTotal: response.data.recordsTotal || 0,
          recordsFiltered: response.data.recordsFiltered || 0
        };
      } else {
        return {
          success: false,
          message: response.data?.message || 'Error en la búsqueda',
          data: []
        };
      }
    } catch (error) {
      console.error('Error en buscarAuditorias:', error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        // Error de respuesta del servidor
        return {
          success: false,
          message: error.response.data?.message || `Error del servidor: ${error.response.status}`,
          data: []
        };
      } else if (error.request) {
        // Error de red
        return {
          success: false,
          message: 'Error de conexión con el servidor',
          data: []
        };
      } else {
        // Error desconocido
        return {
          success: false,
          message: 'Error inesperado en la búsqueda',
          data: []
        };
      }
    }
  },

  // Obtener historial de paciente
  getHistorialPaciente: async (filters) => {
    try {
      // Construir query params correctamente
      const params = new URLSearchParams();
      
      // Parámetros obligatorios
      params.append('dni', filters.dni);
      params.append('page', filters.page || 1);
      params.append('limit', filters.limit || 10);
      
      // Parámetros opcionales
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
      if (filters.search) params.append('search', filters.search);
      
      console.log('Query params:', params.toString());
      
      const response = await api.get(`/auditorias/historial-paciente?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error en getHistorialPaciente:', error);
      
      // Manejar errores de respuesta
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Error al obtener historial',
          data: [],
          total: 0
        };
      }
      
      // Error de red u otro
      return {
        success: false,
        message: 'Error de conexión al servidor',
        data: [],
        total: 0
      };
    }
  },

  // Exportar Excel con datos específicos
  exportarExcelConDatos: async (datos, filtros) => {
    try {
      console.log('🔍 DEBUG: Usando api.js para exportación');
      console.log('📊 Datos:', { cantidad: datos?.length || 0 });
      console.log('🔍 Filtros:', filtros);

      // Validar datos
      if (!datos || datos.length === 0) {
        return {
          success: false,
          message: 'No hay datos para exportar'
        };
      }

      // USAR TU INSTANCIA DE API EXISTENTE
      const response = await api.post('/auditorias/generar-excel-datos', {
        datos: datos,
        filtros: filtros,
        timestamp: new Date().toISOString()
      }, {
        responseType: 'blob' // ¡IMPORTANTE! Para archivos
      });

      console.log('📨 Respuesta de api.js:', {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        dataSize: response.data?.size || 'unknown'
      });

      // Verificar que response.data es un blob
      if (!response.data || !(response.data instanceof Blob)) {
        console.error('❌ La respuesta no es un Blob válido');
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('✅ Blob recibido:', {
        size: response.data.size,
        type: response.data.type
      });

      // Validar que el blob tiene contenido
      if (response.data.size === 0) {
        throw new Error('El archivo generado está vacío');
      }

      return {
        success: true,
        blob: response.data,
        message: 'Excel generado correctamente'
      };
      
    } catch (error) {
      console.error('💥 Error en exportarExcelConDatos (api.js):');
      console.error('📛 Mensaje:', error.message);
      console.error('📛 Response status:', error.response?.status);
      console.error('📛 Response data:', error.response?.data);
      
      // Si el error viene del backend, intentar extraer el mensaje
      let errorMessage = error.message || 'Error al generar Excel';
      
      if (error.response?.data) {
        try {
          // Si el error response es text, intentar parsearlo
          if (typeof error.response.data === 'string') {
            const errorData = JSON.parse(error.response.data);
            errorMessage = errorData.message || errorMessage;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } catch (parseError) {
          console.log('🔍 No se pudo parsear el error del backend');
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error
      };
    }
  },

  // Generar reporte Excel
  generarExcel: async (fecha) => {
    try {
      const response = await api.post('/auditorias/excel', { fecha }, {
        responseType: 'blob' // Para manejar archivos
      });

      // Crear URL para descargar el archivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditorias_${fecha}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return {
        success: true,
        message: 'Archivo Excel descargado correctamente'
      };
    } catch (error) {
      console.error('Error en generarExcel:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al generar el archivo Excel'
      };
    }
  },

  // Obtener auditorías médicas (solo para médicos auditores)
  getAuditoriasMedicas: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const url = `/auditorias/medicas${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await api.get(url);

      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0,
        message: response.data.message || 'Auditorías médicas cargadas correctamente'
      };
    } catch (error) {
      console.error('Error en getAuditoriasMedicas:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Error al obtener auditorías médicas'
      };
    }
  },

  // ===============================
  // FUNCIONES PARA PDF
  // ===============================

  // Generar PDF de la auditoría
  generarPDF: async (id, estadoIdentidad = 0) => {
    try {
      console.log(`Generando PDF para auditoría ${id} con estado identidad: ${estadoIdentidad}`);
      
      const response = await api.post(`/auditorias/${id}/generar-pdf`, {
        estado: estadoIdentidad
      });

      console.log('PDF generado exitosamente:', response.data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'PDF generado correctamente'
      };
    } catch (error) {
      console.error('Error en generarPDF:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al generar PDF'
      };
    }
  },

  // Descargar PDF directamente como archivo
  descargarPDF: async (id, estadoIdentidad = 0) => {
    try {
      console.log(`Descargando PDF para auditoría ${id}`);
      
      const response = await api.post(`/auditorias/${id}/descargar-pdf`, {
        estado: estadoIdentidad
      }, {
        responseType: 'blob' // Para manejar archivos PDF
      });

      // Verificar que realmente es un PDF
      if (response.data.type !== 'application/pdf' && !response.data.type.includes('pdf')) {
        console.warn('El archivo descargado podría no ser un PDF válido');
      }
      
      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Crear elemento 'a' temporal para la descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria-${id}-${new Date().toISOString().split('T')[0]}.pdf`;
      a.style.display = 'none';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(a);
      a.click();
      
      // Limpiar después de un pequeño delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      console.log('PDF descargado correctamente');
      return {
        success: true,
        message: 'PDF descargado correctamente'
      };
    } catch (error) {
      console.error('Error en descargarPDF:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al descargar PDF'
      };
    }
  },

  // Abrir PDF en nueva ventana
  abrirPDF: async (id, estadoIdentidad = 0) => {
    try {
      console.log(`Abriendo PDF para auditoría ${id}`);
      
      // Primero intentar con la URL directa
      const urlDirecta = auditoriasService.obtenerURLPDF(id);
      
      // Verificar si el PDF existe
      try {
        const testResponse = await fetch(urlDirecta, { method: 'HEAD' });
        if (testResponse.ok) {
          window.open(urlDirecta, '_blank');
          return { 
            success: true, 
            message: 'PDF abierto correctamente', 
            data: { url: urlDirecta }
          };
        }
      } catch (testError) {
        console.log('PDF no existe, generando nuevo...');
      }
      
      // Si no existe, generar el PDF primero
      const resultadoGeneracion = await auditoriasService.generarPDF(id, estadoIdentidad);
      
      if (resultadoGeneracion.success) {
        const urlFinal = resultadoGeneracion.data?.url || auditoriasService.obtenerURLPDF(id);
        
        // Pequeño delay para asegurar que el archivo esté disponible
        setTimeout(() => {
          window.open(urlFinal, '_blank');
        }, 500);
        
        return { 
          success: true, 
          message: 'PDF generado y abierto correctamente',
          data: { url: urlFinal }
        };
      } else {
        throw new Error('Error al generar PDF');
      }
    } catch (error) {
      console.error('Error en abrirPDF:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al abrir PDF'
      };
    }
  },

  // Obtener URL del PDF (sin generar)
  obtenerURLPDF: (id) => {
    return `https://cpce.recetasalud.ar/audi/tmp/audinro${id}.pdf`;
  },

  // Verificar si el PDF existe
  verificarPDFExiste: async (id) => {
    try {
      const url = auditoriasService.obtenerURLPDF(id);
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error verificando PDF:', error);
      return false;
    }
  },
// ===============================

  // Verificar estado de Farmalink para una auditoría
  verificarEstadoFarmalink: async (auditoriaId) => {
    try {
      const response = await api.get(`/auditorias/estadoFarmalink/${auditoriaId}`);
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Estado obtenido correctamente'
      };
    } catch (error) {
      console.error('Error verificando estado Farmalink:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al verificar estado Farmalink'
      };
    }
  },

  // Reprocesar medicamentos con errores en Farmalink
  reprocesarFarmalink: async (auditoriaId, medicamentos) => {
    try {
      const response = await api.post(`/auditorias/reprocesarFarmalink/${auditoriaId}`, {
        medicamentos: medicamentos
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Medicamentos marcados para reprocesamiento'
      };
    } catch (error) {
      console.error('Error reprocesando Farmalink:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al reprocesar medicamentos'
      };
    }
  },

  // Obtener log de procesamiento Farmalink
  getLogFarmalink: async (auditoriaId, fecha = null) => {
    try {
      const params = fecha ? `?fecha=${fecha}` : '';
      const response = await api.get(`/auditorias/logFarmalink/${auditoriaId}${params}`);
      return {
        success: true,
        data: response.data.data || {},
        message: response.data.message || 'Log obtenido correctamente'
      };
    } catch (error) {
      console.error('Error obteniendo log Farmalink:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al obtener log de Farmalink'
      };
    }
  },

  // Procesar con Farmalink (función auxiliar para el hook)
  procesarFarmalink: async (accion, datos) => {
    try {
      const response = await api.post('/auditorias/procesarFarmalink', {
        accion: accion,
        ...datos
      });
      return response.data;
    } catch (error) {
      console.error('Error procesando Farmalink:', error);
      throw error;
    }
  },
  // Procesar y generar PDF en una sola operación
  procesarYGenerarPDF: async (id, datos) => {
    try {
      console.log(`Procesando auditoría ${id} y generando PDF automáticamente`);
      
      // 1. Procesar la auditoría
      const resultadoProcesamiento = await auditoriasService.procesarAuditoria(id, datos);
      
      if (!resultadoProcesamiento.success) {
        throw new Error(resultadoProcesamiento.message || 'Error al procesar auditoría');
      }
      
      // 2. Generar PDF automáticamente
      const estadoIdentidad = datos.estadoIdentidad || 0;
      const resultadoPDF = await auditoriasService.generarPDF(id, estadoIdentidad);
      
      return {
        success: true,
        message: 'Auditoría procesada y PDF generado correctamente',
        data: {
          procesamiento: resultadoProcesamiento,
          pdf: resultadoPDF
        }
      };
    } catch (error) {
      console.error('Error en procesarYGenerarPDF:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al procesar auditoría y generar PDF'
      };
    }
  }
};



  // Reenviar email de auditoría procesada
  reenviarEmail: async (id) => {
    try {
      console.log(`Reenviando email para auditoría ${id}`);
      
      const response = await api.post(`/auditorias/${id}/reenviar-email`);

      console.log('Email reenviado exitosamente:', response.data);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Email reenviado correctamente'
      };
    } catch (error) {
      console.error('Error en reenviarEmail:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Error al reenviar email'
      };
    }
  },
// Función auxiliar para calcular edad
function calculateAge(fechaNacimiento) {
  if (!fechaNacimiento) return null;

  const birthDate = new Date(fechaNacimiento);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
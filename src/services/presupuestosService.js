// src/services/presupuestosService.js
import api from './api';

/**
 * ===================================================================
 * SERVICIO DE PRESUPUESTOS Y COMPRAS
 * ===================================================================
 * Maneja todas las operaciones relacionadas con:
 * - Solicitudes de presupuesto
 * - Seguimiento de respuestas
 * - Órdenes de compra
 * - Notificaciones a pacientes
 * - Reportes y análisis
 */

// ===== AUDITORÍAS APROBADAS =====

/**
 * Obtener auditorías de alto costo aprobadas pendientes de cotización
 */
export const getAuditoriasAprobadas = async () => {
  try {
    console.log('📋 Obteniendo auditorías aprobadas de alto costo...');
    const response = await api.get('/compras/pendientes');
    console.log('✅ Auditorías aprobadas obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo auditorías aprobadas:', error);
    throw error;
  }
};

// ===== SOLICITUDES DE PRESUPUESTO =====

/**
 * Enviar a proveedores (Alto Costo)
 * POST /api/compras/:id/enviar-proveedores
 */
export const solicitarPresupuesto = async (idReceta, datos) => {
  try {
    console.log('📤 Enviando a proveedores - Receta:', idReceta, datos);
    const response = await api.post(`/compras/${idReceta}/enviar-proveedores`, datos);
    console.log('✅ Solicitud enviada a proveedores:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al enviar a proveedores:', error);
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo enviar la solicitud a proveedores';
    throw new Error(errorMessage);
  }
};

/**
 * Obtener lista de solicitudes de presupuesto
 */
export const getSolicitudes = async (params = {}) => {
  try {
    console.log('📋 Obteniendo solicitudes de presupuesto:', params);
    const response = await api.get('/presupuestos/solicitudes', { params });
    console.log('✅ Solicitudes obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo solicitudes:', error);
    throw error;
  }
};

/**
 * Obtener detalle de una solicitud específica
 */
export const getSolicitudDetalle = async (id) => {
  try {
    console.log('🔍 Obteniendo detalle de solicitud:', id);
    const response = await api.get(`/presupuestos/solicitudes/${id}`);
    console.log('✅ Detalle obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo detalle de solicitud:', error);
    throw error;
  }
};

/**
 * Registrar respuesta de proveedor a una solicitud
 */
export const registrarRespuesta = async (datos) => {
  try {
    console.log('📝 Registrando respuesta de proveedor:', datos);
    const response = await api.post('/presupuestos/respuesta', datos);
    console.log('✅ Respuesta registrada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error registrando respuesta:', error);
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo registrar la respuesta';
    throw new Error(errorMessage);
  }
};

/**
 * Obtener presupuestos recibidos para una receta
 * GET /api/compras/:id/presupuestos
 */
export const getPresupuestos = async (idReceta) => {
  try {
    console.log('📋 Obteniendo presupuestos recibidos para receta:', idReceta);
    const response = await api.get(`/compras/${idReceta}/presupuestos`);
    console.log('✅ Presupuestos obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo presupuestos:', error);
    throw error;
  }
};

/**
 * Seleccionar presupuestos (Alto Costo)
 * POST /api/compras/:id/seleccionar-presupuestos
 */
export const adjudicarPresupuesto = async (idReceta, datos) => {
  try {
    console.log('✅ Seleccionando presupuestos para receta:', idReceta, datos);
    const response = await api.post(`/compras/${idReceta}/seleccionar-presupuestos`, datos);
    console.log('✅ Presupuestos seleccionados:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al seleccionar presupuestos:', error);
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo seleccionar los presupuestos';
    throw new Error(errorMessage);
  }
};

// ===== ÓRDENES DE COMPRA =====

/**
 * Obtener lista de órdenes de compra
 */
export const getOrdenesCompra = async (params = {}) => {
  try {
    console.log('📦 Obteniendo órdenes de compra:', params);
    const response = await api.get('/ordenes-compra', { params });
    console.log('✅ Órdenes obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo órdenes de compra:', error);
    throw error;
  }
};

/**
 * Obtener detalle de una orden de compra
 */
export const getOrdenDetalle = async (id) => {
  try {
    console.log('🔍 Obteniendo detalle de orden:', id);
    const response = await api.get(`/ordenes-compra/${id}`);
    console.log('✅ Detalle obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo detalle de orden:', error);
    throw error;
  }
};

/**
 * Cambiar estado de una orden de compra
 */
export const cambiarEstadoOrden = async (id, datos) => {
  try {
    console.log('🔄 Cambiando estado de orden:', id, datos);
    const response = await api.put(`/ordenes-compra/${id}/cambiar-estado`, datos);
    console.log('✅ Estado actualizado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al cambiar estado:', error);
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo cambiar el estado de la orden';
    throw new Error(errorMessage);
  }
};

/**
 * 🔥 CONFIRMAR ENTREGA Y NOTIFICAR PACIENTES AUTOMÁTICAMENTE
 */
export const confirmarEntrega = async (id, datos) => {
  try {
    console.log('🔔 Confirmando entrega y notificando pacientes:', id, datos);
    const response = await api.put(`/ordenes-compra/${id}/confirmar-entrega`, datos);
    console.log('✅ Entrega confirmada y pacientes notificados:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al confirmar entrega:', error);
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo confirmar la entrega';
    throw new Error(errorMessage);
  }
};

/**
 * Cancelar una orden de compra
 */
export const cancelarOrden = async (id, motivo) => {
  try {
    console.log('❌ Cancelando orden:', id, motivo);
    const response = await api.put(`/ordenes-compra/${id}/cambiar-estado`, {
      nuevo_estado: 'CANCELADO',
      observaciones: motivo
    });
    console.log('✅ Orden cancelada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al cancelar orden:', error);
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo cancelar la orden';
    throw new Error(errorMessage);
  }
};

// ===== NOTIFICACIONES =====

/**
 * Notificar pacientes manualmente
 */
export const notificarPacientes = async (datos) => {
  try {
    console.log('📧 Notificando pacientes manualmente:', datos);
    const response = await api.post('/notificaciones/paciente', datos);
    console.log('✅ Notificaciones enviadas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al notificar pacientes:', error);
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudieron enviar las notificaciones';
    throw new Error(errorMessage);
  }
};

/**
 * Reenviar notificación específica
 */
export const reenviarNotificacion = async (notificacionId) => {
  try {
    console.log('🔄 Reenviando notificación:', notificacionId);
    const response = await api.post(`/notificaciones/${notificacionId}/reenviar`);
    console.log('✅ Notificación reenviada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al reenviar notificación:', error);
    const errorMessage = error.response?.data?.message
      || error.response?.data?.error
      || error.message
      || 'No se pudo reenviar la notificación';
    throw new Error(errorMessage);
  }
};

/**
 * Obtener historial de notificaciones de una orden
 */
export const getNotificacionesOrden = async (ordenId) => {
  try {
    console.log('📋 Obteniendo notificaciones de orden:', ordenId);
    const response = await api.get(`/notificaciones/orden/${ordenId}`);
    console.log('✅ Notificaciones obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo notificaciones:', error);
    throw error;
  }
};

// ===== REPORTES =====

/**
 * Obtener reporte completo de compras
 */
export const getReporteCompras = async (params = {}) => {
  try {
    console.log('📊 Obteniendo reporte de compras:', params);
    const response = await api.get('/reportes-compras', { params });
    console.log('✅ Reporte obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo reporte:', error);
    throw error;
  }
};

/**
 * Exportar reporte a Excel
 */
export const exportarReporteExcel = async (params = {}) => {
  try {
    console.log('📥 Exportando reporte a Excel:', params);
    const response = await api.post('/reportes-compras/exportar-excel', params, {
      responseType: 'blob'
    });

    // Crear URL del blob y descargar
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_compras_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    console.log('✅ Reporte exportado exitosamente');
    return { success: true, message: 'Reporte exportado exitosamente' };
  } catch (error) {
    console.error('❌ Error al exportar reporte:', error);
    const errorMessage = error.response?.data?.message
      || error.message
      || 'No se pudo exportar el reporte';
    throw new Error(errorMessage);
  }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Validar datos de solicitud de presupuesto
 */
export const validarSolicitudPresupuesto = (datos) => {
  const errores = [];

  if (!datos.descripcion || datos.descripcion.trim() === '') {
    errores.push('La descripción es obligatoria');
  }

  if (!datos.proveedores || datos.proveedores.length === 0) {
    errores.push('Debe seleccionar al menos un proveedor');
  }

  if (!datos.medicamentos || datos.medicamentos.length === 0) {
    errores.push('Debe incluir al menos un medicamento');
  }

  if (datos.medicamentos && datos.medicamentos.some(m => !m.nombre || !m.cantidad)) {
    errores.push('Todos los medicamentos deben tener nombre y cantidad');
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Calcular estadísticas de una solicitud
 */
export const calcularEstadisticasSolicitud = (solicitud) => {
  const { proveedores = [] } = solicitud;

  const estadisticas = {
    total: proveedores.length,
    enviados: 0,
    recibidos: 0,
    pendientes: 0,
    vencidos: 0,
    adjudicados: 0,
    mejorOferta: null,
    menorPrecio: Infinity,
    menorTiempo: Infinity
  };

  proveedores.forEach(proveedor => {
    switch (proveedor.estado) {
      case 'ENVIADO':
        estadisticas.enviados++;
        break;
      case 'RECIBIDO':
        estadisticas.recibidos++;
        // Buscar mejor oferta
        if (proveedor.presupuesto) {
          if (proveedor.presupuesto.total < estadisticas.menorPrecio) {
            estadisticas.menorPrecio = proveedor.presupuesto.total;
            estadisticas.mejorOferta = proveedor;
          }
          if (proveedor.presupuesto.tiempoEntregaDias < estadisticas.menorTiempo) {
            estadisticas.menorTiempo = proveedor.presupuesto.tiempoEntregaDias;
          }
        }
        break;
      case 'PENDIENTE':
        estadisticas.pendientes++;
        break;
      case 'VENCIDO':
        estadisticas.vencidos++;
        break;
      case 'ADJUDICADO':
        estadisticas.adjudicados++;
        break;
      default:
        break;
    }
  });

  // Calcular porcentaje de respuesta
  estadisticas.porcentajeRespuesta = estadisticas.total > 0
    ? ((estadisticas.recibidos + estadisticas.adjudicados) / estadisticas.total * 100).toFixed(1)
    : 0;

  return estadisticas;
};

/**
 * Formatear datos de orden para mostrar
 */
export const formatearOrden = (orden) => {
  return {
    ...orden,
    montoFormateado: new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(orden.monto_total),
    fechaFormateada: new Date(orden.fecha_orden).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    estadoBadge: getEstadoBadge(orden.estado)
  };
};

/**
 * Obtener configuración de badge según estado
 */
const getEstadoBadge = (estado) => {
  const badges = {
    'PENDIENTE': { color: 'gray', texto: 'Pendiente' },
    'CONFIRMADO': { color: 'blue', texto: 'Confirmado' },
    'EN_TRANSITO': { color: 'purple', texto: 'En Tránsito' },
    'ENTREGADO': { color: 'green', texto: 'Entregado' },
    'CANCELADO': { color: 'red', texto: 'Cancelado' }
  };
  return badges[estado] || { color: 'gray', texto: estado };
};

// Exportar todas las funciones
export default {
  // Auditorías
  getAuditoriasAprobadas,

  // Compras Alto Costo
  solicitarPresupuesto,
  getPresupuestos,
  adjudicarPresupuesto,

  // Solicitudes
  getSolicitudes,
  getSolicitudDetalle,
  registrarRespuesta,

  // Órdenes
  getOrdenesCompra,
  getOrdenDetalle,
  cambiarEstadoOrden,
  confirmarEntrega,
  cancelarOrden,

  // Notificaciones
  notificarPacientes,
  reenviarNotificacion,
  getNotificacionesOrden,

  // Reportes
  getReporteCompras,
  exportarReporteExcel,

  // Utilidades
  validarSolicitudPresupuesto,
  calcularEstadisticasSolicitud,
  formatearOrden
};

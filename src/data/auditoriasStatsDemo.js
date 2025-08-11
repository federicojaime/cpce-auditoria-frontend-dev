// src/data/auditoriasStatsDemo.js
const auditoriasStatsDemo = {
  // Estadísticas generales
  resumenGeneral: {
    totalAuditorias: 2847,
    pendientes: 156,
    completadas: 2691,
    rechazadas: 89,
    aprobadas: 2602,
    enRevision: 23,
    ultimaActualizacion: "2025-07-24T10:30:00Z"
  },

  // Distribución por estado
  distribucionEstados: [
    { estado: "Aprobada", cantidad: 2602, porcentaje: 91.4, color: "#10B981" },
    { estado: "Pendiente", cantidad: 156, porcentaje: 5.5, color: "#F59E0B" },
    { estado: "Rechazada", cantidad: 89, porcentaje: 3.1, color: "#EF4444" }
  ],

  // Estadísticas por mes (últimos 6 meses)
  tendenciaMensual: [
    { mes: "Feb", auditorias: 412, aprobadas: 378, rechazadas: 34 },
    { mes: "Mar", auditorias: 485, aprobadas: 441, rechazadas: 44 },
    { mes: "Abr", auditorias: 523, aprobadas: 489, rechazadas: 34 },
    { mes: "May", auditorias: 467, aprobadas: 425, rechazadas: 42 },
    { mes: "Jun", auditorias: 398, aprobadas: 362, rechazadas: 36 },
    { mes: "Jul", auditorias: 562, aprobadas: 507, rechazadas: 55 }
  ],

  // Top auditores
  topAuditores: [
    { nombre: "Dr. María González", auditorias: 387, tasaAprobacion: 90.7 },
    { nombre: "Dr. Carlos Mendoza", auditorias: 342, tasaAprobacion: 92.9 },
    { nombre: "Dra. Ana Rodríguez", auditorias: 298, tasaAprobacion: 90.2 }
  ],

  // Estadísticas por obra social (top 5)
  topObrasSociales: [
    { nombre: "PAMI", auditorias: 523, tasaAprobacion: 89.3 },
    { nombre: "OSDE", auditorias: 456, tasaAprobacion: 92.3 },
    { nombre: "Swiss Medical", auditorias: 398, tasaAprobacion: 90.7 },
    { nombre: "Galeno", auditorias: 367, tasaAprobacion: 91.0 },
    { nombre: "IOMA", auditorias: 289, tasaAprobacion: 89.6 }
  ],

  // Alertas del sistema
  alertas: [
    {
      tipo: "warning",
      mensaje: "23 auditorías llevan más de 5 días en revisión",
      prioridad: "media"
    },
    {
      tipo: "info", 
      mensaje: "Nuevo lote de 45 prescripciones recibido",
      prioridad: "baja"
    }
  ]
};

// Función para obtener estadísticas específicas
const getEstadisticasDemo = (tipo = 'general') => {
  switch(tipo) {
    case 'dashboard':
      return {
        pendientes: auditoriasStatsDemo.resumenGeneral.pendientes,
        historicas: auditoriasStatsDemo.resumenGeneral.completadas,
        tasaAprobacion: ((auditoriasStatsDemo.resumenGeneral.aprobadas / auditoriasStatsDemo.resumenGeneral.totalAuditorias) * 100).toFixed(1),
        totalAuditorias: auditoriasStatsDemo.resumenGeneral.totalAuditorias
      };
    default:
      return auditoriasStatsDemo;
  }
};

export { auditoriasStatsDemo, getEstadisticasDemo };
import axios from 'axios';

// URL base de la API
const API_URL = import.meta.env.VITE_API_URL || 'https://cpce-auditoria-api-dev-production.up.railway.app/api';

/**
 * Servicio para gestionar reportes de compras
 */

/**
 * 1. Obtener estadísticas ejecutivas
 * GET /api/reportes/estadisticas
 */
export const getEstadisticas = async (filtros = {}) => {
    try {
        const params = {};

        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

        const response = await axios.get(`${API_URL}/reportes/estadisticas`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        throw error;
    }
};

/**
 * 2. Obtener distribución de estados
 * GET /api/reportes/distribucion-estados
 */
export const getDistribucionEstados = async (filtros = {}) => {
    try {
        const params = {};

        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

        const response = await axios.get(`${API_URL}/reportes/distribucion-estados`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al obtener distribución de estados:', error);
        throw error;
    }
};

/**
 * 3. Obtener análisis de cumplimiento
 * GET /api/reportes/cumplimiento
 */
export const getAnalisisCumplimiento = async (filtros = {}) => {
    try {
        const params = {};

        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

        const response = await axios.get(`${API_URL}/reportes/cumplimiento`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al obtener análisis de cumplimiento:', error);
        throw error;
    }
};

/**
 * 4. Obtener ranking de proveedores
 * GET /api/reportes/ranking-proveedores
 */
export const getRankingProveedores = async (filtros = {}) => {
    try {
        const params = {};

        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
        if (filtros.limite) params.limite = filtros.limite;

        const response = await axios.get(`${API_URL}/reportes/ranking-proveedores`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al obtener ranking de proveedores:', error);
        throw error;
    }
};

/**
 * 5. Listar órdenes de compra con filtros y paginación
 * GET /api/reportes/ordenes
 */
export const listarOrdenes = async (filtros = {}) => {
    try {
        const params = {};

        // Filtros de búsqueda
        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
        if (filtros.proveedor) params.proveedor = filtros.proveedor;
        if (filtros.estado) params.estado = filtros.estado;
        if (filtros.busqueda) params.busqueda = filtros.busqueda;

        // Paginación
        if (filtros.pagina) params.pagina = filtros.pagina;
        if (filtros.limite) params.limite = filtros.limite;

        const response = await axios.get(`${API_URL}/reportes/ordenes`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al listar órdenes:', error);
        throw error;
    }
};

/**
 * 6. Obtener detalle de una orden de compra
 * GET /api/reportes/ordenes/:id
 */
export const getDetalleOrden = async (ordenId) => {
    try {
        const response = await axios.get(`${API_URL}/reportes/ordenes/${ordenId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al obtener detalle de orden:', error);
        throw error;
    }
};

/**
 * 7. Obtener Dashboard Ejecutivo
 * GET /api/reportes/dashboard-ejecutivo
 */
export const getDashboardEjecutivo = async (filtros = {}) => {
    try {
        const params = {};

        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

        const response = await axios.get(`${API_URL}/reportes/dashboard-ejecutivo`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al obtener dashboard ejecutivo:', error);
        throw error;
    }
};

/**
 * 8. Obtener Análisis de Logística
 * GET /api/reportes/analisis-logistica
 */
export const getAnalisisLogistica = async (filtros = {}) => {
    try {
        const params = {};

        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

        const response = await axios.get(`${API_URL}/reportes/analisis-logistica`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al obtener análisis de logística:', error);
        throw error;
    }
};

/**
 * 9. Obtener Proyección de Costos
 * GET /api/reportes/proyeccion-costos
 */
export const getProyeccionCostos = async (filtros = {}) => {
    try {
        const params = {};

        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;

        const response = await axios.get(`${API_URL}/reportes/proyeccion-costos`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error al obtener proyección de costos:', error);
        throw error;
    }
};

/**
 * HELPER: Exportar reporte a Excel
 * Esta función genera un archivo Excel con los datos proporcionados
 */
export const exportarAExcel = async (filtros = {}) => {
    try {
        const params = {};

        if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
        if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
        if (filtros.proveedor) params.proveedor = filtros.proveedor;
        if (filtros.estado) params.estado = filtros.estado;

        const response = await axios.get(`${API_URL}/reportes/exportar-excel`, {
            params,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            responseType: 'blob' // Importante para descargar archivos
        });

        // Crear un blob y descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Generar nombre de archivo con fecha actual
        const fecha = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `reporte_compras_${fecha}.xlsx`);

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Archivo descargado exitosamente' };
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        throw error;
    }
};

/**
 * HELPER: Formatear precio en pesos argentinos
 */
export const formatearPrecio = (precio) => {
    if (!precio && precio !== 0) return '$0,00';

    let numero = precio;
    if (typeof precio === 'string') {
        numero = parseFloat(precio.replace(/[^\d.-]/g, ''));
    }

    if (isNaN(numero)) return '$0,00';

    const partes = numero.toFixed(2).split('.');
    const entero = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimal = partes[1];

    return `$${entero},${decimal}`;
};

/**
 * HELPER: Formatear fecha en formato argentino
 */
export const formatearFecha = (fecha) => {
    if (!fecha) return '-';

    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * HELPER: Obtener color según estado de orden
 */
export const getColorEstado = (estado) => {
    const colores = {
        'PENDIENTE': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'APROBADA': 'bg-green-100 text-green-800 border-green-300',
        'RECHAZADA': 'bg-red-100 text-red-800 border-red-300',
        'ENTREGADA': 'bg-blue-100 text-blue-800 border-blue-300',
        'CANCELADA': 'bg-gray-100 text-gray-800 border-gray-300'
    };

    return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-300';
};

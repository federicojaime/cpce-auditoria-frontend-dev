// src/pages/AuditoriasHistoricas.jsx - VERSIÓN CON TOAST
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auditoriasService } from '../services/auditoriasService';
import TableWithFilters from '../components/common/TableWithFilters';
import { toast } from 'react-toastify';
import {
    EyeIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    XMarkIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

const AuditoriasHistoricas = () => {
    const { user } = useAuth();
    const [auditorias, setAuditorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10
    });

    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1
    });

    // Estados para el modal del PDF
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfError, setPdfError] = useState('');
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [currentAuditoriaId, setCurrentAuditoriaId] = useState(null);

    // Estados para reenvío de email
    const [sendingEmail, setSendingEmail] = useState(false);
    const [currentEmailId, setCurrentEmailId] = useState(null);

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Auditoría', href: '/' },
        { name: 'Históricas', href: '/historicas', current: true }
    ];

    // Función para cerrar el modal del PDF
    const closePDFModal = () => {
        setShowPDFModal(false);
        setPdfUrl('');
        setPdfError('');
        setCurrentAuditoriaId(null);
    };

    // Función para reenviar email CON TOAST
   const handleReenviarEmail = async (auditoriaId) => {
        try {
            setSendingEmail(true);
            setCurrentEmailId(auditoriaId);
            setError('');

            // Toast de inicio con estilo mejorado
            const toastId = toast.info(
                <div className="toast-content">
                    <div className="toast-icon">📧</div>
                    <div className="toast-message">
                        <div className="toast-title">Enviando email...</div>
                        <div className="toast-description">Procesando solicitud de reenvío</div>
                    </div>
                </div>, 
                {
                    position: "top-right",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: false,
                    className: "toast-glow-info",
                }
            );

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auditorias/${auditoriaId}/reenviar-email`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            console.log('Respuesta reenvío email:', result);

            // Cerrar toast de carga
            toast.dismiss(toastId);

            if (response.ok && result.success) {
                // Extraer información del resultado
                const emailDestino = result.data?.email || result.email || 'destinatario no especificado';
                const paciente = result.data?.paciente || '';
                const estado = result.data?.estado || '';
                const pdfAdjunto = result.data?.pdf_adjunto;
                const messageId = result.data?.messageId || '';

                // Toast de éxito con diseño moderno
                toast.success(
                    <div className="toast-content">
                     
                        <div className="toast-message">
                            <div className="toast-title">Email enviado exitosamente</div>
                         
                            {(emailDestino !== 'destinatario no especificado' || paciente || estado) && (
                                <div className="toast-details">
                                    {emailDestino !== 'destinatario no especificado' && (
                                        <div className="toast-detail-item">
                                            <span className="toast-detail-label">Destinatario:</span>
                                            <span className="toast-detail-value">{emailDestino}</span>
                                        </div>
                                    )}
                                    {paciente && (
                                        <div className="toast-detail-item">
                                            <span className="toast-detail-label">Paciente:</span>
                                            <span className="toast-detail-value">{paciente}</span>
                                        </div>
                                    )}
                                    {estado && (
                                        <div className="toast-detail-item">
                                            <span className="toast-detail-label">Estado:</span>
                                            <span className="toast-detail-value">{estado}</span>
                                        </div>
                                    )}
                                   
                                </div>
                            )}
                        </div>
                    </div>, 
                    {
                        position: "top-right",
                        autoClose: 8000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        className: "toast-glow-success",
                    }
                );

            } else {
                setError(result.message || 'Error al reenviar email');
                
                // Toast de error con diseño moderno
                toast.error(
                    <div className="toast-content">
                        <div className="toast-icon">❌</div>
                        <div className="toast-message">
                            <div className="toast-title">Error al enviar email</div>
                            <div className="toast-description">
                                {result.message || 'Error desconocido al reenviar email'}
                            </div>
                        </div>
                    </div>, 
                    {
                        position: "top-right",
                        autoClose: 6000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        className: "toast-glow-error",
                    }
                );
            }
        } catch (error) {
            console.error('Error reenviando email:', error);
            setError('Error al reenviar email');
            
            // Toast de error de conexión
            toast.error(
                <div className="toast-content">
                    <div className="toast-icon">🔥</div>
                    <div className="toast-message">
                        <div className="toast-title">Error de conexión</div>
                        <div className="toast-description">
                            No se pudo conectar con el servidor para enviar el email
                        </div>
                    </div>
                </div>, 
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    className: "toast-glow-error",
                }
            );
        } finally {
            setSendingEmail(false);
            setCurrentEmailId(null);
        }
    };

    // Columnas de la tabla
    const columns = [
        { key: 'apellido', label: 'Apellido', className: 'whitespace-nowrap text-sm font-medium text-gray-900' },
        { key: 'nombre', label: 'Nombre', className: 'whitespace-nowrap text-sm text-gray-900' },
        { key: 'dni', label: 'DNI', className: 'whitespace-nowrap text-sm text-gray-900 font-mono' },
        { key: 'fecha', label: 'Fecha', className: 'whitespace-nowrap text-sm text-gray-900' },
        { 
            key: 'medico', 
            label: 'Médico', 
            className: 'text-sm text-gray-900 max-w-xs truncate',
            render: (row) => (
                <span title={row.medico} className="truncate block">
                    {row.medico}
                </span>
            )
        },
        { 
            key: 'fechaAuditoria', 
            label: 'Fecha Auditoría',
            className: 'whitespace-nowrap text-sm text-gray-900',
            render: (row) => row.fechaAuditoria || '-'
        },
        { 
            key: 'auditor', 
            label: 'Auditor',
            className: 'text-sm text-gray-900',
            render: (row) => row.auditor || '-'
        },
        { 
            key: 'acciones', 
            label: 'Acciones',
            align: 'center',
            className: 'whitespace-nowrap text-center',
            render: (row) => (
                <div className="flex justify-center space-x-2">
                    {/* Botón Ver */}
                    <Link
                        to={`/auditoria-historica/${row.id}`}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        title="Ver auditoría histórica"
                    >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Ver
                    </Link>
                    
                    {/* Botón PDF */}
                    <button
                        onClick={() => handleGenerarPDF(row.id)}
                        disabled={generatingPDF}
                        className="inline-flex items-center px-3 py-1 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50"
                        title="Generar PDF"
                    >
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        {generatingPDF && currentAuditoriaId === row.id ? 'Generando...' : 'PDF'}
                    </button>

                    {/* Botón Reenviar Email */}
                    <button
                        onClick={() => handleReenviarEmail(row.id)}
                        disabled={sendingEmail}
                        className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                        title="Reenviar email"
                    >
                        <EnvelopeIcon className="h-4 w-4 mr-1" />
                        {sendingEmail && currentEmailId === row.id ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enviando...
                            </>
                        ) : 'Email'}
                    </button>
                </div>
            )
        }
    ];

    // Función para generar PDF con modal y toast
    const handleGenerarPDF = async (auditoriaId) => {
        try {
            setGeneratingPDF(true);
            setCurrentAuditoriaId(auditoriaId);
            setError('');
            setPdfError('');

            // Toast de inicio
            const toastId = toast.info('Generando PDF...', {
                position: "top-right",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auditorias/${auditoriaId}/generar-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: "0" })
            });

            const result = await response.json();
            
            console.log('Respuesta completa de la API:', result);

            // Cerrar toast de carga
            toast.dismiss(toastId);

            if (response.ok && result.success) {
                let finalPdfUrl = null;
                
                if (result.data?.url) {
                    finalPdfUrl = result.data.url;
                } else if (result.url) {
                    finalPdfUrl = result.url;
                } else if (result.data?.nombreArchivo) {
                    finalPdfUrl = `https://cpce.recetasalud.ar/audi/tmp/${result.data.nombreArchivo}`;
                } else if (result.nombreArchivo) {
                    finalPdfUrl = `https://cpce.recetasalud.ar/audi/tmp/${result.nombreArchivo}`;
                }
                
                console.log('URL final del PDF:', finalPdfUrl);
                
                if (finalPdfUrl) {
                    // Establecer la URL del PDF y mostrar el modal
                    setPdfUrl(finalPdfUrl);
                    setShowPDFModal(true);
                    
                    // Toast de éxito
                    toast.success('PDF generado correctamente', {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                } else {
                    console.warn('No se pudo determinar la URL del PDF');
                    setError('PDF generado correctamente, pero no se pudo abrir automáticamente');
                    
                    toast.warning('PDF generado, pero no se pudo abrir automáticamente', {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                }
            } else {
                setError(result.message || 'Error al generar PDF');
                
                toast.error(result.message || 'Error al generar PDF', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Error generando PDF:', error);
            setError('Error al generar PDF');
            
            toast.error('Error al generar PDF', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setGeneratingPDF(false);
            setCurrentAuditoriaId(null);
        }
    };

    // Cargar auditorías históricas
    const loadAuditorias = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            setError('');

            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.append('search', searchTerm);
            queryParams.append('page', filters.page);
            queryParams.append('limit', filters.limit);

            const url = `/auditorias/historicas?${queryParams.toString()}`;
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setAuditorias(result.data || []);
                setPagination({
                    total: result.total || 0,
                    totalPages: result.totalPages || 0,
                    currentPage: result.page || filters.page
                });
            } else {
                setError(result.message || 'Error al cargar auditorías históricas');
                setAuditorias([]);
            }
        } catch (error) {
            console.error('Error cargando auditorías históricas:', error);
            setError('Error inesperado al cargar las auditorías históricas');
            setAuditorias([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [searchTerm, filters]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadAuditorias();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [loadAuditorias]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadAuditorias(false);
    };

    const handleExportExcel = async () => {
        try {
            setError('');

            // Validar que hay datos para exportar
            if (!auditorias || auditorias.length === 0) {
                const errorMsg = 'No hay datos para exportar';
                setError(errorMsg);
                toast.error(errorMsg, {
                    position: "top-right",
                    autoClose: 3000
                });
                return;
            }

            // Toast de inicio
            const toastId = toast.info('Generando archivo Excel...', {
                position: "top-right",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
            });

            console.log('Exportando auditorías históricas:', auditorias.length);

            // Usar exportarExcelConDatos para exportar los datos actuales
            const result = await auditoriasService.exportarExcelConDatos(auditorias, {
                tipo: 'historicas',
                fecha: new Date().toISOString().split('T')[0],
                searchTerm: searchTerm || null
            });

            // Cerrar toast de carga
            toast.dismiss(toastId);

            if (result.success) {
                // Toast de éxito
                toast.success('Archivo Excel descargado correctamente', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                setError(result.message);
                toast.error(result.message || 'Error al generar el archivo Excel', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            console.error('Error exportando Excel:', error);
            const errorMsg = 'Error al generar el archivo Excel';
            setError(errorMsg);

            toast.error(errorMsg, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setFilters(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handlePageSizeChange = (newSize) => {
        setFilters(prev => ({ ...prev, limit: newSize, page: 1 }));
    };

    // Acciones personalizadas
    const actions = (
        <>
            <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
            >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>

            <button
                onClick={handleExportExcel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                Excel
            </button>
        </>
    );

    // Información adicional
    const additionalInfo = pagination.total > 0 ? (
        <div className="flex">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                    Información sobre las auditorías históricas
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                    <p>
                        Se encontraron <strong>{pagination.total}</strong> auditorías procesadas.
                        Puedes buscar por apellido, nombre, DNI, médico o auditor.
                    </p>
                </div>
            </div>
        </div>
    ) : null;

    // Encontrar la auditoría actual para el modal
    const currentAuditoria = auditorias.find(a => a.id === currentAuditoriaId);

    return (
        <>
            <TableWithFilters
                title="Auditorías Históricas"
                subtitle="Consultar auditorías procesadas anteriormente"
                breadcrumbItems={breadcrumbItems}
                data={auditorias}
                columns={columns}
                loading={loading}
                error={error}
                refreshing={refreshing}
                searchValue={searchTerm}
                searchPlaceholder="Buscar por apellido, nombre, DNI, médico o auditor..."
                onSearchChange={handleSearchChange}
                pagination={pagination}
                pageSize={filters.limit}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                actions={actions}
                onRefresh={handleRefresh}
                emptyMessage="No hay auditorías históricas"
                emptySearchMessage="No se encontraron auditorías históricas que coincidan con la búsqueda"
                additionalInfo={additionalInfo}
            />

            {/* Modal del PDF */}
            {showPDFModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative min-h-screen flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                            {/* Header del modal */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                                    PDF - Auditoría #{currentAuditoriaId}
                                    {currentAuditoria && (
                                        <span className="ml-2 text-sm font-normal text-gray-600">
                                            ({currentAuditoria.apellido}, {currentAuditoria.nombre})
                                        </span>
                                    )}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        Abrir en nueva pestaña
                                    </a>
                                    <button
                                        onClick={closePDFModal}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Contenido del PDF */}
                            <div className="flex-1 p-4">
                                {pdfError ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Error al cargar el PDF
                                            </h3>
                                            <p className="text-gray-500 mb-4">{pdfError}</p>
                                            <a
                                                href={pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                Abrir PDF en nueva pestaña
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <iframe
                                        src={pdfUrl}
                                        className="w-full h-full border-0 rounded-lg"
                                        title={`PDF Auditoría #${currentAuditoriaId}`}
                                        onError={() => setPdfError('No se pudo cargar el PDF en el visor integrado')}
                                    >
                                        <p>
                                            Tu navegador no soporta la visualización de PDFs. 
                                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                                                Haz clic aquí para descargar el PDF
                                            </a>
                                        </p>
                                    </iframe>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AuditoriasHistoricas;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import { 
    ArrowLeftIcon, 
    UserIcon, 
    DocumentTextIcon,
    CalendarIcon,
    PrinterIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    DocumentArrowDownIcon,
    ArrowUturnLeftIcon,
    TrashIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const VerAuditoriaHistorica = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [processingAction, setProcessingAction] = useState(false);
    const [data, setData] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmNote, setConfirmNote] = useState('');

    // Estados para el modal del PDF
    const [showPDFModal, setShowPDFModal] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [pdfError, setPdfError] = useState('');

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Auditoría', href: '/' },
        { name: 'Pendientes', href: '/' },
        { name: `Auditoría #${id}`, href: `/historica/${id}`, current: true }
    ];

    useEffect(() => {
        loadAuditoria();
    }, [id]);

    const closeModal = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
        setConfirmNote('');
    };

    const closePDFModal = () => {
        setShowPDFModal(false);
        setPdfUrl('');
        setPdfError('');
    };

    const loadAuditoria = async () => {
        try {
            setLoading(true);
            setError('');
            
            const endpoint = `/auditorias/${id}/historica`;
            
            console.log('Cargando auditoría histórica desde:', endpoint);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`
                }
            });

            const result = await response.json();
            console.log('Respuesta de la API:', result);

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message || 'Error al cargar la auditoría histórica');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar la auditoría histórica');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleGenerarPDF = async () => {
        try {
            setGeneratingPDF(true);
            setError('');
            setSuccess('');
            setPdfError('');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/auditorias/${id}/generar-pdf`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: "0" })
            });

            const result = await response.json();
            
            console.log('Respuesta completa de la API:', result);

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
                    setSuccess('PDF generado correctamente');
                } else {
                    console.warn('No se pudo determinar la URL del PDF');
                    setSuccess('PDF generado correctamente, pero no se pudo abrir automáticamente');
                }
            } else {
                setError(result.message || 'Error al generar PDF');
            }
        } catch (error) {
            console.error('Error generando PDF:', error);
            setError('Error al generar PDF');
        } finally {
            setGeneratingPDF(false);
        }
    };

    const handleRevertir = () => {
        setConfirmAction('revertir');
        setConfirmNote('');
        setShowConfirmModal(true);
    };

    const handleBorrar = () => {
        setConfirmAction('borrar');
        setConfirmNote('');
        setShowConfirmModal(true);
    };

    const executeAction = async () => {
        if (!confirmAction) return;

        // Validar nota para borrar
        if (confirmAction === 'borrar' && (!confirmNote || confirmNote.trim() === '')) {
            setError('La nota es obligatoria para borrar una auditoría');
            return;
        }

        try {
            setProcessingAction(true);
            setError('');
            setSuccess('');

            const endpoint = confirmAction === 'revertir' 
                ? `/auditorias/${id}/revertir`
                : `/auditorias/${id}/borrar`;

            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    nota: confirmNote.trim() || undefined 
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSuccess(
                    confirmAction === 'revertir' 
                        ? 'Auditoría revertida exitosamente'
                        : 'Auditoría borrada exitosamente'
                );
                
                // Navegar a auditorías pendientes después de 1.5 segundos
                setTimeout(() => {
                    navigate('/historicos');
                }, 1500);
                
            } else {
                setError(result.message || `Error al ${confirmAction} la auditoría`);
            }
        } catch (error) {
            console.error(`Error ${confirmAction} auditoría:`, error);
            setError(`Error al ${confirmAction} la auditoría`);
        } finally {
            setProcessingAction(false);
            setShowConfirmModal(false);
            setConfirmAction(null);
            setConfirmNote('');
        }
    };

    const getEstadoColor = (estado) => {
        switch(estado?.toString()) {
            case '1':
                return 'text-green-600 bg-green-50 border-green-200';
            case '2':
                return 'text-red-600 bg-red-50 border-red-200';
            case '3':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case '4':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getEstadoIcon = (estado) => {
        switch(estado?.toString()) {
            case '1':
                return <CheckCircleIcon className="h-4 w-4" />;
            case '2':
                return <XCircleIcon className="h-4 w-4" />;
            case '3':
                return <ExclamationTriangleIcon className="h-4 w-4" />;
            case '4':
                return <ClockIcon className="h-4 w-4" />;
            default:
                return <InformationCircleIcon className="h-4 w-4" />;
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="mb-4">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <Loading text="Cargando auditoría histórica..." />
            </div>
        );
    }

    // Error state
    if (error && !data) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="mb-4">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <ErrorMessage
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-100 p-4">
                <div className="mb-4">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        <span>No se encontraron datos para esta auditoría</span>
                    </div>
                </div>
            </div>
        );
    }

    // Verificar permisos para mostrar botones de acción
    const canRevert = user?.rol !== 9;
    const canDelete = user?.rol !== 9;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Breadcrumb */}
            <div className="mb-4 print:hidden">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Mensajes */}
            {error && (
                <div className="mb-4">
                    <ErrorMessage message={error} />
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                    <div className="flex">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Indicador de generación de PDF */}
            {generatingPDF && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <div className="flex">
                        <DocumentArrowDownIcon className="h-5 w-5 text-blue-400 animate-spin" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-blue-800">Generando PDF...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Indicador de procesamiento de acción */}
            {processingAction && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                    <div className="flex">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-yellow-800">
                                Procesando {confirmAction}...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Título para impresión */}
            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold">Auditoría Histórica #{data.auditoria.id}</h1>
                <p className="text-gray-600">Fecha: {data.auditoria.fecha_origen}</p>
            </div>

            {/* Card principal */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">

                {/* Header con título y botones */}
                <div className="bg-blue-600 text-white px-6 py-4 print:hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/historicos')}
                                className="inline-flex items-center text-white hover:text-blue-200 transition-colors"
                            >
                                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                                Volver a históricos
                            </button>
                            <h1 className="text-lg font-semibold flex items-center">
                                <UserIcon className="h-5 w-5 mr-2" />
                                Auditoría Histórica #{data.auditoria.id}
                            </h1>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleGenerarPDF}
                                disabled={generatingPDF || processingAction}
                                className="inline-flex items-center px-4 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                            >
                                <DocumentTextIcon className="h-5 w-5 mr-2" />
                                {generatingPDF ? 'Generando...' : 'Generar PDF'}
                            </button>
                            <button
                                onClick={handlePrint}
                                disabled={processingAction}
                                className="inline-flex items-center px-4 py-2 border border-white/20 rounded-md shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
                            >
                                <PrinterIcon className="h-5 w-5 mr-2" />
                                Imprimir
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="p-6">

                    {/* Información del paciente, médico y diagnóstico */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                        {/* PACIENTE */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                    📋 PACIENTE
                                </h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <div className="grid grid-cols-2 gap-x-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">Apellido:</span>
                                        <div className="font-semibold">{data.paciente?.apellido || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Nombre:</span>
                                        <div className="font-semibold">{data.paciente?.nombre || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">DNI:</span>
                                        <div className="font-semibold">{data.paciente?.dni || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Sexo:</span>
                                        <div className="font-semibold">{data.paciente?.sexo || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Edad:</span>
                                        <div className="font-semibold">{data.paciente?.edad ? `${data.paciente.edad} años` : 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Fecha Nac.:</span>
                                        <div className="font-semibold">{data.paciente?.fecha_nacimiento || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Teléfono:</span>
                                        <div className="font-semibold">{data.paciente?.telefono || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MÉDICO */}
                        <div className="bg-green-50 border border-green-200 rounded-lg">
                            <div className="bg-green-200 px-4 py-2 border-b border-green-300">
                                <h3 className="text-sm font-semibold text-green-800 flex items-center">
                                    👨‍⚕️ MÉDICO
                                </h3>
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Profesional:</span>
                                    <div className="font-semibold">{data.medico?.nombre || 'Sin datos'}</div>
                                    <div className="text-blue-600 font-medium text-xs">
                                        MP-{data.medico?.matricula || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Especialidad:</span>
                                    <div className="font-semibold text-green-700">{data.medico?.especialidad || 'Sin especialidad'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Fecha atención:</span>
                                    <div className="font-semibold">{data.auditoria?.fecha_auditoria || data.auditoria?.fecha_origen || 'Sin fecha'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Diagnóstico:</span>
                                    <div className="font-semibold">{data.diagnostico?.principal || 'Sin diagnóstico'}</div>
                                </div>
                            </div>
                        </div>

                        {/* INFORMACIÓN DE AUDITORÍA */}
                        <div className="bg-blue-50 border border-blue-300 rounded-lg">
                            <div className="bg-blue-200 px-4 py-2 border-b border-blue-300">
                                <h3 className="text-sm font-semibold text-blue-800 flex items-center">
                                    🔍 INFORMACIÓN DE AUDITORÍA
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-x-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">ID:</span>
                                        <div className="font-semibold">#{data.auditoria?.id}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Estado:</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(data.auditoria?.auditado)}`}>
                                            {getEstadoIcon(data.auditoria?.auditado)}
                                            <span className="ml-1">{data.auditoria?.estado_texto}</span>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Fecha Origen:</span>
                                        <div className="font-semibold">{data.auditoria?.fecha_origen}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Fecha Auditoría:</span>
                                        <div className="font-semibold">{data.auditoria?.fecha_auditoria || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Auditor:</span>
                                        <div className="font-semibold">{data.auditor || '-'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Renglones:</span>
                                        <div className="font-semibold">{data.auditoria?.renglones}</div>
                                    </div>
                                </div>
                                
                                {/* Estadísticas */}
                                <div className="border-t border-blue-200 pt-3 space-y-2">
                                    <div className="text-xs text-blue-700">
                                        <span className="font-medium">Total:</span> {data.estadisticas?.total_medicamentos || 0} medicamentos
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-green-700">
                                            <span className="font-medium">✓</span> {data.estadisticas?.medicamentos_aprobados || 0}
                                        </div>
                                        <div className="text-red-700">
                                            <span className="font-medium">✗</span> {data.estadisticas?.medicamentos_rechazados || 0}
                                        </div>
                                        <div className="text-yellow-700">
                                            <span className="font-medium">⚠</span> {data.estadisticas?.medicamentos_observados || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información de Obra Social */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="bg-purple-200 px-4 py-2 border-b border-purple-300">
                                <h3 className="text-sm font-semibold text-purple-800">🏥 OBRA SOCIAL</h3>
                            </div>
                            <div className="p-4 space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-600">Obra Social:</span>
                                    <div className="font-semibold">{data.obra_social?.nombre || 'Sin datos'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">N° Afiliado:</span>
                                    <div className="font-semibold font-mono">{data.obra_social?.nro_afiliado || 'Sin datos'}</div>
                                </div>
                            </div>
                        </div>

                        {data.auditoria?.nota && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="bg-amber-200 px-4 py-2 border-b border-amber-300">
                                    <h3 className="text-sm font-semibold text-amber-800">📝 NOTA DE AUDITORÍA</h3>
                                </div>
                                <div className="p-4">
                                    <p className="text-sm text-amber-900">{data.auditoria.nota}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Medicamentos por receta */}
                    {Object.keys(data.recetas || {}).length > 0 ? (
                        Object.entries(data.recetas).map(([idReceta, recetaData]) => (
                            <div key={idReceta} className="mb-6">
                                <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-4 py-3">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        💊 Receta N° {recetaData.nroreceta}
                                        <span className="ml-3 text-sm font-normal text-gray-500">
                                            ({recetaData.medicamentos.length} medicamento{recetaData.medicamentos.length !== 1 ? 's' : ''})
                                        </span>
                                    </h3>
                                </div>

                                <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-100 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                        #
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                        NOMBRE COMERCIAL
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                        MONODROGA
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                        PRESENTACIÓN
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                        CANT.
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                        POSOLOGÍA
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                        COBERTURA
                                                    </th>
                                                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                        ESTADO
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                                                        OBSERVACIÓN
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recetaData.medicamentos.map((med, index) => (
                                                    <tr key={med.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                                                            {med.nro_orden}
                                                        </td>
                                                        <td className="px-4 py-3 border-r border-gray-200">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {med.nombrecomercial || 'No especificado'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                                            {med.monodroga || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                                                            {med.presentacion || '-'}
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-center text-gray-900 font-mono border-r border-gray-200">
                                                            {med.cantidad}
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-center text-gray-900 border-r border-gray-200">
                                                            {med.posologia || '-'}
                                                        </td>
                                                        <td className="px-3 py-3 text-center border-r border-gray-200">
                                                            {med.cobertura > 0 ? (
                                                                <div className="text-sm">
                                                                    <span className="font-medium">{med.cobertura}%</span>
                                                                    {med.cobertura2 && (
                                                                        <span className="ml-1 text-gray-500 text-xs">({med.cobertura2})</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-center border-r border-gray-200">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(med.estado)}`}>
                                                                {getEstadoIcon(med.estado)}
                                                                <span className="ml-1">{med.estado_texto}</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-gray-900">
                                                            {med.observacion ? (
                                                                <div className="max-w-xs">
                                                                    <div className="truncate" title={med.observacion}>
                                                                        {med.observacion}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="mb-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-4 py-3">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    💊 Medicamentos
                                </h3>
                            </div>
                            <div className="border border-t-0 border-gray-200 rounded-b-lg p-6 bg-white">
                                <div className="text-center py-8">
                                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No se encontraron medicamentos
                                    </h3>
                                    <p className="text-gray-500">
                                        Esta auditoría no tiene medicamentos asociados o no se pudieron cargar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer con estado de la auditoría */}
                    <div className={`rounded-lg p-6 text-center ${
                        data.auditoria?.auditado === 1 ? 'bg-green-50 border border-green-200' :
                        data.auditoria?.auditado === 2 ? 'bg-red-50 border border-red-200' :
                        data.auditoria?.auditado === 3 ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-gray-50 border border-gray-200'
                    }`}>
                        <div className="flex items-center justify-center mb-4">
                            {getEstadoIcon(data.auditoria?.auditado)}
                            <h3 className={`ml-2 text-lg font-semibold ${
                                data.auditoria?.auditado === 1 ? 'text-green-900' :
                                data.auditoria?.auditado === 2 ? 'text-red-900' :
                                data.auditoria?.auditado === 3 ? 'text-yellow-900' :
                                'text-gray-900'
                            }`}>
                                Auditoría {data.auditoria?.estado_texto}
                            </h3>
                        </div>
                        <p className={`${
                            data.auditoria?.auditado === 1 ? 'text-green-700' :
                            data.auditoria?.auditado === 2 ? 'text-red-700' :
                            data.auditoria?.auditado === 3 ? 'text-yellow-700' :
                            'text-gray-700'
                        } mb-4`}>
                            Esta auditoría fue procesada por <strong>{data.auditor}</strong>
                            {data.auditoria?.fecha_auditoria && ` el ${data.auditoria.fecha_auditoria}`}
                        </p>
                        
                        {/* Resumen final */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div className="bg-white/50 p-3 rounded">
                                <span className="font-medium">Total:</span>
                                <span className="ml-1">{data.estadisticas?.total_medicamentos || 0} medicamentos</span>
                            </div>
                            <div className="bg-green-100/50 p-3 rounded text-green-700">
                                <span className="font-medium">Aprobados:</span>
                                <span className="ml-1">{data.estadisticas?.medicamentos_aprobados || 0}</span>
                            </div>
                            <div className="bg-red-100/50 p-3 rounded text-red-700">
                                <span className="font-medium">Rechazados:</span>
                                <span className="ml-1">{data.estadisticas?.medicamentos_rechazados || 0}</span>
                            </div>
                            <div className="bg-yellow-100/50 p-3 rounded text-yellow-700">
                                <span className="font-medium">Observados:</span>
                                <span className="ml-1">{data.estadisticas?.medicamentos_observados || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200 print:hidden">
                        {/* Botón Revertir - Solo si el usuario tiene permisos */}
                        {canRevert && (
                            <button
                                onClick={handleRevertir}
                                disabled={processingAction || generatingPDF}
                                className="px-6 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center"
                            >
                                <ArrowUturnLeftIcon className="h-4 w-4 mr-2" />
                                Revertir
                            </button>
                        )}

                        {/* Botón Borrar - Solo si el usuario tiene permisos */}
                        {canDelete && (
                            <button
                                onClick={handleBorrar}
                                disabled={processingAction || generatingPDF}
                                className="px-6 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Borrar
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/historicos')}
                            disabled={processingAction || generatingPDF}
                            className="px-6 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                            Volver
                        </button>
                    </div>

                    {/* Mensaje de solo lectura */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
                        <div className="flex">
                            <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-800">
                                    Auditoría Histórica
                                </h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Esta auditoría ya fue procesada. Puedes revertirla para volver al estado pendiente 
                                    o borrarla si es necesario. Los botones de acción están disponibles según tus permisos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal del PDF */}
            {showPDFModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative min-h-screen flex items-center justify-center p-4">
                        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                            {/* Header del modal */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                                    PDF - Auditoría #{data.auditoria.id}
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
                                        title={`PDF Auditoría #${data.auditoria.id}`}
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

            {/* Modal de confirmación */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                                {confirmAction === 'revertir' ? (
                                    <ArrowUturnLeftIcon className="w-6 h-6 text-yellow-600" />
                                ) : (
                                    <TrashIcon className="w-6 h-6 text-red-600" />
                                )}
                            </div>
                            
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                                {confirmAction === 'revertir' 
                                    ? 'Confirmar Reversión de Auditoría'
                                    : 'Confirmar Borrado de Auditoría'
                                }
                            </h3>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 text-center mb-4">
                                    {confirmAction === 'revertir' 
                                        ? '¿Estás seguro que deseas revertir esta auditoría? Esta acción volverá la auditoría al estado pendiente.'
                                        : '¿Estás seguro que deseas borrar esta auditoría? Esta acción no se puede deshacer.'
                                    }
                                </p>
                                
                                {/* Campo de nota - obligatorio para borrar */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nota {confirmAction === 'borrar' && <span className="text-red-500">*</span>}:
                                    </label>
                                    <textarea
                                        value={confirmNote}
                                        onChange={(e) => setConfirmNote(e.target.value)}
                                        placeholder={`Ingrese el motivo para ${confirmAction} esta auditoría...`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        rows="3"
                                        required={confirmAction === 'borrar'}
                                    />
                                    {confirmAction === 'borrar' && (
                                        <p className="text-xs text-red-500 mt-1">
                                            La nota es obligatoria para borrar una auditoría
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={closeModal}
                                    disabled={processingAction}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={executeAction}
                                    disabled={processingAction || (confirmAction === 'borrar' && !confirmNote.trim())}
                                    className={`px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${
                                        confirmAction === 'revertir'
                                            ? 'bg-yellow-600 hover:bg-yellow-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {processingAction ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Procesando...
                                        </div>
                                    ) : (
                                        confirmAction === 'revertir' ? 'Revertir' : 'Borrar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerAuditoriaHistorica;
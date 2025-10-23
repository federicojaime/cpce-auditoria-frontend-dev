// src/pages/ProcesarAuditoria.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditoriasService } from '../services/auditoriasService';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import { useFarmalink } from '../hooks/useFarmalink';
import ModalProgresoFarmalink from '../components/ModalProgresoFarmalink';

import {
    UserIcon,
    CheckCircleIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const ProcesarAuditoria = () => {
    
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: _user } = useAuth();

    const [auditoria, setAuditoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    

    // Estados para el procesamiento
    const [mesesSeleccionados, setMesesSeleccionados] = useState({});
    const [coberturas, setCoberturas] = useState({});
    const [tiposCobertura, setTiposCobertura] = useState({});
    const [nota, setNota] = useState('');
    const [identidadReservada, setIdentidadReservada] = useState(false);

     const {
                progreso,
                mensaje,
                procesando: procesandoFarmalink,
                modalVisible,
                errores,
                procesarConFarmalink,
                cerrarModal
            } = useFarmalink();


    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Auditoría', href: '/' },
        { name: 'Pendientes', href: '/pendientes' },
        { name: `Auditoría #${id}`, href: `/auditoria/${id}`, current: true }
    ];

    // Cargar datos de la auditoría
    useEffect(() => {
        const loadAuditoria = async () => {
            try {
                setLoading(true);
                setError('');
                
                console.log('Cargando auditoría ID:', id);
                
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auditorias/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`
                    }
                });

                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                
                console.log('=== RESPUESTA COMPLETA DEL SERVIDOR ===');
                console.log('result:', result);
                console.log('result.success:', result.success);
                console.log('result.auditoria:', result.auditoria);
              
                if (result.success && result.auditoria) {
                    console.log('Datos del paciente:', result.auditoria.paciente);
                    console.log('Datos del médico:', result.auditoria.medico);
                    console.log('Datos del diagnóstico:', result.auditoria.diagnostico);
                    console.log('Medicamentos:', result.auditoria.medicamentos);
                    
                    setAuditoria(result.auditoria);
                    
                    // Inicializar estado de identidad reservada
                    if (result.auditoria.paciente?.identidadreserv == 1) {
                        setIdentidadReservada(true);
                    }
                    
                    // Inicializar estados basados en los medicamentos
                    if (result.auditoria.medicamentos && result.auditoria.medicamentos.length > 0) {
                        const mesesInit = {};
                        const coberturasInit = {};
                        const tiposInit = {};
                        
                        result.auditoria.medicamentos.forEach((med) => {
                            const key = `${med.idreceta}_${med.nro_orden}`;
                            mesesInit[key] = {
                                mes1: false,
                                mes2: false,
                                mes3: false,
                                mes4: false,
                                mes5: false,
                                mes6: false
                            };
                            coberturasInit[med.nro_orden] = med.cobertura || 50;
                            tiposInit[med.nro_orden] = med.cobertura2 || 'CE';
                        });
                        
                        setMesesSeleccionados(mesesInit);
                        setCoberturas(coberturasInit);
                        setTiposCobertura(tiposInit);
                    }
                    
                    setError('');
                } else {
                    console.error('Respuesta inválida:', result);
                    setError(result.message || 'No se pudo cargar la auditoría');
                    setAuditoria(null);
                }
            } catch (error) {
                console.error('Error cargando auditoría:', error);
                setError(`Error al cargar los datos: ${error.message}`);
                setAuditoria(null);
            } finally {
                setLoading(false);
            }
        };

        loadAuditoria();
    }, [id]);
    

    // Manejar selección de meses
    const handleMesChange = (key, mes) => {
        setMesesSeleccionados(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [mes]: !prev[key][mes]
            }
        }));
    };

    const handleTodosChange = (key) => {
        const meses = mesesSeleccionados[key] || {};
        const todosSeleccionados = Object.values(meses).every(mes => mes);
        
        setMesesSeleccionados(prev => ({
            ...prev,
            [key]: {
                mes1: !todosSeleccionados,
                mes2: !todosSeleccionados,
                mes3: !todosSeleccionados,
                mes4: !todosSeleccionados,
                mes5: !todosSeleccionados,
                mes6: !todosSeleccionados
            }
        }));
    };

    // Manejar cambio de cobertura
    const handleCoberturaChange = (renglon, value) => {
        const numValue = parseInt(value) || 0;
        if (numValue >= 0 && numValue <= 100) {
            setCoberturas(prev => ({
                ...prev,
                [renglon]: numValue
            }));
        }
    };

    // Manejar cambio de tipo de cobertura
    const handleTipoCoberturaChange = (renglon, value) => {
        setTiposCobertura(prev => ({
            ...prev,
            [renglon]: value
        }));
    };

    // Función para generar PDF después del procesamiento
    const generarPDFAuditoria = async () => {
        try {
            setGeneratingPDF(true);
            
            const estadoIdentidad = identidadReservada ? 1 : 0;
            
            console.log(`Generando PDF para auditoría ${id} con estado identidad: ${estadoIdentidad}`);
            
            const result = await auditoriasService.generarPDF(id, estadoIdentidad);
            
            if (result.success) {
                console.log('PDF generado correctamente:', result);
                
                // Abrir PDF en nueva ventana
                const urlPDF = result.data?.url || auditoriasService.obtenerURLPDF(id);
                window.open(urlPDF, '_blank');
                
                setSuccess('PDF generado y abierto correctamente');
                
                return result;
            } else {
                throw new Error(result.message || 'Error al generar PDF');
            }
        } catch (error) {
            console.error('Error generando PDF:', error);
            setError(`Error al generar PDF: ${error.message}`);
            throw error;
        } finally {
            setGeneratingPDF(false);
        }
    };

    // Procesar auditoría
  const handleProcesar = async () => {
    try {
        setProcessing(true);
        setError('');
        setSuccess('');

        // Construir datos basados en meses seleccionados
        const aprobados = [];
        const rechazados = [];

        Object.entries(mesesSeleccionados).forEach(([medicamentoKey, meses]) => {
            const mesesAprobados = Object.entries(meses)
                .filter(([_mes, seleccionado]) => seleccionado)
                .map(([_mes]) => _mes);

            if (mesesAprobados.length > 0) {
                aprobados.push(medicamentoKey);
            } else {
                rechazados.push(medicamentoKey);
            }
        });

        const datos = {
            chequedos: aprobados.join(','),
            nochequeados: rechazados.join(','),
            cobert1: coberturas[1] || '50',
            cobert2: coberturas[2] || '50',
            cobert3: coberturas[3] || '50',
            cobert4: coberturas[4] || '50',
            cobert2_1: tiposCobertura[1] || 'CE',
            cobert2_2: tiposCobertura[2] || 'CE',
            cobert2_3: tiposCobertura[3] || 'CE',
            cobert2_4: tiposCobertura[4] || 'CE',
            nota,
            estadoIdentidad: identidadReservada ? 1 : 0,
            mesesSeleccionados: JSON.stringify(mesesSeleccionados)
        };

        console.log('Procesando auditoría con datos:', datos);

        // 1. PROCESAR LA AUDITORÍA BÁSICA PRIMERO
        const result = await auditoriasService.procesarAuditoria(id, datos);

        if (result.success) {
            setSuccess('Auditoría procesada correctamente.');
            
            // 🔥 LOGS DE VERIFICACIÓN - CORREGIDOS
            console.log('🔥 === RESULTADO DEL PROCESAMIENTO ===');
            console.log('📊 Result completo:', result);
            console.log('📊 Result.data:', result.data);
            
            // 🔥 CORRECCIÓN: Leer desde result.data.data (no result.data)
            const auditoriaData = result.data.data || result.data; // Fallback por si cambia la estructura
            
            console.log('📊 auditoriaData:', auditoriaData);
            console.log('🔥 necesita_farmalink:', auditoriaData.necesita_farmalink);
            console.log('📋 farmalink_data:', auditoriaData.farmalink_data);
            console.log('📊 Medicamentos aprobados:', aprobados.length);
            console.log('📋 Lista aprobados:', aprobados);
            
            // 2. 🔥 VERIFICAR SI NECESITA PROCESAMIENTO FARMALINK - CORREGIDO
            if (auditoriaData.necesita_farmalink && aprobados.length > 0) {
                console.log('🔥 ===== INICIANDO PROCESAMIENTO FARMALINK =====');
                console.log('✅ Condición 1: necesita_farmalink =', auditoriaData.necesita_farmalink);
                console.log('✅ Condición 2: aprobados.length =', aprobados.length);
                
                // Preparar datos para Farmalink
                const datosFarmalink = {
                    chequedos: datos.chequedos,
                    cobert1: datos.cobert1,
                    cobert2: datos.cobert2,
                    cobert3: datos.cobert3,
                    cobert4: datos.cobert4,
                    cobert2_1: datos.cobert2_1,
                    cobert2_2: datos.cobert2_2,
                    cobert2_3: datos.cobert2_3,
                    cobert2_4: datos.cobert2_4,
                    idaudi: id,
                    estadoIdentidad: datos.estadoIdentidad
                };

                console.log('📋 Datos preparados para Farmalink:', datosFarmalink);

                // 3. PROCESAR CON FARMALINK
                await procesarConFarmalink(datosFarmalink, async (exitoso) => {
                    try {
                        console.log('🏁 Callback Farmalink ejecutado. Exitoso:', exitoso);
                        
                        if (exitoso) {
                            console.log('✅ Procesamiento Farmalink exitoso');
                            setSuccess('Auditoría y validación Farmalink completadas. Generando PDF...');
                        } else {
                            console.log('⚠️ Errores en procesamiento Farmalink, pero continuando...');
                            setSuccess('Auditoría procesada con algunos errores en Farmalink. Generando PDF...');
                        }
                        
                        // 4. GENERAR PDF DESPUÉS DEL PROCESAMIENTO
                        await generarPDFAuditoria();
                        
                        // 5. REDIRIGIR DESPUÉS DE UN MOMENTO
                        setTimeout(() => {
                            navigate('/pendientes');
                        }, 3000);
                        
                    } catch (pdfError) {
                        console.error('Error generando PDF:', pdfError);
                        setSuccess('Auditoría procesada, pero hubo error al generar PDF');
                        
                        setTimeout(() => {
                            navigate('/pendientes');
                        }, 3000);
                    }
                });
            } else {
                console.log('❌ === NO SE REQUIERE FARMALINK ===');
                console.log('❌ Razón: necesita_farmalink =', auditoriaData.necesita_farmalink);
                console.log('❌ Razón: aprobados.length =', aprobados.length);
                
                // Flujo normal sin Farmalink
                setSuccess('Auditoría procesada correctamente. Generando PDF...');
                
                try {
                    await generarPDFAuditoria();
                    
                    setTimeout(() => {
                        navigate('/pendientes');
                    }, 3000);
                } catch (pdfError) {
                    console.error('Error al generar PDF:', pdfError);
                    setSuccess('Auditoría procesada correctamente, pero hubo un error al generar el PDF');
                    
                    setTimeout(() => {
                        navigate('/pendientes');
                    }, 3000);
                }
            }
        } else {
            setError(result.message);
        }
    } catch (error) {
        console.error('Error procesando auditoría:', error);
        setError('Error inesperado al procesar la auditoría');
    } finally {
        setProcessing(false);
    }
};


    // Descargar PDF manualmente
    const handleDescargarPDF = async () => {
        try {
            setGeneratingPDF(true);
            
            const estadoIdentidad = identidadReservada ? 1 : 0;
            
            await auditoriasService.descargarPDF(id, estadoIdentidad);
            
            setSuccess('PDF descargado correctamente');
        } catch (error) {
            console.error('Error descargando PDF:', error);
            setError(`Error al descargar PDF: ${error.message}`);
        } finally {
            setGeneratingPDF(false);
        }
    };

    // Enviar a médico auditor
    const handleEnviarMedico = async () => {
        if (!window.confirm('¿Está seguro de enviar esta auditoría al médico auditor?')) {
            return;
        }

        try {
            setProcessing(true);
            setError('');

            const result = await auditoriasService.enviarMedicoAuditor(id);

            if (result.success) {
                setSuccess('Auditoría enviada al médico auditor correctamente');
                setTimeout(() => {
                    navigate('/pendientes');
                }, 2000);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error enviando a médico:', error);
            setError('Error inesperado al enviar al médico auditor');
        } finally {
            setProcessing(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-4 lg:p-6">
                <Loading text="Cargando auditoría..." />
            </div>
        );
    }

    // Error state
    if (error && !auditoria) {
        return (
            <div className="p-4 lg:p-6 space-y-6">
                <Breadcrumb items={breadcrumbItems} />
                <ErrorMessage
                    message={error}
                    onRetry={() => window.location.reload()}
                />
            </div>
        );
    }
<ModalProgresoFarmalink
    visible={modalVisible}
    progreso={progreso}
    mensaje={mensaje}
    procesando={procesandoFarmalink}
    errores={errores}
    onCerrar={cerrarModal}
/>
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Breadcrumb */}
            <div className="mb-4">
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

            {/* Card principal */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-300 overflow-hidden">

                {/* Header con título */}
                <div className="bg-blue-600 text-white px-6 py-4">
                    <h1 className="text-lg font-semibold flex items-center">
                        <UserIcon className="h-5 w-5 mr-2" />
                        Auditoría médica TRATAMIENTO PROLONGADO
                    </h1>
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
                                        <div className="font-semibold">{auditoria?.paciente?.apellido || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Nombre:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.nombre || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">DNI:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.dni || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Sexo:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.sexo || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Edad:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.edad ? `${auditoria.paciente.edad} años` : 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Talla:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.talla || 0}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Peso:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.peso || 0}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Teléfono:</span>
                                        <div className="font-semibold">{auditoria?.paciente?.telefono || '-'}</div>
                                    </div>
                                </div>
                                <div className="col-span-2 pt-1">
                                    <span className="text-gray-600 text-sm">Email:</span>
                                    <div className="font-semibold text-sm">{auditoria?.paciente?.email || '-'}</div>
                                </div>
                                
                                {/* Identidad Reservada */}
                                {auditoria?.paciente?.identidadreserv == 1 && (
                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="flex items-start space-x-2">
                                            <input
                                                type="checkbox"
                                                id="identidadReservada"
                                                checked={identidadReservada}
                                                onChange={(e) => setIdentidadReservada(e.target.checked)}
                                                disabled={auditoria?.botonesDeshabilitados}
                                                className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                                            />
                                            <div className="text-xs">
                                                <label htmlFor="identidadReservada" className="font-medium text-gray-700">
                                                    Identidad Reservada
                                                </label>
                                                <p className="text-gray-500 mt-1">
                                                    Ley 23798, Decreto Reglamentario 1244/91. 
                                                    Mantener tildado para conservar o destildar para quitar.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                    <div className="font-semibold">{auditoria?.medico?.nombre || 'Sin datos'}</div>
                                    <div className="text-blue-600 font-medium text-xs">
                                        MP-{auditoria?.medico?.matricula || 'N/A'} | ME-{auditoria?.medico?.matricespec_prescr || 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Especialidad:</span>
                                    <div className="font-semibold text-green-700">{auditoria?.medico?.especialidad || 'Sin especialidad'}</div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Fecha atención:</span>
                                    <div className="font-semibold">
                                        {auditoria?.diagnostico?.fechaemision ? 
                                            new Date(auditoria.diagnostico.fechaemision).toLocaleDateString('es-ES', { 
                                                day: 'numeric', 
                                                month: 'long', 
                                                year: 'numeric' 
                                            }) : 
                                            'Sin fecha'
                                        }
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600">Diagnóstico:</span>
                                    <div className="font-semibold">{auditoria?.diagnostico?.diagnostico || 'Sin diagnóstico'}</div>
                                </div>
                            </div>
                        </div>

                        {/* DIAGNÓSTICO COMPLETO */}
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg">
                            <div className="bg-yellow-200 px-4 py-2 border-b border-yellow-300">
                                <h3 className="text-sm font-semibold text-yellow-800 flex items-center">
                                    🔍 DIAGNÓSTICO COMPLETO
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                                    <div className="font-semibold text-yellow-900 text-sm">
                                        {auditoria?.diagnostico?.diagnostico || 'Sin diagnóstico'}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600">
                                    <span className="font-medium">Fecha emisión:</span> {
                                        auditoria?.diagnostico?.fechaemision ? 
                                            new Date(auditoria.diagnostico.fechaemision).toLocaleString('es-ES') : 
                                            'Sin fecha'
                                    }
                                </div>
                                {auditoria?.diagnostico?.diagnostico2 && (
                                    <div className="bg-white border border-gray-200 rounded p-3 text-xs">
                                        <div className="text-gray-700">
                                            <span className="font-medium">Resumen de Historia Clínica:</span><br />
                                            {auditoria.diagnostico.diagnostico2}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabla de medicamentos */}
                    {auditoria?.medicamentos && auditoria.medicamentos.length > 0 && (
                        <div className="mb-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-4 py-3">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    💊 Medicamentos para Auditoría
                                </h3>
                            </div>

                            <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-100 border-b border-gray-200">
                                            <tr>
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
                                                    DOSIS
                                                </th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    COBERTURA
                                                </th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    TIPO
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES1
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES2
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES3
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES4
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES5
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r border-gray-200">
                                                    MES6
                                                </th>
                                                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                                                    TODOS
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditoria.medicamentos.map((medicamento, index) => {
                                                const key = `${medicamento.idreceta}_${medicamento.nro_orden}`;
                                                const meses = mesesSeleccionados[key] || {
                                                    mes1: false,
                                                    mes2: false,
                                                    mes3: false,
                                                    mes4: false,
                                                    mes5: false,
                                                    mes6: false
                                                };
                                                const todosSeleccionados = Object.values(meses).every(mes => mes);
                                                
                                                return (
                                                    <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                        {/* Nombre Comercial */}
                                                        <td className="px-4 py-3 text-sm border-r border-gray-200">
                                                            <div className="font-medium text-gray-900">
                                                                {medicamento.nombre_comercial}
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Monodroga */}
                                                        <td className="px-4 py-3 text-sm border-r border-gray-200">
                                                            {medicamento.monodroga || '-'}
                                                        </td>
                                                        
                                                        {/* Presentación */}
                                                        <td className="px-4 py-3 text-sm border-r border-gray-200">
                                                            {medicamento.presentacion || '-'}
                                                        </td>
                                                        
                                                        {/* Cantidad */}
                                                        <td className="px-3 py-3 text-sm text-center border-r border-gray-200">
                                                            {medicamento.cantprescripta}
                                                        </td>
                                                        
                                                        {/* Dosis */}
                                                        <td className="px-3 py-3 text-sm text-center border-r border-gray-200">
                                                            {medicamento.posologia || '-'}
                                                        </td>
                                                        
                                                        {/* Cobertura */}
                                                        <td className="px-3 py-3 text-center border-r border-gray-200">
                                                            <select
                                                                value={coberturas[medicamento.nro_orden] || medicamento.cobertura || 50}
                                                                onChange={(e) => handleCoberturaChange(medicamento.nro_orden, e.target.value)}
                                                                disabled={auditoria?.botonesDeshabilitados}
                                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                                                            >
                                                                <option value="50">50%</option>
                                                                <option value="70">70%</option>
                                                                <option value="100">100%</option>
                                                            </select>
                                                        </td>
                                                        
                                                        {/* Tipo Cobertura */}
                                                        <td className="px-3 py-3 text-center border-r border-gray-200">
                                                            <select
                                                                value={tiposCobertura[medicamento.nro_orden] || medicamento.cobertura2 || 'CE'}
                                                                onChange={(e) => handleTipoCoberturaChange(medicamento.nro_orden, e.target.value)}
                                                                disabled={auditoria?.botonesDeshabilitados}
                                                                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                                                            >
                                                                <option value="CE">CE</option>
                                                                <option value="CA">CA</option>
                                                                <option value="PE">PE</option>
                                                                <option value="BIAC">BIAC</option>
                                                                <option value="DSC">DSC</option>
                                                                <option value="HO">HO</option>
                                                                <option value="HO100">HO100</option>
                                                                <option value="INSU">INSU</option>
                                                                <option value="LECH">LECH</option>
                                                                <option value="ONC">ONC</option>
                                                                <option value="TR">TR</option>
                                                                <option value="PM">PM</option>
                                                                <option value="PI">PI</option>
                                                            </select>
                                                        </td>
                                                        
                                                        {/* Checkboxes para cada mes */}
                                                        {[1, 2, 3, 4, 5, 6].map((mesNum) => {
                                                            // 🔥 Determinar cuántos meses tiene este medicamento
                                                            const mesesPermitidos = medicamento.meses || medicamento.cantmeses || auditoria.cantmeses || 6;
                                                            // 🔥 Este checkbox está deshabilitado si el mes excede los meses permitidos
                                                            const mesDeshabilitado = mesNum > mesesPermitidos;

                                                            return (
                                                                <td
                                                                    key={`mes${mesNum}`}
                                                                    className="px-2 py-3 text-center border-r border-gray-200"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={meses[`mes${mesNum}`]}
                                                                        onChange={() => handleMesChange(key, `mes${mesNum}`)}
                                                                        disabled={auditoria?.botonesDeshabilitados || mesDeshabilitado}
                                                                        className={`h-5 w-5 appearance-none border-2 rounded cursor-pointer disabled:opacity-50 relative ${
                                                                            mesDeshabilitado
                                                                                ? 'bg-gray-300 border-gray-400 cursor-not-allowed'
                                                                                : meses[`mes${mesNum}`]
                                                                                    ? 'bg-green-500 border-green-600 after:content-["✓"] after:text-white after:text-base after:font-bold after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2'
                                                                                    : 'bg-red-500 border-red-600'
                                                                        }`}
                                                                    />
                                                                </td>
                                                            );
                                                        })}
                                                        
                                                        {/* Checkbox Todos */}
                                                        <td className="px-3 py-3 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={todosSeleccionados}
                                                                onChange={() => handleTodosChange(key)}
                                                                disabled={auditoria?.botonesDeshabilitados}
                                                                className={`h-5 w-5 appearance-none border-2 rounded cursor-pointer disabled:opacity-50 relative ${
                                                                    todosSeleccionados
                                                                        ? 'bg-green-500 border-green-600 after:content-["✓"] after:text-white after:text-base after:font-bold after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2'
                                                                        : 'bg-red-500 border-red-600'
                                                                }`}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Resumen de selección */}
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Medicamentos seleccionados:</strong> {
                                        Object.keys(mesesSeleccionados).filter(key => 
                                            Object.values(mesesSeleccionados[key]).some(mes => mes)
                                        ).length
                                    } de {auditoria.medicamentos.length}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Nota */}
                    <div className="mb-6">
                        <div className="bg-gray-50 border border-gray-200 rounded-t-lg px-4 py-3">
                            <h3 className="text-lg font-semibold text-gray-800">Nota</h3>
                        </div>
                        <div className="border border-t-0 border-gray-200 rounded-b-lg p-4 bg-white">
                            <textarea
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Esta nota impacta en el cuerpo del email que el afiliado recibe."
                                disabled={auditoria?.botonesDeshabilitados}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200">
                        {!auditoria?.botonesDeshabilitados && (
                            <>
                                <button
                                    onClick={handleEnviarMedico}
                                    disabled={processing || generatingPDF}
                                    className="px-6 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center"
                                >
                                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                                    {processing ? 'Enviando...' : 'Enviar a Médico Auditor'}
                                </button>

                                <button
                                        onClick={handleProcesar}
                                        disabled={processing || generatingPDF || procesandoFarmalink}
                                        className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                                    >
                                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                                        {processing || procesandoFarmalink ? (
                                            <>
                                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                                {procesandoFarmalink ? 'Validando con Farmalink...' : 'Procesando...'}
                                            </>
                                        ) : (
                                            'Confirmar Auditoría'
                                        )}
                                    </button>

                                {/* Botón para generar PDF manualmente (solo si la auditoría ya fue procesada) */}
                                {auditoria?.auditado && (
                                    <button
                                        onClick={handleDescargarPDF}
                                        disabled={processing || generatingPDF}
                                        className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
                                    >
                                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                        {generatingPDF ? 'Generando...' : 'Descargar PDF'}
                                    </button>
                                )}
                            </>
                        )}

                        <button
                            onClick={() => navigate('/pendientes')}
                            disabled={processing || generatingPDF}
                            className="px-6 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>

                    {/* Información de estado bloqueado */}
                    {auditoria?.botonesDeshabilitados && (
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex">
                                <XMarkIcon className="h-5 w-5 text-yellow-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Auditoría bloqueada
                                    </h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Esta auditoría ha sido enviada al médico auditor y no puede ser modificada.
                                    </p>
                                    {/* Mostrar botón de descargar PDF si la auditoría está procesada */}
                                    {auditoria?.auditado && (
                                        <div className="mt-3">
                                            <button
                                                onClick={handleDescargarPDF}
                                                disabled={generatingPDF}
                                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                                            >
                                                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                                {generatingPDF ? 'Generando...' : 'Descargar PDF'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Indicador de procesamiento */}
                    {(processing || generatingPDF) && (
                        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                            <div className="flex">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        {processing && !generatingPDF && 'Procesando auditoría...'}
                                        {generatingPDF && 'Generando PDF...'}
                                        {processing && generatingPDF && 'Procesando auditoría y generando PDF...'}
                                    </h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Por favor, espere mientras se completa la operación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProcesarAuditoria;
// src/pages/AltoCosto/ProcesarAuditoriaAltoCosto.jsx - COMPLETO DESDE CERO
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auditoriasService } from '../../services/auditoriasService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
    UserIcon,
    CheckCircleIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const ProcesarAuditoriaAltoCosto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados principales
    const [auditoria, setAuditoria] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados específicos para alto costo
    const [mesesSeleccionados, setMesesSeleccionados] = useState({});
    const [coberturas, setCoberturas] = useState({});
    const [tiposCobertura, setTiposCobertura] = useState({});
    const [costosEstimados, setCostosEstimados] = useState({});
    const [justificacionesMedicas, setJustificacionesMedicas] = useState({});
    const [notaGeneral, setNotaGeneral] = useState('');
    const [requiereAutorizacion, setRequiereAutorizacion] = useState({});

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Auditoría Alto Costo', href: '/alto-costo' },
        { name: 'Pendientes', href: '/alto-costo/pendientes' },
        { name: `Auditoría Alto Costo #${id}`, href: `/alto-costo/auditoria/${id}`, current: true }
    ];

    // Opciones específicas para medicamentos de alto costo
    const opcionesCobertura = [
        { value: '70', label: '70% - Cobertura Estándar' },
        { value: '80', label: '80% - Cobertura Ampliada' },
        { value: '90', label: '90% - Cobertura Especial' },
        { value: '100', label: '100% - Cobertura Total' }
    ];

    const tiposCoberturaMedicamento = [
        { value: 'ONC', label: 'ONC - Oncológico' },
        { value: 'HO', label: 'HO - Medicamento Huérfano' },
        { value: 'BIAC', label: 'BIAC - Biotecnología Avanzada' },
        { value: 'CE', label: 'CE - Cobertura Especial' },
        { value: 'DSC', label: 'DSC - Discapacidad' },
        { value: 'INM', label: 'INM - Inmunosupresores' },
        { value: 'NEU', label: 'NEU - Neurológicos Especiales' }
    ];

    const nivelesRiesgo = [
        { value: 'BAJO', label: 'Riesgo Bajo', color: 'green' },
        { value: 'MEDIO', label: 'Riesgo Medio', color: 'yellow' },
        { value: 'ALTO', label: 'Riesgo Alto', color: 'orange' },
        { value: 'CRITICO', label: 'Riesgo Crítico', color: 'red' }
    ];

    // Cargar datos de la auditoría
    useEffect(() => {
        loadAuditoria();
    }, [id]);

    const loadAuditoria = async () => {
        try {
            setLoading(true);
            setError('');
            
            console.log('🔍 Cargando auditoría Alto Costo ID:', id);
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auditorias/${id}?tipo=alto-costo`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            console.log('📊 RESPUESTA COMPLETA DEL SERVIDOR ALTO COSTO');
            console.log('Success:', result.success);
            console.log('Data:', result.data);
            
            if (result.success && result.data) {
                console.log('👤 Datos del paciente:', result.data.paciente);
                console.log('👨‍⚕️ Datos del médico:', result.data.medico);
                console.log('🔬 Datos del diagnóstico:', result.data.diagnostico);
                console.log('💊 Medicamentos Alto Costo:', result.data.medicamentos);
                
                setAuditoria(result.data);
                
                // Inicializar estados específicos para medicamentos de alto costo
                if (result.data.medicamentos && result.data.medicamentos.length > 0) {
                    const mesesInit = {};
                    const coberturasInit = {};
                    const tiposInit = {};
                    const costosInit = {};
                    const justificacionesInit = {};
                    const autorizacionesInit = {};
                    
                    result.data.medicamentos.forEach((med) => {
                        const key = `${med.idreceta}_${med.renglon}`;
                        
                        // Inicializar meses
                        mesesInit[key] = {
                            mes1: false, mes2: false, mes3: false,
                            mes4: false, mes5: false, mes6: false
                        };
                        
                        // Configuración específica para alto costo
                        coberturasInit[med.renglon] = med.cobertura || '100';
                        tiposInit[med.renglon] = med.tipo || 'ONC';
                        costosInit[med.renglon] = med.costo_estimado || 'ALTO';
                        justificacionesInit[med.renglon] = med.justificacion_medica || '';
                        autorizacionesInit[med.renglon] = med.requiere_autorizacion || false;
                    });
                    
                    setMesesSeleccionados(mesesInit);
                    setCoberturas(coberturasInit);
                    setTiposCobertura(tiposInit);
                    setCostosEstimados(costosInit);
                    setJustificacionesMedicas(justificacionesInit);
                    setRequiereAutorizacion(autorizacionesInit);
                }
                
                setError('');
            } else {
                console.error('❌ Respuesta inválida:', result);
                setError(result.message || 'No se pudo cargar la auditoría de alto costo');
                setAuditoria(null);
            }
        } catch (error) {
            console.error('💥 Error cargando auditoría alto costo:', error);
            setError(`Error al cargar los datos de alto costo: ${error.message}`);
            setAuditoria(null);
        } finally {
            setLoading(false);
        }
    };

    // ===== MANEJADORES DE EVENTOS =====

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

    // Seleccionar/deseleccionar todos los meses
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

    // Manejar cambio de costo estimado
    const handleCostoChange = (renglon, value) => {
        setCostosEstimados(prev => ({
            ...prev,
            [renglon]: value
        }));
    };

    // Manejar justificación médica
    const handleJustificacionChange = (renglon, value) => {
        setJustificacionesMedicas(prev => ({
            ...prev,
            [renglon]: value
        }));
    };

    // Manejar requerimiento de autorización
    const handleAutorizacionChange = (renglon, checked) => {
        setRequiereAutorizacion(prev => ({
            ...prev,
            [renglon]: checked
        }));
    };

    // ===== ACCIONES PRINCIPALES =====

    // Procesar auditoría de alto costo
    const handleProcesar = async () => {
        try {
            setProcessing(true);
            setError('');

            // Validar que al menos un medicamento esté seleccionado
            const haySeleccionados = Object.values(mesesSeleccionados).some(meses => 
                Object.values(meses).some(mes => mes)
            );

            if (!haySeleccionados) {
                setError('Debe seleccionar al menos un mes para un medicamento');
                return;
            }

            // Construir datos específicos para alto costo
            const aprobados = [];
            const rechazados = [];

            Object.entries(mesesSeleccionados).forEach(([medicamentoKey, meses]) => {
                const mesesAprobados = Object.entries(meses)
                    .filter(([mes, seleccionado]) => seleccionado)
                    .map(([mes]) => mes);

                if (mesesAprobados.length > 0) {
                    aprobados.push(medicamentoKey);
                } else {
                    rechazados.push(medicamentoKey);
                }
            });

            const datosAltoCosto = {
                // Datos básicos
                chequedos: aprobados.join(','),
                nochequeados: rechazados.join(','),
                
                // Coberturas específicas para alto costo
                cobert1: coberturas[1] || '100',
                cobert2: coberturas[2] || '100',
                cobert3: coberturas[3] || '100',
                cobert4: coberturas[4] || '100',
                
                // Tipos de cobertura especializados
                cobert2_1: tiposCobertura[1] || 'ONC',
                cobert2_2: tiposCobertura[2] || 'ONC',
                cobert2_3: tiposCobertura[3] || 'ONC',
                cobert2_4: tiposCobertura[4] || 'ONC',
                
                // Datos específicos de alto costo
                nota: notaGeneral,
                estadoIdentidad: 0,
                tipo: 'alto-costo',
                
                // Información adicional para alto costo
                mesesSeleccionados: JSON.stringify(mesesSeleccionados),
                costosEstimados: JSON.stringify(costosEstimados),
                justificacionesMedicas: JSON.stringify(justificacionesMedicas),
                requiereAutorizacion: JSON.stringify(requiereAutorizacion),
                
                // Metadatos de procesamiento
                procesadoPor: user?.id,
                fechaProcesamiento: new Date().toISOString(),
                categoriaEspecial: 'ALTO_COSTO'
            };

            console.log('📤 Enviando datos de alto costo:', datosAltoCosto);

            const result = await auditoriasService.procesarAuditoria(id, datosAltoCosto);

            if (result.success) {
                setSuccess('✅ Auditoría de alto costo procesada correctamente');
                setTimeout(() => {
                    navigate('/alto-costo/pendientes');
                }, 2500);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('💥 Error procesando auditoría alto costo:', error);
            setError('Error inesperado al procesar la auditoría de alto costo');
        } finally {
            setProcessing(false);
        }
    };

    // Enviar a médico auditor especializado
    const handleEnviarMedicoEspecializado = async () => {
        if (!window.confirm('¿Está seguro de enviar esta auditoría de alto costo al médico auditor especializado en tratamientos de alto costo?')) {
            return;
        }

        try {
            setProcessing(true);
            setError('');

            const datosEspecializados = {
                tipo: 'alto-costo',
                requiereEvaluacionEspecializada: true,
                motivoDerivacion: 'Medicamentos de alto costo requieren evaluación especializada',
                procesadoPor: user?.id,
                fechaDerivacion: new Date().toISOString()
            };

            const result = await auditoriasService.enviarMedicoAuditor(id, datosEspecializados);

            if (result.success) {
                setSuccess('✅ Auditoría de alto costo enviada al médico auditor especializado correctamente');
                setTimeout(() => {
                    navigate('/alto-costo/pendientes');
                }, 2500);
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('💥 Error enviando a médico especializado:', error);
            setError('Error inesperado al enviar al médico auditor especializado');
        } finally {
            setProcessing(false);
        }
    };

    // ===== FUNCIONES AUXILIARES =====

    // Obtener color según el tipo de cobertura
    const getColorTipoCobertura = (tipo) => {
        const colores = {
            'ONC': 'bg-red-100 text-red-800',
            'HO': 'bg-purple-100 text-purple-800',
            'BIAC': 'bg-blue-100 text-blue-800',
            'CE': 'bg-green-100 text-green-800',
            'DSC': 'bg-yellow-100 text-yellow-800',
            'INM': 'bg-indigo-100 text-indigo-800',
            'NEU': 'bg-pink-100 text-pink-800'
        };
        return colores[tipo] || 'bg-gray-100 text-gray-800';
    };

    // Calcular resumen de selección
    const calcularResumenSeleccion = () => {
        const totalMedicamentos = auditoria?.medicamentos?.length || 0;
        const medicamentosSeleccionados = Object.keys(mesesSeleccionados).filter(key => 
            Object.values(mesesSeleccionados[key]).some(mes => mes)
        ).length;
        
        return { totalMedicamentos, medicamentosSeleccionados };
    };

    // ===== RENDERIZADO =====

    // Loading state
    if (loading) {
        return (
            <div className="p-4 lg:p-6">
                <Loading text="🔄 Cargando auditoría de alto costo..." />
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

    const { totalMedicamentos, medicamentosSeleccionados } = calcularResumenSeleccion();

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Breadcrumb */}
            <div className="mb-4">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Mensajes de estado */}
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

            {/* Card principal de alto costo */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-orange-300 overflow-hidden">

                {/* Header especializado para alto costo */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4">
                    <h1 className="text-lg font-semibold flex items-center">
                        <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                        AUDITORÍA MÉDICA - TRATAMIENTO ALTO COSTO
                        <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 bg-opacity-50">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            Evaluación Especializada Requerida
                        </span>
                    </h1>
                </div>

                {/* Contenido principal */}
                <div className="p-6">

                    {/* Información del paciente, médico y diagnóstico */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                        {/* PACIENTE */}
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg">
                            <div className="bg-gray-200 px-4 py-3 border-b border-gray-300">
                                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    DATOS DEL PACIENTE
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-2 gap-x-3 text-sm">
                                    <div>
                                        <span className="text-gray-600 font-medium">Apellido:</span>
                                        <div className="font-semibold text-gray-900">{auditoria?.paciente?.apellido || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Nombre:</span>
                                        <div className="font-semibold text-gray-900">{auditoria?.paciente?.nombre || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">DNI:</span>
                                        <div className="font-semibold text-blue-700 font-mono">{auditoria?.paciente?.dni || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Sexo:</span>
                                        <div className="font-semibold text-gray-900">{auditoria?.paciente?.sexo || 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Edad:</span>
                                        <div className="font-semibold text-gray-900">{auditoria?.paciente?.edad ? `${auditoria.paciente.edad} años` : 'Sin datos'}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Peso:</span>
                                        <div className="font-semibold text-gray-900">{auditoria?.paciente?.peso || 'N/A'} kg</div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600 font-medium">Teléfono:</span>
                                        <div className="font-semibold text-gray-900">{auditoria?.paciente?.telefono || 'No registrado'}</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="text-gray-600 font-medium text-sm">Email:</span>
                                    <div className="font-semibold text-sm text-gray-900">{auditoria?.paciente?.email || 'No registrado'}</div>
                                </div>
                            </div>
                        </div>

                        {/* MÉDICO ESPECIALISTA */}
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg">
                            <div className="bg-orange-200 px-4 py-3 border-b border-orange-300">
                                <h3 className="text-sm font-semibold text-orange-800 flex items-center">
                                    <HeartIcon className="h-4 w-4 mr-2" />
                                    MÉDICO ESPECIALISTA
                                </h3>
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                <div>
                                    <span className="text-orange-700 font-medium">Profesional:</span>
                                    <div className="font-semibold text-orange-900">DR. ALEJANDRA MARÍA NIORO</div>
                                    <div className="text-orange-600 font-medium text-xs mt-1">MP-255967 | ME-19465</div>
                                </div>
                                <div>
                                    <span className="text-orange-700 font-medium">Especialidad:</span>
                                    <div className="font-semibold text-orange-800">ONCOLOGÍA CLÍNICA</div>
                                </div>
                                <div>
                                    <span className="text-orange-700 font-medium">Fecha de atención:</span>
                                    <div className="font-semibold text-orange-900">31 de Marzo, 2025</div>
                                </div>
                                <div>
                                    <span className="text-orange-700 font-medium">Tipo de consulta:</span>
                                    <div className="font-semibold text-orange-800">Tratamiento Oncológico Especializado</div>
                                </div>
                                
                                {/* Indicador de especialización */}
                                <div className="mt-3 p-2 bg-orange-100 rounded border border-orange-300">
                                    <div className="flex items-center text-xs text-orange-800">
                                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                        <span className="font-medium">Médico habilitado para prescribir medicamentos de alto costo</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DIAGNÓSTICO Y TRATAMIENTO ESPECIALIZADO */}
                        <div className="bg-red-50 border-2 border-red-300 rounded-lg">
                            <div className="bg-red-200 px-4 py-3 border-b border-red-300">
                                <h3 className="text-sm font-semibold text-red-800 flex items-center">
                                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                                    DIAGNÓSTICO ALTO COSTO
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="bg-red-100 border border-red-300 rounded-md p-3">
                                    <div className="font-semibold text-red-900 text-sm">
                                        {auditoria?.diagnostico?.diagnostico || 'Neoplasia maligna. Tratamiento oncológico de alto costo'}
                                    </div>
                                </div>
                                
                                <div className="text-xs text-red-700">
                                    <span className="font-medium">Fecha de emisión:</span> 
                                    <div className="font-semibold">{auditoria?.diagnostico?.fechaemision || '2025-03-31T17:59:51.000Z'}</div>
                                </div>
                                
                                {auditoria?.diagnostico?.diagnostico2 && (
                                    <div className="bg-white border border-red-200 rounded p-3 text-xs">
                                        <div className="text-red-700">
                                            <span className="font-medium">Historia clínica:</span><br />
                                            <div className="mt-1">{auditoria.diagnostico.diagnostico2}</div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Alertas críticas para alto costo */}
                                <div className="space-y-2">
                                    <div className="bg-red-100 border border-red-200 rounded p-2">
                                        <div className="flex items-start">
                                            <CurrencyDollarIcon className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                                            <div className="text-xs text-red-800">
                                                <strong>Alto Costo:</strong> Medicamentos con valor superior a $50,000 por mes
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-yellow-100 border border-yellow-200 rounded p-2">
                                        <div className="flex items-start">
                                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                                            <div className="text-xs text-yellow-800">
                                                <strong>Atención:</strong> Requiere justificación médica detallada y autorización previa
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de medicamentos de alto costo */}
                    {auditoria?.medicamentos && auditoria.medicamentos.length > 0 && (
                        <div className="mb-8">
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-t-lg px-4 py-4">
                                <h3 className="text-lg font-semibold text-orange-800 flex items-center">
                                    <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                                    MEDICAMENTOS DE ALTO COSTO PARA AUDITORÍA
                                    <span className="ml-3 text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                        {auditoria.medicamentos.length} medicamento{auditoria.medicamentos.length !== 1 ? 's' : ''}
                                    </span>
                                </h3>
                            </div>

                            <div className="border-2 border-t-0 border-orange-200 rounded-b-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full" style={{ minWidth: '1600px' }}>
                                        <thead className="bg-gradient-to-r from-orange-100 to-red-100 border-b-2 border-orange-200">
                                            <tr>
                                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    MEDICAMENTO
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    MONODROGA
                                                </th>
                                                <th className="px-3 py-3 text-left text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    PRESENTACIÓN
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    CANT.
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    DOSIS
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    COBERTURA %
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    TIPO ESPECIALIZADO
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    COSTO ESTIMADO
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    AUTORIZACIÓN
                                                </th>
                                                <th className="px-1 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    M1
                                                </th>
                                                <th className="px-1 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    M2
                                                </th>
                                                <th className="px-1 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    M3
                                                </th>
                                                <th className="px-1 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    M4
                                                </th>
                                                <th className="px-1 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    M5
                                                </th>
                                                <th className="px-1 py-3 text-center text-xs font-bold text-gray-800 uppercase border-r border-orange-200">
                                                    M6
                                                </th>
                                                <th className="px-2 py-3 text-center text-xs font-bold text-gray-800 uppercase">
                                                    TODOS
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {auditoria.medicamentos.map((medicamento, index) => {
                                                const key = `${medicamento.idreceta}_${medicamento.renglon}`;
                                                const meses = mesesSeleccionados[key] || {
                                                    mes1: false, mes2: false, mes3: false,
                                                    mes4: false, mes5: false, mes6: false
                                                };
                                                const todosSeleccionados = Object.values(meses).every(mes => mes);
                                                
                                                return (
                                                    <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-orange-25'}>
                                                        {/* Nombre Comercial */}
                                                        <td className="px-3 py-4 text-sm border-r border-orange-200">
                                                            <div className="font-bold text-gray-900">
                                                                {medicamento.nombrecomercial}
                                                            </div>
                                                            <div className="text-xs text-orange-600 mt-1">
                                                                Lab: {medicamento.laboratorio || 'No especificado'}
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Monodroga */}
                                                        <td className="px-3 py-4 text-sm border-r border-orange-200">
                                                            <div className="font-medium text-gray-800">
                                                                {medicamento.monodroga || '-'}
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Presentación */}
                                                        <td className="px-3 py-4 text-sm border-r border-orange-200">
                                                            <div className="text-gray-700">
                                                                {medicamento.presentacion || '-'}
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Cantidad */}
                                                        <td className="px-2 py-4 text-sm text-center border-r border-orange-200">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                                                {medicamento.cantidad}
                                                            </span>
                                                        </td>
                                                        
                                                        {/* Dosis */}
                                                        <td className="px-2 py-4 text-sm text-center border-r border-orange-200">
                                                            <div className="text-gray-700 font-medium">
                                                                {medicamento.dosis || '-'}
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Cobertura % */}
                                                        <td className="px-2 py-4 text-center border-r border-orange-200">
                                                            <div className="flex flex-col items-center space-y-1">
                                                                <input
                                                                    type="number"
                                                                    min="70"
                                                                    max="100"
                                                                    step="10"
                                                                    value={coberturas[medicamento.renglon] || medicamento.cobertura || '100'}
                                                                    onChange={(e) => handleCoberturaChange(medicamento.renglon, e.target.value)}
                                                                    disabled={auditoria?.botonesDeshabilitados}
                                                                    className="w-16 px-2 py-1 text-sm text-center border-2 border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 font-bold"
                                                                />
                                                                <span className="text-xs text-orange-600 font-medium">%</span>
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Tipo Especializado */}
                                                        <td className="px-2 py-4 text-center border-r border-orange-200">
                                                            <select
                                                                value={tiposCobertura[medicamento.renglon] || medicamento.tipo || 'ONC'}
                                                                onChange={(e) => handleTipoCoberturaChange(medicamento.renglon, e.target.value)}
                                                                disabled={auditoria?.botonesDeshabilitados}
                                                                className="px-2 py-1 text-xs border-2 border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 font-medium"
                                                            >
                                                                {tiposCoberturaMedicamento.map(tipo => (
                                                                    <option key={tipo.value} value={tipo.value}>
                                                                        {tipo.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                        
                                                        {/* Costo Estimado */}
                                                        <td className="px-2 py-4 text-center border-r border-orange-200">
                                                            <div className="space-y-1">
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                                                    {costosEstimados[medicamento.renglon] || 'ALTO'}
                                                                </span>
                                                                <div className="text-xs text-gray-600">
                                                                    +$50K/mes
                                                                </div>
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Autorización Requerida */}
                                                        <td className="px-2 py-4 text-center border-r border-orange-200">
                                                            <div className="flex flex-col items-center space-y-1">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={requiereAutorizacion[medicamento.renglon] || false}
                                                                    onChange={(e) => handleAutorizacionChange(medicamento.renglon, e.target.checked)}
                                                                    disabled={auditoria?.botonesDeshabilitados}
                                                                    className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500 disabled:opacity-50"
                                                                />
                                                                <span className="text-xs text-gray-600">
                                                                    {requiereAutorizacion[medicamento.renglon] ? 'SÍ' : 'NO'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        
                                                        {/* Checkboxes para cada mes */}
                                                        {[1, 2, 3, 4, 5, 6].map((mes) => (
                                                            <td key={`mes${mes}`} className="px-1 py-4 text-center border-r border-orange-200">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={meses[`mes${mes}`]}
                                                                    onChange={() => handleMesChange(key, `mes${mes}`)}
                                                                    disabled={auditoria?.botonesDeshabilitados}
                                                                    className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 disabled:opacity-50"
                                                                />
                                                            </td>
                                                        ))}
                                                        
                                                        {/* Checkbox Todos */}
                                                        <td className="px-2 py-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={todosSeleccionados}
                                                                onChange={() => handleTodosChange(key)}
                                                                disabled={auditoria?.botonesDeshabilitados}
                                                                className="h-5 w-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 disabled:opacity-50"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Resumen de selección especializado */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-bold text-orange-800">
                                            <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                                            Medicamentos de alto costo seleccionados: 
                                            <span className="ml-2 text-lg">{medicamentosSeleccionados} de {totalMedicamentos}</span>
                                        </p>
                                        <p className="text-xs text-orange-700 mt-1">
                                            ⚠️ Cada medicamento seleccionado requiere justificación médica detallada
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-700">
                                            Progreso de selección:
                                        </div>
                                        <div className="text-lg font-bold text-orange-600">
                                            {totalMedicamentos > 0 ? Math.round((medicamentosSeleccionados / totalMedicamentos) * 100) : 0}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sección de Justificaciones Médicas Individuales */}
                    {auditoria?.medicamentos && auditoria.medicamentos.length > 0 && (
                        <div className="mb-8">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-t-lg px-4 py-4">
                                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                    JUSTIFICACIONES MÉDICAS POR MEDICAMENTO
                                </h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Cada medicamento de alto costo debe tener justificación médica detallada
                                </p>
                            </div>
                            
                            <div className="border-2 border-t-0 border-blue-200 rounded-b-lg bg-white">
                                <div className="p-4 space-y-4">
                                    {auditoria.medicamentos.map((medicamento, index) => (
                                        <div key={`justif-${medicamento.renglon}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-bold text-blue-800">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="mb-2">
                                                        <h4 className="font-semibold text-gray-900">
                                                            {medicamento.nombrecomercial}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {medicamento.monodroga} - {tiposCobertura[medicamento.renglon] || 'ONC'}
                                                        </p>
                                                    </div>
                                                    <textarea
                                                        value={justificacionesMedicas[medicamento.renglon] || ''}
                                                        onChange={(e) => handleJustificacionChange(medicamento.renglon, e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder={`Justificación médica detallada para ${medicamento.nombrecomercial}. Incluya: diagnóstico específico, tratamientos previos fallidos, criterios de elegibilidad, duración estimada del tratamiento...`}
                                                        disabled={auditoria?.botonesDeshabilitados}
                                                    />
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Caracteres: {(justificacionesMedicas[medicamento.renglon] || '').length}/500
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nota General y Observaciones Clínicas */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-t-lg px-4 py-4">
                            <h3 className="text-lg font-semibold text-green-800">
                                NOTA GENERAL Y OBSERVACIONES CLÍNICAS
                            </h3>
                            <p className="text-sm text-green-700 mt-1">
                                Observaciones generales sobre el caso y consideraciones especiales
                            </p>
                        </div>
                        <div className="border-2 border-t-0 border-green-200 rounded-b-lg p-4 bg-white">
                            <textarea
                                value={notaGeneral}
                                onChange={(e) => setNotaGeneral(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Nota general sobre la auditoría de alto costo. Esta información será incluida en la comunicación al afiliado y en el expediente médico. Incluya cualquier consideración especial, recomendaciones de seguimiento, o aspectos relevantes del caso..."
                                disabled={auditoria?.botonesDeshabilitados}
                            />
                            <div className="mt-2 flex justify-between items-center">
                                <div className="text-xs text-green-600">
                                    💡 Esta nota se incluirá en el email que recibe el afiliado
                                </div>
                                <div className="text-xs text-gray-500">
                                    Caracteres: {notaGeneral.length}/1000
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción especializados */}
                    <div className="flex justify-center space-x-4 pt-6 border-t-2 border-gray-200">
                        {!auditoria?.botonesDeshabilitados && (
                            <>
                                <button
                                    onClick={handleEnviarMedicoEspecializado}
                                    disabled={processing}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200 shadow-lg"
                                >
                                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                                    {processing ? 'Enviando...' : 'Enviar a Médico Auditor Especializado'}
                                </button>

                                <button
                                    onClick={handleProcesar}
                                    disabled={processing || medicamentosSeleccionados === 0}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all duration-200 shadow-lg"
                                >
                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                    {processing ? 'Procesando...' : 'Confirmar Auditoría Alto Costo'}
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => navigate('/alto-costo/pendientes')}
                            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                        >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            Cancelar
                        </button>
                    </div>

                    {/* Información de estado bloqueado */}
                    {auditoria?.botonesDeshabilitados && (
                        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Auditoría de Alto Costo Bloqueada
                                    </h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Esta auditoría de medicamentos de alto costo ha sido enviada al médico auditor especializado 
                                        y no puede ser modificada. Los medicamentos requieren evaluación adicional debido a su 
                                        complejidad clínica y alto costo económico.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Información adicional para alto costo */}
                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CurrencyDollarIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Información sobre Medicamentos de Alto Costo
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium">Criterios de Alto Costo:</h4>
                                            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                                <li>Costo mensual superior a $50,000</li>
                                                <li>Medicamentos oncológicos especializados</li>
                                                <li>Terapias biológicas avanzadas</li>
                                                <li>Medicamentos huérfanos</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Requisitos Especiales:</h4>
                                            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                                <li>Justificación médica detallada</li>
                                                <li>Evaluación por especialista</li>
                                                <li>Autorización previa obligatoria</li>
                                                <li>Seguimiento clínico estricto</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcesarAuditoriaAltoCosto;
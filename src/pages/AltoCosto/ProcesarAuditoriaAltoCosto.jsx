// src/pages/AltoCosto/ProcesarAuditoriaAltoCosto.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import Breadcrumb from '../../components/common/Breadcrumb';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
    UserIcon,
    CheckCircleIcon,
    XMarkIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    HeartIcon,
    ShieldCheckIcon,
    ShoppingCartIcon
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

    // Estados para modales de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Estados para medicamentos (sin meses para alto costo)
    const [medicamentosSeleccionados, setMedicamentosSeleccionados] = useState({});
    const [coberturas, setCoberturas] = useState({});
    const [tiposCobertura, setTiposCobertura] = useState({});
    const [justificacionesMedicas, setJustificacionesMedicas] = useState({});
    const [notaGeneral, setNotaGeneral] = useState('');

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Auditoría Alto Costo', href: '/alto-costo' },
        { name: 'Pendientes', href: '/alto-costo/pendientes' },
        { name: `Auditoría #${id}`, href: `/alto-costo/auditoria/${id}`, current: true }
    ];

    // Opciones de cobertura para alto costo
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
        { value: 'INM', label: 'INM - Inmunosupresores' }
    ];

    // Cargar datos de la auditoría desde el endpoint
    useEffect(() => {
        const cargarAuditoria = async () => {
            try {
                setLoading(true);
                setError('');

                console.log('Cargando auditoría de alto costo ID:', id);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/alto-costo/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`
                    }
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                console.log('=== RESPUESTA COMPLETA DEL SERVIDOR ALTO COSTO ===');
                console.log('result:', result);
                console.log('result.success:', result.success);
                console.log('result.auditoria:', result.auditoria);

                if (result.success && result.auditoria) {
                    console.log('Datos del paciente:', result.auditoria.paciente);
                    console.log('Datos del médico:', result.auditoria.medico);
                    console.log('Medicamentos:', result.auditoria.medicamentos);

                    setAuditoria(result.auditoria);

                    // Inicializar estados basados en los medicamentos
                    if (result.auditoria.medicamentos && result.auditoria.medicamentos.length > 0) {
                        const seleccionadosInit = {};
                        const coberturasInit = {};
                        const tiposInit = {};
                        const justificacionesInit = {};

                        result.auditoria.medicamentos.forEach((med) => {
                            const renglon = med.nro_orden;
                            seleccionadosInit[renglon] = false; // Inicialmente no seleccionados
                            coberturasInit[renglon] = med.porcentajecobertura || 100;
                            tiposInit[renglon] = 'ONC'; // Por defecto oncológico para alto costo
                            justificacionesInit[renglon] = med.observacion || '';
                        });

                        setMedicamentosSeleccionados(seleccionadosInit);
                        setCoberturas(coberturasInit);
                        setTiposCobertura(tiposInit);
                        setJustificacionesMedicas(justificacionesInit);
                    }

                    // Inicializar nota general si existe
                    setNotaGeneral(result.auditoria.nota || '');

                    setError('');
                } else {
                    console.error('Respuesta inválida:', result);
                    setError(result.message || 'No se pudo cargar la auditoría de alto costo');
                    setAuditoria(null);
                }
            } catch (error) {
                console.error('Error cargando auditoría de alto costo:', error);
                setError(`Error al cargar los datos: ${error.message}`);
                setAuditoria(null);
            } finally {
                setLoading(false);
            }
        };

        cargarAuditoria();
    }, [id]);

    // ===== MANEJADORES DE EVENTOS =====

    // Manejar selección de medicamento (aprobado/rechazado)
    const handleMedicamentoChange = (renglon, aprobado) => {
        setMedicamentosSeleccionados(prev => ({
            ...prev,
            [renglon]: aprobado
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

    // Manejar justificación médica
    const handleJustificacionChange = (renglon, value) => {
        setJustificacionesMedicas(prev => ({
            ...prev,
            [renglon]: value
        }));
    };

    // ===== ACCIONES PRINCIPALES =====

    // Enviar a Compras (procesar auditoría de alto costo)
    const handleEnviarComprasClick = () => {
        const medicamentosAprobados = Object.entries(medicamentosSeleccionados)
            .filter(([_, aprobado]) => aprobado)
            .map(([renglon]) => renglon);

        if (medicamentosAprobados.length === 0) {
            setError('Debe aprobar al menos un medicamento para enviar a compras');
            return;
        }

        // Mostrar modal de confirmación
        setShowConfirmModal(true);
    };

    const handleEnviarCompras = async () => {
        try {
            setProcessing(true);
            setError('');

            // Construir strings en formato: "idreceta_nroorden,idreceta_nroorden"
            const chequedos = [];
            const nochequeados = [];

            auditoria.medicamentos.forEach(med => {
                const renglon = med.nro_orden;
                const idStr = `${id}_${renglon}`;

                if (medicamentosSeleccionados[renglon] === true) {
                    chequedos.push(idStr);
                } else if (medicamentosSeleccionados[renglon] === false) {
                    nochequeados.push(idStr);
                }
            });

            // Formato esperado por el backend
            const datosAuditoria = {
                chequedos: chequedos.join(','),        // "17_1,17_2"
                nochequeados: nochequeados.join(','),  // "17_3"
                nota: notaGeneral
            };

            // Agregar coberturas y tipos para cada medicamento
            auditoria.medicamentos.forEach((med, index) => {
                const renglon = med.nro_orden;
                const numeroMedicamento = index + 1;

                // Solo incluir coberturas y tipos para medicamentos aprobados
                if (medicamentosSeleccionados[renglon] === true) {
                    datosAuditoria[`cobert${numeroMedicamento}`] = coberturas[renglon] || 100;
                    datosAuditoria[`cobert2_${numeroMedicamento}`] = tiposCobertura[renglon] || 'ONC';

                    // Agregar justificación médica si existe
                    if (justificacionesMedicas[renglon]) {
                        datosAuditoria[`justificacion_${numeroMedicamento}`] = justificacionesMedicas[renglon];
                    }
                }
            });

            console.log('📤 Enviando auditoría de alto costo a procesar:', datosAuditoria);

            // Llamada al endpoint de procesamiento
            const response = await fetch(`${import.meta.env.VITE_API_URL}/alto-costo/${id}/procesar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosAuditoria)
            });

            const result = await response.json();

            console.log('📥 Respuesta del servidor:', result);

            if (result.success) {
                setSuccess('✅ Auditoría de alto costo procesada y enviada al área de Compras exitosamente. El área de Compras gestionará la cotización con proveedores.');

                // NO generamos PDF automáticamente en Alto Costo
                // El PDF solo se genera manualmente cuando se necesite
                console.log('✅ Auditoría enviada a Compras - Sin generación automática de PDF');

                setTimeout(() => {
                    navigate('/alto-costo/pendientes');
                }, 3500);

            } else {
                setError(result.message || 'Error al procesar la auditoría de alto costo');
            }

        } catch (error) {
            console.error('💥 Error enviando a compras:', error);
            setError('Error inesperado al procesar la auditoría de alto costo');
        } finally {
            setProcessing(false);
        }
    };

    // Rechazar auditoría completa
    const handleRechazarAuditoriaClick = () => {
        // Mostrar modal de confirmación
        setShowRejectModal(true);
    };

    const handleRechazarAuditoria = async () => {
        try {
            setProcessing(true);
            setError('');

            // Construir string de todos los medicamentos rechazados
            const nochequeados = auditoria.medicamentos.map(med => {
                return `${id}_${med.nro_orden}`;
            });

            // Formato esperado por el backend para rechazo total
            const datosRechazo = {
                chequedos: '',  // Ninguno aprobado
                nochequeados: nochequeados.join(','),  // Todos rechazados
                cobert1: 0,
                cobert2_1: 'RECHAZADO',
                nota: notaGeneral || 'Auditoría de alto costo rechazada por el auditor'
            };

            console.log('❌ Rechazando auditoría de alto costo:', datosRechazo);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/alto-costo/${id}/procesar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosRechazo)
            });

            const result = await response.json();

            if (result.success) {
                setSuccess('✅ Auditoría de alto costo rechazada correctamente');

                setTimeout(() => {
                    navigate('/alto-costo/pendientes');
                }, 2000);
            } else {
                setError(result.message || 'Error al rechazar la auditoría');
            }

        } catch (error) {
            console.error('💥 Error rechazando auditoría:', error);
            setError('Error inesperado al rechazar auditoría');
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
            'INM': 'bg-indigo-100 text-indigo-800'
        };
        return colores[tipo] || 'bg-gray-100 text-gray-800';
    };

    // Calcular resumen de selección
    const calcularResumen = () => {
        const totalMedicamentos = auditoria?.medicamentos?.length || 0;
        const aprobados = Object.values(medicamentosSeleccionados).filter(Boolean).length;
        const rechazados = totalMedicamentos - aprobados;

        return { totalMedicamentos, aprobados, rechazados };
    };

    // ===== RENDERIZADO =====

    if (loading) {
        return (
            <div className="p-4 lg:p-6">
                <Loading text="🔄 Cargando auditoría de alto costo..." />
            </div>
        );
    }

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

    const { totalMedicamentos, aprobados, rechazados } = calcularResumen();

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


            {/* Card principal */}
            <div className="bg-white rounded-lg shadow-lg border-2 border-orange-300 overflow-hidden">

                {/* Header especializado para alto costo */}
                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-4">
                    <h1 className="text-lg font-semibold flex items-center">
                        <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                        AUDITORÍA MÉDICA - TRATAMIENTO ALTO COSTO
                        <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500 bg-opacity-50">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            Evaluación Especializada
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
                                        <div className="font-semibold text-gray-900">{auditoria?.paciente?.peso || 'Sin datos'} kg</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="text-gray-600 font-medium text-sm">Teléfono:</span>
                                    <div className="font-semibold text-sm text-gray-900">{auditoria?.paciente?.telefono || '-'}</div>
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
                                    <div className="font-semibold text-orange-900">{auditoria?.medico?.nombre_completo || 'Sin datos'}</div>
                                    <div className="text-orange-600 font-medium text-xs mt-1">MP-{auditoria?.medico?.matricula || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="text-orange-700 font-medium">Especialidad:</span>
                                    <div className="font-semibold text-orange-800">{auditoria?.medico?.especialidad || 'Sin especialidad'}</div>
                                </div>
                                <div className="mt-3 p-2 bg-orange-100 rounded border border-orange-300">
                                    <div className="flex items-center text-xs text-orange-800">
                                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                                        <span className="font-medium">Médico habilitado para prescribir medicamentos de alto costo</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DIAGNÓSTICO */}
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
                                        {auditoria?.recetas?.[0]?.diagnostico || 'Sin diagnóstico'}
                                    </div>
                                </div>

                                {auditoria?.recetas?.[0]?.diagnostico2 && (
                                    <div className="bg-white border border-red-200 rounded p-3 text-xs">
                                        <div className="text-red-700">
                                            <span className="font-medium">Historia clínica:</span><br />
                                            <div className="mt-1">{auditoria.recetas[0].diagnostico2}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-red-100 border border-red-200 rounded p-2">
                                    <div className="flex items-start">
                                        <CurrencyDollarIcon className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                                        <div className="text-xs text-red-800">
                                            <strong>Alto Costo:</strong> Medicamentos especializados de alto valor económico
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de medicamentos simplificada (sin meses) */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-t-lg px-4 py-4">
                            <h3 className="text-lg font-semibold text-orange-800 flex items-center">
                                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                                MEDICAMENTOS DE ALTO COSTO PARA EVALUACIÓN
                                <span className="ml-3 text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                    {auditoria?.medicamentos?.length || 0} medicamento{auditoria?.medicamentos?.length !== 1 ? 's' : ''}
                                </span>
                            </h3>
                        </div>

                        <div className="border-2 border-t-0 border-orange-200 rounded-b-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-orange-100 to-red-100 border-b-2 border-orange-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase">
                                                MEDICAMENTO
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase">
                                                PRESENTACIÓN
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-bold text-gray-800 uppercase">
                                                CANTIDAD
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-bold text-gray-800 uppercase">
                                                DOSIS
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-bold text-gray-800 uppercase">
                                                COBERTURA %
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-bold text-gray-800 uppercase">
                                                TIPO
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase">
                                                DECISIÓN
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditoria?.medicamentos?.map((medicamento, index) => {
                                            const renglon = medicamento.nro_orden;
                                            const aprobado = medicamentosSeleccionados[renglon];

                                            return (
                                                <tr key={renglon} className={index % 2 === 0 ? 'bg-white' : 'bg-orange-25'}>
                                                    {/* Medicamento */}
                                                    <td className="px-4 py-4 text-sm">
                                                        <div className="font-bold text-gray-900">
                                                            {medicamento.nombre_comercial}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            {medicamento.monodroga}
                                                        </div>
                                                    </td>

                                                    {/* Presentación */}
                                                    <td className="px-4 py-4 text-sm text-gray-700">
                                                        {medicamento.presentacion}
                                                    </td>

                                                    {/* Cantidad */}
                                                    <td className="px-3 py-4 text-sm text-center">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                                            {medicamento.cantprescripta}
                                                        </span>
                                                    </td>

                                                    {/* Dosis */}
                                                    <td className="px-3 py-4 text-sm text-center text-gray-700">
                                                        {medicamento.posologia || '-'}
                                                    </td>

                                                    {/* Cobertura */}
                                                    <td className="px-3 py-4 text-center">
                                                        <select
                                                            value={coberturas[renglon]}
                                                            onChange={(e) => handleCoberturaChange(renglon, e.target.value)}
                                                            className="px-2 py-1 text-sm border-2 border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                                                        >
                                                            <option value="70">70%</option>
                                                            <option value="80">80%</option>
                                                            <option value="90">90%</option>
                                                            <option value="100">100%</option>
                                                        </select>
                                                    </td>

                                                    {/* Tipo */}
                                                    <td className="px-3 py-4 text-center">
                                                        <select
                                                            value={tiposCobertura[renglon]}
                                                            onChange={(e) => handleTipoCoberturaChange(renglon, e.target.value)}
                                                            className="px-2 py-1 text-xs border-2 border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                                                        >
                                                            {tiposCoberturaMedicamento.map(tipo => (
                                                                <option key={tipo.value} value={tipo.value}>
                                                                    {tipo.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    {/* Decisión */}
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-center space-x-2">
                                                                <button
                                                                    onClick={() => handleMedicamentoChange(renglon, true)}
                                                                    className={`px-3 py-1 text-xs font-medium rounded-md border-2 transition-all ${aprobado
                                                                            ? 'bg-green-100 text-green-800 border-green-300'
                                                                            : 'bg-white text-gray-600 border-gray-300 hover:border-green-300'
                                                                        }`}
                                                                >
                                                                    <CheckCircleIcon className="h-3 w-3 mr-1 inline" />
                                                                    Aprobar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMedicamentoChange(renglon, false)}
                                                                    className={`px-3 py-1 text-xs font-medium rounded-md border-2 transition-all ${aprobado === false
                                                                            ? 'bg-red-100 text-red-800 border-red-300'
                                                                            : 'bg-white text-gray-600 border-gray-300 hover:border-red-300'
                                                                        }`}
                                                                >
                                                                    <XMarkIcon className="h-3 w-3 mr-1 inline" />
                                                                    Rechazar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Resumen de decisiones */}
                        <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-gray-800">{totalMedicamentos}</div>
                                    <div className="text-sm text-gray-600">Total Medicamentos</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-700">{aprobados}</div>
                                    <div className="text-sm text-gray-600">Aprobados</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-red-700">{rechazados}</div>
                                    <div className="text-sm text-gray-600">Rechazados</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Justificaciones médicas */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-t-lg px-4 py-4">
                            <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                JUSTIFICACIONES MÉDICAS
                            </h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Detalle las justificaciones para cada medicamento aprobado
                            </p>
                        </div>

                        <div className="border-2 border-t-0 border-blue-200 rounded-b-lg bg-white">
                            <div className="p-4 space-y-4">
                                {auditoria?.medicamentos?.map((medicamento, index) => {
                                    const renglon = medicamento.nro_orden;
                                    return (
                                        <div key={`justif-${renglon}`} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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
                                                            {medicamento.nombre_comercial}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {medicamento.monodroga} - {tiposCobertura[renglon]}
                                                        </p>
                                                    </div>
                                                    <textarea
                                                        value={justificacionesMedicas[renglon] || ''}
                                                        onChange={(e) => handleJustificacionChange(renglon, e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder={`Justificación médica para ${medicamento.nombre_comercial}. Incluya criterios clínicos, estudios de laboratorio, respuesta a tratamientos previos, etc.`}
                                                    />
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Caracteres: {(justificacionesMedicas[renglon] || '').length}/500
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Nota General */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-t-lg px-4 py-4">
                            <h3 className="text-lg font-semibold text-green-800">
                                OBSERVACIONES GENERALES
                            </h3>
                            <p className="text-sm text-green-700 mt-1">
                                Observaciones generales sobre el caso de alto costo
                            </p>
                        </div>
                        <div className="border-2 border-t-0 border-green-200 rounded-b-lg p-4 bg-white">
                            <textarea
                                value={notaGeneral}
                                onChange={(e) => setNotaGeneral(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-green-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="Observaciones generales sobre la auditoría de alto costo. Incluya consideraciones especiales sobre la justificación clínica, urgencia del tratamiento, o cualquier aspecto relevante para el área de compras..."
                            />
                            <div className="mt-2 flex justify-between items-center">
                                <div className="text-xs text-green-600">
                                    💡 Esta información será enviada junto con la solicitud al área de compras
                                </div>
                                <div className="text-xs text-gray-500">
                                    Caracteres: {notaGeneral.length}/1000
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción especializados para alto costo */}
                    <div className="flex justify-center space-x-4 pt-6 border-t-2 border-gray-200">
                        <button
                            onClick={handleRechazarAuditoriaClick}
                            disabled={processing}
                            className="inline-flex items-center px-6 py-3 border-2 border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
                        >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            {processing ? 'Procesando...' : 'Rechazar Auditoría'}
                        </button>

                        <button
                            onClick={handleEnviarComprasClick}
                            disabled={processing || aprobados === 0}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg"
                        >
                            <ShoppingCartIcon className="h-4 w-4 mr-2" />
                            {processing ? 'Enviando...' : 'Procesar y Enviar a Compras'}
                        </button>

                        <button
                            onClick={() => navigate('/alto-costo/pendientes')}
                            disabled={processing}
                            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all duration-200"
                        >
                            Cancelar
                        </button>
                    </div>

                    {/* Información adicional específica para alto costo */}
                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ShoppingCartIcon className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-blue-800">
                                    Proceso de Medicamentos de Alto Costo
                                </h3>
                                <div className="mt-2 text-sm text-blue-700">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium">Flujo Especializado:</h4>
                                            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                                <li>Evaluación médica especializada</li>
                                                <li>Aprobación por auditor de alto costo</li>
                                                <li><strong>Envío al área de Compras (SIN PDF)</strong></li>
                                                <li>Cotización con proveedores especializados</li>
                                                <li>Generación de presupuestos</li>
                                                <li>Autorización final y entrega</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Información Enviada a Compras:</h4>
                                            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                                <li>Medicamentos aprobados y cantidades</li>
                                                <li>Porcentajes de cobertura autorizados</li>
                                                <li>Justificaciones médicas detalladas</li>
                                                <li>Tipo de cobertura (ONC, HO, BIAC, etc.)</li>
                                                <li>Observaciones generales del caso</li>
                                                <li>Datos completos del paciente y médico</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-300">
                                        <p className="text-xs text-blue-900">
                                            <strong>Nota importante:</strong> Al enviar a Compras, NO se genera automáticamente el PDF.
                                            El área de Compras gestionará las cotizaciones con proveedores y generará el PDF cuando sea necesario.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación para enviar a compras */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleEnviarCompras}
                title="Enviar a Compras"
                message="¿Está seguro de enviar esta auditoría de alto costo al área de Compras para cotización de proveedores?"
                confirmText="Enviar a Compras"
                cancelText="Cancelar"
                type="warning"
                confirmButtonColor="blue"
            />

            {/* Modal de confirmación para rechazar */}
            <ConfirmModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={handleRechazarAuditoria}
                title="Rechazar Auditoría"
                message="¿Está seguro de rechazar toda la auditoría de alto costo? Esta acción no se puede deshacer."
                confirmText="Rechazar"
                cancelText="Cancelar"
                type="danger"
                confirmButtonColor="red"
            />
        </div>
    );
};

export default ProcesarAuditoriaAltoCosto;

// src/pages/AltoCosto/ProcesarAuditoriaAltoCostoDemo.jsx - DEMO SIMPLIFICADO
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    ShieldCheckIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';

const ProcesarAuditoriaAltoCostoDemo = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados principales
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados para medicamentos (sin meses)
    const [medicamentosSeleccionados, setMedicamentosSeleccionados] = useState({});
    const [coberturas, setCoberturas] = useState({});
    const [tiposCobertura, setTiposCobertura] = useState({});
    const [justificacionesMedicas, setJustificacionesMedicas] = useState({});
    const [notaGeneral, setNotaGeneral] = useState('');

    // Datos demo de la auditoría de alto costo
    const auditoriaDemo = {
        id: id || 'AC-2024-001',
        paciente: {
            apellido: 'González',
            nombre: 'María Elena',
            dni: '32456789',
            edad: 45,
            sexo: 'F',
            telefono: '351-5551234',
            email: 'maria.gonzalez@email.com',
            peso: '68'
        },
        medico: {
            nombre: 'DR. ALEJANDRA MARÍA NIORO',
            matricula: '255967',
            especialidad: 'ONCOLOGÍA CLÍNICA'
        },
        diagnostico: {
            diagnostico: 'Neoplasia maligna de mama. Tratamiento oncológico de alto costo',
            fechaemision: '2025-03-31T17:59:51.000Z',
            diagnostico2: 'Paciente femenina de 45 años con diagnóstico de carcinoma ductal invasivo de mama izquierda, estadio IIIB. Ha completado cirugía y quimioterapia neoadyuvante. Requiere tratamiento de mantenimiento con terapia dirigida de alto costo.'
        },
        medicamentos: [
            {
                id: 1,
                idreceta: 'REC001',
                renglon: 1,
                nombrecomercial: 'HERCEPTIN 440MG',
                monodroga: 'Trastuzumab',
                presentacion: 'Vial 440mg polvo liofilizado',
                laboratorio: 'Roche',
                cantidad: 1,
                dosis: '6mg/kg cada 21 días',
                cobertura: '100',
                tipo: 'ONC',
                costo_estimado: 'CRITICO',
                requiere_autorizacion: true,
                justificacion_medica: ''
            },
            {
                id: 2,
                idreceta: 'REC001',
                renglon: 2,
                nombrecomercial: 'PERJETA 420MG',
                monodroga: 'Pertuzumab',
                presentacion: 'Vial 420mg/14ml',
                laboratorio: 'Roche',
                cantidad: 1,
                dosis: '420mg cada 21 días',
                cobertura: '100',
                tipo: 'ONC',
                costo_estimado: 'CRITICO',
                requiere_autorizacion: true,
                justificacion_medica: ''
            },
            {
                id: 3,
                idreceta: 'REC001',
                renglon: 3,
                nombrecomercial: 'ZOMETA 4MG',
                monodroga: 'Ácido Zoledrónico',
                presentacion: 'Vial 4mg/5ml',
                laboratorio: 'Novartis',
                cantidad: 1,
                dosis: '4mg cada 28 días',
                cobertura: '100',
                tipo: 'ONC',
                costo_estimado: 'ALTO',
                requiere_autorizacion: true,
                justificacion_medica: ''
            }
        ]
    };

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Auditoría Alto Costo', href: '/alto-costo' },
        { name: 'Pendientes', href: '/alto-costo/pendientes' },
        { name: `Auditoría #${auditoriaDemo.id}`, href: `/alto-costo/auditoria/${auditoriaDemo.id}`, current: true }
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

    // Simular carga inicial
    useEffect(() => {
        const timer = setTimeout(() => {
            // Inicializar estados con datos demo
            const seleccionadosInit = {};
            const coberturasInit = {};
            const tiposInit = {};
            const justificacionesInit = {};

            auditoriaDemo.medicamentos.forEach((med) => {
                seleccionadosInit[med.renglon] = false; // Inicialmente no seleccionados
                coberturasInit[med.renglon] = med.cobertura || '100';
                tiposInit[med.renglon] = med.tipo || 'ONC';
                justificacionesInit[med.renglon] = med.justificacion_medica || '';
            });

            setMedicamentosSeleccionados(seleccionadosInit);
            setCoberturas(coberturasInit);
            setTiposCobertura(tiposInit);
            setJustificacionesMedicas(justificacionesInit);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

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

    // Enviar a Compras (nueva funcionalidad para alto costo)
    const handleEnviarCompras = async () => {
        const medicamentosAprobados = Object.entries(medicamentosSeleccionados)
            .filter(([_, aprobado]) => aprobado)
            .map(([renglon]) => renglon);

        if (medicamentosAprobados.length === 0) {
            setError('Debe aprobar al menos un medicamento para enviar a compras');
            return;
        }

        if (!window.confirm('¿Está seguro de enviar esta auditoría de alto costo al área de Compras para cotización de proveedores?')) {
            return;
        }

        try {
            setProcessing(true);
            setError('');

            // Simular envío a compras
            await new Promise(resolve => setTimeout(resolve, 2000));

            setSuccess('✅ Auditoría de alto costo enviada al área de Compras exitosamente');

            setTimeout(() => {
                navigate('/alto-costo/pendientes');
            }, 2500);

        } catch (error) {
            console.error('Error enviando a compras:', error);
            setError('Error inesperado al enviar a compras');
        } finally {
            setProcessing(false);
        }
    };

    // Rechazar auditoría completa
    const handleRechazarAuditoria = async () => {
        if (!window.confirm('¿Está seguro de rechazar toda la auditoría de alto costo?')) {
            return;
        }

        try {
            setProcessing(true);
            setError('');

            // Simular rechazo
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess('✅ Auditoría de alto costo rechazada correctamente');

            setTimeout(() => {
                navigate('/alto-costo/pendientes');
            }, 2000);

        } catch (error) {
            console.error('Error rechazando auditoría:', error);
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
        const totalMedicamentos = auditoriaDemo.medicamentos.length;
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
                                        <div className="font-semibold text-gray-900">{auditoriaDemo.paciente.apellido}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Nombre:</span>
                                        <div className="font-semibold text-gray-900">{auditoriaDemo.paciente.nombre}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">DNI:</span>
                                        <div className="font-semibold text-blue-700 font-mono">{auditoriaDemo.paciente.dni}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Sexo:</span>
                                        <div className="font-semibold text-gray-900">{auditoriaDemo.paciente.sexo}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Edad:</span>
                                        <div className="font-semibold text-gray-900">{auditoriaDemo.paciente.edad} años</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 font-medium">Peso:</span>
                                        <div className="font-semibold text-gray-900">{auditoriaDemo.paciente.peso} kg</div>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-gray-200">
                                    <span className="text-gray-600 font-medium text-sm">Teléfono:</span>
                                    <div className="font-semibold text-sm text-gray-900">{auditoriaDemo.paciente.telefono}</div>
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
                                    <div className="font-semibold text-orange-900">{auditoriaDemo.medico.nombre}</div>
                                    <div className="text-orange-600 font-medium text-xs mt-1">MP-{auditoriaDemo.medico.matricula}</div>
                                </div>
                                <div>
                                    <span className="text-orange-700 font-medium">Especialidad:</span>
                                    <div className="font-semibold text-orange-800">{auditoriaDemo.medico.especialidad}</div>
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
                                        {auditoriaDemo.diagnostico.diagnostico}
                                    </div>
                                </div>

                                {auditoriaDemo.diagnostico.diagnostico2 && (
                                    <div className="bg-white border border-red-200 rounded p-3 text-xs">
                                        <div className="text-red-700">
                                            <span className="font-medium">Historia clínica:</span><br />
                                            <div className="mt-1">{auditoriaDemo.diagnostico.diagnostico2}</div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-red-100 border border-red-200 rounded p-2">
                                    <div className="flex items-start">
                                        <CurrencyDollarIcon className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                                        <div className="text-xs text-red-800">
                                            <strong>Alto Costo:</strong> Medicamentos oncológicos especializados de alto valor económico
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
                                    {auditoriaDemo.medicamentos.length} medicamento{auditoriaDemo.medicamentos.length !== 1 ? 's' : ''}
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
                                            <th className="px-3 py-3 text-center text-xs font-bold text-gray-800 uppercase">
                                                COSTO
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 uppercase">
                                                DECISIÓN
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditoriaDemo.medicamentos.map((medicamento, index) => {
                                            const aprobado = medicamentosSeleccionados[medicamento.renglon];

                                            return (
                                                <tr key={medicamento.renglon} className={index % 2 === 0 ? 'bg-white' : 'bg-orange-25'}>
                                                    {/* Medicamento */}
                                                    <td className="px-4 py-4 text-sm">
                                                        <div className="font-bold text-gray-900">
                                                            {medicamento.nombrecomercial}
                                                        </div>
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            {medicamento.monodroga}
                                                        </div>
                                                        <div className="text-xs text-orange-600 mt-1">
                                                            Lab: {medicamento.laboratorio}
                                                        </div>
                                                    </td>

                                                    {/* Presentación */}
                                                    <td className="px-4 py-4 text-sm text-gray-700">
                                                        {medicamento.presentacion}
                                                    </td>

                                                    {/* Cantidad */}
                                                    <td className="px-3 py-4 text-sm text-center">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                                            {medicamento.cantidad}
                                                        </span>
                                                    </td>

                                                    {/* Dosis */}
                                                    <td className="px-3 py-4 text-sm text-center text-gray-700">
                                                        {medicamento.dosis}
                                                    </td>

                                                    {/* Cobertura */}
                                                    <td className="px-3 py-4 text-center">
                                                        <input
                                                            type="number"
                                                            min="70"
                                                            max="100"
                                                            step="10"
                                                            value={coberturas[medicamento.renglon]}
                                                            onChange={(e) => handleCoberturaChange(medicamento.renglon, e.target.value)}
                                                            className="w-16 px-2 py-1 text-sm text-center border-2 border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                                                        />
                                                        <div className="text-xs text-orange-600 font-medium mt-1">%</div>
                                                    </td>

                                                    {/* Tipo */}
                                                    <td className="px-3 py-4 text-center">
                                                        <select
                                                            value={tiposCobertura[medicamento.renglon]}
                                                            onChange={(e) => handleTipoCoberturaChange(medicamento.renglon, e.target.value)}
                                                            className="px-2 py-1 text-xs border-2 border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                                                        >
                                                            {tiposCoberturaMedicamento.map(tipo => (
                                                                <option key={tipo.value} value={tipo.value}>
                                                                    {tipo.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>

                                                    {/* Costo */}
                                                    <td className="px-3 py-4 text-center">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                                            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                                            {medicamento.costo_estimado}
                                                        </span>
                                                    </td>

                                                    {/* Decisión */}
                                                    <td className="px-4 py-4 text-center">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-center space-x-2">
                                                                <button
                                                                    onClick={() => handleMedicamentoChange(medicamento.renglon, true)}
                                                                    className={`px-3 py-1 text-xs font-medium rounded-md border-2 transition-all ${aprobado
                                                                            ? 'bg-green-100 text-green-800 border-green-300'
                                                                            : 'bg-white text-gray-600 border-gray-300 hover:border-green-300'
                                                                        }`}
                                                                >
                                                                    <CheckCircleIcon className="h-3 w-3 mr-1 inline" />
                                                                    Aprobar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMedicamentoChange(medicamento.renglon, false)}
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
                                {auditoriaDemo.medicamentos.map((medicamento, index) => (
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
                                                        {medicamento.monodroga} - {tiposCobertura[medicamento.renglon]}
                                                    </p>
                                                </div>
                                                <textarea
                                                    value={justificacionesMedicas[medicamento.renglon] || ''}
                                                    onChange={(e) => handleJustificacionChange(medicamento.renglon, e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder={`Justificación médica para ${medicamento.nombrecomercial}. Incluya criterios clínicos, estudios de laboratorio, respuesta a tratamientos previos, etc.`}
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
                            onClick={handleRechazarAuditoria}
                            disabled={processing}
                            className="inline-flex items-center px-6 py-3 border-2 border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
                        >
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            {processing ? 'Procesando...' : 'Rechazar Auditoría'}
                        </button>

                        <button
                            onClick={handleEnviarCompras}
                            disabled={processing || aprobados === 0}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg"
                        >
                            <ShoppingCartIcon className="h-4 w-4 mr-2" />
                            {processing ? 'Enviando...' : 'Enviar a Compras'}
                        </button>

                        <button
                            onClick={() => navigate('/alto-costo/pendientes')}
                            className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
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
                                                <li>Envío al área de Compras</li>
                                                <li>Cotización con proveedores especializados</li>
                                                <li>Autorización final y entrega</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Información para Compras:</h4>
                                            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                                <li>Medicamentos aprobados y cantidades</li>
                                                <li>Porcentajes de cobertura autorizados</li>
                                                <li>Justificaciones médicas detalladas</li>
                                                <li>Urgencia del tratamiento</li>
                                                <li>Datos completos del paciente y médico</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Demo indicator */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center mb-2">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="text-sm font-medium text-yellow-800">Demo - Sistema de Auditoría Alto Costo</span>
                        </div>
                        <p className="text-xs text-yellow-700">
                            Esta es una demostración del proceso de auditoría para medicamentos de alto costo.
                            Los datos mostrados son ficticios y el flujo termina enviando la solicitud al área de Compras
                            para cotización con proveedores especializados.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcesarAuditoriaAltoCostoDemo;
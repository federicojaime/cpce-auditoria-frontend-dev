// src/pages/AltoCosto/AltoCostoAuditoriaDemo.jsx - ROL 1 EVALÚA Y ENVÍA A ROL 3
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    ArrowLeftIcon,
    UserIcon,
    DocumentTextIcon,
    BuildingOffice2Icon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    PaperAirplaneIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    PrinterIcon,
    PhoneIcon,
    EnvelopeIcon,
    CalendarIcon,
    TruckIcon,
    ShieldCheckIcon,
    StarIcon,
    BanknotesIcon,
    ChartBarIcon,
    HandThumbUpIcon,
    HandThumbDownIcon,
    ShoppingCartIcon
} from '@heroicons/react/24/outline';

const AltoCostoAuditoriaDemo = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Estados principales
    const [activeTab, setActiveTab] = useState('auditoria');
    const [medicamentosDecision, setMedicamentosDecision] = useState({});
    const [coberturas, setCoberturas] = useState({});
    const [tiposCobertura, setTiposCobertura] = useState({});
    const [notaAuditor, setNotaAuditor] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Datos demo de la auditoría
    const auditoriaDemo = {
        id: 'AC-2024-001',
        paciente: {
            nombre: 'María Elena',
            apellido: 'González',
            dni: '32456789',
            edad: 45,
            sexo: 'F',
            telefono: '351-5551234',
            email: 'maria.gonzalez@email.com',
            obraSocial: 'CPCE Salud'
        },
        medico: {
            nombre: 'Dr. Roberto Mendoza',
            matricula: '12345',
            especialidad: 'Oncología Clínica',
            telefono: '351-5559876',
            email: 'r.mendoza@hospital.com'
        },
        medicamentos: [
            {
                id: 1,
                nombre: 'KEYTRUDA 100MG',
                nombreComercial: 'KEYTRUDA 100MG',
                monodroga: 'Pembrolizumab',
                presentacion: 'Vial 100mg/4ml',
                cantidad: 6,
                posologia: '200mg c/21 días',
                meses: 6,
                indicacion: 'Cáncer de pulmón no células pequeñas',
                justificacion: 'Paciente con cáncer de pulmón avanzado, PD-L1 positivo >50%. Primera línea de tratamiento según guías NCCN.',
                costoEstimado: 245000,
                categoria: 'Inmunoterapia Oncológica',
                requiereAutorizacion: true
            },
            {
                id: 2,
                nombre: 'REVLIMID 25MG',
                nombreComercial: 'REVLIMID 25MG',
                monodroga: 'Lenalidomida',
                presentacion: 'Cápsulas 25mg x21',
                cantidad: 6,
                posologia: '25mg/día días 1-21 c/28',
                meses: 6,
                indicacion: 'Mieloma múltiple',
                justificacion: 'Terapia de mantenimiento post-trasplante. Paciente con respuesta parcial muy buena.',
                costoEstimado: 185000,
                categoria: 'Inmunomodulador',
                requiereAutorizacion: true
            }
        ],
        costoTotal: 430000,
        prioridad: 'ALTA',
        fechaPrescripcion: '2024-03-15',
        diagnosticos: ['C78.9 - Cáncer de pulmón', 'C90.0 - Mieloma múltiple']
    };

    // Inicializar estados
    useEffect(() => {
        const decisionesInit = {};
        const coberturasInit = {};
        const tiposInit = {};

        auditoriaDemo.medicamentos.forEach((med) => {
            decisionesInit[med.id] = null; // null = no decidido, true = aprobado, false = rechazado
            coberturasInit[med.id] = 100; // Cobertura por defecto
            tiposInit[med.id] = 'ONC'; // Tipo por defecto
        });

        setMedicamentosDecision(decisionesInit);
        setCoberturas(coberturasInit);
        setTiposCobertura(tiposInit);
    }, []);

    // Manejar decisión de medicamento
    const handleDecisionChange = (medicamentoId, decision) => {
        setMedicamentosDecision(prev => ({
            ...prev,
            [medicamentoId]: decision
        }));
    };

    // Manejar cambio de cobertura
    const handleCoberturaChange = (medicamentoId, value) => {
        setCoberturas(prev => ({
            ...prev,
            [medicamentoId]: parseInt(value)
        }));
    };

    // Manejar cambio de tipo
    const handleTipoChange = (medicamentoId, value) => {
        setTiposCobertura(prev => ({
            ...prev,
            [medicamentoId]: value
        }));
    };

    // Calcular resumen
    const calcularResumen = () => {
        const decisiones = Object.values(medicamentosDecision);
        const aprobados = decisiones.filter(d => d === true).length;
        const rechazados = decisiones.filter(d => d === false).length;
        const pendientes = decisiones.filter(d => d === null).length;
        
        return { 
            total: auditoriaDemo.medicamentos.length, 
            aprobados, 
            rechazados, 
            pendientes 
        };
    };

    // Enviar a Rol 3 (Compras/Proveedores)
    const handleEnviarCompras = async () => {
        const { aprobados } = calcularResumen();
        
        if (aprobados === 0) {
            setError('Debe aprobar al menos un medicamento para enviar a compras');
            return;
        }

        if (!window.confirm('¿Está seguro de enviar esta auditoría de alto costo al área de Compras y Proveedores (Rol 3) para cotización?')) {
            return;
        }

        try {
            setProcessing(true);
            setError('');

            // Simular envío a Rol 3
            await new Promise(resolve => setTimeout(resolve, 2000));

            setSuccess('✅ Auditoría enviada exitosamente al área de Compras y Proveedores (Rol 3)');
            
            setTimeout(() => {
                navigate('/alto-costo/pendientes');
            }, 3000);

        } catch (error) {
            setError('Error al enviar a compras');
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

            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess('✅ Auditoría de alto costo rechazada');
            
            setTimeout(() => {
                navigate('/alto-costo/pendientes');
            }, 2000);

        } catch (error) {
            setError('Error al rechazar auditoría');
        } finally {
            setProcessing(false);
        }
    };

    const { total, aprobados, rechazados, pendientes } = calcularResumen();

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            
            {/* Header con botón volver */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/alto-costo/pendientes')}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Volver a Pendientes Alto Costo
                </button>
            </div>

            {/* Mensajes */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <div className="flex">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header de auditoría */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <CurrencyDollarIcon className="h-6 w-6 mr-2 text-red-600" />
                            Auditoría Alto Costo #{auditoriaDemo.id}
                        </h2>
                        <div className="mt-2 flex items-center space-x-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                Prioridad {auditoriaDemo.prioridad}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                                ${auditoriaDemo.costoTotal.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <PrinterIcon className="h-4 w-4 mr-2" />
                        Imprimir
                    </button>
                </div>
            </div>

            {/* Información del paciente */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Datos del Paciente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Apellido y Nombre</p>
                        <p className="font-medium">{auditoriaDemo.paciente.apellido}, {auditoriaDemo.paciente.nombre}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">DNI</p>
                        <p className="font-medium">{auditoriaDemo.paciente.dni}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Edad / Sexo</p>
                        <p className="font-medium">{auditoriaDemo.paciente.edad} años / {auditoriaDemo.paciente.sexo}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium">{auditoriaDemo.paciente.telefono}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{auditoriaDemo.paciente.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Obra Social</p>
                        <p className="font-medium">{auditoriaDemo.paciente.obraSocial}</p>
                    </div>
                </div>
            </div>

            {/* Información del médico */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Médico Prescriptor</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="font-medium">{auditoriaDemo.medico.nombre}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Matrícula</p>
                        <p className="font-medium">MP-{auditoriaDemo.medico.matricula}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Especialidad</p>
                        <p className="font-medium text-orange-700">{auditoriaDemo.medico.especialidad}</p>
                    </div>
                </div>
            </div>

            {/* Medicamentos para evaluación (SIN MESES) */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-red-600" />
                    Medicamentos de Alto Costo - Evaluación del Auditor
                </h3>
                
                <div className="space-y-6">
                    {auditoriaDemo.medicamentos.map((medicamento) => {
                        const decision = medicamentosDecision[medicamento.id];
                        
                        return (
                            <div key={medicamento.id} className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                                {/* Información del medicamento */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                                            {medicamento.nombreComercial}
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <p><strong>Monodroga:</strong> {medicamento.monodroga}</p>
                                            <p><strong>Presentación:</strong> {medicamento.presentacion}</p>
                                            <p><strong>Cantidad:</strong> {medicamento.cantidad}</p>
                                            <p><strong>Posología:</strong> {medicamento.posologia}</p>
                                            <p><strong>Duración:</strong> {medicamento.meses} meses</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="space-y-4">
                                            <div>
                                                <strong className="text-red-700">Costo Estimado:</strong>
                                                <div className="text-xl font-bold text-red-600">
                                                    ${medicamento.costoEstimado.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-600">por tratamiento completo</div>
                                            </div>
                                            
                                            <div>
                                                <strong>Categoría:</strong>
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {medicamento.categoria}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Indicación y justificación */}
                                <div className="mb-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h5 className="font-medium text-blue-800 mb-2">Indicación:</h5>
                                        <p className="text-blue-700 text-sm">{medicamento.indicacion}</p>
                                    </div>
                                    
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                                        <h5 className="font-medium text-yellow-800 mb-2">Justificación Médica:</h5>
                                        <p className="text-yellow-700 text-sm">{medicamento.justificacion}</p>
                                    </div>
                                </div>

                                {/* Configuración de cobertura */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Cobertura (%)
                                        </label>
                                        <select
                                            value={coberturas[medicamento.id]}
                                            onChange={(e) => handleCoberturaChange(medicamento.id, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={70}>70% - Estándar</option>
                                            <option value={80}>80% - Ampliada</option>
                                            <option value={90}>90% - Especial</option>
                                            <option value={100}>100% - Total</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Cobertura
                                        </label>
                                        <select
                                            value={tiposCobertura[medicamento.id]}
                                            onChange={(e) => handleTipoChange(medicamento.id, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="ONC">ONC - Oncológico</option>
                                            <option value="HO">HO - Huérfano</option>
                                            <option value="BIAC">BIAC - Biotecnología</option>
                                            <option value="CE">CE - Especial</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Decisión del auditor */}
                                <div className="border-t border-gray-300 pt-4">
                                    <h5 className="font-medium text-gray-700 mb-3">Decisión del Auditor:</h5>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => handleDecisionChange(medicamento.id, true)}
                                            className={`flex-1 inline-flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all ${
                                                decision === true
                                                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-green-50'
                                            }`}
                                        >
                                            <CheckCircleIcon className="h-5 w-5 mr-2" />
                                            APROBAR
                                        </button>
                                        
                                        <button
                                            onClick={() => handleDecisionChange(medicamento.id, false)}
                                            className={`flex-1 inline-flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all ${
                                                decision === false
                                                    ? 'bg-red-100 text-red-800 border-2 border-red-300'
                                                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-red-50'
                                            }`}
                                        >
                                            <XCircleIcon className="h-5 w-5 mr-2" />
                                            RECHAZAR
                                        </button>
                                    </div>
                                    
                                    {decision !== null && (
                                        <div className={`mt-3 p-3 rounded-md ${
                                            decision ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            <div className="flex items-center">
                                                {decision ? (
                                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                                ) : (
                                                    <XCircleIcon className="h-4 w-4 mr-2" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {decision ? 'MEDICAMENTO APROBADO' : 'MEDICAMENTO RECHAZADO'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Resumen de decisiones */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Resumen de Evaluación</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-800">{total}</div>
                        <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{aprobados}</div>
                        <div className="text-sm text-green-600">Aprobados</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{rechazados}</div>
                        <div className="text-sm text-red-600">Rechazados</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{pendientes}</div>
                        <div className="text-sm text-yellow-600">Pendientes</div>
                    </div>
                </div>
            </div>

            {/* Nota del auditor */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Observaciones del Auditor</h3>
                <textarea
                    value={notaAuditor}
                    onChange={(e) => setNotaAuditor(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Observaciones y recomendaciones del auditor para el área de compras..."
                />
            </div>

            {/* Botones de acción */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={handleRechazarAuditoria}
                        disabled={processing}
                        className="inline-flex items-center px-6 py-3 border-2 border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        {processing ? 'Procesando...' : 'Rechazar Auditoría'}
                    </button>

                    <button
                        onClick={handleEnviarCompras}
                        disabled={processing || aprobados === 0}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                        {processing ? 'Enviando...' : `Enviar a Compras (${aprobados} aprobados)`}
                    </button>
                </div>
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-center">
                        <BuildingOffice2Icon className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">
                            Los medicamentos aprobados serán enviados al Rol 3 (Compras y Proveedores) para cotización
                        </span>
                    </div>
                </div>
            </div>

            {/* Información del flujo */}
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-sm font-medium text-orange-800">Flujo de Auditoría Alto Costo</span>
                </div>
                <p className="text-xs text-orange-700">
                    <strong>Rol 1 (Auditor Alto Costo):</strong> Evalúa y aprueba medicamentos → 
                    <strong> Rol 3 (Compras/Proveedores):</strong> Gestiona cotizaciones y proveedores → 
                    <strong> Entrega final al paciente</strong>
                </p>
            </div>
        </div>
    );
};

export default AltoCostoAuditoriaDemo;
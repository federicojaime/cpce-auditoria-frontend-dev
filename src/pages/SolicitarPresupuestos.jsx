// src/pages/SolicitarPresupuestos.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import {
    ShoppingCartIcon,
    BuildingOffice2Icon,
    CurrencyDollarIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    UserIcon,
    ClockIcon,
    DocumentTextIcon,
    ArrowPathIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

const SolicitarPresupuestos = () => {
    const { user } = useAuth();

    // Estados principales
    const [auditorias, setAuditorias] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estados de selección
    const [auditoriasSeleccionadas, setAuditoriasSeleccionadas] = useState(new Set());
    const [proveedoresSeleccionados, setProveedoresSeleccionados] = useState(new Set());
    const [mostrarDetalle, setMostrarDetalle] = useState(null);

    // Breadcrumb configuration
    const breadcrumbItems = [
        { name: 'Compras', href: '/compras' },
        { name: 'Solicitar Presupuestos', href: '/solicitar-presupuestos', current: true }
    ];

    // Datos demo de auditorías aprobadas
    const auditoriasDemo = [
        {
            id: 'AC-2024-001',
            fechaAprobacion: '2025-01-15',
            auditor: 'Dr. José Garrido',
            paciente: {
                nombre: 'María Elena González',
                dni: '32456789',
                obraSocial: 'CPCE Salud'
            },
            medicamentos: [
                {
                    id: 1,
                    nombre: 'KEYTRUDA 100MG',
                    cantidad: 6,
                    costoEstimado: 245000,
                    categoria: 'Inmunoterapia Oncológica'
                },
                {
                    id: 2,
                    nombre: 'REVLIMID 25MG',
                    cantidad: 6,
                    costoEstimado: 185000,
                    categoria: 'Inmunomodulador'
                }
            ],
            costoTotal: 430000,
            prioridad: 'ALTA',
            estado: 'APROBADO',
            observaciones: 'Tratamiento oncológico urgente. Paciente con buena respuesta previa.'
        },
        {
            id: 'AC-2024-002',
            fechaAprobacion: '2025-01-14',
            auditor: 'Dr. José Garrido',
            paciente: {
                nombre: 'Carlos Roberto Mendez',
                dni: '28765432',
                obraSocial: 'CPCE Salud'
            },
            medicamentos: [
                {
                    id: 3,
                    nombre: 'HERCEPTIN 440MG',
                    cantidad: 8,
                    costoEstimado: 320000,
                    categoria: 'Anticuerpo Monoclonal'
                }
            ],
            costoTotal: 320000,
            prioridad: 'MEDIA',
            estado: 'APROBADO',
            observaciones: 'Tratamiento de mantenimiento. Sin urgencia especial.'
        },
        {
            id: 'AC-2024-003',
            fechaAprobacion: '2025-01-13',
            auditor: 'Dr. José Garrido',
            paciente: {
                nombre: 'Ana Lucía Torres',
                dni: '35123456',
                obraSocial: 'CPCE Salud'
            },
            medicamentos: [
                {
                    id: 4,
                    nombre: 'RITUXIMAB 500MG',
                    cantidad: 4,
                    costoEstimado: 180000,
                    categoria: 'Anticuerpo Monoclonal'
                },
                {
                    id: 5,
                    nombre: 'BEVACIZUMAB 400MG',
                    cantidad: 6,
                    costoEstimado: 220000,
                    categoria: 'Antiangiogénico'
                }
            ],
            costoTotal: 400000,
            prioridad: 'ALTA',
            estado: 'APROBADO',
            observaciones: 'Combinación terapéutica. Requiere coordinación de entregas.'
        }
    ];

    // Datos demo de proveedores
    const proveedoresDemo = [
        {
            id: 1,
            nombre: 'FARMACORP S.A.',
            especialidad: 'Oncología',
            contacto: 'Lic. Patricia Vega',
            email: 'pvega@farmacorp.com.ar',
            telefono: '351-4567890',
            activo: true,
            tiempoRespuesta: '24-48hs'
        },
        {
            id: 2,
            nombre: 'ONCOMED DISTRIBUCIONES',
            especialidad: 'Alto Costo Oncológico',
            contacto: 'Dr. Miguel Torres',
            email: 'm.torres@oncomed.com.ar',
            telefono: '351-7891234',
            activo: true,
            tiempoRespuesta: '12-24hs'
        },
        {
            id: 3,
            nombre: 'GLOBAL PHARMA SOLUTIONS',
            especialidad: 'Medicamentos Huérfanos',
            contacto: 'Ing. Carlos Ruiz',
            email: 'c.ruiz@globalpharma.com.ar',
            telefono: '351-3456789',
            activo: true,
            tiempoRespuesta: '48-72hs'
        },
        {
            id: 4,
            nombre: 'BIOTECH MEDICAMENTOS',
            especialidad: 'Biológicos y Biosimilares',
            contacto: 'Dra. Ana Morales',
            email: 'a.morales@biotech.com.ar',
            telefono: '351-9876543',
            activo: true,
            tiempoRespuesta: '24-48hs'
        }
    ];

    // Simular carga de datos
    useEffect(() => {
        const timer = setTimeout(() => {
            setAuditorias(auditoriasDemo);
            setProveedores(proveedoresDemo);
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Manejar selección de auditorías
    const handleAuditoriaSelect = (auditoriaId) => {
        const nuevasSeleccionadas = new Set(auditoriasSeleccionadas);
        if (nuevasSeleccionadas.has(auditoriaId)) {
            nuevasSeleccionadas.delete(auditoriaId);
        } else {
            nuevasSeleccionadas.add(auditoriaId);
        }
        setAuditoriasSeleccionadas(nuevasSeleccionadas);
    };

    // Seleccionar todas las auditorías
    const handleSelectAllAuditorias = () => {
        if (auditoriasSeleccionadas.size === auditorias.length) {
            setAuditoriasSeleccionadas(new Set());
        } else {
            setAuditoriasSeleccionadas(new Set(auditorias.map(a => a.id)));
        }
    };

    // Manejar selección de proveedores
    const handleProveedorSelect = (proveedorId) => {
        const nuevosSeleccionados = new Set(proveedoresSeleccionados);
        if (nuevosSeleccionados.has(proveedorId)) {
            nuevosSeleccionados.delete(proveedorId);
        } else {
            nuevosSeleccionados.add(proveedorId);
        }
        setProveedoresSeleccionados(nuevosSeleccionados);
    };

    // Seleccionar todos los proveedores
    const handleSelectAllProveedores = () => {
        if (proveedoresSeleccionados.size === proveedores.length) {
            setProveedoresSeleccionados(new Set());
        } else {
            setProveedoresSeleccionados(new Set(proveedores.map(p => p.id)));
        }
    };

    // Enviar solicitudes en lote
    const handleEnviarSolicitudes = async () => {
        if (auditoriasSeleccionadas.size === 0) {
            setError('Debe seleccionar al menos una auditoría');
            return;
        }

        if (proveedoresSeleccionados.size === 0) {
            setError('Debe seleccionar al menos un proveedor');
            return;
        }

        const confirmMessage = `¿Está seguro de enviar ${auditoriasSeleccionadas.size} auditoría(s) a ${proveedoresSeleccionados.size} proveedor(es)?`;
        
        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            setSending(true);
            setError('');

            // Simular envío
            await new Promise(resolve => setTimeout(resolve, 3000));

            setSuccess(`✅ Solicitudes enviadas exitosamente: ${auditoriasSeleccionadas.size} auditorías a ${proveedoresSeleccionados.size} proveedores`);
            
            // Limpiar selecciones
            setAuditoriasSeleccionadas(new Set());
            setProveedoresSeleccionados(new Set());

        } catch (error) {
            setError('Error al enviar las solicitudes de presupuesto');
        } finally {
            setSending(false);
        }
    };

    // Calcular totales
    const calcularTotales = () => {
        const auditoriasArray = Array.from(auditoriasSeleccionadas)
            .map(id => auditorias.find(a => a.id === id))
            .filter(Boolean);
        
        const costoTotal = auditoriasArray.reduce((total, auditoria) => total + auditoria.costoTotal, 0);
        const medicamentosTotal = auditoriasArray.reduce((total, auditoria) => 
            total + auditoria.medicamentos.length, 0);

        return { costoTotal, medicamentosTotal, auditoriasCount: auditoriasArray.length };
    };

    const { costoTotal, medicamentosTotal, auditoriasCount } = calcularTotales();

    if (loading) {
        return (
            <div className="p-4 lg:p-6">
                <Loading text="Cargando auditorías aprobadas..." />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                                <ShoppingCartIcon className="h-6 w-6 mr-2 text-blue-600" />
                                Solicitar Presupuestos - Alto Costo
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                Enviar auditorías aprobadas a proveedores para cotización en lote
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowPathIcon className="h-4 w-4 mr-2" />
                            Actualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Mensajes */}
            {error && (
                <ErrorMessage message={error} />
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                        <CheckCircleIcon className="h-5 w-5 text-green-400" />
                        <div className="ml-3">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Resumen de selección */}
            {(auditoriasSeleccionadas.size > 0 || proveedoresSeleccionados.size > 0) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Resumen de Selección</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-xl font-bold text-blue-600">{auditoriasCount}</div>
                            <div className="text-sm text-gray-600">Auditorías</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-xl font-bold text-green-600">{medicamentosTotal}</div>
                            <div className="text-sm text-gray-600">Medicamentos</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-xl font-bold text-orange-600">${costoTotal.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Costo Total</div>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <div className="text-xl font-bold text-purple-600">{proveedoresSeleccionados.size}</div>
                            <div className="text-sm text-gray-600">Proveedores</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Auditorías Aprobadas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-orange-600" />
                                Auditorías Aprobadas ({auditorias.length})
                            </h2>
                            <button
                                onClick={handleSelectAllAuditorias}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {auditoriasSeleccionadas.size === auditorias.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                            </button>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {auditorias.map((auditoria) => {
                            const isSelected = auditoriasSeleccionadas.has(auditoria.id);
                            
                            return (
                                <div
                                    key={auditoria.id}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                        isSelected 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleAuditoriaSelect(auditoria.id)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">#{auditoria.id}</h3>
                                            <p className="text-sm text-gray-600">{auditoria.paciente.nombre}</p>
                                            <p className="text-xs text-gray-500">DNI: {auditoria.paciente.dni}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-orange-600">
                                                ${auditoria.costoTotal.toLocaleString()}
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                auditoria.prioridad === 'ALTA' 
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {auditoria.prioridad}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            <strong>Auditor:</strong> {auditoria.auditor}
                                        </div>
                                        <div className="text-sm">
                                            <strong>Fecha:</strong> {auditoria.fechaAprobacion}
                                        </div>
                                        <div className="text-sm">
                                            <strong>Medicamentos:</strong> {auditoria.medicamentos.length}
                                        </div>
                                    </div>

                                    {mostrarDetalle === auditoria.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h4 className="font-medium mb-2">Medicamentos:</h4>
                                            {auditoria.medicamentos.map((med) => (
                                                <div key={med.id} className="flex justify-between text-sm mb-1">
                                                    <span>{med.nombre}</span>
                                                    <span>${med.costoEstimado.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            {auditoria.observaciones && (
                                                <div className="mt-2">
                                                    <strong className="text-sm">Observaciones:</strong>
                                                    <p className="text-sm text-gray-600">{auditoria.observaciones}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-3 flex justify-between items-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMostrarDetalle(mostrarDetalle === auditoria.id ? null : auditoria.id);
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            {mostrarDetalle === auditoria.id ? 'Ocultar' : 'Ver'} Detalle
                                        </button>
                                        
                                        {isSelected && (
                                            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Proveedores */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <BuildingOffice2Icon className="h-5 w-5 mr-2 text-green-600" />
                                Proveedores Disponibles ({proveedores.length})
                            </h2>
                            <button
                                onClick={handleSelectAllProveedores}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {proveedoresSeleccionados.size === proveedores.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                            </button>
                        </div>
                    </div>

                    <div className="p-4 space-y-4">
                        {proveedores.map((proveedor) => {
                            const isSelected = proveedoresSeleccionados.has(proveedor.id);
                            
                            return (
                                <div
                                    key={proveedor.id}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                        isSelected 
                                            ? 'border-green-500 bg-green-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleProveedorSelect(proveedor.id)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{proveedor.nombre}</h3>
                                            <p className="text-sm text-gray-600">{proveedor.especialidad}</p>
                                            <div className="mt-2 space-y-1">
                                                <div className="text-xs text-gray-500">
                                                    <strong>Contacto:</strong> {proveedor.contacto}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <strong>Email:</strong> {proveedor.email}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    <strong>Respuesta:</strong> {proveedor.tiempoRespuesta}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {isSelected && (
                                            <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Botón de envío */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Enviar Solicitudes de Presupuesto
                    </h3>
                    <p className="text-sm text-gray-600">
                        Las auditorías seleccionadas serán enviadas a todos los proveedores seleccionados para cotización
                    </p>
                </div>

                <button
                    onClick={handleEnviarSolicitudes}
                    disabled={sending || auditoriasSeleccionadas.size === 0 || proveedoresSeleccionados.size === 0}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {sending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Enviando Solicitudes...
                        </>
                    ) : (
                        <>
                            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                            Enviar Solicitudes ({auditoriasSeleccionadas.size} auditorías a {proveedoresSeleccionados.size} proveedores)
                        </>
                    )}
                </button>

                {(auditoriasSeleccionadas.size === 0 || proveedoresSeleccionados.size === 0) && (
                    <p className="mt-2 text-sm text-red-600">
                        Debe seleccionar al menos una auditoría y un proveedor
                    </p>
                )}
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                            Información sobre Solicitudes de Presupuesto
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Las solicitudes incluyen todos los datos de la auditoría y medicamentos</li>
                                <li>Los proveedores recibirán un email con la información detallada</li>
                                <li>El seguimiento de respuestas se puede ver en "Seguimiento Presupuestos"</li>
                                <li>Los proveedores tienen 72 horas para responder por defecto</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SolicitarPresupuestos;
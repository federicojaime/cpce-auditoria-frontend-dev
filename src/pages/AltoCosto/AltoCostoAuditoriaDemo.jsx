import React, { useState, useEffect } from 'react';
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
    HandThumbDownIcon
} from '@heroicons/react/24/outline';

const AltoCostoAuditoriaDemo = () => {
    const [activeTab, setActiveTab] = useState('auditoria');
    const [selectedProviders, setSelectedProviders] = useState([]);
    const [cotizacionesEnviadas, setCotizacionesEnviadas] = useState(false);
    const [presupuestosRecibidos, setPresupuestosRecibidos] = useState([]);
    const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
    const [showComparison, setShowComparison] = useState(false);

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
                nombre: 'PEMBROLIZUMAB',
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
                nombre: 'LENALIDOMIDA',
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

    // Datos demo de proveedores
    const proveedoresDemo = [
        {
            id: 1,
            nombre: 'FARMACORP S.A.',
            categoria: 'Distribuidor Mayorista',
            especialidad: 'Oncología',
            rating: 4.8,
            experiencia: '15 años',
            certificaciones: ['ISO 9001', 'FDA', 'ANMAT'],
            contacto: {
                nombre: 'Lic. Patricia Vega',
                telefono: '351-4567890',
                email: 'pvega@farmacorp.com.ar'
            },
            tiempoEntrega: '24-48hs',
            cobertura: 'Nacional',
            ventajas: ['Stock permanente', 'Entrega express', 'Soporte técnico 24/7']
        },
        {
            id: 2,
            nombre: 'ONCOMED DISTRIBUCIONES',
            categoria: 'Especialista Oncológico',
            especialidad: 'Alto Costo Oncológico',
            rating: 4.9,
            experiencia: '12 años',
            certificaciones: ['ISO 9001', 'ANMAT', 'Buenas Prácticas'],
            contacto: {
                nombre: 'Dr. Miguel Torres',
                telefono: '351-7891234',
                email: 'm.torres@oncomed.com.ar'
            },
            tiempoEntrega: '12-24hs',
            cobertura: 'Regional',
            ventajas: ['Especialización oncológica', 'Asesoría médica', 'Programas de pacientes']
        },
        {
            id: 3,
            nombre: 'GLOBAL PHARMA SOLUTIONS',
            categoria: 'Importador Directo',
            especialidad: 'Medicamentos Huérfanos',
            rating: 4.6,
            experiencia: '20 años',
            certificaciones: ['ISO 9001', 'FDA', 'EMA', 'ANMAT'],
            contacto: {
                nombre: 'Ing. Carlos Ruiz',
                telefono: '351-3456789',
                email: 'c.ruiz@globalpharma.com.ar'
            },
            tiempoEntrega: '48-72hs',
            cobertura: 'Internacional',
            ventajas: ['Importación directa', 'Mejores precios', 'Acceso global']
        },
        {
            id: 4,
            nombre: 'BIOTECH MEDICAMENTOS',
            categoria: 'Biotecnología',
            especialidad: 'Biológicos y Biosimilares',
            rating: 4.7,
            experiencia: '10 años',
            certificaciones: ['ISO 9001', 'ANMAT', 'Biotecnología'],
            contacto: {
                nombre: 'Dra. Ana Morales',
                telefono: '351-9876543',
                email: 'a.morales@biotech.com.ar'
            },
            tiempoEntrega: '24-48hs',
            cobertura: 'Nacional',
            ventajas: ['Biosimilares', 'I+D propio', 'Programas de acceso']
        }
    ];

    // Generar presupuestos demo
    const generarPresupuestos = () => {
        const presupuestos = selectedProviders.map(proveedorId => {
            const proveedor = proveedoresDemo.find(p => p.id === proveedorId);
            const medicamentos = auditoriaDemo.medicamentos.map(med => {
                // Variación de precios por proveedor
                let factor = 1;
                switch(proveedorId) {
                    case 1: factor = 1.05; break; // FARMACORP más caro
                    case 2: factor = 0.92; break; // ONCOMED mejor precio
                    case 3: factor = 0.88; break; // GLOBAL PHARMA mejor por importación
                    case 4: factor = 0.95; break; // BIOTECH intermedio
                }
                
                const precioUnitario = Math.round(med.costoEstimado * factor);
                const precioTotal = precioUnitario * med.cantidad;
                
                return {
                    ...med,
                    precioUnitario,
                    precioTotal,
                    disponibilidad: Math.random() > 0.2 ? 'Disponible' : 'Bajo pedido',
                    tiempoEntrega: proveedor.tiempoEntrega,
                    lote: `L${Math.floor(Math.random() * 10000)}`,
                    vencimiento: '2025-12-31'
                };
            });
            
            const totalGeneral = medicamentos.reduce((acc, med) => acc + med.precioTotal, 0);
            
            return {
                id: `PRES-${proveedorId}-${Date.now()}`,
                proveedorId,
                proveedor: proveedor.nombre,
                contacto: proveedor.contacto,
                fechaCotizacion: new Date().toISOString().split('T')[0],
                validezDias: 15,
                medicamentos,
                totalGeneral,
                condicionesPago: '30 días fecha factura',
                garantia: '12 meses',
                entrega: proveedor.tiempoEntrega,
                observaciones: `Cotización para tratamiento oncológico de alto costo. Precios sujetos a disponibilidad de stock.`
            };
        });
        
        setPresupuestosRecibidos(presupuestos);
    };

    useEffect(() => {
        if (cotizacionesEnviadas && selectedProviders.length > 0) {
            // Simular recepción de presupuestos después de 2 segundos
            const timer = setTimeout(() => {
                generarPresupuestos();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [cotizacionesEnviadas, selectedProviders]);

    const handleProviderSelect = (providerId) => {
        setSelectedProviders(prev => 
            prev.includes(providerId) 
                ? prev.filter(id => id !== providerId)
                : [...prev, providerId]
        );
    };

    const enviarCotizaciones = () => {
        setCotizacionesEnviadas(true);
    };

    const adjudicarProveedor = (presupuesto) => {
        setProveedorSeleccionado(presupuesto);
        setActiveTab('adjudicacion');
    };

    const renderAuditoria = () => (
        <div className="space-y-6">
            {/* Header de auditoría */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <CurrencyDollarIcon className="h-6 w-6 mr-2 text-orange-600" />
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
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
            <div className="bg-white border border-gray-200 rounded-lg p-6">
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

            {/* Medicamentos */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-red-600" />
                    Medicamentos de Alto Costo
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicamento</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posología</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Est.</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {auditoriaDemo.medicamentos.map((med) => (
                                <tr key={med.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{med.nombreComercial}</div>
                                            <div className="text-sm text-gray-500">{med.monodroga}</div>
                                            <div className="text-xs text-gray-400">{med.presentacion}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm font-medium">{med.cantidad}</td>
                                    <td className="px-4 py-4 text-sm">{med.posologia}</td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                                            ${med.costoEstimado.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {med.categoria}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-orange-800">Costo Total Estimado:</span>
                        <span className="text-2xl font-bold text-red-700">
                            ${auditoriaDemo.costoTotal.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-sm text-orange-700 mt-2">
                        * Valores estimados por {auditoriaDemo.medicamentos.reduce((acc, med) => acc + med.cantidad, 0)} unidades 
                        para tratamiento de {auditoriaDemo.medicamentos[0].meses} meses
                    </p>
                </div>
            </div>

            {/* Justificaciones clínicas */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Justificaciones Clínicas</h3>
                <div className="space-y-4">
                    {auditoriaDemo.medicamentos.map((med) => (
                        <div key={med.id} className="border-l-4 border-orange-400 pl-4">
                            <h4 className="font-medium text-gray-900">{med.nombreComercial}</h4>
                            <p className="text-sm text-gray-600 mt-1">{med.justificacion}</p>
                            <p className="text-xs text-gray-500 mt-1">Indicación: {med.indicacion}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botón para continuar */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Auditoría Aprobada</h3>
                <p className="text-gray-600 mb-4">
                    Los medicamentos han sido evaluados y aprobados. Proceder con cotización a proveedores.
                </p>
                <button
                    onClick={() => setActiveTab('proveedores')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                >
                    <BuildingOffice2Icon className="h-5 w-5 mr-2" />
                    Solicitar Cotizaciones
                </button>
            </div>
        </div>
    );

    const renderProveedores = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
                    <BuildingOffice2Icon className="h-6 w-6 mr-2 text-blue-600" />
                    Selección de Proveedores
                </h2>
                <p className="text-gray-600">
                    Seleccione los proveedores a los que desea enviar la solicitud de cotización para los medicamentos de alto costo.
                </p>
            </div>

            {/* Grid de proveedores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proveedoresDemo.map((proveedor) => (
                    <div
                        key={proveedor.id}
                        className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                            selectedProviders.includes(proveedor.id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleProviderSelect(proveedor.id)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{proveedor.nombre}</h3>
                                <p className="text-sm text-gray-600">{proveedor.categoria}</p>
                            </div>
                            <div className="flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-sm font-medium">{proveedor.rating}</span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-500" />
                                Especialidad: {proveedor.especialidad}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <TruckIcon className="h-4 w-4 mr-2 text-blue-500" />
                                Entrega: {proveedor.tiempoEntrega}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <ClockIcon className="h-4 w-4 mr-2 text-orange-500" />
                                Experiencia: {proveedor.experiencia}
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Certificaciones:</p>
                            <div className="flex flex-wrap gap-1">
                                {proveedor.certificaciones.map((cert) => (
                                    <span
                                        key={cert}
                                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800"
                                    >
                                        {cert}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-500 mb-1">Ventajas:</p>
                            <ul className="text-xs text-gray-600">
                                {proveedor.ventajas.map((ventaja, idx) => (
                                    <li key={idx} className="flex items-center">
                                        <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
                                        {ventaja}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="border-t pt-3">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-600">
                                    <PhoneIcon className="h-4 w-4 mr-1" />
                                    {proveedor.contacto.telefono}
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                                    {proveedor.contacto.nombre}
                                </div>
                            </div>
                        </div>

                        {selectedProviders.includes(proveedor.id) && (
                            <div className="mt-4 p-3 bg-blue-100 border border-blue-200 rounded">
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-4 w-4 text-blue-600 mr-2" />
                                    <span className="text-sm font-medium text-blue-800">Seleccionado</span>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Botones de acción */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600">
                            {selectedProviders.length} proveedor(es) seleccionado(s)
                        </p>
                        {selectedProviders.length > 0 && (
                            <p className="text-xs text-gray-500">
                                Se enviará solicitud de cotización a los proveedores seleccionados
                            </p>
                        )}
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setActiveTab('auditoria')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2 inline" />
                            Volver
                        </button>
                        <button
                            onClick={enviarCotizaciones}
                            disabled={selectedProviders.length === 0 || cotizacionesEnviadas}
                            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                            {cotizacionesEnviadas ? 'Enviado' : 'Enviar Cotizaciones'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Estado de envío */}
            {cotizacionesEnviadas && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                            <h3 className="text-sm font-medium text-green-800">Cotizaciones Enviadas</h3>
                            <p className="text-sm text-green-700 mt-1">
                                Se han enviado solicitudes de cotización a {selectedProviders.length} proveedor(es). 
                                Los presupuestos comenzarán a llegar en las próximas horas.
                            </p>
                        </div>
                    </div>
                    {presupuestosRecibidos.length === 0 && (
                        <div className="mt-4 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                            <span className="text-sm text-green-700">Esperando respuestas...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Botón para ver presupuestos */}
            {presupuestosRecibidos.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                        ¡Presupuestos Recibidos!
                    </h3>
                    <p className="text-blue-700 mb-4">
                        Se han recibido {presupuestosRecibidos.length} presupuesto(s). Revisar y comparar ofertas.
                    </p>
                    <button
                        onClick={() => setActiveTab('presupuestos')}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <EyeIcon className="h-5 w-5 mr-2" />
                        Ver Presupuestos
                    </button>
                </div>
            )}
        </div>
    );

    const renderPresupuestos = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <BanknotesIcon className="h-6 w-6 mr-2 text-green-600" />
                            Presupuestos Recibidos
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Comparar ofertas de {presupuestosRecibidos.length} proveedor(es) para medicamentos de alto costo
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                            <ChartBarIcon className="h-4 w-4 mr-2" />
                            {showComparison ? 'Vista Individual' : 'Comparar'}
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Exportar
                        </button>
                    </div>
                </div>
            </div>

            {/* Resumen comparativo */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Resumen Comparativo</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Entrega</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Validez</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {presupuestosRecibidos
                                .sort((a, b) => a.totalGeneral - b.totalGeneral)
                                .map((presupuesto, index) => (
                                <tr key={presupuesto.id} className={index === 0 ? 'bg-green-50' : 'hover:bg-gray-50'}>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="font-medium text-gray-900">{presupuesto.proveedor}</div>
                                                <div className="text-sm text-gray-500">{presupuesto.contacto.nombre}</div>
                                            </div>
                                            {index === 0 && (
                                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <StarIcon className="h-3 w-3 mr-1" />
                                                    Mejor Precio
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="text-lg font-bold text-gray-900">
                                            ${presupuesto.totalGeneral.toLocaleString()}
                                        </div>
                                        {index > 0 && (
                                            <div className="text-xs text-red-600">
                                                +${(presupuesto.totalGeneral - presupuestosRecibidos[0].totalGeneral).toLocaleString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            presupuesto.entrega.includes('12-24') ? 'bg-green-100 text-green-800' :
                                            presupuesto.entrega.includes('24-48') ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            <TruckIcon className="h-3 w-3 mr-1" />
                                            {presupuesto.entrega}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="text-sm text-gray-900">{presupuesto.validezDias} días</div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => {/* Ver detalle */}}
                                                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <EyeIcon className="h-3 w-3 mr-1" />
                                                Ver
                                            </button>
                                            <button
                                                onClick={() => adjudicarProveedor(presupuesto)}
                                                className="inline-flex items-center px-2 py-1 border border-green-300 rounded text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100"
                                            >
                                                <HandThumbUpIcon className="h-3 w-3 mr-1" />
                                                Adjudicar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista detallada de presupuestos */}
            {showComparison ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Comparación Detallada por Medicamento</h3>
                    {auditoriaDemo.medicamentos.map((medicamento) => (
                        <div key={medicamento.id} className="mb-6 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">{medicamento.nombreComercial}</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Proveedor</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">P. Unitario</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Cantidad</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Total</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Disponibilidad</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Lote</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {presupuestosRecibidos.map((presupuesto) => {
                                            const medPres = presupuesto.medicamentos.find(m => m.id === medicamento.id);
                                            const esMejorPrecio = presupuestosRecibidos.every(p => {
                                                const otroMed = p.medicamentos.find(m => m.id === medicamento.id);
                                                return medPres.precioUnitario <= otroMed.precioUnitario;
                                            });
                                            
                                            return (
                                                <tr key={presupuesto.id} className={esMejorPrecio ? 'bg-green-50' : ''}>
                                                    <td className="px-3 py-2 text-sm font-medium">{presupuesto.proveedor}</td>
                                                    <td className="px-3 py-2 text-center text-sm">
                                                        ${medPres.precioUnitario.toLocaleString()}
                                                        {esMejorPrecio && (
                                                            <StarIcon className="inline h-3 w-3 ml-1 text-green-500" />
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-sm">{medPres.cantidad}</td>
                                                    <td className="px-3 py-2 text-center text-sm font-medium">
                                                        ${medPres.precioTotal.toLocaleString()}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            medPres.disponibilidad === 'Disponible' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {medPres.disponibilidad}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-xs text-gray-500">
                                                        {medPres.lote}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {presupuestosRecibidos.map((presupuesto, index) => (
                        <div key={presupuesto.id} className={`border-2 rounded-lg p-6 ${
                            index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                        }`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{presupuesto.proveedor}</h3>
                                    <p className="text-sm text-gray-600">{presupuesto.contacto.nombre}</p>
                                </div>
                                {index === 0 && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <StarIcon className="h-4 w-4 mr-1" />
                                        Mejor Oferta
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Fecha:</span>
                                    <span className="text-sm font-medium">{presupuesto.fechaCotizacion}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Validez:</span>
                                    <span className="text-sm font-medium">{presupuesto.validezDias} días</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Entrega:</span>
                                    <span className="text-sm font-medium">{presupuesto.entrega}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Condiciones:</span>
                                    <span className="text-sm font-medium">{presupuesto.condicionesPago}</span>
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">Detalle por Medicamento:</h4>
                                <div className="space-y-2">
                                    {presupuesto.medicamentos.map((med) => (
                                        <div key={med.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                                            <div>
                                                <div className="font-medium">{med.nombreComercial}</div>
                                                <div className="text-gray-500">Cant: {med.cantidad}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">${med.precioTotal.toLocaleString()}</div>
                                                <div className="text-gray-500">${med.precioUnitario.toLocaleString()} c/u</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold">Total General:</span>
                                    <span className="text-2xl font-bold text-green-700">
                                        ${presupuesto.totalGeneral.toLocaleString()}
                                    </span>
                                </div>
                                
                                <div className="flex space-x-2">
                                    <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                        <EyeIcon className="h-4 w-4 mr-2" />
                                        Ver Detalle
                                    </button>
                                    <button
                                        onClick={() => adjudicarProveedor(presupuesto)}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                                    >
                                        <HandThumbUpIcon className="h-4 w-4 mr-2" />
                                        Adjudicar
                                    </button>
                                </div>
                            </div>

                            {presupuesto.observaciones && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                                    <strong>Observaciones:</strong> {presupuesto.observaciones}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Análisis de ahorro */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Análisis de Costos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                            ${Math.min(...presupuestosRecibidos.map(p => p.totalGeneral)).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Mejor Oferta</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">
                            ${Math.max(...presupuestosRecibidos.map(p => p.totalGeneral)).toLocaleString()}
                        </div>
                        <div className="text-sm text-red-600">Oferta Más Alta</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                            ${(Math.max(...presupuestosRecibidos.map(p => p.totalGeneral)) - 
                               Math.min(...presupuestosRecibidos.map(p => p.totalGeneral))).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">Ahorro Potencial</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAdjudicacion = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
                    <CheckCircleIcon className="h-6 w-6 mr-2 text-green-600" />
                    Adjudicación de Compra
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Proveedor Seleccionado:</p>
                        <p className="font-semibold text-lg text-green-700">{proveedorSeleccionado?.proveedor}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Monto Total:</p>
                        <p className="font-semibold text-lg text-green-700">
                            ${proveedorSeleccionado?.totalGeneral.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Tiempo de Entrega:</p>
                        <p className="font-semibold text-lg text-green-700">{proveedorSeleccionado?.entrega}</p>
                    </div>
                </div>
            </div>

            {/* Resumen de la orden */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Orden de Compra - Medicamentos Alto Costo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Datos del Paciente:</h4>
                        <div className="text-sm space-y-1">
                            <p><strong>Nombre:</strong> {auditoriaDemo.paciente.apellido}, {auditoriaDemo.paciente.nombre}</p>
                            <p><strong>DNI:</strong> {auditoriaDemo.paciente.dni}</p>
                            <p><strong>Obra Social:</strong> {auditoriaDemo.paciente.obraSocial}</p>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Datos del Proveedor:</h4>
                        <div className="text-sm space-y-1">
                            <p><strong>Empresa:</strong> {proveedorSeleccionado?.proveedor}</p>
                            <p><strong>Contacto:</strong> {proveedorSeleccionado?.contacto.nombre}</p>
                            <p><strong>Teléfono:</strong> {proveedorSeleccionado?.contacto.telefono}</p>
                            <p><strong>Email:</strong> {proveedorSeleccionado?.contacto.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detalle de medicamentos adjudicados */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Detalle de Medicamentos</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-green-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicamento</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">P. Unitario</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lote</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {proveedorSeleccionado?.medicamentos.map((med) => (
                                <tr key={med.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <div>
                                            <div className="font-medium text-gray-900">{med.nombreComercial}</div>
                                            <div className="text-sm text-gray-500">{med.monodroga}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center font-medium">{med.cantidad}</td>
                                    <td className="px-4 py-4 text-center">${med.precioUnitario.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-center font-medium">${med.precioTotal.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-center text-sm">{med.lote}</td>
                                    <td className="px-4 py-4 text-center text-sm">{med.vencimiento}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td colSpan="3" className="px-4 py-4 text-right font-semibold">Total General:</td>
                                <td className="px-4 py-4 text-center text-lg font-bold text-green-700">
                                    ${proveedorSeleccionado?.totalGeneral.toLocaleString()}
                                </td>
                                <td colSpan="2"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Condiciones y términos */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Condiciones de la Compra</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Condiciones Comerciales:</h4>
                        <ul className="text-sm space-y-1 text-gray-700">
                            <li>• <strong>Forma de Pago:</strong> {proveedorSeleccionado?.condicionesPago}</li>
                            <li>• <strong>Tiempo de Entrega:</strong> {proveedorSeleccionado?.entrega}</li>
                            <li>• <strong>Garantía:</strong> {proveedorSeleccionado?.garantia}</li>
                            <li>• <strong>Validez:</strong> {proveedorSeleccionado?.validezDias} días</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Condiciones Especiales:</h4>
                        <ul className="text-sm space-y-1 text-gray-700">
                            <li>• Medicamentos de alto costo oncológico</li>
                            <li>• Requiere cadena de frío especializada</li>
                            <li>• Entrega directa al paciente</li>
                            <li>• Seguimiento farmacoterapéutico incluido</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Estados de seguimiento */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Estado del Proceso</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Auditoría Aprobada</p>
                            <p className="text-xs text-gray-500">Medicamentos evaluados</p>
                        </div>
                    </div>
                    <div className="flex-1 h-0.5 bg-green-200 mx-4"></div>
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Cotizaciones Recibidas</p>
                            <p className="text-xs text-gray-500">Proveedores consultados</p>
                        </div>
                    </div>
                    <div className="flex-1 h-0.5 bg-green-200 mx-4"></div>
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Proveedor Adjudicado</p>
                            <p className="text-xs text-gray-500">Compra autorizada</p>
                        </div>
                    </div>
                    <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
                    <div className="flex items-center">
                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                            <ClockIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">En Proceso</p>
                            <p className="text-xs text-gray-500">Preparando entrega</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Acciones finales */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div>
                        <h3 className="text-lg font-semibold text-green-800">¡Proceso Completado!</h3>
                        <p className="text-green-700">
                            La orden de compra ha sido generada y enviada al proveedor adjudicado.
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-white hover:bg-green-50">
                            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                            Generar OC
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50">
                            <TruckIcon className="h-4 w-4 mr-2" />
                            Seguir Entrega
                        </button>
                        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Finalizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Resumen final */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Resumen del Proceso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-700">
                            ${(auditoriaDemo.costoTotal - proveedorSeleccionado?.totalGeneral).toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">Ahorro Obtenido</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-700">
                            {proveedoresDemo.length}
                        </div>
                        <div className="text-sm text-green-600">Proveedores Consultados</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-700">
                            {proveedorSeleccionado?.entrega}
                        </div>
                        <div className="text-sm text-orange-600">Tiempo Entrega</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-700">
                            {auditoriaDemo.medicamentos.length}
                        </div>
                        <div className="text-sm text-purple-600">Medicamentos</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const tabs = [
        { id: 'auditoria', name: 'Auditoría', icon: DocumentTextIcon },
        { id: 'proveedores', name: 'Proveedores', icon: BuildingOffice2Icon },
        { id: 'presupuestos', name: 'Presupuestos', icon: BanknotesIcon },
        { id: 'adjudicacion', name: 'Adjudicación', icon: CheckCircleIcon }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            {/* Navigation */}
            <div className="mb-6">
                <nav className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-200">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const isDisabled = 
                            (tab.id === 'proveedores' && activeTab === 'auditoria') ||
                            (tab.id === 'presupuestos' && !cotizacionesEnviadas) ||
                            (tab.id === 'adjudicacion' && !proveedorSeleccionado);
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => !isDisabled && setActiveTab(tab.id)}
                                disabled={isDisabled}
                                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-md transition-all ${
                                    isActive
                                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                        : isDisabled
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Icon className={`h-5 w-5 mr-2 ${
                                    isActive ? 'text-orange-600' : isDisabled ? 'text-gray-400' : 'text-gray-500'
                                }`} />
                                {tab.name}
                                {tab.id === 'presupuestos' && presupuestosRecibidos.length > 0 && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        {presupuestosRecibidos.length}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Progress indicator */}
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                            ['auditoria', 'proveedores', 'presupuestos', 'adjudicacion'].includes(activeTab) 
                                ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className={`w-3 h-3 rounded-full ${
                            ['proveedores', 'presupuestos', 'adjudicacion'].includes(activeTab) 
                                ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className={`w-3 h-3 rounded-full ${
                            ['presupuestos', 'adjudicacion'].includes(activeTab) 
                                ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className={`w-3 h-3 rounded-full ${
                            activeTab === 'adjudicacion' ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                    </div>
                    <div className="text-sm text-gray-600">
                        Proceso de Auditoría y Compra - Alto Costo
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="transition-all duration-300">
                {activeTab === 'auditoria' && renderAuditoria()}
                {activeTab === 'proveedores' && renderProveedores()}
                {activeTab === 'presupuestos' && renderPresupuestos()}
                {activeTab === 'adjudicacion' && renderAdjudicacion()}
            </div>

            {/* Footer con información */}
            <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-sm font-medium text-orange-800">Demo - Sistema de Auditoría Alto Costo</span>
                </div>
                <p className="text-xs text-orange-700">
                    Esta es una demostración del flujo completo de auditoría, cotización y adjudicación para medicamentos de alto costo. 
                    Los datos mostrados son ficticios y con fines demostrativos únicamente.
                </p>
            </div>
        </div>
    );
};

export default AltoCostoAuditoriaDemo;
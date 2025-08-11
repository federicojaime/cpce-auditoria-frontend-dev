// src/pages/AltoCosto/VerAuditoriaHistoricaAltoCosto.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    ArrowLeftIcon, 
    UserIcon, 
    DocumentTextIcon,
    ArrowPathIcon,
    CalendarIcon,
    PrinterIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const VerAuditoriaHistoricaAltoCosto = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    useEffect(() => {
        loadAuditoria();
    }, [id]);

    const loadAuditoria = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auditorias/${id}?tipo=historica&categoria=alto-costo`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cpce_token')}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.message || 'Error al cargar la auditoría de alto costo');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al cargar la auditoría de alto costo');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getEstadoColor = (estado) => {
        switch(estado?.toString()) {
            case '1':
                return 'text-green-600 bg-green-50';
            case '0':
                return 'text-red-600 bg-red-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getEstadoIcon = (estado) => {
        switch(estado?.toString()) {
            case '1':
                return <CheckCircleIcon className="h-5 w-5" />;
            case '0':
                return <XCircleIcon className="h-5 w-5" />;
            default:
                return <ClockIcon className="h-5 w-5" />;
        }
    };

    const getEstadoTexto = (estado) => {
        switch(estado?.toString()) {
            case '1':
                return 'Aprobado';
            case '0':
                return 'Rechazado';
            default:
                return 'Pendiente';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 print:hidden">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/alto-costo/historicos')}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Volver a históricos alto costo
                        </button>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <PrinterIcon className="h-5 w-5 mr-2" />
                        Imprimir
                    </button>
                </div>
            </div>

            {/* Título para impresión */}
            <div className="hidden print:block text-center mb-8">
                <h1 className="text-2xl font-bold flex items-center justify-center">
                    <CurrencyDollarIcon className="h-6 w-6 mr-2 text-orange-600" />
                    Auditoría Alto Costo #{data.auditoria.id}
                </h1>
                <p className="text-gray-600">Fecha: {data.auditoria.fecha_origen}</p>
            </div>

            {/* Información de la auditoría */}
            <div className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-orange-500">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-orange-600" />
                    Información de la Auditoría - Alto Costo
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">ID Auditoría</p>
                        <p className="font-medium">#{data.auditoria.id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fecha Origen</p>
                        <p className="font-medium">{data.auditoria.fecha_origen}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fecha Auditoría</p>
                        <p className="font-medium">{data.auditoria.fecha_auditoria || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Renglones</p>
                        <p className="font-medium">{data.auditoria.renglones}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Meses</p>
                        <p className="font-medium">{data.auditoria.cantmeses}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Auditor Especializado</p>
                        <p className="font-medium">{data.auditor || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Tipo</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                            Alto Costo
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Costo Total Estimado</p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                            {data.auditoria.costo_total || 'Alto'}
                        </span>
                    </div>
                </div>
                {data.auditoria.nota && (
                    <div className="mt-4 p-3 bg-orange-50 rounded border border-orange-200">
                        <p className="text-sm text-orange-700">
                            <strong>Nota y Justificación Clínica:</strong> {data.auditoria.nota}
                        </p>
                    </div>
                )}
                
                {/* Alerta específica para alto costo */}
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                            <strong>Tratamiento de Alto Costo:</strong> Esta auditoría incluye medicamentos de alto valor económico que requirieron evaluación especializada y justificación clínica detallada.
                        </div>
                    </div>
                </div>
            </div>

            {/* Información del paciente */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2" />
                    Datos del Paciente
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Apellido y Nombre</p>
                        <p className="font-medium">{data.paciente.apellido}, {data.paciente.nombre}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">DNI</p>
                        <p className="font-medium">{data.paciente.dni}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Fecha Nacimiento</p>
                        <p className="font-medium">{data.paciente.fecha_nacimiento || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Sexo</p>
                        <p className="font-medium">{data.paciente.sexo || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Teléfono</p>
                        <p className="font-medium">{data.paciente.telefono || '-'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{data.paciente.email || '-'}</p>
                    </div>
                </div>
            </div>

            {/* Información del médico especialista */}
            <div className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-orange-400">
                <h2 className="text-lg font-semibold mb-4 text-orange-800">Médico Prescriptor Especialista</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="font-medium">{data.medico.nombre}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Matrícula</p>
                        <p className="font-medium">MP-{data.medico.matricula}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Especialidad</p>
                        <p className="font-medium text-orange-700">{data.medico.especialidad || 'Especialista en Alto Costo'}</p>
                    </div>
                </div>
            </div>

            {/* Medicamentos por receta */}
            {Object.entries(data.recetas).map(([idReceta, recetaData]) => (
                <div key={idReceta} className="bg-white shadow rounded-lg p-6 mb-6 border-l-4 border-red-400">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-red-600" />
                        Receta N° {recetaData.nroreceta} - Medicamentos de Alto Costo
                    </h3>
                    <div className="overflow-x-auto -mx-6 px-6">
                        <div className="inline-block min-w-full align-middle">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-orange-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Medicamento
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cantidad
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Tipo Cobertura
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Costo Estimado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Justificación
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {recetaData.medicamentos.map((med) => (
                                            <tr key={med.id} className="hover:bg-orange-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {med.nombrecomercial}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {med.monodroga}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {med.cantidad}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        {med.tipo_cobertura || 'ONC'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                                        {med.costo_estimado || 'Alto'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(med.estado)}`}>
                                                        {getEstadoIcon(med.estado)}
                                                        <span className="ml-1">{getEstadoTexto(med.estado)}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                    <div className="truncate" title={med.justificacion}>
                                                        {med.justificacion || med.observacion || 'Medicamento de alto costo aprobado por criterio clínico'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Estado general con información de alto costo */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 text-center">
                <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 flex items-center justify-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-orange-600" />
                    Auditoría de Alto Costo Completada
                </h3>
                <p className="text-gray-700 mt-1">
                    Esta auditoría de alto costo fue procesada por {data.auditor || 'el auditor especializado'}
                    {data.auditoria.fecha_auditoria && ` el ${data.auditoria.fecha_auditoria}`}
                </p>
                <div className="mt-3 p-3 bg-orange-100 rounded-md border border-orange-200">
                    <p className="text-sm text-orange-800">
                        <strong>Nota importante:</strong> Los medicamentos incluidos en esta auditoría requirieron evaluación especializada 
                        debido a su alto costo y complejidad clínica. La justificación médica fue revisada según protocolos específicos.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerAuditoriaHistoricaAltoCosto;
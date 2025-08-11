// src/pages/HistorialAuditoria.jsx - MEJORADO ESTÉTICAMENTE
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { auditoriasService } from '../services/auditoriasService';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Breadcrumb from '../components/common/Breadcrumb';
import {
  ArrowLeftIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const HistorialAuditoria = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [auditoria, setAuditoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Obtener datos del estado de navegación (si existen)
  const fromHistorial = location.state?.fromHistorial || false;
  const pacienteDni = location.state?.pacienteDni || '';
  const returnPath = location.state?.returnPath || '/historial-paciente';

  // Breadcrumb dinámico basado en origen
  const breadcrumbItems = fromHistorial ? [
    { name: 'Auditoría', href: '/' },
    { name: 'Historial Paciente', href: returnPath },
    { name: `Auditoría ${id}`, current: true }
  ] : [
    { name: 'Auditoría', href: '/' },
    { name: `Auditoría ${id}`, current: true }
  ];

  // Cargar auditoría
  useEffect(() => {
    const loadAuditoria = async () => {
      if (!id) {
        setError('ID de auditoría no válido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        console.log('🔍 Cargando auditoría ID:', id);
        
        // OPCIÓN 1: Intentar usar getAuditoriaHistorial si existe
        let result;
        try {
          result = await auditoriasService.getAuditoriaHistorial(id);
          console.log('✅ Resultado getAuditoriaHistorial:', result);
        } catch (historialError) {
          console.log('⚠️ getAuditoriaHistorial falló, intentando getAuditoria normal');
          // OPCIÓN 2: Fallback a getAuditoria normal
          result = await auditoriasService.getAuditoria(id);
          console.log('✅ Resultado getAuditoria normal:', result);
        }
        
        if (result && result.success) {
          // Adaptar estructura de datos según qué endpoint respondió
          const auditoriaData = result.auditoria || result.data;
          
          if (auditoriaData) {
            setAuditoria(auditoriaData);
            console.log('✅ Auditoría cargada:', auditoriaData);
          } else {
            setError('No se encontraron datos de la auditoría');
          }
        } else {
          setError(result?.message || 'Error al cargar la auditoría');
        }
      } catch (error) {
        console.error('❌ Error cargando auditoría:', error);
        setError('Error inesperado al cargar la auditoría');
      } finally {
        setLoading(false);
      }
    };

    loadAuditoria();
  }, [id]);

  // Función para volver (mejorada)
  const handleBack = () => {
    if (fromHistorial && pacienteDni) {
      // Volver al historial del paciente con el DNI
      navigate(returnPath, { state: { dni: pacienteDni } });
    } else {
      // Si no hay contexto, ir al dashboard o atrás en historial
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  // 🔥 NUEVA FUNCIÓN - Renderizar estado de mes específico
  const renderEstadoMes = (medicamento, numeroMes) => {
    // Buscar el estado del mes específico en el medicamento
    const estadoMes = medicamento[`estado_auditoria${numeroMes}`] || medicamento[`estado_mes_${numeroMes}`];
    
    if (estadoMes === null || estadoMes === undefined) {
      return <span className="text-gray-400 text-xs">-</span>;
    }

    if (estadoMes === 1) {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" title="Aprobado" />;
    } else {
      return <XCircleIcon className="h-4 w-4 text-red-500" title="Rechazado" />;
    }
  };

  // Renderizar estado del medicamento
  const renderEstadoMedicamento = (medicamento) => {
    const estado = medicamento.estado_auditoria;
    const estadoTexto = medicamento.estado_texto;

    let icon, colorClass, bgClass;

    switch (estado) {
      case 1:
        icon = <CheckCircleIcon className="h-4 w-4" />;
        colorClass = 'text-green-700';
        bgClass = 'bg-green-100';
        break;
      case 2:
        icon = <XCircleIcon className="h-4 w-4" />;
        colorClass = 'text-red-700';
        bgClass = 'bg-red-100';
        break;
      case 3:
        icon = <ExclamationTriangleIcon className="h-4 w-4" />;
        colorClass = 'text-yellow-700';
        bgClass = 'bg-yellow-100';
        break;
      case 4:
        icon = <ClockIcon className="h-4 w-4" />;
        colorClass = 'text-blue-700';
        bgClass = 'bg-blue-100';
        break;
      default:
        icon = <ClockIcon className="h-4 w-4" />;
        colorClass = 'text-gray-700';
        bgClass = 'bg-gray-100';
    }

    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass} ${bgClass}`}>
        {icon}
        <span className="ml-1">{estadoTexto}</span>
      </div>
    );
  };

  // Loading
  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <Loading text="Cargando auditoría..." />
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Error al cargar auditoría
            </h1>
          </div>
        </div>
        <ErrorMessage 
          message={error} 
          onRetry={() => window.location.reload()}
          showRetry={true}
        />
      </div>
    );
  }

  // No data
  if (!auditoria) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-4"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Auditoría no encontrada
            </h1>
          </div>
          <div className="p-6">
            <div className="text-center text-gray-500">
              No se encontraron datos para la auditoría ID: {id}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Función auxiliar para obtener datos seguros
  const getDataSafely = (obj, path, defaultValue = '') => {
    try {
      return path.split('.').reduce((acc, key) => acc?.[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Header con botón de volver */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Detalle de Auditoría #{auditoria.id}
            </h1>
          </div>
          
          {/* Estado de la auditoría */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            auditoria.auditado === 1 ? 'bg-green-100 text-green-800' :
            auditoria.auditado === 2 ? 'bg-red-100 text-red-800' :
            auditoria.auditado === 3 ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {auditoria.estado_texto || (
              auditoria.auditado === 1 ? 'APROBADO' :
              auditoria.auditado === 2 ? 'RECHAZADO' :
              auditoria.auditado === 3 ? 'OBSERVADO' : 'PENDIENTE'
            )}
          </div>
        </div>

        {/* Información de la auditoría - Mejorado con fondos alternados */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Fecha de origen", value: getDataSafely(auditoria, 'fecha_origen') },
              { label: "Renglones", value: getDataSafely(auditoria, 'renglones', 0) },
              { label: "Meses", value: getDataSafely(auditoria, 'cantmeses', 0) },
              { label: "Auditor", value: getDataSafely(auditoria, 'auditor.nombre', 'No especificado'), highlight: true },
              { label: "Fecha auditoría", value: getDataSafely(auditoria, 'auditor.fecha_auditoria') }
            ].map((item, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <span className="text-gray-600 text-sm font-medium block">{item.label}:</span>
                <div className={`font-semibold mt-1 ${item.highlight ? 'text-blue-600' : 'text-gray-900'}`}>
                  {item.value}
                </div>
              </div>
            ))}
            
            {auditoria.nota && (
              <div className="md:col-span-3 bg-yellow-50/80 backdrop-blur-sm rounded-lg p-3 border border-yellow-200/50">
                <span className="text-gray-600 text-sm font-medium block">Nota:</span>
                <div className="font-medium text-yellow-800 mt-1">
                  {auditoria.nota}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información del paciente - Con separación visual mejorada */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-gray-50">
          <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Datos del Paciente
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Apellido y Nombre", value: `${getDataSafely(auditoria, 'paciente.apellido', 'N/A')}, ${getDataSafely(auditoria, 'paciente.nombre', 'N/A')}`, highlight: true },
              { label: "DNI", value: getDataSafely(auditoria, 'paciente.dni', 'N/A'), mono: true },
              { label: "Sexo", value: getDataSafely(auditoria, 'paciente.sexo', 'N/A') },
              { label: "Edad", value: `${getDataSafely(auditoria, 'paciente.edad', 0)} años` },
              { label: "Teléfono", value: getDataSafely(auditoria, 'paciente.telefono', 'N/A') },
              { label: "Email", value: getDataSafely(auditoria, 'paciente.email', 'N/A') }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-gray-600 text-sm font-medium block">{item.label}:</span>
                <div className={`font-semibold mt-1 ${
                  item.highlight ? 'text-blue-600' : 
                  item.mono ? 'text-gray-900 font-mono' : 'text-gray-900'
                }`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Información del médico y obra social - Con diseño mejorado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Médico */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-gradient-to-r from-emerald-50 to-teal-50">
            <BuildingOfficeIcon className="h-5 w-5 text-emerald-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Médico Prescriptor
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {[
              { label: "Nombre", value: getDataSafely(auditoria, 'medico.nombre', 'N/A'), highlight: true },
              { label: "Matrícula", value: getDataSafely(auditoria, 'medico.matricula', 'N/A'), mono: true },
              { label: "Especialidad", value: getDataSafely(auditoria, 'medico.especialidad', 'N/A') }
            ].map((item, index) => (
              <div key={index} className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100/50">
                <span className="text-gray-600 text-sm font-medium block">{item.label}:</span>
                <div className={`font-semibold mt-1 ${
                  item.highlight ? 'text-emerald-700' : 
                  item.mono ? 'text-gray-900 font-mono' : 'text-gray-900'
                }`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Obra Social */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-gradient-to-r from-purple-50 to-indigo-50">
            <CalendarIcon className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Obra Social
            </h3>
          </div>
          
          <div className="p-6 space-y-4">
            {[
              { label: "Obra Social", value: getDataSafely(auditoria, 'obraSocial.sigla', 'N/A'), highlight: true },
              { label: "Nº Afiliado", value: getDataSafely(auditoria, 'obraSocial.nroAfiliado', 'N/A'), mono: true },
              { label: "Fecha emisión", value: getDataSafely(auditoria, 'diagnostico.fechaemision', 'N/A') }
            ].map((item, index) => (
              <div key={index} className="bg-purple-50/50 rounded-lg p-3 border border-purple-100/50">
                <span className="text-gray-600 text-sm font-medium block">{item.label}:</span>
                <div className={`font-semibold mt-1 ${
                  item.highlight ? 'text-purple-700' : 
                  item.mono ? 'text-gray-900 font-mono' : 'text-gray-900'
                }`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnóstico - Con diseño mejorado */}
      {getDataSafely(auditoria, 'diagnostico.diagnostico') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center bg-gradient-to-r from-orange-50 to-amber-50">
            <DocumentTextIcon className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Diagnóstico
            </h3>
          </div>
          
          <div className="p-6">
            <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-4 rounded-lg border border-orange-100/50">
              <div className="font-medium text-gray-900 leading-relaxed">
                {getDataSafely(auditoria, 'diagnostico.diagnostico')}
              </div>
              {getDataSafely(auditoria, 'diagnostico.diagnostico2') && (
                <div className="mt-3 text-gray-600 leading-relaxed border-t border-orange-200 pt-3">
                  {getDataSafely(auditoria, 'diagnostico.diagnostico2')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔥 TABLA DE MEDICAMENTOS - Con diseño optimizado */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <div className="w-3 h-3 bg-cyan-500 rounded-full mr-3"></div>
            Medicamentos Prescritos ({auditoria.medicamentos?.length || 0})
          </h3>
        </div>

        {/* Estadísticas - Con mejor diseño */}
        {auditoria.metadata && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Aprobados", value: getDataSafely(auditoria, 'metadata.medicamentos_aprobados', 0), color: "bg-green-500" },
                { label: "Rechazados", value: getDataSafely(auditoria, 'metadata.medicamentos_rechazados', 0), color: "bg-red-500" },
                { label: "Observados", value: getDataSafely(auditoria, 'metadata.medicamentos_observados', 0), color: "bg-yellow-500" },
                { label: "Pendientes", value: getDataSafely(auditoria, 'metadata.medicamentos_pendientes', 0), color: "bg-gray-500" }
              ].map((stat, index) => (
                <div key={index} className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200">
                  <div className={`w-3 h-3 rounded-full ${stat.color} mr-2`}></div>
                  <span className="text-sm font-medium text-gray-600">{stat.label}:</span>
                  <span className="text-sm font-bold text-gray-900 ml-1">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de medicamentos CON OPTIMIZACIÓN DE ESPACIOS */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                  #
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                  Nombre Comercial
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Monodroga
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Presentación
                </th>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  Cant.
                </th>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Pos.
                </th>
                <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Cob.
                </th>
                {/* 🔥 MESES 1-6 optimizados */}
                {[1, 2, 3, 4, 5, 6].map(mes => (
                  <th key={mes} className="px-1 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    M{mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!auditoria.medicamentos || auditoria.medicamentos.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-6 py-8 text-center">
                    <div className="text-gray-400">
                      <DocumentTextIcon className="h-8 w-8 mx-auto mb-2" />
                      <div className="text-sm">No hay medicamentos registrados</div>
                    </div>
                  </td>
                </tr>
              ) : (
                auditoria.medicamentos.map((medicamento, index) => (
                  <tr key={medicamento.medicamento_key || index} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-2 py-3 text-sm font-medium text-gray-900 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                        {medicamento.nro_orden || index + 1}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm">
                      <div className="font-medium text-gray-900 leading-tight">
                        {medicamento.nombre_comercial || 'N/A'}
                      </div>
                      {medicamento.bono_nombre && (
                        <div className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded-full inline-block">
                          {medicamento.bono_nombre}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 leading-tight">
                      {medicamento.monodroga || 'N/A'}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-600 leading-tight">
                      {medicamento.presentacion || 'N/A'}
                    </td>
                    <td className="px-2 py-3 text-center text-sm">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                        {medicamento.cantprescripta || 0}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center text-xs text-gray-600">
                      {medicamento.posologia || '-'}
                    </td>
                    <td className="px-2 py-3 text-center text-sm">
                      {medicamento.cobertura ? (
                        <span className="inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {medicamento.cobertura}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    
                    {/* 🔥 MOSTRAR ESTADOS DE LOS 6 MESES */}
                    {[1, 2, 3, 4, 5, 6].map((numeroMes) => (
                      <td key={numeroMes} className="px-1 py-3 text-center">
                        <div className="flex justify-center">
                          {renderEstadoMes(medicamento, numeroMes)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información adicional del sistema - Con diseño mejorado */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-blue-900">
              Información de la auditoría
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Esta auditoría se encuentra en modo de solo lectura.
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "ID auditoría", value: auditoria.id },
                { label: "Vista", value: fromHistorial ? "Desde paciente" : "Acceso directo" },
                { label: "Medicamentos", value: auditoria.medicamentos?.length || 0 },
                { label: "Estado", value: auditoria.estado_texto || "Sin definir" }
              ].map((item, index) => (
                <div key={index} className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-200/50">
                  <div className="text-xs font-medium text-blue-600">{item.label}:</div>
                  <div className="text-sm font-semibold text-blue-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistorialAuditoria;
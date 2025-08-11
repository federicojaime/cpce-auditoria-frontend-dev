// src/hooks/useFarmalink.js
import { useState } from 'react';
import { auditoriasService } from '../services/auditoriasService';

export const useFarmalink = () => {
    const [procesando, setProcesando] = useState(false);
    const [progreso, setProgreso] = useState(0);
    const [mensaje, setMensaje] = useState('');
    const [errores, setErrores] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);

    // Función para validar y parsear formato de medicamento
    const validarMedicamento = (medicamento) => {
    try {
        if (!medicamento || typeof medicamento !== 'string') {
            throw new Error('Medicamento debe ser una cadena válida');
        }

        // 🔥 CORRECCIÓN: Usar underscore en lugar de guión
        const match = medicamento.match(/^(.+)_(\d+)$/);
        
        if (!match) {
            throw new Error(`Formato inválido: ${medicamento}. Se esperaba 'idreceta_numero'`);
        }

        const [, idreceta, nroOrdenStr] = match;
        const nroOrden = parseInt(nroOrdenStr, 10);

        if (!idreceta.trim()) {
            throw new Error('ID de receta no puede estar vacío');
        }

        if (isNaN(nroOrden) || nroOrden < 1) {
            throw new Error(`Número de orden inválido: ${nroOrdenStr}`);
        }

        return {
            esValido: true,
            idreceta: idreceta.trim(),
            nroOrden,
            original: medicamento
        };

    } catch (error) {
        return {
            esValido: false,
            error: error.message,
            original: medicamento
        };
    }
};
    const iniciarProcesamiento = async (auditoriaId, chequedos, configuracion = {}) => {
    try {
        setProcesando(true);
        setProgreso(0);
        setErrores([]);
        setMostrarModal(true);
        setMensaje('Iniciando procesamiento Farmalink...');

        console.log('🚀 Iniciando procesamiento Farmalink');
        console.log('Auditoría ID:', auditoriaId);
        console.log('Medicamentos chequedos:', chequedos);

        // 1. Validar formato de medicamentos antes de procesar
        const medicamentosAprobados = chequedos.split(',').filter(Boolean);
        const medicamentosValidados = [];
        const erroresValidacion = [];

        for (const medicamento of medicamentosAprobados) {
            const validacion = validarMedicamento(medicamento);
            
            if (validacion.esValido) {
                medicamentosValidados.push(validacion);
                console.log(`✅ Medicamento válido: ${medicamento} → ID: ${validacion.idreceta}, Orden: ${validacion.nroOrden}`);
            } else {
                erroresValidacion.push({
                    medicamento: validacion.original,
                    error: `Formato inválido: ${validacion.error}`
                });
                console.log(`❌ Medicamento inválido: ${medicamento} → ${validacion.error}`);
            }
        }

        if (medicamentosValidados.length === 0) {
            throw new Error('No hay medicamentos con formato válido para procesar');
        }

        if (erroresValidacion.length > 0) {
            console.log(`⚠️ ${erroresValidacion.length} medicamentos con formato inválido serán omitidos`);
        }

        // 2. Inicializar tokens
        setMensaje('Obteniendo tokens de autorización...');
        setProgreso(5);

        const inicializacion = await auditoriasService.procesarFarmalink('iniciar', {});
        
        if (inicializacion.status !== 'success') {
            throw new Error(inicializacion.message || 'Error al inicializar Farmalink');
        }

        const { tokenReceta, tokenAfiliado } = inicializacion;
        console.log('✅ Tokens obtenidos');

        // 3. Procesar medicamentos individuales
        const totalMedicamentos = medicamentosValidados.length;
        setMensaje(`Procesando ${totalMedicamentos} medicamentos válidos...`);
        setProgreso(10);

        const resultados = [];
        const erroresEncontrados = [...erroresValidacion]; // Incluir errores de validación
        let medicamentosCronicos = [];

        // Procesar cada medicamento validado
        for (let i = 0; i < medicamentosValidados.length; i++) {
            const medicamentoData = medicamentosValidados[i];
            const progresoActual = 10 + ((i + 1) / totalMedicamentos) * 70;
            
            setMensaje(`Procesando ${i + 1}/${totalMedicamentos}: ${medicamentoData.original}`);
            setProgreso(Math.round(progresoActual));

            try {
                // 🔥 CORRECCIÓN: Pasar datos correctos al backend
                const resultado = await auditoriasService.procesarFarmalink('procesar_item', {
                    item: medicamentoData.original,
                    idreceta: medicamentoData.idreceta,
                    nroOrden: medicamentoData.nroOrden,
                    tokenReceta,
                    tokenAfiliado
                });

                if (resultado.success) {
                    resultados.push({
                        medicamento: medicamentoData.original,
                        numero_farmalink: resultado.numeroFarmalink,
                        estado: 'OK'
                    });

                    if (resultado.tipo === 'cronico') {
                        medicamentosCronicos.push(medicamentoData.original);
                    }

                    console.log(`✅ ${medicamentoData.original} → ${resultado.numeroFarmalink}`);
                } else {
                    erroresEncontrados.push({
                        medicamento: medicamentoData.original,
                        error: resultado.message || 'Error desconocido'
                    });
                    console.log(`❌ Error en ${medicamentoData.original}: ${resultado.message}`);
                }
            } catch (error) {
                console.error(`Error procesando ${medicamentoData.original}:`, error);
                erroresEncontrados.push({
                    medicamento: medicamentoData.original,
                    error: error.message || 'Error de conexión'
                });
            }

            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // 4. Procesar medicamentos crónicos (AE)
        if (medicamentosCronicos.length > 0) {
            setProgreso(80);
            setMensaje('Creando autorizaciones especiales para medicamentos crónicos...');

            try {
                const resultadoCronicos = await auditoriasService.procesarFarmalink('finalizar_cronicos', {
                    tokenAfiliado
                });

                if (resultadoCronicos.success) {
                    console.log(`✅ AE crónicas creadas: ${resultadoCronicos.creadas}`);
                    setMensaje(`AE crónicas creadas: ${resultadoCronicos.creadas}`);
                    
                    if (resultadoCronicos.errores && resultadoCronicos.errores.length > 0) {
                        erroresEncontrados.push(...resultadoCronicos.errores.map(error => ({
                            medicamento: 'AE Crónica',
                            error: error
                        })));
                    }
                } else {
                    erroresEncontrados.push({
                        medicamento: 'AE Crónicas',
                        error: resultadoCronicos.message || 'Error creando autorizaciones especiales'
                    });
                }
            } catch (errorCronicos) {
                console.error('Error procesando crónicos:', errorCronicos);
                erroresEncontrados.push({
                    medicamento: 'AE Crónicas',
                    error: errorCronicos.message || 'Error en autorizaciones especiales'
                });
            }
        }

        // 5. Finalización
        setProgreso(100);
        setErrores(erroresEncontrados);
        
        const exitosos = resultados.length;
        const conErrores = erroresEncontrados.length;
        
        if (conErrores === 0) {
            setMensaje(`✅ Procesamiento completado: ${exitosos} medicamentos procesados exitosamente`);
        } else {
            setMensaje(`⚠️ Procesamiento completado: ${exitosos} exitosos, ${conErrores} con problemas`);
        }

        console.log('🏁 Procesamiento Farmalink completado');
        console.log(`Exitosos: ${exitosos}, Errores: ${conErrores}`);
        
        // Log de errores por tipo
        if (erroresValidacion.length > 0) {
            console.log(`📋 Errores de formato: ${erroresValidacion.length}`);
            erroresValidacion.forEach(e => console.log(`   - ${e.medicamento}: ${e.error}`));
        }

        return {
            success: true,
            resultados,
            errores: erroresEncontrados,
            exitosos,
            conErrores,
            erroresValidacion: erroresValidacion.length
        };

    } catch (error) {
        console.error('❌ Error en procesamiento Farmalink:', error);
        setProgreso(0);
        setMensaje(`Error: ${error.message}`);
        setErrores([{
            medicamento: 'SISTEMA',
            error: error.message || 'Error inesperado'
        }]);

        return {
            success: false,
            message: error.message || 'Error inesperado'
        };
    } finally {
        setProcesando(false);
    }
};
    const cerrarModal = () => {
        setMostrarModal(false);
        setProgreso(0);
        setMensaje('');
        setErrores([]);
    };

    const verificarEstado = async (auditoriaId) => {
        try {
            const resultado = await auditoriasService.verificarEstadoFarmalink(auditoriaId);
            return resultado;
        } catch (error) {
            console.error('Error verificando estado Farmalink:', error);
            return {
                success: false,
                message: error.message || 'Error al verificar estado'
            };
        }
    };

    const reprocesar = async (auditoriaId, medicamentos) => {
        try {
            const resultado = await auditoriasService.reprocesarFarmalink(auditoriaId, medicamentos);
            return resultado;
        } catch (error) {
            console.error('Error reprocesando Farmalink:', error);
            return {
                success: false,
                message: error.message || 'Error al reprocesar'
            };
        }
    };

    const procesarConFarmalink = async (datosFarmalink, callback) => {
        const resultado = await iniciarProcesamiento(
            datosFarmalink.idaudi,
            datosFarmalink.chequedos,
            datosFarmalink
        );

        if (resultado.success) {
            callback(true);
        } else {
            callback(false);
        }
    };

    return {
        // Estados
        procesando,
        progreso,
        mensaje,
        errores,
        mostrarModal,
        
        // Funciones
        procesarConFarmalink,
        iniciarProcesamiento,
        cerrarModal,
        verificarEstado,
        reprocesar,
        validarMedicamento // Exponer función de validación para testing
    };
};

export default useFarmalink;
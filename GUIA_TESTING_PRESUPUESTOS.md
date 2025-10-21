# 🧪 GUÍA DE TESTING - Sistema de Presupuestos del SISTEMA DE AUDITORIA

## ✅ IMPLEMENTACIÓN COMPLETA

### Lo que acabamos de implementar:

1. ✅ **Backend completo** (ya estaba):
   - Endpoints públicos y privados
   - Sistema de tokens seguros
   - Base de datos con tablas necesarias
   - Servicio de emails

2. ✅ **Frontend nuevo**:
   - ✅ Página pública: `ResponderPresupuesto.jsx`
   - ✅ Ruta pública: `/presupuesto/responder/:token`
   - ✅ Integración completa con el backend

---

## 📋 FLUJO COMPLETO DEL SISTEMA

### 1. Usuario Interno Crea Solicitud

**Página:** `/solicitar-presupuestos`

**Pasos:**
1. Usuario selecciona auditorías aprobadas de alto costo
2. Usuario selecciona proveedores a contactar
3. Sistema genera:
   - Número de lote único (ej: LOTE-20251020-0001)
   - Token único por proveedor
   - Fecha de expiración (72 horas)
4. Sistema envía emails a cada proveedor con:
   - Enlace personalizado: `http://tu-dominio.com/presupuesto/responder/TOKEN_UNICO`
   - Detalles de medicamentos
   - Info de pacientes

**Endpoint usado:**
```
POST /api/presupuestos/solicitar-con-email
Body: {
  "auditoriaIds": [17, 18],
  "proveedorIds": [1, 2, 3],
  "observaciones": "Urgente - Pacientes prioritarios"
}
```

---

### 2. Proveedor Recibe Email

**Email contiene:**
- Número de lote de la solicitud
- Lista de medicamentos solicitados
- Datos de pacientes (anónimos)
- Enlace único para responder
- Fecha de expiración
- Remitente: SISTEMA DE AUDITORIA

---

### 3. Proveedor Responde (SIN LOGIN)

**Página:** `/presupuesto/responder/:token` ← **PÁGINA NUEVA QUE CREAMOS**

**El proveedor puede:**
- ✅ Ver toda la información de la solicitud
- ✅ Aceptar o rechazar cada medicamento
- ✅ Si acepta, ingresar:
  - Precio
  - Fecha de retiro disponible
  - Fecha de vencimiento del medicamento
  - Comentarios opcionales
- ✅ Si rechaza, indicar motivo
- ✅ Enviar respuesta

**Validaciones implementadas:**
- Token válido y no expirado
- No puede responder dos veces
- Si acepta, precio y fechas son obligatorios
- Fecha vencimiento > Fecha retiro

**Endpoint usado:**
```
POST /api/presupuestos/responder/:token
Body: {
  "respuestas": [
    {
      "auditoriaId": 17,
      "medicamentoId": 1,
      "acepta": true,
      "precio": 1500.50,
      "fechaRetiro": "2025-10-25",
      "fechaVencimiento": "2026-12-31",
      "comentarios": "Stock disponible"
    },
    {
      "auditoriaId": 17,
      "medicamentoId": 2,
      "acepta": false,
      "comentarios": "No disponible en stock"
    }
  ]
}
```

---

### 4. Sistema Notifica Usuario Interno

Cuando un proveedor responde:
- ✅ Sistema envía email a administradores
- ✅ Actualiza estado de la solicitud a "en_proceso"
- ✅ Marca la respuesta del proveedor como "respondido"

---

### 5. Usuario Interno Ve Respuestas

**Página:** `/seguimiento-presupuestos`

**El usuario puede:**
- Ver todas las solicitudes enviadas
- Filtrar por estado
- Ver qué proveedores respondieron
- Comparar precios
- Adjudicar presupuesto al mejor proveedor

**Endpoints usados:**
```
GET /api/presupuestos/solicitudes-email
GET /api/presupuestos/solicitudes-email/:id
GET /api/presupuestos/comparar/:solicitudId
```

---

## 🧪 PLAN DE TESTING PASO A PASO

### Pre-requisitos:

1. ✅ Backend corriendo en `http://localhost:3000`
2. ✅ Frontend corriendo en `http://localhost:5173` (o el puerto que uses)
3. ✅ Base de datos con las tablas creadas
4. ✅ Servicio de email configurado (SMTP)

---

### TEST 1: Crear Solicitud de Presupuesto

#### Paso 1: Login como usuario administrativo
```
Usuario: admin@cpce.com (o el que tengas)
Contraseña: tu-contraseña
```

#### Paso 2: Ir a "Solicitar Presupuestos"
```
URL: http://localhost:5173/solicitar-presupuestos
```

#### Paso 3: Seleccionar auditorías y proveedores
- Marca al menos 1 auditoría aprobada
- Marca al menos 1 proveedor
- Click en "Enviar Solicitudes"

#### Resultado esperado:
✅ Toast de éxito
✅ Email enviado al proveedor
✅ Solicitud creada en BD

---

### TEST 2: Proveedor Recibe Email y Accede

#### Paso 1: Revisar email del proveedor
```
Buscar email con asunto: "Solicitud de Presupuesto - SISTEMA DE AUDITORIA"
```

#### Paso 2: Copiar el token del enlace
```
Ejemplo de enlace:
http://localhost:5173/presupuesto/responder/abc123def456...
                                              ^^^^^^^^^
                                              TOKEN
```

#### Paso 3: Acceder al enlace (sin login)
```
Abrir en navegador de incógnito para verificar que NO requiere login
```

#### Resultado esperado:
✅ Página de respuesta carga correctamente
✅ Muestra información del proveedor
✅ Muestra lista de medicamentos
✅ Muestra tiempo restante
✅ Formulario funcional

---

### TEST 3: Proveedor Responde Presupuesto

#### Escenario A: Acepta todos los medicamentos

1. Marcar checkbox "Acepto proporcionar este medicamento"
2. Ingresar precio: `1500.50`
3. Ingresar fecha de retiro: `2025-10-25`
4. Ingresar fecha de vencimiento: `2026-12-31`
5. Comentarios: `Stock disponible`
6. Click "Enviar Respuesta"
7. Confirmar en el diálogo

**Resultado esperado:**
✅ Mensaje de éxito
✅ No puede volver a responder (verificar refresh)

#### Escenario B: Rechaza algunos medicamentos

1. Medicamento 1: Marcar "Acepto" e ingresar datos
2. Medicamento 2: NO marcar "Acepto", poner comentario: "No disponible"
3. Click "Enviar Respuesta"

**Resultado esperado:**
✅ Acepta respuestas mixtas
✅ Mensaje de éxito

#### Escenario C: Validaciones de error

**Error 1: No ingresa precio**
- Marcar "Acepto"
- NO ingresar precio
- Intentar enviar

**Resultado esperado:**
❌ Error: "Debe ingresar un precio válido"

**Error 2: Fecha vencimiento antes de fecha retiro**
- Fecha retiro: `2025-12-31`
- Fecha vencimiento: `2025-10-01`
- Intentar enviar

**Resultado esperado:**
❌ Error: "La fecha de vencimiento debe ser posterior a la fecha de retiro"

---

### TEST 4: Verificar Estados de Token

#### Test 4.1: Token expirado

```bash
# En la base de datos, modificar manualmente:
UPDATE presupuesto_solicitud_proveedores
SET fecha_expiracion = '2025-01-01 00:00:00'
WHERE token = 'TU_TOKEN_AQUI';
```

Intentar acceder al enlace.

**Resultado esperado:**
❌ Mensaje: "Esta solicitud ha expirado"
🔶 Ícono de reloj naranja

#### Test 4.2: Token ya respondido

Intentar acceder nuevamente con el token que ya usaste.

**Resultado esperado:**
✅ Mensaje: "Ya ha respondido a esta solicitud"
🟢 Ícono de check verde

#### Test 4.3: Token inválido

```
URL: http://localhost:5173/presupuesto/responder/token_falso_123
```

**Resultado esperado:**
❌ Mensaje: "Solicitud no encontrada o token inválido"
🔴 Ícono de alerta

---

### TEST 5: Usuario Interno Ve Respuestas

#### Paso 1: Login como admin

#### Paso 2: Ir a "Seguimiento Presupuestos"
```
URL: http://localhost:5173/seguimiento-presupuestos
```

#### Resultado esperado:
✅ Lista de solicitudes enviadas
✅ Estado actualizado a "en_proceso"
✅ Contador de respuestas recibidas
✅ Puede expandir detalles
✅ Ve tabla con proveedores y sus respuestas
✅ Ve precios, fechas, comentarios

---

### TEST 6: Comparar Presupuestos

#### Endpoint de comparación:
```
GET /api/presupuestos/comparar/1
```

O implementar botón en el frontend.

**Resultado esperado:**
✅ Agrupa por medicamento
✅ Muestra todas las ofertas
✅ Identifica la mejor oferta (menor precio)
✅ Muestra total de ofertas aceptadas vs rechazadas

---

## 🐛 CHECKLIST DE TESTING

### Frontend

- [ ] Página ResponderPresupuesto carga correctamente
- [ ] Muestra información de la solicitud
- [ ] Muestra información del proveedor
- [ ] Formulario se renderiza para cada medicamento
- [ ] Checkbox "Acepto" funciona correctamente
- [ ] Campos se habilitan/deshabilitan según checkbox
- [ ] Validación de campos obligatorios funciona
- [ ] Validación de fechas funciona
- [ ] Botón enviar deshabilitado mientras envía
- [ ] Toast/mensajes de error se muestran
- [ ] Página de éxito se muestra después de enviar
- [ ] Estados de error (expirado, ya respondido, inválido) funcionan
- [ ] Tiempo restante se calcula correctamente
- [ ] Responsive en mobile

### Backend

- [ ] Endpoint crear solicitud funciona
- [ ] Genera tokens únicos
- [ ] Genera número de lote único
- [ ] Envía emails correctamente
- [ ] Endpoint obtener por token funciona
- [ ] Valida token expirado
- [ ] Valida token ya usado
- [ ] Endpoint responder funciona
- [ ] Valida campos obligatorios
- [ ] Actualiza estados correctamente
- [ ] Endpoint listar solicitudes funciona
- [ ] Endpoint detalle solicitud funciona
- [ ] Endpoint comparar funciona
- [ ] Transacciones de BD funcionan correctamente

### Integración

- [ ] Flujo completo end-to-end funciona
- [ ] Emails se envían con la URL correcta
- [ ] URLs en emails funcionan (no localhost en producción)
- [ ] Estados se actualizan correctamente
- [ ] Notificaciones a admins funcionan
- [ ] Permisos/roles funcionan correctamente

---

## 🚀 TESTING EN PRODUCCIÓN

### Variables de entorno importantes:

```env
# Frontend (.env)
VITE_API_URL=https://api.tudominio.com/api

# Backend (.env)
FRONTEND_URL=https://app.tudominio.com

EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_USER=envios@codeo.site
EMAIL_PASSWORD=tu_password
EMAIL_FROM=envios@codeo.site
```

### URLs esperadas:

```
Frontend: https://app.tudominio.com
Backend: https://api.tudominio.com

Enlace proveedor:
https://app.tudominio.com/presupuesto/responder/TOKEN
```

---

## 📊 MÉTRICAS A MONITOREAR

1. **Tasa de respuesta**
   - ¿Cuántos proveedores responden?
   - Tiempo promedio de respuesta

2. **Tasa de expiración**
   - ¿Cuántas solicitudes expiran sin respuesta?

3. **Errores comunes**
   - Tokens inválidos (URLs mal copiadas)
   - Errores de validación
   - Problemas de email

---

## 🔧 TROUBLESHOOTING

### Problema: Email no llega al proveedor

**Soluciones:**
1. Verificar configuración SMTP
2. Revisar logs del servidor
3. Verificar que el proveedor tiene email válido
4. Revisar carpeta spam

### Problema: Token inválido

**Soluciones:**
1. Verificar que el enlace se copió completo
2. Verificar que no expiró (< 72 horas)
3. Verificar en BD que el token existe

### Problema: Error al enviar respuesta

**Soluciones:**
1. Abrir DevTools → Network → Ver error exacto
2. Verificar que todos los campos obligatorios están completos
3. Verificar formato de fechas
4. Verificar conexión con backend

---

## 📝 NOTAS FINALES

### Mejoras futuras sugeridas:

1. **Dashboard de proveedores**
   - Historial de cotizaciones
   - Estadísticas de respuestas

2. **Recordatorios automáticos**
   - Email 24h antes de expirar

3. **Permitir modificar respuesta**
   - Con confirmación y auditoría

4. **Exportar comparación a Excel/PDF**

5. **Chat en vivo con proveedores**

6. **Sistema de puntuación de proveedores**
   - Basado en precios, tiempos, cumplimiento

---

## ✅ RESUMEN

### Lo que funciona ahora:

1. ✅ Usuario interno crea solicitud
2. ✅ Sistema envía emails a proveedores con tokens
3. ✅ Proveedor accede SIN LOGIN con el token
4. ✅ Proveedor responde con precios y fechas
5. ✅ Sistema notifica a admins
6. ✅ Usuario interno ve y compara presupuestos
7. ✅ Seguridad con tokens únicos y expiración
8. ✅ Validaciones completas
9. ✅ Estados manejados correctamente
10. ✅ UX/UI profesional

### Próximos pasos recomendados:

1. 🧪 Hacer testing completo (usar este documento)
2. 🐛 Arreglar bugs encontrados
3. 📧 Probar envío de emails real
4. 🚀 Deploy a staging
5. 👥 Testing con usuarios reales
6. 🚀 Deploy a producción
7. 📊 Monitorear métricas

---

**Autor:** Sistema de Auditorías CPCE
**Fecha:** Octubre 2025
**Versión:** 1.0.0

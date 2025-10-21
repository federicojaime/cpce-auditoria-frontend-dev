# 🧪 PRUEBA: Horas de Expiración Configurables

## ✅ IMPLEMENTACIÓN COMPLETADA

### Archivos modificados:

1. ✅ **`src/pages/SolicitarPresupuestos.jsx`**
   - Agregado estado `horasExpiracion` (default: 72)
   - Agregado estado `modoExpiracionPersonalizado`
   - Agregadas funciones `calcularFechaExpiracion()` y `calcularDiasYHoras()`
   - Agregado componente UI con Select + Input personalizado
   - Incluido `horasExpiracion` en el request al backend

---

## 🎨 CARACTERÍSTICAS IMPLEMENTADAS

### 1. Select con Opciones Predefinidas

El usuario puede seleccionar entre:
- 12 horas (medio día) - Urgente
- 24 horas (1 día) - Muy urgente
- 48 horas (2 días) - Urgente
- **72 horas (3 días) - Recomendado** ⭐ (Por defecto)
- 96 horas (4 días)
- 120 horas (5 días)
- 168 horas (1 semana)
- 336 horas (2 semanas)
- 720 horas (30 días / máximo)
- ⚙️ Personalizado... (abre input manual)

### 2. Input Personalizado

Cuando selecciona "Personalizado":
- Input numérico aparece
- Validación en tiempo real: min=1, max=720
- Placeholder: "Ej: 48"
- Texto de ayuda: "Mínimo: 1 hora | Máximo: 720 horas (30 días)"

### 3. Preview en Tiempo Real

Muestra automáticamente:
- 📅 Fecha y hora exacta de expiración
- ⏰ Equivalencia en días y horas
- Ejemplo: "3 días y 12 horas"

---

## 🧪 PLAN DE PRUEBAS

### TEST 1: Valor por Defecto (72 horas)

1. Abrir `/solicitar-presupuestos`
2. NO cambiar el select de expiración
3. Seleccionar auditorías y proveedores
4. Click "Enviar Solicitudes"
5. Abrir DevTools → Network → Ver request
6. **Verificar:** `horasExpiracion: 72` en el body

**Resultado esperado:** ✅ Backend recibe 72 horas

---

### TEST 2: Seleccionar Opción Predefinida (24 horas)

1. Abrir `/solicitar-presupuestos`
2. Cambiar select a "24 horas (1 día) - Muy urgente"
3. **Verificar:** Preview muestra fecha de mañana a esta misma hora
4. Enviar solicitud
5. **Verificar:** `horasExpiracion: 24` en el request

**Resultado esperado:** ✅ Backend recibe 24 horas

---

### TEST 3: Modo Personalizado (48 horas)

1. Abrir `/solicitar-presupuestos`
2. Cambiar select a "⚙️ Personalizado..."
3. **Verificar:** Aparece input numérico
4. Ingresar: `48`
5. **Verificar:** Preview actualiza a 2 días
6. Enviar solicitud
7. **Verificar:** `horasExpiracion: 48` en el request

**Resultado esperado:** ✅ Backend recibe 48 horas

---

### TEST 4: Validación Mínima (< 1 hora)

1. Modo personalizado
2. Intentar ingresar: `0`
3. **Verificar:** Input no permite valor < 1

**Resultado esperado:** ✅ Validación frontend funciona

---

### TEST 5: Validación Máxima (> 720 horas)

1. Modo personalizado
2. Intentar ingresar: `721`
3. **Verificar:** Input no permite valor > 720

**Resultado esperado:** ✅ Validación frontend funciona

---

### TEST 6: Cambiar entre Modos

1. Seleccionar "72 horas"
2. Cambiar a "Personalizado"
3. Ver que aparece input con valor "72"
4. Cambiar input a "100"
5. Volver a seleccionar "48 horas"
6. **Verificar:** Input desaparece, valor es 48

**Resultado esperado:** ✅ Cambio de modo funciona correctamente

---

### TEST 7: Preview Actualización en Tiempo Real

1. Modo personalizado
2. Ingresar diferentes valores: 1, 12, 24, 48, 72, 168
3. **Verificar:**
   - Fecha de expiración cambia inmediatamente
   - Equivalencia en días se calcula correctamente

**Ejemplos:**
- 24h → "1 día"
- 25h → "1 día y 1 hora"
- 48h → "2 días"
- 72h → "3 días"
- 168h → "7 días"

**Resultado esperado:** ✅ Cálculos correctos

---

## 📊 REQUEST ESPERADO

Cuando el usuario envía la solicitud, el request debe ser:

```json
{
  "auditoriaIds": [17, 18],
  "proveedorIds": [1, 2, 3],
  "observaciones": "Solicitud de cotización para 2 auditoría(s) de alto costo",
  "horasExpiracion": 48
}
```

---

## ✅ VERIFICACIONES VISUALES

### En la UI debe verse:

1. **Card de "Tiempo de Expiración"** con ícono de reloj naranja
2. **Select dropdown** con opciones claras
3. **Input personalizado** (solo si selecciona "Personalizado")
4. **Box naranja/amarillo** con:
   - Fecha exacta de expiración
   - Equivalencia en días y horas
5. **Diseño responsive** (se ve bien en mobile)

---

## 🐛 TROUBLESHOOTING

### Problema: Input personalizado no aparece
**Solución:** Verificar que seleccionaste "⚙️ Personalizado..." en el select

### Problema: Backend devuelve error de validación
**Solución:**
- Verificar que el valor está entre 1 y 720
- Verificar que se envía como `parseInt(horasExpiracion)`

### Problema: Fecha de expiración incorrecta
**Solución:**
- Verificar zona horaria del navegador
- Función usa `new Date()` local del cliente

### Problema: No se envía horasExpiracion en el request
**Solución:**
- Verificar línea 185 de SolicitarPresupuestos.jsx
- Debe incluir: `horasExpiracion: parseInt(horasExpiracion)`

---

## 📸 CAPTURAS DE PANTALLA (Esperadas)

### Vista Normal (72 horas seleccionado):
```
┌─────────────────────────────────────────────────┐
│ ⏰ Tiempo de Expiración                        │
│                                                  │
│ Seleccione un plazo:                            │
│ [72 horas (3 días) - Recomendado ▼]            │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ 📅 Los proveedores podrán responder hasta:│   │
│ │ 23/10/2025 14:30                          │   │
│ │ ⏰ 72 horas (3 días)                       │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Vista Personalizada (100 horas):
```
┌─────────────────────────────────────────────────┐
│ ⏰ Tiempo de Expiración                        │
│                                                  │
│ Seleccione un plazo:                            │
│ [⚙️ Personalizado... ▼]                        │
│                                                  │
│ Horas personalizadas:                           │
│ [100              ]                             │
│ Mínimo: 1 hora | Máximo: 720 horas (30 días)   │
│                                                  │
│ ┌──────────────────────────────────────────┐   │
│ │ 📅 Los proveedores podrán responder hasta:│   │
│ │ 24/10/2025 18:30                          │   │
│ │ ⏰ 100 horas (4 días y 4 horas)            │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🎯 CHECKLIST FINAL

Antes de dar por completado, verificar:

- [ ] Select muestra todas las opciones
- [ ] Valor por defecto es 72 horas
- [ ] Modo personalizado se activa/desactiva correctamente
- [ ] Input personalizado valida min=1, max=720
- [ ] Preview de fecha se actualiza en tiempo real
- [ ] Equivalencia en días se calcula bien
- [ ] Request incluye `horasExpiracion` como número
- [ ] Backend acepta el valor sin errores
- [ ] Email enviado al proveedor muestra la expiración correcta
- [ ] Responsive design funciona en mobile

---

## 🚀 CÓMO PROBAR RÁPIDO

```bash
# 1. Abrir consola del navegador (F12)

# 2. Ir a Solicitar Presupuestos
http://localhost:5173/solicitar-presupuestos

# 3. Seleccionar 1 auditoría y 1 proveedor

# 4. Cambiar horas de expiración a 24

# 5. Click "Enviar Solicitudes"

# 6. En la pestaña Network, buscar el request:
POST /api/presupuestos/solicitar-con-email

# 7. Ver el Payload:
{
  "auditoriaIds": [17],
  "proveedorIds": [1],
  "observaciones": "...",
  "horasExpiracion": 24  // ✅ ESTO DEBE ESTAR
}

# 8. Ver la respuesta del servidor:
{
  "mensaje": "Solicitud de presupuesto creada exitosamente",
  "loteNumero": "LOTE-20251020-XXXX",
  "fechaExpiracion": "2025-10-21T14:30:00.000Z",  // ✅ 24 horas desde ahora
  ...
}
```

---

## 📧 VERIFICAR EMAIL DEL PROVEEDOR

El email debe decir algo como:

```
⏰ IMPORTANTE: Este enlace expira el 21/10/2025 14:30
(24 horas desde el envío)

Haga clic en el siguiente enlace para responder:
http://localhost:5173/presupuesto/responder/TOKEN
```

---

## ✅ RESULTADO FINAL ESPERADO

1. ✅ Usuario puede configurar horas de expiración fácilmente
2. ✅ Preview muestra claramente cuándo expira
3. ✅ Backend recibe el valor correcto
4. ✅ Email muestra la expiración correcta
5. ✅ Proveedor ve el tiempo restante en la página de respuesta
6. ✅ Sistema expira tokens automáticamente

---

**Fecha de prueba:** Octubre 2025
**Versión:** 2.1.0 (con horas configurables)
**Estado:** ✅ IMPLEMENTADO Y LISTO PARA PROBAR

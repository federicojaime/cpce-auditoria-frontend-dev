# 🔧 FIX: Backend no retorna campo `lugar_retiro`

## 📅 Fecha: 2025-10-22

---

## ❌ Problema Confirmado

El modal comparador en el frontend **NO muestra el lugar de retiro** porque el endpoint del backend **NO está retornando** el campo `lugar_retiro`.

### Evidencia:
- ✅ La tabla `alt_presupuesto_respuesta_detalle` **SÍ tiene** la columna `lugar_retiro`
- ✅ El frontend **SÍ está implementado** para mostrar el campo
- ❌ El endpoint `/api/presupuestos/comparar/:solicitudId` **NO incluye** `lugar_retiro` en el SELECT

---

## 🔧 Solución: Actualizar Controller Backend

### Archivo a Modificar

**Ubicación:** `/controllers/presupuestoTokenController.js`
**Línea aproximada:** ~720 (según documentación)

### Cambio Necesario

#### ❌ ANTES (Probablemente actual):

```javascript
const query = `
    SELECT
        prd.id_proveedor AS proveedor_id,
        p.razon_social AS proveedor_nombre,
        prd.acepta,
        prd.precio,
        prd.fecha_retiro,
        prd.fecha_vencimiento,
        -- FALTA: prd.lugar_retiro
        prd.comentarios
    FROM alt_presupuesto_respuesta_detalle prd
    INNER JOIN alt_proveedor p ON prd.id_proveedor = p.id_proveedor
    WHERE prd.id_solicitud_proveedor IN (
        SELECT id_solicitud_proveedor
        FROM alt_solicitud_presupuesto_proveedores
        WHERE id_solicitud = ?
    )
    AND prd.id_auditoria = ?
    AND prd.id_medicamento = ?
    ORDER BY prd.precio ASC
`;
```

#### ✅ DESPUÉS (Corregido):

```javascript
const query = `
    SELECT
        prd.id_proveedor AS proveedor_id,
        p.razon_social AS proveedor_nombre,
        prd.acepta,
        prd.precio,
        prd.fecha_retiro,
        prd.fecha_vencimiento,
        prd.lugar_retiro,  -- ← AGREGADO
        prd.comentarios
    FROM alt_presupuesto_respuesta_detalle prd
    INNER JOIN alt_proveedor p ON prd.id_proveedor = p.id_proveedor
    WHERE prd.id_solicitud_proveedor IN (
        SELECT id_solicitud_proveedor
        FROM alt_solicitud_presupuesto_proveedores
        WHERE id_solicitud = ?
    )
    AND prd.id_auditoria = ?
    AND prd.id_medicamento = ?
    ORDER BY prd.precio ASC
`;
```

---

## 📝 Ubicación Exacta en el Código

### Función: `compararPresupuestos`

```javascript
/**
 * Comparar presupuestos de una solicitud
 * GET /api/presupuestos/comparar/:solicitudId
 */
const compararPresupuestos = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { solicitudId } = req.params;

        // ... código de validación ...

        // 🔍 BUSCAR ESTE QUERY:
        const queryRespuestas = `
            SELECT
                prd.id_auditoria,
                prd.id_medicamento,
                prd.id_proveedor AS proveedor_id,
                p.razon_social AS proveedor_nombre,
                prd.acepta,
                prd.precio,
                prd.fecha_retiro,
                prd.fecha_vencimiento,
                prd.lugar_retiro,  -- ⚠️ AGREGAR ESTA LÍNEA SI NO ESTÁ
                prd.comentarios
            FROM alt_presupuesto_respuesta_detalle prd
            INNER JOIN alt_proveedor p ON prd.id_proveedor = p.id_proveedor
            WHERE ...
        `;

        const [respuestas] = await connection.query(queryRespuestas, [solicitudId]);

        // ... resto del código ...

        res.json({
            comparacion: comparacionPorAuditoria,
            solicitudId: parseInt(solicitudId)
        });

    } catch (error) {
        console.error('Error al comparar presupuestos:', error);
        res.status(500).json({ error: 'Error al comparar presupuestos' });
    } finally {
        if (connection) connection.release();
    }
};
```

---

## 🧪 Cómo Verificar el Fix

### Paso 1: Aplicar el cambio

1. Abrir `/controllers/presupuestoTokenController.js`
2. Buscar la función `compararPresupuestos`
3. Buscar el SELECT de `alt_presupuesto_respuesta_detalle`
4. Agregar la línea: `prd.lugar_retiro,`
5. Guardar archivo

### Paso 2: Reiniciar el servidor

```bash
# Si usas npm:
npm restart

# Si usas PM2:
pm2 restart api

# Si ejecutas manualmente:
# Ctrl+C para detener
node server.js  # o npm start
```

### Paso 3: Probar en el Frontend

1. Abrir la aplicación en el navegador
2. Ir a "Seguimiento de Presupuestos"
3. Click en "📊 Comparar Presupuestos"
4. **Abrir consola del navegador (F12)**
5. Verificar el log:

```javascript
📊 Comparación recibida: {...}
📋 Medicamento SINTROM: [
  {
    proveedor_id: 1,
    proveedor_nombre: "Droguería Mario Luna",
    acepta: true,
    precio: 12312,
    fecha_retiro: "2026-09-22",
    fecha_vencimiento: "2027-09-22",
    lugar_retiro: "Sucursal Centro - Av. San Martín 456",  // ✅ DEBE APARECER
    comentarios: "tasdasd"
  }
]
```

### Paso 4: Verificar UI

Ahora el modal debe mostrar:

```
┌─────────────────────────────────────────────┐
│  Droguería Mario Luna                       │
│  $12.312                                    │
│  📅 Retiro: 22/9/2026                       │
│  🕐 Vence: 22/9/2027                        │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │ 📍 Lugar de Retiro:                    │ │  ✅ AHORA SÍ APARECE
│  │    Sucursal Centro - Av. San Martín...│ │
│  └────────────────────────────────────────┘ │
│                                             │
│  💬 tasdasd                                 │
│  [🏆 Adjudicar (Recomendado)]               │
└─────────────────────────────────────────────┘
```

---

## 🔍 Query de Verificación Manual

Si quieres verificar que los datos existen en la base de datos:

```sql
-- Ver si las respuestas tienen lugar_retiro
SELECT
    prd.id,
    prd.id_auditoria,
    prd.id_medicamento,
    p.razon_social AS proveedor,
    prd.acepta,
    prd.precio,
    prd.lugar_retiro,  -- ← Debe tener valor aquí
    prd.comentarios
FROM alt_presupuesto_respuesta_detalle prd
INNER JOIN alt_proveedor p ON prd.id_proveedor = p.id_proveedor
WHERE prd.id_solicitud_proveedor IN (
    SELECT id_solicitud_proveedor
    FROM alt_solicitud_presupuesto_proveedores
    WHERE id_solicitud = 1  -- ← Ajusta este ID
)
ORDER BY prd.id DESC
LIMIT 20;
```

**Resultado esperado:**
| id | proveedor | acepta | precio | lugar_retiro | comentarios |
|----|-----------|--------|--------|--------------|-------------|
| 45 | Droguería Mario Luna | 1 | 12312 | Sucursal Centro - Av. San Martín 456 | tasdasd |
| 46 | Droguería del Sud | 1 | 123123 | Local Principal - Calle Mitre 123 | asddasdasd |

---

## ⚠️ Casos Especiales

### Caso 1: El lugar_retiro es NULL en base de datos

Si las respuestas fueron creadas **antes** de implementar el campo obligatorio:

```sql
-- Ver cuántas respuestas tienen lugar_retiro NULL
SELECT
    COUNT(*) as total_sin_lugar,
    COUNT(CASE WHEN acepta = 1 THEN 1 END) as aceptadas_sin_lugar
FROM alt_presupuesto_respuesta_detalle
WHERE lugar_retiro IS NULL
AND fecha_respuesta < '2025-10-22';
```

**Solución temporal:**

```sql
-- Actualizar registros antiguos con valor por defecto
UPDATE alt_presupuesto_respuesta_detalle prd
INNER JOIN alt_proveedor p ON prd.id_proveedor = p.id_proveedor
SET prd.lugar_retiro = CONCAT('Contactar a ', p.razon_social, ' - Tel: ', COALESCE(p.telefono, 'Sin teléfono'))
WHERE prd.lugar_retiro IS NULL
AND prd.acepta = 1
AND prd.fecha_respuesta < '2025-10-22';
```

---

### Caso 2: El lugar_retiro es string vacía ''

Si por algún motivo el campo está vacío pero no NULL:

**Frontend ya maneja esto:**

```jsx
{oferta.lugar_retiro && (  // ← Solo muestra si tiene valor
    <div className="...">
        ...
    </div>
)}
```

**Para forzar que siempre se muestre:**

Cambiar el condicional en `SeguimientoPresupuestos.jsx` línea 788:

```jsx
// Antes (solo muestra si existe y no está vacío)
{oferta.lugar_retiro && (

// Después (siempre muestra, con fallback)
{(
    <div className="p-3 bg-green-50 border-l-4 border-green-500 text-sm mb-3">
        <div className="flex items-start">
            <MapPinIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-green-600" />
            <div>
                <div className="font-semibold text-green-900 mb-1">Lugar de Retiro:</div>
                <div className="text-gray-700">
                    {oferta.lugar_retiro || '⚠️ Sin especificar (contactar al proveedor)'}
                </div>
            </div>
        </div>
    </div>
)}
```

---

## 📋 Checklist de Implementación

### Backend:
- [ ] Abrir `/controllers/presupuestoTokenController.js`
- [ ] Buscar función `compararPresupuestos`
- [ ] Buscar SELECT de `alt_presupuesto_respuesta_detalle`
- [ ] Agregar `prd.lugar_retiro,` en el SELECT
- [ ] Guardar archivo
- [ ] Reiniciar servidor Node.js
- [ ] Probar endpoint manualmente con Postman/curl

### Frontend:
- [ ] Abrir modal comparador
- [ ] Verificar consola del navegador (F12)
- [ ] Confirmar que `lugar_retiro` aparece en los logs
- [ ] Verificar que la caja verde se muestra en UI
- [ ] Probar con varias solicitudes diferentes

### Base de Datos:
- [ ] Verificar que registros tienen valor en `lugar_retiro`
- [ ] Si hay registros antiguos, actualizarlos con valor por defecto
- [ ] Confirmar que nuevas respuestas incluyen `lugar_retiro`

---

## 🎯 Resultado Esperado

Después de aplicar este fix, el modal comparador mostrará:

```
┌─────────────────────────────────────────────────────────┐
│               🏆 MEJOR PRECIO                           │
│                                                         │
│            Droguería Mario Luna                         │
│                                                         │
│                  $12.312                                │
│                                                         │
│  📅 Retiro: 22/9/2026                                   │
│  🕐 Vence: 22/9/2027                                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📍 Lugar de Retiro:                              │  │
│  │    Sucursal Centro - Av. San Martín 456, Ciudad │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  💬 tasdasd                                             │
│                                                         │
│  [🏆 Adjudicar (Recomendado)]                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📞 Soporte

Si después de aplicar este fix el problema persiste:

1. **Compartir el output de la consola del navegador**
2. **Ejecutar el query de verificación manual** y compartir resultados
3. **Verificar que el servidor se reinició correctamente**

---

**Estado:** ✅ Fix identificado y documentado
**Acción requerida:** Aplicar cambio en backend y reiniciar servidor

# 🔧 Nuevo Endpoint Requerido en el Backend

## Endpoint: GET `/api/compras/en-presupuesto`

### Descripción:
Retorna las auditorías que ya tienen solicitud de presupuesto activa (estado_auditoria = 4).

---

## Implementación Backend

### Archivo: `routes/compras.js` o `routes/altoCosto.js`

```javascript
/**
 * GET /api/compras/en-presupuesto
 * Obtener auditorías que están en proceso de presupuesto (estado_auditoria = 4)
 */
router.get('/en-presupuesto', authMiddleware, async (req, res) => {
    try {
        const query = `
            SELECT
                r.idreceta,
                r.idauditoria,
                CONCAT(p.apellido, ', ', p.nombre) as paciente,
                p.dni,
                p.email as paciente_email,
                p.telefono as paciente_telefono,
                DATE_FORMAT(r.fecha_origen, '%d-%m-%Y') as fecha,

                -- Medicamentos con estado_auditoria = 4
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', m.idrecetamedic,
                            'nombre', v.nombre_comercial,
                            'monodroga', v.monodroga,
                            'presentacion', v.presentacion,
                            'cantidad', m.cantprescripta,
                            'precio', v.precio,
                            'estado', m.estado_auditoria
                        )
                    )
                    FROM rec_prescrmedicamento_alto_costo m
                    LEFT JOIN vademecum v ON m.codigo = v.id
                    WHERE m.idreceta = r.idreceta
                    AND m.estado_auditoria = 4
                ) as medicamentos,

                -- Información de la solicitud de presupuesto
                (
                    SELECT JSON_OBJECT(
                        'loteNumero', ps.lote_numero,
                        'fechaEnvio', ps.fecha_envio,
                        'fechaExpiracion', DATE_ADD(ps.fecha_envio, INTERVAL ps.horas_expiracion HOUR),
                        'estado', ps.estado,
                        'proveedores', (
                            SELECT JSON_ARRAYAGG(
                                JSON_OBJECT(
                                    'id', psp.id,
                                    'nombre', pr.nombre,
                                    'email', pr.email,
                                    'estado', psp.estado,
                                    'fechaRespuesta', psp.fecha_respuesta,
                                    'respondio', IF(psp.estado = 'respondido', true, false)
                                )
                            )
                            FROM presupuesto_solicitud_proveedores psp
                            INNER JOIN proveedores pr ON psp.proveedor_id = pr.id
                            WHERE psp.solicitud_id = ps.id
                        )
                    )
                    FROM presupuesto_solicitudes ps
                    INNER JOIN presupuesto_solicitud_auditorias psa ON ps.id = psa.solicitud_id
                    WHERE psa.auditoria_id = r.idauditoria
                    ORDER BY ps.fecha_envio DESC
                    LIMIT 1
                ) as presupuesto

            FROM rec_auditoria r
            INNER JOIN rec_paciente p ON r.idpaciente = p.id
            WHERE r.idobrasoc = 20
            AND EXISTS (
                SELECT 1 FROM rec_prescrmedicamento_alto_costo m2
                WHERE m2.idreceta = r.idreceta
                AND m2.estado_auditoria = 4
            )
            ORDER BY r.fecha_origen DESC
        `;

        const [rows] = await db.query(query);

        // Parsear JSON fields
        const auditorias = rows.map(row => ({
            ...row,
            medicamentos: row.medicamentos ? JSON.parse(row.medicamentos) : [],
            presupuesto: row.presupuesto ? JSON.parse(row.presupuesto) : null
        }));

        res.json({
            success: true,
            data: auditorias,
            count: auditorias.length
        });

    } catch (error) {
        console.error('Error obteniendo auditorías en presupuesto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener auditorías en presupuesto',
            error: error.message
        });
    }
});
```

---

## Respuesta Esperada

```json
{
  "success": true,
  "data": [
    {
      "idreceta": 12345,
      "idauditoria": 789,
      "paciente": "García, Juan",
      "dni": "12345678",
      "paciente_email": "juan@email.com",
      "paciente_telefono": "3512345678",
      "fecha": "20-10-2025",
      "medicamentos": [
        {
          "id": 1,
          "nombre": "SINTROM",
          "monodroga": "Acenocumarol",
          "presentacion": "4mg x 30 comp",
          "cantidad": 20,
          "precio": 326164,
          "estado": 4
        }
      ],
      "presupuesto": {
        "loteNumero": "LOTE-20251020-1234",
        "fechaEnvio": "2025-10-20T14:30:00.000Z",
        "fechaExpiracion": "2025-10-23T14:30:00.000Z",
        "estado": "en_proceso",
        "proveedores": [
          {
            "id": 1,
            "nombre": "Farmacia Central",
            "email": "farmacia@central.com",
            "estado": "enviado",
            "fechaRespuesta": null,
            "respondio": false
          },
          {
            "id": 2,
            "nombre": "Droguería del Sur",
            "email": "contacto@drogueriadelsur.com",
            "estado": "respondido",
            "fechaRespuesta": "2025-10-21T10:00:00.000Z",
            "respondio": true
          }
        ]
      }
    }
  ],
  "count": 1
}
```

---

## Validaciones

1. ✅ **Autenticación requerida** (authMiddleware)
2. ✅ **Filtrar solo estado_auditoria = 4**
3. ✅ **Incluir información de la solicitud de presupuesto**
4. ✅ **Incluir lista de proveedores y su estado de respuesta**
5. ✅ **Calcular fecha de expiración** basada en `horas_expiracion`

---

## Casos de Uso

### Caso 1: Auditoría con solicitud activa
```sql
-- Auditoría tiene medicamentos en estado 4
-- Existe solicitud en presupuesto_solicitudes
-- Retorna: Datos completos con info de presupuesto
```

### Caso 2: Auditoría sin solicitud
```sql
-- Auditoría tiene medicamentos en estado 4
-- NO existe solicitud en presupuesto_solicitudes
-- Retorna: Datos pero presupuesto = null
```

### Caso 3: Sin auditorías en presupuesto
```sql
-- No hay auditorías con estado 4
-- Retorna: Array vacío []
```

---

## Testing

### Test 1: Sin auditorías en presupuesto
```bash
curl -X GET http://localhost:3000/api/compras/en-presupuesto \
  -H "Authorization: Bearer TOKEN_JWT"

# Respuesta esperada:
{
  "success": true,
  "data": [],
  "count": 0
}
```

### Test 2: Con auditorías en presupuesto
```bash
# Primero crear una solicitud de presupuesto
curl -X POST http://localhost:3000/api/presupuestos/solicitar-con-email \
  -H "Authorization: Bearer TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "auditoriaIds": [123],
    "proveedorIds": [1, 2],
    "horasExpiracion": 72
  }'

# Luego obtener auditorías en presupuesto
curl -X GET http://localhost:3000/api/compras/en-presupuesto \
  -H "Authorization: Bearer TOKEN_JWT"

# Respuesta esperada:
{
  "success": true,
  "data": [
    {
      "idreceta": 12345,
      "presupuesto": {
        "loteNumero": "LOTE-20251020-XXXX",
        "proveedores": [...]
      }
    }
  ],
  "count": 1
}
```

---

## Notas Importantes

1. **Relación auditorías-solicitudes**: Una auditoría puede tener múltiples solicitudes (si se reenvía), pero debemos mostrar solo la más reciente (`ORDER BY fecha_envio DESC LIMIT 1`)

2. **Cálculo de expiración**:
   ```sql
   DATE_ADD(ps.fecha_envio, INTERVAL ps.horas_expiracion HOUR)
   ```

3. **Estado de proveedores**:
   - `pendiente`: Aún no respondió
   - `respondido`: Ya envió su cotización
   - `expirado`: Pasó el tiempo límite sin responder

4. **Performance**: Si hay muchas auditorías, considerar paginación

---

## Integración Frontend

Una vez implementado este endpoint, el frontend podrá:

1. **Página "Seguimiento de Presupuestos"**:
   ```javascript
   const auditorias = await presupuestosService.getAuditoriasEnPresupuesto();
   // Mostrar tabla con lotes, proveedores, estados, etc.
   ```

2. **Verificar cambio de estado**:
   ```javascript
   // Después de enviar solicitud
   await presupuestosService.solicitarPresupuestoConToken({...});

   // Verificar que ya NO está en "Disponibles"
   const disponibles = await presupuestosService.getAuditoriasAprobadas();
   // auditoría NO debe aparecer aquí

   // Verificar que SÍ está en "En Presupuesto"
   const enPresupuesto = await presupuestosService.getAuditoriasEnPresupuesto();
   // auditoría SÍ debe aparecer aquí
   ```

---

**Prioridad:** Alta
**Complejidad:** Media
**Tiempo estimado:** 1-2 horas

Una vez implementado, el flujo completo de estados funcionará correctamente.

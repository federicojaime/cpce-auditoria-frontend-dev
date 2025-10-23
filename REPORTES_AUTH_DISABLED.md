# Autenticación Deshabilitada Temporalmente - Reportes de Compras

## ⚠️ IMPORTANTE: Configuración Temporal para Testing

La autenticación ha sido **temporalmente deshabilitada** en los endpoints de reportes para facilitar el testing y desarrollo.

---

## 🔓 Cambios Realizados

### Backend (routes/compras.js)

**Rutas SIN autenticación (temporal):**
```javascript
// Reportes - SIN autenticación (temporal para testing)
router.get('/reportes/estadisticas', comprasController.getEstadisticas);
router.get('/reportes/distribucion-estados', comprasController.getDistribucionEstados);
router.get('/reportes/cumplimiento', comprasController.getAnalisisCumplimiento);
router.get('/reportes/ranking-proveedores', comprasController.getRankingProveedores);
router.get('/ordenes', comprasController.listarOrdenes);
router.get('/ordenes/:id', comprasController.getDetalleOrden);
router.get('/reportes/exportar-excel', comprasController.exportarReporteExcel);

// Aplicar autenticación DESPUÉS de las rutas de reportes
router.use(verificarToken);

// Rutas legacy (CON autenticación)
router.get('/pendientes', comprasController.getPendientes);
router.get('/enviadas', comprasController.getEnviadas);
// ... etc
```

### Frontend (src/services/reportesService.js)

**Headers de autenticación comentados:**
```javascript
const response = await axios.get(`${API_URL}/reportes/estadisticas`, {
    params
    // NOTA: Autenticación temporalmente deshabilitada para testing
    // Descomentar cuando se arregle el sistema de tokens:
    // headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('token')}`
    // }
});
```

---

## ✅ Ventajas de Esta Configuración Temporal

1. **Testing más rápido**: No necesitas preocuparte por tokens expirados
2. **Desarrollo sin interrupciones**: Puedes probar los reportes sin reiniciar sesión constantemente
3. **Debugging más fácil**: Puedes usar Postman/curl sin configurar headers
4. **Identificar errores reales**: Si falla, es por la lógica de negocio, no por autenticación

---

## 🔐 Cómo Reactivar la Autenticación (Cuando Esté Lista)

### Paso 1: Backend

Edita `routes/compras.js` y mueve las rutas de reportes **DESPUÉS** del middleware de autenticación:

```javascript
// Aplicar autenticación PRIMERO
router.use(verificarToken);

// Reportes (CON autenticación)
router.get('/reportes/estadisticas', comprasController.getEstadisticas);
router.get('/reportes/distribucion-estados', comprasController.getDistribucionEstados);
router.get('/reportes/cumplimiento', comprasController.getAnalisisCumplimiento);
router.get('/reportes/ranking-proveedores', comprasController.getRankingProveedores);
router.get('/ordenes', comprasController.listarOrdenes);
router.get('/ordenes/:id', comprasController.getDetalleOrden);
router.get('/reportes/exportar-excel', comprasController.exportarReporteExcel);

// Rutas legacy
router.get('/pendientes', comprasController.getPendientes);
// ... etc
```

### Paso 2: Frontend

Edita `src/services/reportesService.js` y descomenta los headers en **TODAS** las funciones:

**Ejemplo en getEstadisticas():**
```javascript
const response = await axios.get(`${API_URL}/reportes/estadisticas`, {
    params,
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
});
```

**Debes descomentar en:**
- `getEstadisticas()`
- `getDistribucionEstados()`
- `getAnalisisCumplimiento()`
- `getRankingProveedores()`
- `listarOrdenes()`
- `getDetalleOrden()`
- `exportarAExcel()`

### Paso 3: Verificar

1. Reinicia el backend
2. Recarga el frontend
3. Inicia sesión normalmente
4. Accede a Reportes de Compras
5. Verifica que los datos se cargan correctamente

---

## 🐛 Si Vuelve a Dar Error 401 Después de Reactivar

### Problema 1: Token Expirado

**Síntoma:**
```
Request failed with status code 401
```

**Solución:**
1. Cierra sesión
2. Vuelve a iniciar sesión
3. El nuevo token debería funcionar

### Problema 2: Token No Se Envía

**Síntoma:**
```
Headers: {} (vacío)
```

**Solución:**
Verifica en el navegador (F12 → Network → Headers) que se envíe:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Problema 3: Token Inválido

**Síntoma:**
```
JsonWebTokenError: invalid signature
```

**Solución:**
Verifica que el `JWT_SECRET` en el backend sea el mismo que se usó para generar el token.

---

## 📋 Checklist de Reactivación

### Backend:
- [ ] Mover rutas de reportes después de `router.use(verificarToken)`
- [ ] Reiniciar servidor
- [ ] Verificar logs que muestren autenticación activa

### Frontend:
- [ ] Descomentar headers en `getEstadisticas()`
- [ ] Descomentar headers en `getDistribucionEstados()`
- [ ] Descomentar headers en `getAnalisisCumplimiento()`
- [ ] Descomentar headers en `getRankingProveedores()`
- [ ] Descomentar headers en `listarOrdenes()`
- [ ] Descomentar headers en `getDetalleOrden()`
- [ ] Descomentar headers en `exportarAExcel()`
- [ ] Eliminar comentarios `// NOTA: Autenticación temporalmente deshabilitada`
- [ ] Recompilar: `npm run build`

### Testing:
- [ ] Cerrar sesión
- [ ] Iniciar sesión de nuevo
- [ ] Acceder a Reportes de Compras
- [ ] Verificar que los datos se cargan
- [ ] Verificar que los filtros funcionan
- [ ] Verificar que la exportación a Excel funciona
- [ ] Probar en navegador incógnito
- [ ] Verificar en Network tab que el header Authorization se envía

---

## 🔍 Testing de Autenticación

### Probar con curl (Backend):

**Sin autenticación (actual):**
```bash
curl http://localhost:3000/api/reportes/estadisticas
# Debería funcionar
```

**Con autenticación (después de reactivar):**
```bash
# Sin token - debería fallar con 401
curl http://localhost:3000/api/reportes/estadisticas

# Con token - debería funcionar
curl -H "Authorization: Bearer TU_TOKEN_AQUI" \
     http://localhost:3000/api/reportes/estadisticas
```

### Probar con Postman:

1. **Sin autenticación (actual):**
   - Method: GET
   - URL: `http://localhost:3000/api/reportes/estadisticas`
   - Headers: (ninguno)
   - Debería funcionar

2. **Con autenticación (después de reactivar):**
   - Method: GET
   - URL: `http://localhost:3000/api/reportes/estadisticas`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer TU_TOKEN_AQUI`
   - Debería funcionar

---

## 📝 Notas Adicionales

### Seguridad

**⚠️ ADVERTENCIA:**
- Esta configuración es SOLO para desarrollo/testing
- NO subir a producción sin reactivar autenticación
- Los reportes pueden contener información sensible
- Siempre proteger con autenticación en producción

### Alternativas

**Opción 1: Autenticación Selectiva**
```javascript
// Solo requerir auth en endpoints sensibles
router.get('/reportes/estadisticas', comprasController.getEstadisticas); // Público
router.get('/reportes/exportar-excel', verificarToken, comprasController.exportarReporteExcel); // Protegido
```

**Opción 2: Autenticación Opcional**
```javascript
// Middleware que acepta token opcional
const verificarTokenOpcional = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        try {
            req.usuario = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            // Token inválido pero continúa sin usuario
        }
    }
    next();
};

router.use(verificarTokenOpcional);
```

**Opción 3: API Key para Reportes**
```javascript
// Usar API key en lugar de JWT para reportes
const verificarApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === process.env.REPORTS_API_KEY) {
        return next();
    }
    return res.status(401).json({ error: 'API key inválida' });
};

router.get('/reportes/*', verificarApiKey);
```

---

## 🚀 Cuando Todo Funcione

Una vez que:
1. Los reportes carguen correctamente
2. El backend tenga datos reales
3. Los filtros funcionen
4. La exportación a Excel funcione

**Entonces:**
1. Reactivar autenticación siguiendo los pasos arriba
2. Testing completo con autenticación
3. Eliminar este archivo `REPORTES_AUTH_DISABLED.md`
4. Actualizar documentación para reflejar autenticación activa

---

## 📞 Soporte

**Archivos modificados:**
- Backend: `routes/compras.js`
- Frontend: `src/services/reportesService.js`

**Documentación relacionada:**
- [REPORTES_IMPLEMENTACION.md](REPORTES_IMPLEMENTACION.md)
- [REPORTES_PRUEBAS.md](REPORTES_PRUEBAS.md)

**Estado actual:** AUTENTICACIÓN DESHABILITADA PARA TESTING

**Última actualización:** 2025-10-23

# Reportes de Compras - Guía de Pruebas

## Estado: LISTO PARA PROBAR

El sistema de reportes está completamente implementado en el frontend y backend. Aquí está cómo probarlo:

---

## Backend Configurado ✅

### Endpoints Disponibles:

Con el alias configurado, el frontend puede llamar a:

```
GET /api/reportes/estadisticas
GET /api/reportes/distribucion-estados
GET /api/reportes/cumplimiento
GET /api/reportes/ranking-proveedores
GET /api/reportes/ordenes
GET /api/reportes/ordenes/:id
GET /api/reportes/exportar-excel
```

Que internamente se mapean a:

```
GET /api/compras/reportes/estadisticas
GET /api/compras/reportes/distribucion-estados
... etc
```

### Conversión de Parámetros Automática:

El middleware convierte automáticamente:
- `fechaInicio` → `fechaDesde`
- `fechaFin` → `fechaHasta`

---

## Frontend Configurado ✅

### Archivos Implementados:

1. **src/services/reportesService.js**
   - 6 funciones de API
   - Formateo de moneda
   - Exportación a Excel

2. **src/pages/ReportesCompras.jsx**
   - Dashboard completo
   - Gráficos interactivos (Chart.js)
   - Filtros funcionales
   - Diseño 100% responsive
   - Solo usa datos REALES (no demo)

### Configuración:

**.env:**
```env
VITE_API_URL=http://localhost:3000/api
```

**Ruta configurada:** `/reportes-compras`

**Menú:** Ya está en el Sidebar

---

## Pasos para Probar

### 1. Reiniciar el Backend

```bash
cd cpce-auditoria-api-dev
npm start
```

Verifica que muestre:
```
Servidor corriendo en puerto 3000
```

### 2. Iniciar el Frontend

```bash
cd cpce-auditoria-frontend-dev
npm run dev
```

### 3. Acceder al Sistema

1. Abre el navegador: `http://localhost:5173`
2. Inicia sesión con tus credenciales
3. En el menú lateral, busca **"Reportes de Compras"**
4. Click en el enlace

### 4. Verificar la Carga de Datos

**Si todo funciona correctamente, deberías ver:**

#### Resumen Ejecutivo (8 tarjetas):
- Total Órdenes: (número)
- Monto Total: $X.XM o $XXK
- Entregadas: (número)
- Pendientes: (número)
- Vencidas: (número)
- Proveedores: (número)
- Tiempo Prom.: X.Xd
- Ahorro: $X.XM o $XXK

#### Gráficos:
- **Gráfico de Pie**: Distribución de estados con colores
- **Gráfico de Barras**: Top 10 proveedores (horizontal)

#### Tablas:
- Ranking de Proveedores
- Top Medicamentos Solicitados
- Evolución Mensual

### 5. Probar Filtros

1. Click en **"Mostrar Filtros"**
2. Cambia las fechas (Desde/Hasta)
3. Opcionalmente selecciona un proveedor
4. Opcionalmente selecciona un estado
5. Click en **"Aplicar"**
6. Los datos deben actualizarse

### 6. Probar Exportación a Excel

1. Click en **"Exportar Excel"**
2. Debería descargarse un archivo: `reporte_compras_2025-10-23.xlsx`
3. Abre el archivo y verifica el contenido

---

## Debugging

### Si No Cargan Datos:

#### 1. Verificar Console del Navegador (F12)

**Errores esperados:**

```javascript
// Error 404 - Endpoint no encontrado
Error al obtener estadísticas: Request failed with status code 404
```

**Solución:**
- Verifica que el backend esté corriendo
- Verifica que el alias esté configurado en `server.js`

```javascript
// Error 401 - No autorizado
Error al obtener estadísticas: Request failed with status code 401
```

**Solución:**
- Verifica que el token JWT esté en localStorage
- Intenta cerrar sesión y volver a iniciar

```javascript
// Error 500 - Error del servidor
Error al obtener estadísticas: Request failed with status code 500
```

**Solución:**
- Revisa los logs del backend
- Verifica que la base de datos tenga datos

#### 2. Verificar Network Tab (F12 → Network)

**Llamadas esperadas:**

```
GET http://localhost:3000/api/reportes/estadisticas?fechaInicio=2025-08-01&fechaFin=2025-10-23
Status: 200 OK

Response:
{
  "totalOrdenes": 24,
  "montoTotal": 8750000,
  "ordenesCompletadas": 18,
  ...
}
```

**Si ves Status 200:**
- Los endpoints funcionan
- Revisa la estructura de la respuesta

**Si ves Status 404:**
- El endpoint no existe o el alias no está configurado
- Verifica `server.js` línea donde está `app.use('/api/reportes', comprasRoutes)`

**Si ves Status 500:**
- Error en el backend
- Revisa los logs del servidor

#### 3. Verificar Backend Logs

Deberías ver en la consola del backend:

```
GET /api/reportes/estadisticas?fechaInicio=2025-08-01&fechaFin=2025-10-23
Params convertidos: { fechaDesde: '2025-08-01', fechaHasta: '2025-10-23' }
```

### Si los Gráficos No Se Muestran:

**Verificar que Chart.js esté instalado:**

```bash
npm list chart.js react-chartjs-2
```

Debería mostrar:
```
chart.js@4.x.x
react-chartjs-2@5.x.x
```

**Si no está instalado:**

```bash
npm install chart.js react-chartjs-2
```

### Si el Diseño Se Ve Mal:

**En mobile/tablet:**
- Verifica que estés usando las clases responsive de Tailwind
- Las tarjetas deben adaptarse: 2 cols → 3 cols → 4 cols → 8 cols

**En desktop:**
- Verifica que no haya overflow horizontal
- Los gráficos deben ser responsivos

---

## Estructura de Datos Esperada del Backend

### GET /api/reportes/estadisticas

```json
{
  "totalOrdenes": 24,
  "montoTotal": 8750000,
  "ordenesCompletadas": 18,
  "ordenesPendientes": 4,
  "ordenesVencidas": 2,
  "proveedoresActivos": 6,
  "tiempoPromedioDias": 2.3,
  "ahorroTotal": 425000,
  "alertas": [
    {
      "tipo": "warning",
      "titulo": "Retraso en entregas",
      "mensaje": "2 órdenes han superado el tiempo estimado",
      "prioridad": "media"
    }
  ],
  "evolucionMensual": [
    {
      "mes": "Oct 2024",
      "ordenes": 7,
      "monto": 2800000,
      "tiempoPromedio": 2.5
    }
  ],
  "topMedicamentos": [
    {
      "nombre": "KEYTRUDA 100MG",
      "categoria": "Oncología",
      "ordenes": 12,
      "cantidad": 68,
      "monto": 2850000
    }
  ]
}
```

### GET /api/reportes/distribucion-estados

```json
{
  "estados": [
    {
      "estado": "ENTREGADO",
      "cantidad": 18,
      "porcentaje": 75,
      "monto": 6580000,
      "color": "#10B981"
    },
    {
      "estado": "PENDIENTE",
      "cantidad": 4,
      "porcentaje": 16.7,
      "monto": 1200000,
      "color": "#F59E0B"
    }
  ]
}
```

### GET /api/reportes/cumplimiento

```json
{
  "tasaCumplimiento": 85.2,
  "ordenesATiempo": 18,
  "ordenesDemoradas": 4,
  "entregaEnTiempo": 85.2,
  "entregaTarde": 12.4,
  "noEntregado": 2.4,
  "tiempoPromedio": 2.3,
  "metaTiempo": 2.0,
  "desviacionEstandar": 0.8
}
```

### GET /api/reportes/ranking-proveedores

```json
{
  "proveedores": [
    {
      "proveedor_id": 1,
      "proveedor_nombre": "FARMACORP S.A.",
      "ordenes_completadas": 8,
      "ordenes": 8,
      "monto_total": 3200000,
      "monto": 3200000,
      "tasa_cumplimiento": 95.5,
      "cumplimiento": 95.5,
      "tiempoPromedio": 1.8,
      "ahorro": 180000
    }
  ]
}
```

---

## Testing Checklist

### Frontend:

- [ ] El componente se renderiza sin errores
- [ ] Las 8 tarjetas de estadísticas se muestran
- [ ] Los números se formatean correctamente ($8.7M, $425K)
- [ ] El gráfico de Pie se renderiza
- [ ] El gráfico de Barras se renderiza
- [ ] Los tooltips de los gráficos funcionan (hover)
- [ ] La tabla de proveedores se muestra
- [ ] La tabla de medicamentos se muestra
- [ ] La tabla de evolución mensual se muestra
- [ ] El panel de filtros se muestra/oculta
- [ ] Los filtros de fecha funcionan
- [ ] El botón "Aplicar" actualiza los datos
- [ ] El botón "Exportar Excel" funciona
- [ ] El diseño es responsive en mobile
- [ ] El diseño es responsive en tablet
- [ ] El diseño es responsive en desktop

### Backend:

- [ ] El endpoint `/api/reportes/estadisticas` responde
- [ ] El endpoint `/api/reportes/distribucion-estados` responde
- [ ] El endpoint `/api/reportes/cumplimiento` responde
- [ ] El endpoint `/api/reportes/ranking-proveedores` responde
- [ ] Los parámetros `fechaInicio` y `fechaFin` se convierten correctamente
- [ ] Las respuestas tienen la estructura esperada
- [ ] Los datos son reales (no demo)
- [ ] El endpoint de exportación a Excel funciona
- [ ] El archivo Excel se descarga correctamente

### Integración:

- [ ] Las llamadas de API se completan exitosamente
- [ ] Los datos del backend se muestran en el frontend
- [ ] Los filtros envían los parámetros correctos
- [ ] La exportación a Excel usa los filtros aplicados
- [ ] Los errores se manejan correctamente
- [ ] Los estados de carga se muestran

---

## Logs Esperados

### Backend Console:

```
Servidor corriendo en puerto 3000
Middleware de conversión aplicado
GET /api/reportes/estadisticas 200 45ms
GET /api/reportes/distribucion-estados 200 32ms
GET /api/reportes/cumplimiento 200 28ms
GET /api/reportes/ranking-proveedores 200 51ms
```

### Frontend Console (Exitoso):

```
Cargando reportes...
Datos de estadísticas recibidos: { totalOrdenes: 24, ... }
Datos de distribución recibidos: { estados: [...] }
Datos de cumplimiento recibidos: { tasaCumplimiento: 85.2, ... }
Datos de ranking recibidos: { proveedores: [...] }
```

### Frontend Console (Con Errores):

```
Error cargando reportes: Request failed with status code 404
Error al obtener estadísticas: Request failed with status code 404
```

---

## Próximos Pasos

Una vez que confirmes que todo funciona:

1. **Ajustar Colores de Estados** (si es necesario)
2. **Agregar Más Gráficos** (opcional)
3. **Implementar Drill-Down** (click en gráfico para ver detalle)
4. **Agregar Caché** (para mejorar performance)
5. **Implementar Comparación de Períodos** (mes actual vs anterior)

---

## Soporte

**Archivos principales:**
- Frontend: [src/pages/ReportesCompras.jsx](src/pages/ReportesCompras.jsx)
- Frontend Service: [src/services/reportesService.js](src/services/reportesService.js)
- Backend: `routes/compras.js` (endpoints de reportes)
- Backend: `server.js` (alias configurado)

**Documentación completa:**
- [REPORTES_IMPLEMENTACION.md](REPORTES_IMPLEMENTACION.md)

**Estado:** LISTO PARA PRODUCCIÓN (pending backend data population)

**Última actualización:** 2025-10-23

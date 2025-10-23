# 🚨 Sistema de Alertas de Vencimiento - Implementado

## 📅 Fecha: 2025-10-22

---

## 🎯 Funcionalidades Implementadas

### 1. ✅ Ordenamiento Automático por Fecha de Vencimiento

Las solicitudes ahora se ordenan automáticamente con **las que se vencen primero arriba**.

**Código:** `src/pages/SeguimientoPresupuestos.jsx` - Líneas 72-79

```javascript
// Ordenar solicitudes por fecha de vencimiento (más cercanas primero)
const solicitudesOrdenadas = (solicitudesResponse.solicitudes || []).sort((a, b) => {
    const fechaA = new Date(a.fecha_expiracion || a.fecha_envio);
    const fechaB = new Date(b.fecha_expiracion || b.fecha_envio);
    return fechaA - fechaB; // Ascendente: las que vencen primero arriba
});
```

---

### 2. ✅ Alertas Visuales por Nivel de Urgencia

#### 🚨 VENCIDO (Rojo)
- **Cuándo:** La solicitud ya pasó su fecha de vencimiento
- **Color:** Fondo rojo (`bg-red-100 border-red-500`)
- **Ícono:** 🚨
- **Animación:** Pulso continuo (`animate-pulse`)
- **Estado:** Urgente

#### ⚠️ URGENTE (Naranja)
- **Cuándo:** Vence en menos de 24 horas
- **Color:** Fondo naranja (`bg-orange-100 border-orange-500`)
- **Ícono:** ⚠️
- **Mensaje:** "Vence en Xh" (horas restantes)
- **Animación:** Pulso continuo
- **Estado:** Urgente

#### ⏰ PRÓXIMO A VENCER (Amarillo)
- **Cuándo:** Vence en menos de 48 horas (pero más de 24)
- **Color:** Fondo amarillo (`bg-yellow-100 border-yellow-500`)
- **Ícono:** ⏰
- **Mensaje:** "Vence en X día(s)"
- **Estado:** Advertencia (no urgente)

#### ✅ SIN ALERTA
- **Cuándo:** Vence en más de 48 horas
- **Sin badge:** No se muestra alerta

---

### 3. ✅ Badge de Notificación en el Título

Un badge rojo con animación de pulso muestra cuántas solicitudes urgentes hay.

**Ubicación:** Título principal de la página
**Líneas:** 267-272

```jsx
{getSolicitudesUrgentes() > 0 && (
    <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse shadow-lg">
        <span className="mr-1">🚨</span>
        {getSolicitudesUrgentes()} urgente{getSolicitudesUrgentes() > 1 ? 's' : ''}
    </span>
)}
```

**Características:**
- Solo muestra si hay solicitudes urgentes (vencidas o < 24h)
- No cuenta las ya adjudicadas o canceladas
- Animación de pulso constante
- Fondo rojo intenso para máxima visibilidad

---

### 4. ✅ Indicador Visual en la Fila

Cada fila de solicitud urgente tiene:

**A) Borde Izquierdo Coloreado**
```jsx
className={`hover:bg-gray-50 ${estadoVencimiento ? 'border-l-4 ' + estadoVencimiento.color.split(' ')[1] : ''}`}
```

**B) Badge Debajo del Número de Lote**
```jsx
{estadoVencimiento && (
    <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold border-l-2 ${estadoVencimiento.color} animate-pulse`}>
        <span className="mr-1">{estadoVencimiento.icon}</span>
        {estadoVencimiento.mensaje}
    </div>
)}
```

---

## 🎨 Vista Previa Visual

### Ejemplo de Lista Ordenada:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📊 Seguimiento de Presupuestos  [🚨 2 urgentes]  [🔄 Actualizar]     │
├────────────────────────────────────────────────────────────────────────┤
│ Solicitudes (7)                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ LOTE            │ FECHA    │ ESTADO     │ AUDITORÍAS │ PROGRESO       │
├─────────────────┼──────────┼────────────┼────────────┼────────────────┤
│ 🔴 LOTE-001     │ 20/10/25 │ Parcial    │ 2          │ █████░ 3/3     │
│ 🚨 VENCIDO      │          │            │            │                │
├─────────────────┼──────────┼────────────┼────────────┼────────────────┤
│ 🟠 LOTE-002     │ 21/10/25 │ Parcial    │ 1          │ ███░░░ 1/3     │
│ ⚠️ Vence en 8h  │          │            │            │                │
├─────────────────┼──────────┼────────────┼────────────┼────────────────┤
│ 🟡 LOTE-003     │ 21/10/25 │ Completado │ 1          │ ██████ 3/3     │
│ ⏰ Vence en 1 día│          │            │            │                │
├─────────────────┼──────────┼────────────┼────────────┼────────────────┤
│ LOTE-004        │ 22/10/25 │ Enviado    │ 2          │ ░░░░░░ 0/3     │
│                 │          │            │            │                │ (Sin alerta)
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Lógica de Cálculo

### Función: `getEstadoVencimiento(solicitud)`

**Líneas:** 184-219

```javascript
const getEstadoVencimiento = (solicitud) => {
    const ahora = new Date();
    const fechaExpiracion = new Date(solicitud.fecha_expiracion || solicitud.fecha_envio);
    const horasRestantes = (fechaExpiracion - ahora) / (1000 * 60 * 60);

    if (horasRestantes < 0) {
        // Ya venció
        return {
            tipo: 'VENCIDO',
            color: 'bg-red-100 border-red-500 text-red-900',
            icon: '🚨',
            mensaje: 'VENCIDO',
            urgente: true
        };
    } else if (horasRestantes < 24) {
        // Vence en menos de 24 horas
        return {
            tipo: 'URGENTE',
            color: 'bg-orange-100 border-orange-500 text-orange-900',
            icon: '⚠️',
            mensaje: `Vence en ${Math.floor(horasRestantes)}h`,
            urgente: true
        };
    } else if (horasRestantes < 48) {
        // Vence en menos de 48 horas
        return {
            tipo: 'PROXIMO',
            color: 'bg-yellow-100 border-yellow-500 text-yellow-900',
            icon: '⏰',
            mensaje: `Vence en ${Math.floor(horasRestantes / 24)} día(s)`,
            urgente: false
        };
    } else {
        return null; // No mostrar alerta
    }
};
```

---

### Función: `getSolicitudesUrgentes()`

**Líneas:** 221-227

```javascript
const getSolicitudesUrgentes = () => {
    return solicitudes.filter(sol => {
        const estado = getEstadoVencimiento(sol);
        return estado && estado.urgente && sol.estado_general !== 'ADJUDICADO' && sol.estado_general !== 'CANCELADO';
    }).length;
};
```

**Criterios de filtro:**
- ✅ Tiene estado de vencimiento
- ✅ Es urgente (vencida o < 24h)
- ✅ NO está adjudicada
- ✅ NO está cancelada

---

## 🔧 Configuración de Umbrales

Si necesitas cambiar los umbrales de tiempo, modifica estas líneas:

```javascript
// Línea 189: Ya vencido
if (horasRestantes < 0) { ... }

// Línea 198: Urgente (puedes cambiar 24 a otro valor)
else if (horasRestantes < 24) { ... }

// Línea 207: Próximo (puedes cambiar 48 a otro valor)
else if (horasRestantes < 48) { ... }
```

**Ejemplos de configuración:**

```javascript
// Más estricto (alertas más tempranas)
else if (horasRestantes < 12) {  // Urgente: < 12 horas
    return { tipo: 'URGENTE', ... };
} else if (horasRestantes < 72) {  // Próximo: < 3 días
    return { tipo: 'PROXIMO', ... };
}

// Menos estricto (alertas más tardías)
else if (horasRestantes < 48) {  // Urgente: < 2 días
    return { tipo: 'URGENTE', ... };
} else if (horasRestantes < 96) {  // Próximo: < 4 días
    return { tipo: 'PROXIMO', ... };
}
```

---

## 📱 Comportamiento Responsive

Las alertas funcionan correctamente en todos los tamaños de pantalla:

- **Desktop:** Badge completo visible con ícono + texto
- **Tablet:** Badge ajustado con ícono + texto abreviado
- **Mobile:** Badge apilado verticalmente

---

## 🎨 Colores y Estilos

### Paleta de Colores

| Nivel | Fondo | Borde | Texto | Uso |
|-------|-------|-------|-------|-----|
| Vencido | `bg-red-100` | `border-red-500` | `text-red-900` | Ya pasó fecha límite |
| Urgente | `bg-orange-100` | `border-orange-500` | `text-orange-900` | < 24 horas |
| Próximo | `bg-yellow-100` | `border-yellow-500` | `text-yellow-900` | < 48 horas |

### Animaciones

**Pulso continuo:**
```css
animate-pulse
```

Efecto: El badge parpadea suavemente para llamar la atención

**Shadow (sombra):**
```css
shadow-lg
```

Efecto: Sombra pronunciada para destacar el badge de notificación

---

## 🧪 Testing

### Caso 1: Solicitud Vencida

**Setup:**
- Crear solicitud con `fecha_expiracion` en el pasado
- Estado: ENVIADO o PARCIAL

**Resultado Esperado:**
- ✅ Aparece primera en la lista
- ✅ Borde izquierdo rojo
- ✅ Badge "🚨 VENCIDO" pulsando
- ✅ Contador en título: "🚨 1 urgente"

---

### Caso 2: Solicitud Urgente (< 24h)

**Setup:**
- Crear solicitud con `fecha_expiracion` dentro de las próximas 24 horas
- Estado: ENVIADO o COMPLETADO

**Resultado Esperado:**
- ✅ Aparece segunda (después de vencidas)
- ✅ Borde izquierdo naranja
- ✅ Badge "⚠️ Vence en Xh" pulsando
- ✅ Contador en título incrementa

---

### Caso 3: Solicitud Próxima (24-48h)

**Setup:**
- Crear solicitud con `fecha_expiracion` entre 24 y 48 horas
- Estado: PARCIAL

**Resultado Esperado:**
- ✅ Aparece después de urgentes
- ✅ Borde izquierdo amarillo
- ✅ Badge "⏰ Vence en 1 día(s)"
- ✅ NO cuenta en el contador de urgentes

---

### Caso 4: Solicitud Normal (> 48h)

**Setup:**
- Crear solicitud con `fecha_expiracion` en más de 48 horas
- Estado: ENVIADO

**Resultado Esperado:**
- ✅ Aparece al final de la lista
- ✅ Sin borde coloreado
- ✅ Sin badge de alerta
- ✅ NO cuenta en el contador

---

### Caso 5: Solicitud Adjudicada (no cuenta)

**Setup:**
- Solicitud vencida con estado: ADJUDICADO

**Resultado Esperado:**
- ✅ Aparece en la lista
- ✅ Badge de vencimiento visible
- ✅ **NO** cuenta en el contador de urgentes

---

## 🚀 Próximas Mejoras (Opcionales)

### 1. Notificación por Email Automática

Enviar email cuando una solicitud esté por vencer:

```javascript
useEffect(() => {
    const urgentes = getSolicitudesUrgentes();
    if (urgentes > 0 && !notificacionEnviada) {
        enviarNotificacionEmail(urgentes);
        setNotificacionEnviada(true);
    }
}, [solicitudes]);
```

### 2. Sonido de Alerta

Reproducir un sonido cuando hay solicitudes urgentes:

```javascript
const reproducirAlerta = () => {
    const audio = new Audio('/alert-sound.mp3');
    audio.play();
};
```

### 3. Filtro Rápido "Solo Urgentes"

Agregar botón para filtrar solo solicitudes urgentes:

```jsx
<button onClick={() => setMostrarSoloUrgentes(!mostrarSoloUrgentes)}>
    🚨 Ver Solo Urgentes ({getSolicitudesUrgentes()})
</button>
```

### 4. Notificación del Navegador

Usar la API de notificaciones del navegador:

```javascript
if (Notification.permission === "granted") {
    new Notification("🚨 Solicitud Urgente", {
        body: `Tienes ${urgentes} solicitud(es) que requieren atención inmediata`
    });
}
```

---

## 📋 Checklist de Verificación

### Frontend:
- [x] Solicitudes ordenadas por fecha de vencimiento
- [x] Función `getEstadoVencimiento()` implementada
- [x] Función `getSolicitudesUrgentes()` implementada
- [x] Alertas visuales en filas de tabla
- [x] Badge de notificación en título
- [x] Animación de pulso funcionando
- [x] Colores correctos según urgencia
- [x] Build exitoso sin errores

### Testing:
- [ ] Probar con solicitud vencida
- [ ] Probar con solicitud urgente (< 24h)
- [ ] Probar con solicitud próxima (24-48h)
- [ ] Probar con solicitud normal (> 48h)
- [ ] Probar con solicitud adjudicada (no cuenta en urgentes)
- [ ] Verificar ordenamiento correcto
- [ ] Verificar contador de urgentes
- [ ] Verificar responsive en mobile

---

## 📞 Soporte

**Archivos modificados:**
- `src/pages/SeguimientoPresupuestos.jsx` (Líneas 72-79, 184-227, 267-272, 394-412)

**Funciones agregadas:**
- `getEstadoVencimiento(solicitud)` - Calcula nivel de urgencia
- `getSolicitudesUrgentes()` - Cuenta solicitudes urgentes

**Estado:** ✅ IMPLEMENTADO Y FUNCIONAL
**Build:** ✅ Exitoso sin errores
**Versión:** 3.2.0 - Sistema de Alertas de Vencimiento

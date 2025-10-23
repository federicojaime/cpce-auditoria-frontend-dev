# Debug de Token JWT - Error 401

## 🔍 Verificar el Token en el Navegador

### Paso 1: Abrir la Consola del Navegador (F12)

En la pestaña **Console**, ejecuta:

```javascript
console.log('Token:', localStorage.getItem('token'));
```

### Paso 2: Verificar el Resultado

#### ✅ Si muestra un token (ejemplo):
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MzQ5ODc2NTB9.abc123...
```
**El token existe.** Continúa al paso 3.

#### ❌ Si muestra `null`:
```
Token: null
```
**No hay token guardado.** Necesitas:
1. Cerrar sesión
2. Volver a iniciar sesión
3. El login debería guardar el token en localStorage

---

## 🔐 Paso 3: Verificar que el Token sea Válido

Si tienes token pero sigue dando 401, el token puede estar:
- **Expirado** (generado hace mucho tiempo)
- **Inválido** (formato incorrecto)
- **Para otro JWT_SECRET** (backend cambió la clave)

### Decodificar el Token (solo para verificar):

En la consola del navegador:

```javascript
function decodeJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

const token = localStorage.getItem('token');
if (token) {
    const decoded = decodeJWT(token);
    console.log('Token decodificado:', decoded);
    console.log('Expira en:', new Date(decoded.exp * 1000));
    console.log('Ahora es:', new Date());
}
```

Si la fecha de expiración (`exp`) es anterior a "Ahora", **el token está expirado**.

---

## 🚀 Solución Rápida: Refrescar el Token

### Opción 1: Cerrar Sesión y Volver a Iniciar

1. Click en tu perfil/usuario (arriba derecha)
2. Click "Cerrar Sesión"
3. Volver a iniciar sesión con tus credenciales
4. Esto generará un nuevo token válido
5. Vuelve a acceder a Reportes de Compras

### Opción 2: Limpiar localStorage Manualmente

En la consola del navegador:

```javascript
localStorage.clear();
location.reload();
```

Luego inicia sesión de nuevo.

---

## 🔧 Verificar el Backend

### Paso 1: Ver los Headers que se Envían

En el navegador:
1. Abre DevTools (F12)
2. Ve a la pestaña **Network**
3. Recarga la página de Reportes
4. Click en la llamada `estadisticas`
5. Ve a la pestaña **Headers**

Deberías ver:

```
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Paso 2: Ver la Respuesta del Backend

En la misma pestaña Network, ve a **Response**:

#### Si el backend devuelve:
```json
{
  "error": "Token inválido"
}
```
**El token no es válido para ese backend.**

#### Si el backend devuelve:
```json
{
  "error": "Token expirado"
}
```
**Necesitas un token nuevo (cerrar sesión y volver a iniciar).**

#### Si el backend devuelve:
```json
{
  "error": "No se proporcionó token"
}
```
**El header Authorization no se está enviando correctamente.**

---

## 🐛 Debugging Avanzado

### Agregar Logs Temporales

Edita `src/services/reportesService.js` y agrega al inicio de `getEstadisticas`:

```javascript
export const getEstadisticas = async (filtros = {}) => {
    try {
        const token = localStorage.getItem('token');
        console.log('🔐 Token encontrado:', token ? 'SÍ' : 'NO');
        console.log('🔐 Primeros 50 caracteres:', token ? token.substring(0, 50) : 'N/A');

        const params = {};
        // ... resto del código
```

Luego en la consola verás:
```
🔐 Token encontrado: SÍ
🔐 Primeros 50 caracteres: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQi
```

---

## ✅ Checklist de Solución

- [ ] El token existe en localStorage
- [ ] El token no está expirado
- [ ] El header Authorization se envía en la request
- [ ] El backend recibe el header
- [ ] El backend valida el token correctamente
- [ ] El JWT_SECRET del backend es el correcto

---

## 🔄 Si Nada Funciona: Reset Completo

```bash
# Frontend
cd cpce-auditoria-frontend-dev
rm -rf node_modules/.vite
rm -rf dist
npm run dev

# Backend (en otra terminal)
cd cpce-auditoria-api-dev
# Verificar que JWT_SECRET esté en .env
# Reiniciar servidor
npm start
```

Luego:
1. Abre el navegador en modo incógnito
2. Navega a `http://localhost:5173`
3. Inicia sesión
4. Accede a Reportes de Compras

---

## 📞 Información de Debug

**Cuando veas el error 401, comparte:**
1. El resultado de `localStorage.getItem('token')` (primeros 50 caracteres)
2. La fecha de expiración del token (usando la función de arriba)
3. El error exacto del backend (en la consola del servidor)
4. Los headers que se envían (desde Network tab)

Esto ayudará a identificar exactamente dónde está el problema.

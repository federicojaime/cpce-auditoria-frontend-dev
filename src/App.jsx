// src/App.jsx - CORREGIDO COMPLETAMENTE
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationsProvider } from './context/NotificationsContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';

import SolicitarPresupuestos from './pages/SolicitarPresupuestos';
import SeguimientoPresupuestos from './pages/SeguimientoPresupuestos';
import GestionOrdenes from './pages/GestionOrdenes';
import ReportesCompras from './pages/ReportesCompras';

// Página pública para proveedores
import ResponderPresupuesto from './pages/ResponderPresupuesto';

// Páginas de Auditorías Tratamiento Prolongado (Rol 2 y 5)
import Dashboard from './pages/Dashboard';
import AuditoriasPendientes from './pages/AuditoriasPendientes';
import AuditoriasHistoricas from './pages/AuditoriasHistoricas';
import ListadoAuditorias from './pages/ListadoAuditorias';
import HistorialPaciente from './pages/HistorialPaciente';
import DescargarExcel from './pages/DescargarExcel';
import Vademecum from './pages/Vademecum';
import ProcesarAuditoria from './pages/ProcesarAuditoria';
import VerAuditoriaHistorica from './pages/VerAuditoriaHistorica';
import HistorialAuditoria from './pages/HistorialAuditoria';

// Páginas de Auditorías Alto Costo (Rol 1 y 5)
import AltoCostoPendientes from './pages/AltoCosto/AltoCostoPendientes';
import AltoCostoHistoricas from './pages/AltoCosto/AltoCostoHistoricas';
import AltoCostoListado from './pages/AltoCosto/AltoCostoListado';
import AltoCostoHistorialPaciente from './pages/AltoCosto/AltoCostoHistorialPaciente';
import AltoCostoDescargarExcel from './pages/AltoCosto/AltoCostoDescargarExcel';
import ProcesarAuditoriaAltoCosto from './pages/AltoCosto/ProcesarAuditoriaAltoCosto';
import VerAuditoriaHistoricaAltoCosto from './pages/AltoCosto/VerAuditoriaHistoricaAltoCosto';
import AltoCostoAuditoriaDemo from './pages/AltoCosto/AltoCostoAuditoriaDemo';

// Páginas de Proveedores (Solo rol 5 - Administrativo)
import Proveedores from './pages/Proveedores';
import ProveedorDetalle from './pages/ProveedorDetalle';
import ProveedorForm from './pages/ProveedorForm';
import ContactosProveedor from './pages/ContactosProveedor';

import Estadisticas from './pages/Estadisticas';
import Perfil from './pages/Perfil';
import Configuracion from './pages/Configuracion';
import GestionUsuariosPrueba from './pages/GestionUsuariosPrueba';

// Componente para rutas protegidas generales
const GeneralProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Verificando sesión..." />
      </div>
    );
  }

  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Componente para rutas públicas
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, getUserDefaultRoute } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Verificando sesión..." />
      </div>
    );
  }

  if (isAuthenticated) {
    const defaultRoute = getUserDefaultRoute();
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
};

// Componente principal de la aplicación
function AppContent() {
  return (
    <>
      <Routes>
        {/* ===== RUTAS PÚBLICAS ===== */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Ruta pública para que proveedores respondan presupuestos */}
        <Route
          path="/presupuesto/responder/:token"
          element={<ResponderPresupuesto />}
        />

        {/* ===== RUTAS PROTEGIDAS - DASHBOARD (Solo Administrativos - Rol 5) ===== */}
        <Route
          path="/"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[5]}>
                <Dashboard />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        {/* ===== RUTAS AUDITORÍAS TRATAMIENTO PROLONGADO (Rol 2 y 5) ===== */}

        <Route
          path="/pendientes"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[2, 5]}>
                <AuditoriasPendientes />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/historial-auditoria/:id"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[2, 5]}>
                <HistorialAuditoria />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/estadisticas"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[2, 3, 5]}>
                <Estadisticas />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/historicos"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[2, 5]}>
                <AuditoriasHistoricas />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/listado"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[2, 5]}>
                <ListadoAuditorias />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/historial-paciente"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[2, 5]}>
                <HistorialPaciente />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/descargar-excel"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[2, 5]}>
                <DescargarExcel />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/auditoria/:id"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[2, 5]}>
                <ProcesarAuditoria />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/auditoria-historica/:id"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[2, 5]}>
                <VerAuditoriaHistorica />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        {/* ===== RUTAS AUDITORÍAS ALTO COSTO (Rol 1 y 5) ===== */}

        <Route
          path="/alto-costo/pendientes"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[1, 5]}>
                <AltoCostoPendientes />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/solicitar-presupuestos"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <SolicitarPresupuestos />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/seguimiento-presupuestos"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <SeguimientoPresupuestos />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/gestion-ordenes"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <GestionOrdenes />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/reportes-compras"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <ReportesCompras />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/historicos"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[1, 5]}>
                <AltoCostoHistoricas />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/listado"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[1, 5]}>
                <AltoCostoListado />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/historial-paciente"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[1, 5]}>
                <AltoCostoHistorialPaciente />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/descargar-excel"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[1, 5]}>
                <AltoCostoDescargarExcel />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/auditoria/demo"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[1, 5]}>
                <AltoCostoAuditoriaDemo />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/auditoria/:id"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[1, 5]}>
                <ProcesarAuditoriaAltoCosto />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/auditoria/:id/historica"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[1, 5]}>
                <VerAuditoriaHistoricaAltoCosto />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        {/* ===== RUTAS GENERALES ===== */}

        <Route
          path="/vademecum"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <Vademecum />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        {/* ===== RUTAS DE PROVEEDORES (Rol 3 y 5) ===== */}

        <Route
          path="/proveedores"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <Proveedores />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/proveedores/nuevo"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <ProveedorForm />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/proveedores/:id"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <ProveedorDetalle />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/proveedores/:id/editar"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <ProveedorForm />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        {/* Redirección: /proveedores/contactos sin ID -> /proveedores */}
        <Route
          path="/proveedores/contactos"
          element={<Navigate to="/proveedores" replace />}
        />

        <Route
          path="/proveedores/:id/contactos"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[3, 5]}>
                <ContactosProveedor />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        {/* ===== RUTAS DE DEMO Y CONFIGURACIÓN ===== */}

        <Route
          path="/demo"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[1, 5]}>
                <AltoCostoAuditoriaDemo />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <GeneralProtectedRoute>
              <Perfil />
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/configuracion"
          element={
            <GeneralProtectedRoute>
              <Configuracion />
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/gestion-usuarios-prueba"
          element={
            <GeneralProtectedRoute>
              <ProtectedRoute allowedRoles={[5]}>
                <GestionUsuariosPrueba />
              </ProtectedRoute>
            </GeneralProtectedRoute>
          }
        />

        {/* ===== PÁGINAS DE AYUDA ===== */}

        <Route
          path="/ayuda"
          element={
            <GeneralProtectedRoute>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">Centro de Ayuda</h1>
                <p className="mt-2 text-gray-600">Documentación y soporte técnico</p>
              </div>
            </GeneralProtectedRoute>
          }
        />

        <Route
          path="/manual"
          element={
            <GeneralProtectedRoute>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">Manual de Usuario</h1>
                <p className="mt-2 text-gray-600">Guía completa del sistema</p>
              </div>
            </GeneralProtectedRoute>
          }
        />

        {/* ===== PÁGINA 404 ===== */}

        <Route
          path="/404"
          element={
            <GeneralProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h1 className="mt-4 text-xl font-bold text-gray-900">Página no encontrada</h1>
                  <p className="mt-2 text-sm text-gray-600">
                    La página que buscas no existe o no tienes permisos para acceder.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => window.history.back()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Volver atrás
                    </button>
                  </div>
                </div>
              </div>
            </GeneralProtectedRoute>
          }
        />

        {/* Redirigir cualquier ruta no encontrada a 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* ===== TOAST CONTAINER ===== */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        progressClassName="custom-progress"
        limit={5}
        style={{ zIndex: 9999 }}
      />
    </>
  );
}

// Componente principal con providers
function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <Router>
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
// src/App.jsx - ACTUALIZADO CON RUTAS PARA DEMO Y TOAST
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import Loading from './components/common/Loading';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';

// Páginas de Auditorías Tratamiento Prolongado
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

// Páginas de Auditorías Alto Costo (duplicadas)
import AltoCostoPendientes from './pages/AltoCosto/AltoCostoPendientes';
import AltoCostoHistoricas from './pages/AltoCosto/AltoCostoHistoricas';
import AltoCostoListado from './pages/AltoCosto/AltoCostoListado';
import AltoCostoHistorialPaciente from './pages/AltoCosto/AltoCostoHistorialPaciente';
import AltoCostoDescargarExcel from './pages/AltoCosto/AltoCostoDescargarExcel';
import ProcesarAuditoriaAltoCosto from './pages/AltoCosto/ProcesarAuditoriaAltoCosto';
import VerAuditoriaHistoricaAltoCosto from './pages/AltoCosto/VerAuditoriaHistoricaAltoCosto';

// NUEVA IMPORTACIÓN - Demo Alto Costo
import AltoCostoAuditoriaDemo from './pages/AltoCosto/AltoCostoAuditoriaDemo';

// Páginas de Proveedores
import Proveedores from './pages/Proveedores';
import ProveedorDetalle from './pages/ProveedorDetalle';
import ProveedorForm from './pages/ProveedorForm';
import ContactosProveedor from './pages/ContactosProveedor';

import Estadisticas from './pages/Estadisticas';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
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

// Componente para rutas públicas (redirigir si ya está logueado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading text="Verificando sesión..." />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// Componente principal de la aplicación
function AppContent() {
  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas - Dashboard */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ===== RUTAS AUDITORÍAS TRATAMIENTO PROLONGADO ===== */}

        <Route
          path="/pendientes"
          element={
            <ProtectedRoute>
              <AuditoriasPendientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/historial-auditoria/:id"
          element={
            <ProtectedRoute>
              <HistorialAuditoria />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estadisticas"
          element={
            <ProtectedRoute>
              <Estadisticas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/historicos"
          element={
            <ProtectedRoute>
              <AuditoriasHistoricas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/listado"
          element={
            <ProtectedRoute>
              <ListadoAuditorias />
            </ProtectedRoute>
          }
        />

        <Route
          path="/historial-paciente"
          element={
            <ProtectedRoute>
              <HistorialPaciente />
            </ProtectedRoute>
          }
        />

        <Route
          path="/descargar-excel"
          element={
            <ProtectedRoute>
              <DescargarExcel />
            </ProtectedRoute>
          }
        />

        {/* Rutas para procesar auditorías tratamiento prolongado */}
        <Route
          path="/auditoria/:id"
          element={
            <ProtectedRoute>
              <ProcesarAuditoria />
            </ProtectedRoute>
          }
        />

        <Route
          path="/auditoria-historica/:id"
          element={
            <ProtectedRoute>
              <VerAuditoriaHistorica />
            </ProtectedRoute>
          }
        />

        {/* ===== RUTAS AUDITORÍAS ALTO COSTO ===== */}

        <Route
          path="/alto-costo/pendientes"
          element={
            <ProtectedRoute>
              <AltoCostoPendientes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/historicos"
          element={
            <ProtectedRoute>
              <AltoCostoHistoricas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/listado"
          element={
            <ProtectedRoute>
              <AltoCostoListado />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/historial-paciente"
          element={
            <ProtectedRoute>
              <AltoCostoHistorialPaciente />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/descargar-excel"
          element={
            <ProtectedRoute>
              <AltoCostoDescargarExcel />
            </ProtectedRoute>
          }
        />

        {/* NUEVA RUTA - Demo Alto Costo con Proveedores */}
        <Route
          path="/alto-costo/auditoria/demo"
          element={
            <ProtectedRoute>
              <AltoCostoAuditoriaDemo />
            </ProtectedRoute>
          }
        />

        {/* Rutas para procesar auditorías alto costo (mantener originales) */}
        <Route
          path="/alto-costo/auditoria/:id"
          element={
            <ProtectedRoute>
              <ProcesarAuditoriaAltoCosto />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alto-costo/auditoria/:id/historica"
          element={
            <ProtectedRoute>
              <VerAuditoriaHistoricaAltoCosto />
            </ProtectedRoute>
          }
        />

        {/* ===== RUTAS GENERALES ===== */}

        <Route
          path="/vademecum"
          element={
            <ProtectedRoute>
              <Vademecum />
            </ProtectedRoute>
          }
        />

        {/* ===== RUTAS DE PROVEEDORES ===== */}

        <Route
          path="/proveedores"
          element={
            <ProtectedRoute>
              <Proveedores />
            </ProtectedRoute>
          }
        />

        <Route
          path="/proveedores/nuevo"
          element={
            <ProtectedRoute>
              <ProveedorForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/proveedores/:id"
          element={
            <ProtectedRoute>
              <ProveedorDetalle />
            </ProtectedRoute>
          }
        />

        <Route
          path="/proveedores/:id/editar"
          element={
            <ProtectedRoute>
              <ProveedorForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/proveedores/contactos"
          element={
            <ProtectedRoute>
              <ContactosProveedor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/proveedores/:id/contactos"
          element={
            <ProtectedRoute>
              <ContactosProveedor />
            </ProtectedRoute>
          }
        />

        {/* ===== RUTA ESPECIAL PARA DEMO RÁPIDA ===== */}
        <Route
          path="/demo"
          element={
            <ProtectedRoute>
              <AltoCostoAuditoriaDemo />
            </ProtectedRoute>
          }
        />

        {/* Rutas de administración/configuración */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
                <p className="mt-2 text-gray-600">Funcionalidad en desarrollo</p>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/configuracion"
          element={
            <ProtectedRoute>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                <p className="mt-2 text-gray-600">Funcionalidad en desarrollo</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Páginas de ayuda */}
        <Route
          path="/ayuda"
          element={
            <ProtectedRoute>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">Centro de Ayuda</h1>
                <p className="mt-2 text-gray-600">Documentación y soporte técnico</p>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/manual"
          element={
            <ProtectedRoute>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">Manual de Usuario</h1>
                <p className="mt-2 text-gray-600">Guía completa del sistema</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Ruta de fallback - 404 */}
        <Route
          path="/404"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h1 className="mt-4 text-xl font-bold text-gray-900">Página no encontrada</h1>
                  <p className="mt-2 text-sm text-gray-600">
                    La página que buscas no existe o ha sido movida.
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
            </ProtectedRoute>
          }
        />

        {/* Redirigir cualquier ruta no encontrada a 404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* ===== TOAST CONTAINER - CONFIGURACIÓN COMPLETA ===== */}
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
        limit={5} // Máximo 5 toasts a la vez
        style={{ zIndex: 9999 }} // Asegurar que esté por encima de todo
      />
    </>
  );
}

// Componente principal con providers
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
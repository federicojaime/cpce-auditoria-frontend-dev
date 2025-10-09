import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';

const Vademecum = () => {
  const iframeRef = useRef(null);
  const { user } = useAuth();

  const breadcrumbItems = [
    { name: 'Vademécum', href: '/vademecum', current: true }
  ];

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const token = user?.token || localStorage.getItem('cpce_token');

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // Crear documento HTML completo dentro del iframe
      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vademécum</title>

  <!-- Next.js Data -->
  <script id="__NEXT_DATA__" type="application/json">
  {
    "props": { "pageProps": {} },
    "page": "/",
    "query": {},
    "buildId": "qyd1RrGAMl6XJJq4QbTKP",
    "nextExport": true,
    "autoExport": true,
    "isFallback": false,
    "scriptLoader": []
  }
  </script>

  <!-- CSS Files -->
  <link rel="stylesheet" href="https://cpce.recetasalud.ar/vademecum-test/_next/static/css/431944509084d071.css">
  <link rel="stylesheet" href="https://cpce.recetasalud.ar/vademecum-test/_next/static/css/ad3572720aa218e9.css">

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #333;
    }
    #__next * {
      color: inherit !important;
      font-family: inherit !important;
    }
  </style>
</head>
<body>
  <div id="token" style="display: none;">${token}</div>
  <div id="__next"></div>

  <!-- Next.js Scripts -->
  <script src="https://cpce.recetasalud.ar/vademecum-test/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js" defer></script>
  <script src="https://cpce.recetasalud.ar/vademecum-test/_next/static/chunks/webpack-8fa1640cc84ba8fe.js" defer></script>
  <script src="https://cpce.recetasalud.ar/vademecum-test/_next/static/chunks/framework-63157d71ad419e09.js" defer></script>
  <script src="https://cpce.recetasalud.ar/vademecum-test/_next/static/chunks/main-7b07c6a356fe204f.js" defer></script>
  <script src="https://cpce.recetasalud.ar/vademecum-test/_next/static/chunks/pages/_app-d512e81188bdecfb.js" defer></script>
  <script src="https://cpce.recetasalud.ar/vademecum-test/_next/static/chunks/pages/index-159c513a97cab49b.js" defer></script>
</body>
</html>
      `;

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();
    } catch (error) {
      console.error('Error loading iframe:', error);
    }
  }, [user]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Vademécum</h1>
          <p className="mt-1 text-sm text-gray-500">Consulta de medicamentos y monodrogas</p>
        </div>

        <iframe
          ref={iframeRef}
          style={{
            width: '100%',
            minHeight: '800px',
            height: 'calc(100vh - 200px)',
            border: 'none',
            display: 'block'
          }}
          title="Vademécum"
        />
      </div>
    </div>
  );
};

export default Vademecum;

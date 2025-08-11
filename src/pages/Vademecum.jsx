import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';

const Vademecum = () => {
  const containerRef = useRef(null);
  const { user } = useAuth();

  const breadcrumbItems = [
    { name: 'Vademécum', href: '/vademecum', current: true }
  ];

  useEffect(() => {
    const initializeVademecum = async () => {
      const token = user?.token || localStorage.getItem('cpce_token');
      
      // Crear elemento para el token (como en tu PHP)
      const tokenDiv = document.createElement('div');
      tokenDiv.id = 'token';
      tokenDiv.style.display = 'none';
      tokenDiv.textContent = token;
      document.body.appendChild(tokenDiv);

      // Crear contenedor Next.js
      const nextContainer = document.createElement('div');
      nextContainer.id = '__next';
      containerRef.current.appendChild(nextContainer);

      // Agregar script con datos de Next.js
      const nextDataScript = document.createElement('script');
      nextDataScript.id = '__NEXT_DATA__';
      nextDataScript.type = 'application/json';
      nextDataScript.textContent = JSON.stringify({
        props: { pageProps: {} },
        page: "/",
        query: {},
        buildId: "Fca9HhakZSvVTEJFCHcfl",
        nextExport: true,
        autoExport: true,
        isFallback: false,
        scriptLoader: []
      });
      document.head.appendChild(nextDataScript);

      // Cargar CSS de Next.js
      const cssFiles = [
        'https://cpce.recetasalud.ar/vademecum/_next/static/css/74567cb490853f1f.css',
        'https://cpce.recetasalud.ar/vademecum/_next/static/css/45ccd052f26a170a.css',
        'https://cpce.recetasalud.ar/vademecum/_next/static/css/2514059e0f96c481.css'
      ];

      // Agregar CSS base para el texto
      const baseStyle = document.createElement('style');
      baseStyle.textContent = `
        #__next * {
          color: inherit !important;
          font-family: inherit !important;
        }
        #__next {
          color: #333 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `;
      document.head.appendChild(baseStyle);

      cssFiles.forEach(href => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          document.head.appendChild(link);
        }
      });

      // Cargar scripts de Next.js
      const scriptFiles = [
        'https://cpce.recetasalud.ar/vademecum/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js',
        'https://cpce.recetasalud.ar/vademecum/_next/static/chunks/webpack-8fa1640cc84ba8fe.js',
        'https://cpce.recetasalud.ar/vademecum/_next/static/chunks/framework-63157d71ad419e09.js',
        'https://cpce.recetasalud.ar/vademecum/_next/static/chunks/main-7b07c6a356fe204f.js',
        'https://cpce.recetasalud.ar/vademecum/_next/static/chunks/pages/index-53afc3f285f17de6.js',
        'https://cpce.recetasalud.ar/vademecum/_next/static/chunks/384-ed7f61f3836cc2ce.js',
        'https://cpce.recetasalud.ar/vademecum/_next/static/chunks/pages/_app-1f9a1a10257d6ad5.js'
      ];

      for (const src of scriptFiles) {
        if (!document.querySelector(`script[src="${src}"]`)) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
      }
    };

    initializeVademecum().catch(console.error);

    // Cleanup
    return () => {
      const tokenDiv = document.getElementById('token');
      const nextDataScript = document.getElementById('__NEXT_DATA__');
      if (tokenDiv) tokenDiv.remove();
      if (nextDataScript) nextDataScript.remove();
    };
  }, [user]);

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Vademécum</h1>
          <p className="mt-1 text-sm text-gray-500">Consulta de medicamentos y monodrogas</p>
        </div>
        
        <div 
          ref={containerRef}
          className="min-h-[600px] w-full"
          style={{ backgroundColor: '#f9fafb' }}
        />
      </div>
    </div>
  );
};

export default Vademecum;
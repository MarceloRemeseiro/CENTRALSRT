'use client';
import React, { useEffect, useState } from 'react';
import { authenticatedRequest } from '@/services/restreamer';

const ProcessDebugPage = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProcesses = async () => {
    try {
      const response = await authenticatedRequest('GET', '/api/v3/process');
      setProcesses(response);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const copyToClipboard = (process) => {
    navigator.clipboard.writeText(JSON.stringify(process, null, 2))
      .then(() => {
        alert('Copiado al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar:', err);
      });
  };

  const deleteProcess = async (processId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proceso?')) {
      try {
        await authenticatedRequest('DELETE', `/api/v3/process/${processId}`);
        fetchProcesses();
      } catch (err) {
        console.error('Error al eliminar proceso:', err);
        alert('Error al eliminar el proceso');
      }
    }
  };

  if (loading) return (
    <div className="bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Cargando procesos...</h1>
    </div>
  );

  if (error) return (
    <div className="bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Error al cargar procesos</h1>
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Debug: Procesos</h1>
      <div className="space-y-4">
        {processes.map((process) => (
          <div key={process.id} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold">ID: {process.id}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(process)}
                  className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Copiar JSON
                </button>
                <button
                  onClick={() => deleteProcess(process.id)}
                  className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
                {JSON.stringify(process, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessDebugPage; 
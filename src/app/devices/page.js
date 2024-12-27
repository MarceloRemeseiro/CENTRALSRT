"use client"
import { useEffect, useState, useCallback } from 'react';
import EditNameModal from '@/components/EditNameModal';

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [srtInputs, setSrtInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDevice, setEditingDevice] = useState(null);

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch('/api/devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(prevDevices => data.map(newDevice => ({
          ...newDevice,
          // Mantener el selected_srt del estado anterior o usar assigned_srt
          selected_srt: (prevDevices.find(d => d.device_id === newDevice.device_id)?.selected_srt) || newDevice.assigned_srt || ''
        })));
      }
    } catch (error) {
      console.error('Error al obtener dispositivos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Obtener la lista de SRTs disponibles
    const fetchSrtInputs = async () => {
      try {
        const response = await fetch('/api/process/inputs');
        if (response.ok) {
          const data = await response.json();
          setSrtInputs(data);
        }
      } catch (error) {
        console.error('Error al obtener SRTs:', error);
      }
    };

    fetchDevices();
    fetchSrtInputs();
    
    const pollInterval = setInterval(fetchDevices, 10000); // 10 segundos

    return () => clearInterval(pollInterval);
  }, [fetchDevices]);

  const handleSrtSelection = async (deviceId, srtId) => {
    try {
      // Actualizar estado local inmediatamente
      setDevices(prevDevices => prevDevices.map(device => {
        if (device.device_id === deviceId) {
          return { ...device, selected_srt: srtId, assigned_srt: srtId };
        }
        return device;
      }));

      // Construir URL SRT limpia
      let srtUrl = null;
      if (srtId) {
        const selectedSrt = srtInputs.find(srt => srt.id === srtId);
        if (selectedSrt) {
          const streamId = selectedSrt.streamId
            .replace('restreamer-ui:ingest:', '')
            .replace('?mode=request', '');
            
          srtUrl = `srt://streamingpro.es:6000/?mode=caller&transtype=live&streamid=${streamId}`;
        }
      }

      // Actualizar en el servidor
      await fetch(`/api/devices/${deviceId}/srt`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srtId: srtId || null })
      });

    } catch (error) {
      console.error('Error:', error);
      fetchDevices();
    }
  };

  const handleEditName = (device) => {
    setEditingDevice(device);
  };

  const handleSaveName = async (deviceId, newName) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: newName }),
      });

      if (response.ok) {
        // Actualizar la lista de dispositivos
        const updatedDevices = devices.map(device => 
          device.device_id === deviceId 
            ? { ...device, display_name: newName }
            : device
        );
        setDevices(updatedDevices);
      }
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Actualizar la lista de dispositivos
        setDevices(devices.filter(device => device.device_id !== deviceId));
      } else {
        console.error('Error al eliminar dispositivo');
      }
    } catch (error) {
      console.error('Error al eliminar dispositivo:', error);
    }
  };

  const StatusIndicator = ({ status }) => {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span>{status}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">STREAMING PRO / DISPOSITIVOS</h1>
          {devices.length === 0 ? (
        <p className="text-gray-500">No hay dispositivos conectados</p>
      ) : (
        <table className="table-auto border-collapse border border-gray-400 w-full">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="border border-gray-400 px-4 py-2">Device ID</th>
              <th className="border border-gray-400 px-4 py-2">IP Local</th>
              <th className="border border-gray-400 px-4 py-2">IP Pública</th>
              <th className="border border-gray-400 px-4 py-2">SRT Asignado</th>
              <th className="border border-gray-400 px-4 py-2">Estado</th>
              <th className="border border-gray-400 px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.device_id}>
                <td className="border border-gray-400 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span>{device.display_name || device.device_id}</span>
                    <button
                      onClick={() => handleEditName(device)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✏️
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">{device.device_id}</span>
                </td>
                <td className="border border-gray-400 px-4 py-2">{device.local_ip}</td>
                <td className="border border-gray-400 px-4 py-2">{device.public_ip}</td>
                <td className="border border-gray-400 px-4 py-2">
                  <select
                    className="w-full bg-gray-800 text-white rounded p-2"
                    value={device.selected_srt || ''}
                    onChange={(e) => handleSrtSelection(device.device_id, e.target.value)}
                  >
                    <option value="">NINGUNO</option>
                    {srtInputs.map((srt) => (
                      <option key={srt.id} value={srt.id}>
                        {srt.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  <StatusIndicator status={device.status} />
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  <button
                    onClick={() => handleDeleteDevice(device.device_id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <EditNameModal
        device={editingDevice}
        isOpen={!!editingDevice}
        onClose={() => setEditingDevice(null)}
        onSave={handleSaveName}
      />
    </div>
  );
}

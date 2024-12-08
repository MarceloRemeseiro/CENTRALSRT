import React, { useState } from 'react';

export default function EditNameModal({ device, isOpen, onClose, onSave }) {
  const [newName, setNewName] = useState(device?.display_name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(device.device_id, newName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl mb-4">Editar nombre del dispositivo</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm mb-2">ID: {device.device_id}</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del dispositivo"
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-400"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
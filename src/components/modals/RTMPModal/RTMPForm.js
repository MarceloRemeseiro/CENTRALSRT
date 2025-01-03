import React from 'react';

const RTMPForm = ({
  data,
  onChange,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  console.log('RTMPForm - Datos recibidos:', data);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Crear una copia de los datos
    const formattedData = { ...data };
    
    // Asegurarnos de que la URL tenga el prefijo rtmp:// al enviar
    if (formattedData.url && !formattedData.url.startsWith('rtmp://')) {
      formattedData.url = `rtmp://${formattedData.url}`;
    }
    
    console.log('RTMPForm - Datos al enviar:', formattedData);
    onSubmit(e, formattedData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('RTMPForm - onChange:', { name, value });
    
    // Para la URL, guardamos exactamente lo que el usuario escribe
    onChange(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300">Nombre del Output</label>
        <input
          type="text"
          name="nombre"
          value={data.nombre || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 
                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   shadow-sm"
          placeholder="Ej: YouTube Stream"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">URL del Servidor RTMP</label>
        <input
          type="text"
          name="url"
          value={data.url || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 
                   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   shadow-sm"
          placeholder="rtmp://a.rtmp.youtube.com/live2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Stream Key</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="text"
            name="streamKey"
            value={data.streamKey || ''}
            onChange={handleChange}
            className="block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-gray-100 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="xxxx-xxxx-xxxx-xxxx"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500
                   transition-colors duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500
                   transition-colors duration-200"
        >
          {isEditing ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  );
};

export default RTMPForm; 
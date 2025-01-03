import React from 'react';

const StatusIndicator = ({ state }) => {
  switch (state) {
    case "running":
      return (
        <div className="flex items-center text-green-500">
          <div className="w-2 h-2 mr-2 rounded-full bg-green-500 animate-pulse"></div>
          Activo
        </div>
      );
    case "finished":
      return (
        <div className="flex items-center text-blue-500">
          <div className="w-2 h-2 mr-2 rounded-full bg-blue-500"></div>
          Finalizado
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center text-red-500">
          <div className="w-2 h-2 mr-2 rounded-full bg-red-500"></div>
          Error
        </div>
      );
    default:
      return (
        <div className="flex items-center text-gray-500">
          <div className="w-2 h-2 mr-2 rounded-full bg-gray-500"></div>
          Desconocido
        </div>
      );
  }
};

export default StatusIndicator; 
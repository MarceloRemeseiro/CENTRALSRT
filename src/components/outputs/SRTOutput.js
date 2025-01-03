import React from "react";
import OutputSwitch from "./OutputSwitch";

const SRTOutput = ({ output, onToggle, onEdit, onDelete }) => (
  <div className="bg-purple-900 p-3 rounded text-gray-300">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <span className="bg-purple-800 px-2 py-1 rounded-full text-xs font-medium">
          SRT
        </span>
        <p>
          <strong>Nombre:</strong> {output.name}
        </p>
      </div>
      <OutputSwitch output={output} onToggle={onToggle} />
    </div>
    <p className="text-sm break-all">
      <strong>URL: </strong> {output.address}
    </p>
    <p className="text-sm break-all">
      <strong>Puerto: </strong> {output.port}
    </p>
    {/* Aquí podemos añadir más campos específicos de SRT */}
    <div className="flex justify-between mt-2">
      <button
        onClick={() => onEdit(output.id)}
        className="bg-blue-600 text-xs px-2 py-1 rounded hover:bg-blue-700 transition-colors mr-2"
      >
        Editar
      </button>
      <button
        onClick={() => onDelete(output.id)}
        className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-900 transition-colors"
      >
        Eliminar
      </button>
    </div>
  </div>
);

export default SRTOutput; 
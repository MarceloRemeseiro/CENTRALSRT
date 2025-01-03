import React from "react";
import OutputSwitch from "./OutputSwitch";

const RTMPOutput = ({ output, onToggle, onEdit, onDelete }) => (
  <div className="bg-yellow-800 p-3 rounded text-gray-300">
        <span className="bg-yellow-900 px-2 py-1 rounded-full text-xs font-medium">
          RTMP
        </span>
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
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
      <strong>Stream Key: </strong> {output.streamKey}
    </p>
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

export default RTMPOutput; 
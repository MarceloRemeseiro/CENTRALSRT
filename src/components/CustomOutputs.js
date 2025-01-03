import React from "react";
import RTMPOutput from "./outputs/RTMPOutput";
import SRTOutput from "./outputs/SRTOutput";

const CustomOutputs = ({
  localOutputs,
  handleEliminarPunto,
  handleToggle,
  handleEditarPunto,
}) => {
  if (!Array.isArray(localOutputs)) {
    console.warn('localOutputs no es un array:', localOutputs);
    return null;
  }

  // Separar outputs por tipo usando el ID de manera segura
  const rtmpOutputs = localOutputs.filter(output => 
    output?.id && typeof output.id === 'string' && output.id.includes(':rtmp:')
  );
  
  const srtOutputs = localOutputs.filter(output => 
    output?.id && typeof output.id === 'string' && output.id.includes(':srt:')
  );

  console.log('RTMP Outputs:', rtmpOutputs);
  console.log('SRT Outputs:', srtOutputs);

  return (
    <>
      <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
        PUNTOS DE PUBLICACIÓN
      </h3>
      <div className="space-y-2">
        {rtmpOutputs.map((output) => (
          <RTMPOutput
            key={output.id}
            output={output}
            onToggle={handleToggle}
            onEdit={handleEditarPunto}
            onDelete={handleEliminarPunto}
          />
        ))}
        {srtOutputs.map((output) => (
          <SRTOutput
            key={output.id}
            output={output}
            onToggle={handleToggle}
            onEdit={handleEditarPunto}
            onDelete={handleEliminarPunto}
          />
        ))}
      </div>
    </>
  );
};

export default CustomOutputs;

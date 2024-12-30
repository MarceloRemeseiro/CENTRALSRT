import React from "react";

const CustomOutputs = ({
  localOutputs,
  handleEliminarPunto,
  handleToggle,
  handleEditarPunto,
}) => {
  const getSwitchColor = (output) => {
    if (output.state === "failed") return "bg-red-500";
    if (output.state === "running") return "bg-green-500";
    return "bg-gray-300";
  };

  const switchStyle = (output) =>
    `relative inline-flex h-6 w-11 items-center rounded-full transition ${getSwitchColor(
      output
    )}`;

  const circleStyle = (output) =>
    `inline-block h-4 w-4 rounded-full bg-white transition transform ${
      output.state === "running" || output.isTogglingOn
        ? "translate-x-6"
        : "translate-x-1"
    }`;
console.log(localOutputs);

  const renderRTMPOutput = (output) => (
    <div key={`rtmp-${output.id}`} className="bg-yellow-800 p-3 rounded text-gray-300">
      <div className="flex justify-between items-center">
        <p>
          <strong>Nombre:</strong> {output.name}
        </p>
        <div
          className={switchStyle(output)}
          onClick={() => handleToggle(output.id, output.state)}
        >
          <span className={circleStyle(output)} />
        </div>
      </div>
      <p className="text-sm break-all">
        <strong>URL: </strong> {output.address}
      </p>
      <p className="text-sm break-all">
        <strong>KEY: </strong> {output.key}
      </p>
      <div className="flex justify-between mt-2">
        <button
          onClick={() => handleEditarPunto(output.id)}
          className="bg-blue-600 text-xs px-2 py-1 rounded hover:bg-blue-700 transition-colors mr-2"
        >
          Editar
        </button>
        <button
          onClick={() => handleEliminarPunto(output.id)}
          className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-900 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );

  const renderSRTOutput = (output) => {
    try {
      // Parseamos la URL SRT para mostrar los detalles
      const srtRegex = /srt:\/\/([^:]+):(\d+)(?:\?(.*))?/;
      const match = output.address.match(srtRegex);
      
      if (!match) {
        console.error('Invalid SRT address format:', output.address);
        return null;
      }

      const [_, host, port, queryString] = match;
      const params = queryString ? new URLSearchParams(queryString) : new URLSearchParams();
      
      return (
        <div key={`srt-${output.id}`} className="bg-red-700 p-3 rounded text-gray-300">
          <div className="flex justify-between items-center">
            <p>
              <strong>Nombre:</strong> {output.name}
            </p>
            <div
              className={switchStyle(output)}
              onClick={() => handleToggle(output.id, output.state)}
            >
              <span className={circleStyle(output)} />
            </div>
          </div>
          <div className="space-y-1 mt-2">
            <p className="text-sm">
              <strong>Host:</strong> {host}
            </p>
            <p className="text-sm">
              <strong>Puerto:</strong> {port}
            </p>
            {params.get('streamid') && (
              <p className="text-sm">
                <strong>Stream ID:</strong> {params.get('streamid')}
              </p>
            )}
            {params.get('latency') && (
              <p className="text-sm">
                <strong>Latency:</strong> {params.get('latency')}
              </p>
            )}
            {params.get('passphrase') && (
              <p className="text-sm">
                <strong>Passphrase:</strong> {params.get('passphrase')}
              </p>
            )}
          </div>
          <div className="flex justify-between mt-2">
            <button
              onClick={() => handleEditarPunto(output.id)}
              className="bg-blue-600 text-xs px-2 py-1 rounded hover:bg-blue-700 transition-colors mr-2"
            >
              Editar
            </button>
            <button
              onClick={() => handleEliminarPunto(output.id)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-900 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering SRT output:', error);
      return null;
    }
  };

  const isOutputSRT = (output) => {
    return output?.address?.toLowerCase().startsWith('srt://') || false;
  };

  if (!Array.isArray(localOutputs) || localOutputs.length === 0) {
    return (
      <div>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
        PUNTOS DE PUBLICACIÓN
      </h3>
      <div className="space-y-2 text-neutral-800">
        {localOutputs.map((output) => 
          isOutputSRT(output) ? renderSRTOutput(output) : renderRTMPOutput(output)
        )}
      </div>
    </>
  );
};

export default CustomOutputs;

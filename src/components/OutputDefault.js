import React from 'react';
import CopyButton from './CopyButton';

const OutputDefault = ({ defaultOutputs }) => {
  return (
    <>
      <h3 className="text-lg font-semibold mt-4 mb-2 text-white">
        OUTPUTS POR DEFECTO
      </h3>
      <div className="bg-slate-800 p-3 rounded mb-4">
        {Object.entries(defaultOutputs).map(([key, value]) => (
          <div key={key} className="mb-2 flex items-center justify-between bg-black/30 p-2 rounded">
            <div >
              <p>
                <strong className="text-gray-300">{key}:</strong>
              </p>
              <p className="p-2 text-sm break-all text-gray-400">{value}</p>
            </div>
            <CopyButton text={value} />
          </div>
        ))}
      </div>
    </>
  );
};

export default OutputDefault;
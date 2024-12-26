import React, { useState } from 'react';

const CopyButton = ({ text, className = '', label = 'Copiar' }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={className || "bg-blue-600 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-sm"}
    >
      {label}
    </button>
  );
};

export default CopyButton;
"use client";
import React, { useState, useEffect } from "react";
import InputDetails from "../../../components/InputDetails";
import useAuth from "../../../hooks/useAuth";
import useInputs from "../../../hooks/useInputs";
import Link from 'next/link';

export default function InputPage({ params }) {
  const { user } = useAuth();
  const { 
    inputs,
    agregarPuntoPublicacion, 
    eliminarPuntoPublicacion, 
    toggleOutputState,
    editarPuntoPublicacion
  } = useInputs();

  const [input, setInput] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = params;

  useEffect(() => {
    if (id && user) {
      fetchInput();
    }
  }, [id, user]);

  const fetchInput = async () => {
    try {
      const response = await fetch(`/api/process/${id}/input`);
      if (!response.ok) {
        throw new Error("Failed to fetch input");
      }
      const data = await response.json();
      setInput(data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching input data");
      setLoading(false);
    }
  };

  const handleEditarPuntoPublicacion = async (inputId, outputId, data) => {
    try {
      if (typeof editarPuntoPublicacion !== 'function') {
        throw new Error('editarPuntoPublicacion no está definida');
      }

      const updatedOutput = await editarPuntoPublicacion(inputId, outputId, data);
      if (updatedOutput) {
        setInput((prevInput) => ({
          ...prevInput,
          customOutputs: prevInput.customOutputs.map((output) =>
            output.id === outputId ? { ...output, ...data } : output
          ),
        }));
        await fetchInput();
      }
      return updatedOutput;
    } catch (error) {
      console.error('Error al editar punto de publicación:', error);
      throw error;
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <span className="loader"></span>
      </div>
    );
  if (error)
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  if (!input) return <div className="text-center mt-8">No input found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Detalles del Input</h1>
        <div className="flex items-center gap-4">
          <Link 
            href="/devices" 
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver dispositivos
          </Link>
          <Link 
            href="/" 
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            Volver a Inputs
          </Link>
        </div>
      </div>
      <InputDetails
        input={input}
        agregarPuntoPublicacion={agregarPuntoPublicacion}
        eliminarPuntoPublicacion={eliminarPuntoPublicacion}
        toggleOutputState={toggleOutputState}
        editarPuntoPublicacion={handleEditarPuntoPublicacion}
      />
    </div>
  );
}

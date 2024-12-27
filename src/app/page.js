"use client";
import { useEffect, useState } from "react";
import InputCard from "../components/InputCard";
import Login from "../components/Login";
import useAuth from "../hooks/useAuth";
import useInputs from "../hooks/useInputs";
import Link from 'next/link';

function Home() {
  const { user, loading: authLoading, handleLogin, handleLogout } = useAuth();
  const { 
    inputs, 
    loading: inputsLoading, 
    error, 
    fetchInputs, 
    agregarPuntoPublicacion, 
    eliminarPuntoPublicacion, 
    toggleOutputState,
    updateInputMetadata 
  } = useInputs();

  const [isClient, setIsClient] = useState(false);
  console.log(inputs);
  
  useEffect(() => {
    setIsClient(true);
    if (user) {
      fetchInputs();
    }
  }, [user, fetchInputs]);

  if (!isClient) {
    return null; // O un placeholder si lo prefieres
  }

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <span className="loader"></span>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (inputsLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
        <span className="loader"></span>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-8">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Inputs</h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/devices" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver dispositivos
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inputs.map((input, index) => (
            <InputCard
              key={input.id}
              input={input}
              index={index}
              agregarPuntoPublicacion={agregarPuntoPublicacion}
              eliminarPuntoPublicacion={eliminarPuntoPublicacion}
              toggleOutputState={toggleOutputState}
              updateInputMetadata={updateInputMetadata}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
"use client";
import React from "react";
import VideoPlayer from "./VideoPlayer";
import InputInfo from "./InputInfo";
import OutputDefault from "./OutputDefault";
import CustomOutputs from "./CustomOutputs";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";
import InputData from "./InputData";
import Link from "next/link";
import { useInputLogic } from "../hooks/useInputLogic";

const InputDetails = ({
  input,
  agregarPuntoPublicacion,
  eliminarPuntoPublicacion,
  toggleOutputState,
  editarPuntoPublicacion,
}) => {
  const {
    localInput,
    localOutputs,
    isModalOpen,
    isEditModalOpen,
    videoRefreshTrigger,
    newOutput,
    editingOutput,
    confirmationModal,
    openModal,
    closeModal,
    openEditModal,
    closeEditModal,
    handleInputChange,
    handleSubmit,
    handleEliminarPunto,
    handleToggle,
    handleEditarPunto,
    handleUpdateOutput,
    setConfirmationModal,
    setEditingOutput,
  } = useInputLogic(
    input,
    agregarPuntoPublicacion,
    eliminarPuntoPublicacion,
    toggleOutputState,
    editarPuntoPublicacion
  );

  const getStatusIcon = (state) => {
    switch (state) {
      case "running":
        return (
          <div className="flex items-center justify-end text-2xl">
            <div className="w-4 h-4 mr-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-semibold text-green-500">Activo</span>
          </div>
        );
      case "finished":
        return (
          <div className="flex items-center justify-end text-2xl">
            <div className="w-4 h-4 mr-3 rounded-full bg-blue-500"></div>
            <span className="font-semibold text-blue-500">Finalizado</span>
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center justify-end text-2xl">
            <div className="w-4 h-4 mr-3 rounded-full bg-red-500"></div>
            <span className="font-semibold text-red-500">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-end text-2xl">
            <div className="w-4 h-4 mr-3 rounded-full bg-gray-500"></div>
            <span className="font-semibold text-gray-500">Desconocido</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="md:w-2/3 space-y-6">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <Link 
              href="/" 
              className="flex items-center text-gray-400 hover:text-blue-400 transition-colors group"
            >
              <span className="text-2xl mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform">
                ←
              </span>
              <span className="text-lg">Volver a Inputs</span>
            </Link>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-white">
                  {localInput.name}
                </h1>
                <p className="text-xl text-gray-400 leading-relaxed">
                  {localInput.description || 'Sin descripción'}
                </p>
              </div>
              <div className="ml-6">
                {getStatusIcon(localInput.state)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Video Preview</h2>
          <VideoPlayer
            url={localInput.defaultOutputs?.HLS}
            isRunning={localInput.state === "running"}
            refreshTrigger={videoRefreshTrigger}
          />
        </div>

       
          <InputInfo data={localInput} />
          <OutputDefault defaultOutputs={localInput.defaultOutputs} />
     
      </div>

      <div className="md:w-1/3">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Custom Outputs</h2>
          <CustomOutputs
            localOutputs={localOutputs}
            handleEliminarPunto={handleEliminarPunto}
            handleToggle={handleToggle}
            handleEditarPunto={handleEditarPunto}
          />
          <button
            onClick={openModal}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Agregar Punto de Publicación RTMP
          </button>
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4">RTMP</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa un nombre"
                value={newOutput.nombre}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-gray-400">URL</label>
              <input
                type="text"
                name="url"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la URL"
                value={newOutput.url}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-gray-400">Key</label>
              <input
                type="text"
                name="streamKey"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la Key"
                value={newOutput.streamKey}
                onChange={handleInputChange}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Agregar
            </button>
          </form>
        </Modal>
      )}

      {isEditModalOpen && editingOutput && (
        <Modal onClose={closeEditModal}>
          <h2 className="text-xl font-bold mb-4">Editar RTMP</h2>
          <form onSubmit={handleUpdateOutput} className="space-y-4">
            <div>
              <label className="text-gray-400">Nombre</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa un nombre"
                name="nombre"
                value={editingOutput.nombre || ''}
                onChange={(e) => setEditingOutput({...editingOutput, nombre: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">URL</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la URL"
                name="url"
                value={editingOutput.url || ''}
                onChange={(e) => setEditingOutput({...editingOutput, url: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">Key</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la Key"
                name="streamKey"
                value={editingOutput.streamKey || ''}
                onChange={(e) => setEditingOutput({...editingOutput, streamKey: e.target.value})}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Actualizar
            </button>
          </form>
        </Modal>
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal({ ...confirmationModal, isOpen: false })
        }
        onConfirm={() => {
          confirmationModal.onConfirm();
          setConfirmationModal({ ...confirmationModal, isOpen: false });
        }}
        message={confirmationModal.message}
      />
    </div>
  );
};

export default InputDetails;
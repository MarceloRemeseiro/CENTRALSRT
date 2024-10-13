import React from "react";
import Modal from "./Modal";
import ConfirmationModal from "./ConfirmationModal";
import VideoPlayer from "./VideoPlayer";
import OutputDefault from "./OutputDefault";
import CustomOutputs from "./CustomOutputs";
import InputInfo from "./InputInfo";
import InputData from "./InputData";
import Link from "next/link";
import { useInputLogic } from "../hooks/useInputLogic";

const InputCard = ({
  input,
  index,
  agregarPuntoPublicacion,
  eliminarPuntoPublicacion,
  toggleOutputState,
  editarPuntoPublicacion,
}) => {
  const {
    localInput,
    setLocalInput,
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
  console.log(editingOutput);

  const getStatusIcon = (state) => {
    return state === "running" ? "🟢" : "🔴";
  };

  return (
    <div className="bg-gray-800 text-gray-200 shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center">
        <Link href={`input/${input.id}`}>
          <h2 className="text-xl font-bold mb-2 text-white">
            SRT INPUT # {index + 1}
          </h2>
        </Link>
        <span className="text-2xl mb-2">{getStatusIcon(localInput.state)}</span>
      </div>
      <InputData input={input} />
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
        <div className="video-wrapper" style={{ aspectRatio: "16 / 9" }}>
          <VideoPlayer
            url={localInput.defaultOutputs.HLS}
            isRunning={localInput.state === "running"}
            refreshTrigger={videoRefreshTrigger}
          />
        </div>
      </div>
      <InputInfo name={input.name} streamId={input.streamId} />
      <OutputDefault defaultOutputs={input.defaultOutputs} />
      <CustomOutputs
        localOutputs={localOutputs}
        handleEliminarPunto={handleEliminarPunto}
        handleToggle={handleToggle}
        handleEditarPunto={handleEditarPunto}
      />
      <div className="flex justify-center mt-4">
        <button
          onClick={openModal}
          className="flex justify-center mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Agregar Punto de Publicación RTMP
        </button>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <h2 className="text-xl font-bold mb-4">Agregar RTMP</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400">Nombre</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa un nombre"
                name="nombre"
                value={newOutput.nombre}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-gray-400">URL</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la URL"
                name="url"
                value={newOutput.url}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-gray-400">Key</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa la Key"
                name="streamKey"
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

export default InputCard;

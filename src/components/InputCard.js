import React, { useState } from "react";
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
  updateInputMetadata,
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

  // Nuevo estado para el modal de edición de info
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoFormData, setInfoFormData] = useState({
    name: input?.name || '',
    description: input?.description || ''
  });

  const getStatusIcon = (state) => {
   
    
    switch (state) {
      case "running":
        return (
          <div className="flex items-center text-green-500">
            <div className="w-2 h-2 mr-2 rounded-full bg-green-500 animate-pulse"></div>
            Activo
          </div>
        );
      case "finished":
        return (
          <div className="flex items-center text-blue-500">
            <div className="w-2 h-2 mr-2 rounded-full bg-blue-500"></div>
            Finalizado
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center text-red-500">
            <div className="w-2 h-2 mr-2 rounded-full bg-red-500"></div>
            Error
          </div>
        );
      default:
        console.log('Estado no reconocido:', state);
        return (
          <div className="flex items-center text-gray-500">
            <div className="w-2 h-2 mr-2 rounded-full bg-gray-500"></div>
            Desconocido
          </div>
        );
    }
  };

  // Determinar el tipo de input y su color de fondo
  
  const isRTMP = input.type === 'rtmp';
  const cardBackground = isRTMP ? 'bg-blue-900' : 'bg-blue-950';

  // Función para separar la URL RTMP y la streamkey
  const getRTMPDetails = (rtmpUrl) => {
    if (!rtmpUrl) return { baseUrl: '', streamKey: '' };
    
    // Encontrar la última ocurrencia de '/'
    const lastSlashIndex = rtmpUrl.lastIndexOf('/');
    if (lastSlashIndex === -1) return { baseUrl: rtmpUrl, streamKey: '' };

    const baseUrl = rtmpUrl.substring(0, lastSlashIndex + 1); // Incluimos el '/'
    const streamKey = rtmpUrl.substring(lastSlashIndex + 1).replace('.stream', '');

    return { baseUrl, streamKey };
  };

  // Obtener URL base y streamkey
  const { baseUrl, streamKey } = getRTMPDetails(input.defaultOutputs.RTMP);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateInputMetadata(input.id, infoFormData);
      setIsInfoModalOpen(false);
    } catch (error) {
      console.error('Error updating input info:', error);
      // Opcionalmente, mostrar un mensaje de error al usuario
      alert('Error al actualizar la información. Por favor, intente nuevamente.');
    }
  };


  return (
    <div className={`${cardBackground} text-gray-200 shadow-lg rounded-lg p-6`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link 
              href={`/input/${input.id}`}
              className="hover:text-blue-400 transition-colors"
            >
              <h2 className="text-xl font-bold text-white">
                {localInput?.name || 'Sin nombre'}
              </h2>
            </Link>
            <button 
              onClick={() => {
                setInfoFormData({
                  name: input?.name || '',
                  description: input?.description || ''
                });
                setIsInfoModalOpen(true);
              }}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                />
              </svg>
            </button>
          </div>
          <p className="text-gray-400">
            {localInput?.description || 'Sin descripción'}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div>{getStatusIcon(localInput?.state)}</div>
        
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Video Preview</h3>
        <div className="video-wrapper" style={{ aspectRatio: "16 / 9" }}>
         
          <VideoPlayer
            url={localInput.defaultOutputs?.HLS}
            isRunning={localInput.state === "running"}
            refreshTrigger={videoRefreshTrigger}
          />
        </div>
      </div>

      <InputInfo 
        data={input}
        
      />
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
              <label className="text-gray-800">URL</label>
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

      {isInfoModalOpen && (
        <Modal onClose={() => setIsInfoModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Editar Información</h2>
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400">Nombre</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa un nombre"
                value={infoFormData.name}
                onChange={(e) => setInfoFormData({
                  ...infoFormData,
                  name: e.target.value
                })}
              />
            </div>
            <div>
              <label className="text-gray-400">Descripción</label>
              <textarea
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                placeholder="Ingresa una descripción"
                value={infoFormData.description}
                onChange={(e) => setInfoFormData({
                  ...infoFormData,
                  description: e.target.value
                })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsInfoModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
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
                value={editingOutput.streamKey || ''}
                onChange={(e) => setEditingOutput({...editingOutput, streamKey: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Guardar
              </button>
            </div>
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

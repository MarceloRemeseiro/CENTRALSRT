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
import RTMPModal from './modals/RTMPModal';
import useRTMPOutputs from '@/hooks/useRTMPOutputs';

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
    setLocalOutputs,
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
    handleEditarPunto: handleEditarPuntoOriginal,
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

  const { 
    createRTMPOutput, 
    updateRTMPOutput, 
    deleteRTMPOutput, 
    toggleRTMPOutput,
    isLoading 
  } = useRTMPOutputs();

  const [isRTMPModalOpen, setIsRTMPModalOpen] = useState(false);
  const [rtmpFormData, setRtmpFormData] = useState({
    nombre: '',
    url: '',
    streamKey: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentOutputId, setCurrentOutputId] = useState(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoFormData, setInfoFormData] = useState({
    name: '',
    description: ''
  });

  const openRTMPModal = (output = null) => {
    if (output) {
      setRtmpFormData({
        nombre: output.name,
        url: output.url,
        streamKey: output.streamKey
      });
      setIsEditing(true);
      setCurrentOutputId(output.id);
    } else {
      setRtmpFormData({ nombre: '', url: '', streamKey: '' });
      setIsEditing(false);
      setCurrentOutputId(null);
    }
    setIsRTMPModalOpen(true);
  };

  const closeRTMPModal = () => {
    setIsRTMPModalOpen(false);
    setRtmpFormData({ nombre: '', url: '', streamKey: '' });
    setIsEditing(false);
    setCurrentOutputId(null);
  };

  const handleRTMPChange = (e) => {
    const { name, value } = e.target;
    setRtmpFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRTMPSubmit = async (e, formData) => {
    try {
      if (isEditing && currentOutputId) {
        const updatedOutput = await updateRTMPOutput(input.id, currentOutputId, formData);
        setLocalOutputs(prev => prev.map(output => 
          output.id === currentOutputId ? updatedOutput : output
        ));
      } else {
        const newOutput = await createRTMPOutput(input.id, formData);
        const completeOutput = {
          ...newOutput,
          streamKey: formData.streamKey,
          address: `${formData.url}`,
          name: formData.nombre
        };
        setLocalOutputs(prev => [...prev, completeOutput]);
      }
      closeRTMPModal();

    } catch (error) {
      console.error('Error al manejar output RTMP:', error);
    }
  };

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
        return (
          <div className="flex items-center text-gray-500">
            <div className="w-2 h-2 mr-2 rounded-full bg-gray-500"></div>
            Desconocido
          </div>
        );
    }
  };

  const isRTMP = input.type === 'rtmp';
  const cardBackground = isRTMP ? 'bg-blue-900' : 'bg-blue-950';

  const getRTMPDetails = (rtmpUrl) => {
    if (!rtmpUrl) return { baseUrl: '', streamKey: '' };
    const lastSlashIndex = rtmpUrl.lastIndexOf('/');
    if (lastSlashIndex === -1) return { baseUrl: rtmpUrl, streamKey: '' };
    const baseUrl = rtmpUrl.substring(0, lastSlashIndex + 1);
    const streamKey = rtmpUrl.substring(lastSlashIndex + 1).replace('.stream', '');
    return { baseUrl, streamKey };
  };

  const { baseUrl, streamKey } = getRTMPDetails(input.defaultOutputs?.RTMP);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateInputMetadata(input.id, infoFormData);
      setIsInfoModalOpen(false);
    } catch (error) {
      console.error('Error updating input info:', error);
    }
  };

  const handleOpenRTMPEdit = (outputId) => {
    const output = localOutputs.find(o => o.id === outputId);
    console.log('Editando output:', output);
    if (output) {
      setRtmpFormData({
        nombre: output.name,
        url: output.address,
        streamKey: output.streamKey
      });
      setIsEditing(true);
      setCurrentOutputId(outputId);
      setIsRTMPModalOpen(true);
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

      <InputInfo data={input} />
      <OutputDefault defaultOutputs={input.defaultOutputs} />
      <CustomOutputs
        localOutputs={localOutputs}
        handleEliminarPunto={handleEliminarPunto}
        handleToggle={handleToggle}
        handleEditarPunto={handleOpenRTMPEdit}
      />

      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={() => openRTMPModal()}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Procesando...' : 'Agregar RTMP'}
        </button>
        <button
          onClick={() => setIsSRTModalOpen(true)}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
        >
          Agregar SRT
        </button>
      </div>

      <RTMPModal
        isOpen={isRTMPModalOpen}
        onClose={closeRTMPModal}
        onSubmit={handleRTMPSubmit}
        data={rtmpFormData}
        onChange={handleRTMPChange}
        isEditing={isEditing}
        reference={input.id}
      />

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
     

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
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

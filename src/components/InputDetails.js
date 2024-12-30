"use client";
import React, { useState } from "react";
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
  onUpdate,
  recargarOutputs,
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
    handleEditarPunto: handleEditarPuntoRTMP,
    handleUpdateOutput,
    setConfirmationModal,
    setEditingOutput,
    updateSRTOutput,
  } = useInputLogic(
    input,
    agregarPuntoPublicacion,
    eliminarPuntoPublicacion,
    toggleOutputState,
    editarPuntoPublicacion
  );

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isSRTModalOpen, setIsSRTModalOpen] = useState(false);
  const [srtFormData, setSrtFormData] = useState({
    nombre: '',
    url: '',
    port: '',
    latency: '',
    streamId: '',
    passphrase: ''
  });
  const [isEditSRTModalOpen, setIsEditSRTModalOpen] = useState(false);
  const [editingSRTOutput, setEditingSRTOutput] = useState(null);

  const handleSRTSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        type: 'srt',
        metadata: {
          'restreamer-ui': {
            name: srtFormData.nombre,
            settings: {
              address: `${srtFormData.url}:${srtFormData.port}`,
              protocol: 'srt://',
              params: {
                latency: srtFormData.latency || '200',
                streamid: srtFormData.streamId || '',
                passphrase: srtFormData.passphrase || '',
                transtype: 'live',
                mode: 'caller',
                nakreport: true,
                tlpktdrop: true,
                ipttl: '64',
                iptos: '0xB8',
                oheadbw: '25'
              }
            }
          }
        }
      };

      console.log('Creando output SRT:', data);
      
      await agregarPuntoPublicacion(input.id, data);
      setIsSRTModalOpen(false);
      setSrtFormData({
        nombre: '',
        url: '',
        port: '',
        latency: '',
        streamId: '',
        passphrase: ''
      });
    } catch (error) {
      console.error('Error al crear output SRT:', error);
    }
  };

  const handleAddOutputClick = () => {
    setIsTypeModalOpen(true);
  };

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

  const handleEditarPunto = (outputId) => {
    const output = localOutputs.find(o => o.id === outputId);
    if (!output) return;

    if (output.address.toLowerCase().startsWith('srt://')) {
      // Parsear la URL SRT para obtener los valores
      try {
        const url = new URL(output.address);
        const params = new URLSearchParams(url.search);
        
        setSrtFormData({
          nombre: output.name,
          url: url.hostname,
          port: url.port,
          latency: params.get('latency') || '',
          streamId: params.get('streamid') || '',
          passphrase: params.get('passphrase') || ''
        });
        
        setEditingSRTOutput(output);
        setIsEditSRTModalOpen(true);
      } catch (error) {
        console.error('Error parsing SRT URL:', error);
      }
    } else {
      // Usar la función original para RTMP
      handleEditarPuntoRTMP(outputId);
    }
  };

  const handleSRTEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        nombre: srtFormData.nombre,
        settings: {
          address: `${srtFormData.url}:${srtFormData.port}`,
          params: {
            latency: srtFormData.latency,
            streamid: srtFormData.streamId || '',
            passphrase: srtFormData.passphrase || '',
            transtype: 'live'
          },
          protocol: 'srt://'
        },
        type: 'srt'
      };

      await updateSRTOutput(editingSRTOutput.id, data);

      setIsEditSRTModalOpen(false);
      setEditingSRTOutput(null);
      setSrtFormData({
        nombre: '',
        url: '',
        port: '',
        latency: '',
        streamId: '',
        passphrase: ''
      });
    } catch (error) {
      console.error('Error al editar output SRT:', error);
    }
  };

  const debugProcess = async () => {
    try {
      const response = await fetch('/api/process/debug');
      const data = await response.json();
      console.log('Estructura del proceso:', data);
      
      // Buscar específicamente los outputs SRT
      const srtOutputs = data.process.outputs.filter(output => 
        output.address.startsWith('srt://')
      );
      console.log('Outputs SRT:', srtOutputs);
    } catch (error) {
      console.error('Error al obtener debug:', error);
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
            onClick={handleAddOutputClick}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Agregar Punto de Publicación
          </button>
        </div>
      </div>

      {isTypeModalOpen && (
        <Modal onClose={() => setIsTypeModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Seleccionar tipo de output</h2>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setIsTypeModalOpen(false);
                openModal();
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              RTMP
            </button>
            <button
              onClick={() => {
                setIsTypeModalOpen(false);
                setIsSRTModalOpen(true);
              }}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
            >
              SRT
            </button>
          </div>
        </Modal>
      )}

      {isSRTModalOpen && (
        <Modal onClose={() => setIsSRTModalOpen(false)}>
          <h2 className="text-xl font-bold mb-4">AGREGAR SRT CALLER</h2>
          <form onSubmit={handleSRTSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400">Nombre *</label>
              <input
                type="text"
                required
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.nombre}
                onChange={(e) => setSrtFormData({...srtFormData, nombre: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">URL *</label>
              <input
                type="text"
                required
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.url}
                onChange={(e) => setSrtFormData({...srtFormData, url: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">Puerto *</label>
              <input
                type="number"
                required
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.port}
                onChange={(e) => setSrtFormData({...srtFormData, port: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">Latency *</label>
              <input
                type="number"
                required
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.latency}
                onChange={(e) => setSrtFormData({...srtFormData, latency: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">Stream ID (opcional)</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.streamId}
                onChange={(e) => setSrtFormData({...srtFormData, streamId: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">Passphrase (opcional)</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.passphrase}
                onChange={(e) => setSrtFormData({...srtFormData, passphrase: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSRTModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Agregar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isEditSRTModalOpen && (
        <Modal onClose={() => {
          setIsEditSRTModalOpen(false);
          setEditingSRTOutput(null);
        }}>
          <h2 className="text-xl font-bold mb-4">EDITAR SRT CALLER</h2>
          <form onSubmit={handleSRTEditSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400">Nombre *</label>
              <input
                type="text"
                required
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.nombre}
                onChange={(e) => setSrtFormData({...srtFormData, nombre: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">URL *</label>
              <input
                type="text"
                required
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.url}
                onChange={(e) => setSrtFormData({...srtFormData, url: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">Puerto *</label>
              <input
                type="number"
                required
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.port}
                onChange={(e) => setSrtFormData({...srtFormData, port: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">Latency *</label>
              <input
                type="number"
                required
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.latency}
                onChange={(e) => setSrtFormData({...srtFormData, latency: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">Stream ID (opcional)</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.streamId}
                onChange={(e) => setSrtFormData({...srtFormData, streamId: e.target.value})}
              />
            </div>
            <div>
              <label className="text-gray-400">Passphrase (opcional)</label>
              <input
                type="text"
                className="w-full p-2 mt-1 border rounded bg-gray-800 text-white"
                value={srtFormData.passphrase}
                onChange={(e) => setSrtFormData({...srtFormData, passphrase: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditSRTModalOpen(false);
                  setEditingSRTOutput(null);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}

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

      <button
        onClick={debugProcess}
        className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
      >
        Debug Process
      </button>
    </div>
  );
};

export default InputDetails;
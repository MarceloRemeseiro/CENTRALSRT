import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const useRTMPOutputs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createRTMPOutput = async (inputId, data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = `${API_BASE_URL}/api/process/${inputId}/outputs/rtmp`;
      const response = await axios.post(endpoint, {
        url: data.url,
        streamKey: data.streamKey,
        name: data.nombre,
        reference: inputId
      });

      return response.data;
    } catch (error) {
      console.error('Error completo:', error);
      setError(error.message || 'Error al crear output RTMP');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRTMPOutput = async (inputId, outputId, data) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Actualizando RTMP:', { inputId, outputId, data });
      
      const endpoint = `/api/process/${inputId}/outputs/${outputId}`;
      const response = await axios.put(endpoint, {
        url: data.url,
        streamKey: data.streamKey,
        nombre: data.nombre
      });

      console.log('Respuesta actualización:', response.data);
      
      // Asegurarnos de que devolvemos el output con el formato correcto
      return {
        id: outputId,
        name: data.nombre,
        address: data.url,
        streamKey: data.streamKey,
        state: response.data.updatedOutput.state,
        type: 'rtmp'
      };
    } catch (error) {
      console.error('Error al actualizar:', error);
      setError(error.message || 'Error al actualizar output RTMP');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRTMPOutput = async (inputId, outputId) => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = `/api/process/${inputId}/outputs/${outputId}`;
      await axios.delete(endpoint);
    } catch (error) {
      setError(error.message || 'Error al eliminar output RTMP');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRTMPOutput = async (inputId, outputId, currentState) => {
    setIsLoading(true);
    setError(null);

    try {
      const order = currentState === 'running' ? 'stop' : 'start';
      const endpoint = `/api/process/${inputId}/outputs/${outputId}/state`;
      const response = await axios.put(endpoint, { order });

      return response.data;
    } catch (error) {
      setError(error.message || 'Error al cambiar estado del output RTMP');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRTMPOutput,
    updateRTMPOutput,
    deleteRTMPOutput,
    toggleRTMPOutput,
    isLoading,
    error
  };
};

export default useRTMPOutputs; 
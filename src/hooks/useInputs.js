import { useState, useCallback } from 'react';

const useInputs = () => {
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInputs = useCallback(async () => {
    try {
      const response = await fetch("/api/process/inputs", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error al recuperar los inputs");
      }

      const data = await response.json();
      const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
      setInputs(sortedData || []);
    } catch (error) {
      console.error("Error al cargar los inputs:", error);
      setError("Error al cargar los inputs");
    } finally {
      setLoading(false);
    }
  }, []);

  const agregarPuntoPublicacion = async (inputId, data) => {
    try {
      const response = await fetch(
        `/api/process/${inputId}/outputs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to add publication point');
      }

      const result = await response.json();
      console.log('Resultado del backend:', result);

      setInputs(prevInputs =>
        prevInputs.map(input =>
          input.id === inputId
            ? {
                ...input,
                customOutputs: [
                  ...(input.customOutputs || []),
                  result
                ]
              }
            : input
        )
      );

      return result;
    } catch (error) {
      console.error('Error adding publication point:', error);
      throw error;
    }
  };

  const eliminarPuntoPublicacion = useCallback(async (inputId, outputId) => {
    try {
      const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
      const response = await fetch(`/api/process/${inputId}/outputs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outputId: correctedOutputId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInputs((prevInputs) =>
        prevInputs.map((input) =>
          input.id === inputId
            ? {
                ...input,
                customOutputs: input.customOutputs.filter(
                  (output) => output.id !== outputId
                ),
              }
            : input
        )
      );
      return data;
    } catch (error) {
      console.error('Error al eliminar el punto de publicación:', error);
      throw error;
    }
  }, []);

  const toggleOutputState = useCallback(async (outputId, newState) => {
    try {
      const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
      const response = await fetch(`/api/process/${correctedOutputId}/state`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newState }),
      });
      if (!response.ok) {
        throw new Error("Failed to toggle output state");
      }
      const updatedOutput = await response.json();
      setInputs((prevInputs) =>
        prevInputs.map((input) => ({
          ...input,
          customOutputs: input.customOutputs?.map((output) =>
            output.id === outputId
              ? { ...output, state: updatedOutput.state }
              : output
          ),
        }))
      );
      return updatedOutput;
    } catch (error) {
      console.error('Error al cambiar el estado del output:', error);
      throw error;
    }
  }, []);

  const updateInputMetadata = useCallback(async (inputId, { name, description }) => {
    try {
      const response = await fetch(`/api/process/${inputId}/metadata`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to update input metadata');
      }

      const data = await response.json();

      setInputs(prevInputs =>
        prevInputs.map(input =>
          input.id === inputId
            ? {
                ...input,
                name,
                description,
                metadata: {
                  ...input.metadata,
                  'restreamer-ui': {
                    ...input.metadata?.['restreamer-ui'],
                    meta: {
                      ...input.metadata?.['restreamer-ui']?.meta,
                      name,
                      description
                    }
                  }
                }
              }
            : input
        )
      );

      return data;
    } catch (error) {
      console.error('Error updating input metadata:', error);
      throw error;
    }
  }, []);

  const editarPuntoPublicacion = async (inputId, outputId, data) => {
    try {
      console.log('Enviando datos al backend:', {
        inputId,
        outputId,
        data
      });

      const response = await fetch(`/api/process/${inputId}/outputs/${outputId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        throw new Error(errorData.message || 'Error al editar el punto de publicación');
      }

      const updatedOutput = await response.json();
      return updatedOutput;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  return { 
    inputs, 
    loading, 
    error, 
    fetchInputs, 
    agregarPuntoPublicacion, 
    eliminarPuntoPublicacion, 
    toggleOutputState,
    updateInputMetadata,
    editarPuntoPublicacion
  };
};

export default useInputs;
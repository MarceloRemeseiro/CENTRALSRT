import { useState, useEffect, useCallback, useRef } from 'react';

export const useInputLogic = (input, agregarPuntoPublicacion, eliminarPuntoPublicacion, toggleOutputState, editarPuntoPublicacion) => {
  const [localInput, setLocalInput] = useState(input);
  const [localOutputs, setLocalOutputs] = useState(input.customOutputs || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [videoRefreshTrigger, setVideoRefreshTrigger] = useState(0);
  const [newOutput, setNewOutput] = useState({ nombre: '', url: '', streamKey: '' });
  const [editingOutput, setEditingOutput] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const refreshTimeoutRef = useRef(null);

  const fetchInputStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/process/${input.id}/state`);
      const data = await response.json();
      setLocalInput((prevInput) => {
        if (prevInput.state !== data.state) {
          if (data.state === 'running') {
            if (refreshTimeoutRef.current) {
              clearTimeout(refreshTimeoutRef.current);
            }
            refreshTimeoutRef.current = setTimeout(() => {
              setVideoRefreshTrigger(prev => prev + 1);
            }, 3000);
          }
          return { ...prevInput, ...data };
        }
        return prevInput;
      });
    } catch (error) {
      console.error('Error fetching input status:', error);
    }
  }, [input.id]);

  useEffect(() => {
    fetchInputStatus();
    const intervalId = setInterval(fetchInputStatus, 5000);
    return () => {
      clearInterval(intervalId);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchInputStatus]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setNewOutput({ nombre: '', url: '', streamKey: '' });
  };

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingOutput(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingOutput) {
      setEditingOutput(prev => ({ ...prev, [name]: value }));
    } else {
      setNewOutput(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newOutput.nombre && newOutput.url) {
      try {
        console.log('Enviando datos para crear nuevo output:', newOutput);
        const createdOutput = await agregarPuntoPublicacion(input.id, newOutput);
        console.log('Respuesta del servidor al crear output:', createdOutput);

        // Asegúrate de que el ID del nuevo output es correcto
        const newOutputId = createdOutput.id.replace(/^restreamer-ui:egress:rtmp:restreamer-ui:egress:rtmp:/, 'restreamer-ui:egress:rtmp:');

        // Actualizar los datos locales con la información correcta del servidor
        setLocalOutputs(prevOutputs => [...prevOutputs, {
          id: newOutputId,
          name: createdOutput.name,
          address: createdOutput.address,
          key: createdOutput.key,
          state: createdOutput.state
        }]);
        
        closeModal();
        setNewOutput({ nombre: '', url: '', streamKey: '' });
      } catch (error) {
        console.error('Error al crear el punto de publicación:', error);
        alert('Error al crear el punto de publicación. Por favor, inténtelo de nuevo.');
      }
    } else {
      alert('Por favor, complete al menos el nombre y la URL.');
    }
  };

  const handleEliminarPunto = (outputId) => {
    setConfirmationModal({
      isOpen: true,
      message: '¿Seguro quieres eliminar este Punto de publicación?',
      onConfirm: () => performEliminarPunto(outputId),
    });
  };

  const performEliminarPunto = async (outputId) => {
    const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
    console.log('ID corregido para eliminar:', correctedOutputId);

    try {
      await eliminarPuntoPublicacion(input.id, correctedOutputId);
      setLocalOutputs(prevOutputs => prevOutputs.filter(output => output.id !== outputId));
    } catch (error) {
      console.error('Error al eliminar el punto de publicación:', error);
      alert('Error al eliminar el punto de publicación. Por favor, inténtelo de nuevo.');
    }
  };

  const handleToggle = async (outputId, currentState, index) => {
    if (currentState === 'running') {
      setConfirmationModal({
        isOpen: true,
        message: '¿Seguro quieres apagar el Punto de publicación?',
        onConfirm: () => performToggle(outputId, currentState, index),
      });
    } else {
      performToggle(outputId, currentState, index);
    }
  };

  const performToggle = async (outputId, currentState, index) => {
    const newState = currentState === 'running' ? 'stop' : 'start';

    try {
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index
            ? { ...output, isTogglingOn: newState === 'start' }
            : output
        )
      );

      const correctedOutputId = outputId.replace(/^(restreamer-ui:egress:rtmp:)(?:restreamer-ui:egress:rtmp:)?/, '$1');
      console.log('ID corregido:', correctedOutputId);

      const updatedOutput = await toggleOutputState(correctedOutputId, newState);

      console.log('Estado actualizado recibido:', updatedOutput.state);

      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index
            ? { ...output, state: updatedOutput.state, isTogglingOn: undefined }
            : output
        )
      );

      setTimeout(async () => {
        const refreshedState = await fetchOutputState(correctedOutputId);
        setLocalOutputs((prevOutputs) =>
          prevOutputs.map((output, i) =>
            i === index
              ? { ...output, state: refreshedState }
              : output
          )
        );
      }, 2000);

    } catch (error) {
      console.error('Error al cambiar el estado del output:', error);
      setLocalOutputs((prevOutputs) =>
        prevOutputs.map((output, i) =>
          i === index ? { ...output, isTogglingOn: undefined } : output
        )
      );
    }
  };

  const fetchOutputState = async (outputId) => {
    try {
      const response = await fetch(`/api/process/${outputId}/state`);
      const data = await response.json();
      return data.state;
    } catch (error) {
      console.error('Error al obtener el estado del output:', error);
      return 'unknown';
    }
  };

  const handleEditarPunto = (outputId) => {
    console.log("Editando output con ID:", outputId);
    // Corregir el ID si es necesario
    const correctedOutputId = outputId.replace(/^restreamer-ui:egress:rtmp:restreamer-ui:egress:rtmp:/, 'restreamer-ui:egress:rtmp:');
    const output = localOutputs.find(o => o.id === correctedOutputId);
    console.log("Output encontrado para editar:", output);
    
    if (output) {
      const editingOutputData = {
        id: correctedOutputId,
        nombre: output.name,
        url: output.address,
        streamKey: output.key
      };
      console.log("Datos de edición preparados:", editingOutputData);
      setEditingOutput(editingOutputData);
      openEditModal();
    } else {
      console.error("No se encontró el output con id:", correctedOutputId);
    }
  };

  const handleUpdateOutput = async (e) => {
    e.preventDefault();
    if (editingOutput && editingOutput.nombre && editingOutput.url) {
      try {
        console.log('Enviando actualización para:', editingOutput);
        
        // El ID ya debería estar corregido, pero por si acaso:
        const correctOutputId = editingOutput.id.replace(/^restreamer-ui:egress:rtmp:restreamer-ui:egress:rtmp:/, 'restreamer-ui:egress:rtmp:');
        
        const response = await fetch(`/api/process/${input.id}/outputs/${correctOutputId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: editingOutput.nombre,
            url: editingOutput.url,
            streamKey: editingOutput.streamKey,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        console.log('Respuesta del servidor (texto):', responseText);

        let updatedOutput;
        try {
          updatedOutput = JSON.parse(responseText);
        } catch (error) {
          console.error('Error al parsear la respuesta JSON:', error);
          throw new Error('La respuesta del servidor no es JSON válido');
        }

        console.log('Respuesta del servidor (JSON):', updatedOutput);

        setLocalOutputs(prevOutputs => prevOutputs.map(output => 
          output.id === updatedOutput.updatedOutput.id ? updatedOutput.updatedOutput : output
        ));
        closeEditModal();
      } catch (error) {
        console.error('Error detallado al editar el punto de publicación:', error);
        alert(`Error al editar el punto de publicación: ${error.message}`);
      }
    } else {
      alert('Por favor, complete al menos el nombre y la URL.');
    }
  };

  return {
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
  };
};

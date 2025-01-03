import React from 'react';
import Modal from '@/components/Modal';
import RTMPForm from './RTMPForm';

const RTMPModal = ({
  isOpen,
  onClose,
  onSubmit,
  data,
  onChange,
  isEditing = false,
  reference
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e, formData) => {
    const completeData = {
      ...formData,
      reference
    };
    onSubmit(e, completeData);
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">{isEditing ? 'Editar RTMP' : 'Nuevo RTMP'}</h2>
      <RTMPForm
        data={data}
        onChange={onChange}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isEditing={isEditing}
      />
    </Modal>
  );
};

export default RTMPModal; 
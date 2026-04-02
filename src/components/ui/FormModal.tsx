import React from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';
import AnimatedButton from './AnimatedButton';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  isLoading = false,
  size = 'md',
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size={size}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={handleSubmit}>
        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 mb-6"
        >
          {children}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 pt-4 border-t border-navy-200 dark:border-navy-700"
        >
          <AnimatedButton
            type="button"
            variant="outline"
            onClick={onClose}
            fullWidth
            disabled={isLoading}
          >
            {cancelText}
          </AnimatedButton>
          <AnimatedButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            {submitText}
          </AnimatedButton>
        </motion.div>
      </form>
    </Modal>
  );
};

export default FormModal;

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className={`
                bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10
                rounded-t-3xl sm:rounded-3xl shadow-2xl w-full ${sizeClasses[size]}
                pointer-events-auto max-h-[92vh] overflow-hidden flex flex-col
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-white/20" />
              </div>

              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="p-2 -mr-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                  >
                    <IoClose className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-6 pb-6 pt-4">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

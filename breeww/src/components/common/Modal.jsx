import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, showClose = true }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-[calc(100%-2rem)] max-w-md bg-casino-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">{title}</h3>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;

"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./ModalMessage.scss";

interface ModalMessageProps {
  message: string;
  open: boolean;
  isModalOpen: boolean;
}

const ModalMessage: React.FC<ModalMessageProps> = ({ message, open }) => {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          key="modal-message"
          initial={{
            opacity: 0,
            scale: 0.8,
            y: -100,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            y: -100,
            transition: { duration: 0.3 },
          }}
        >
          <div className="modalmessage">
            <div className="modalmessage-inner">
              <p className="modalmessage-message">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalMessage;

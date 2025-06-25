"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ModalMessage.scss";

interface ModalMessageProps {
  message: string;
  open: boolean;
}

const ModalMessage: React.FC<ModalMessageProps> = ({ message, open }) => {
  return (
    <AnimatePresence>
      {open && message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: [0.25, 0.8, 0.5, 1] }}
          className="w-[100vw] modalmessage h-[100vh] fixed top-0 left-0 flex justify-center items-center bg-[rgba(0,0,0,.95)] z-100 p-4"
        >
          <div className="modalmessage-inner">
            <h3 className="modalmessage-message">{message}</h3>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalMessage;

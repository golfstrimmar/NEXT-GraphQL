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
          initial={{
            opacity: 0,
            scale: 0.8,
            y: -100,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -100 }}
          transition={{ duration: 0.3 }}
<<<<<<< HEAD
          className=" modalmessage  fixed top-0 left-1/2  -translate-x-1/2 flex justify-center  items-center bg-[rgba(39,83,141,0.95)] z-100 p-1 rounded-lg "
=======
          className=" modalmessage  fixed top-0 left-1/2  -translate-x-1/2 flex justify-center  items-center bg-[rgba(209,227,250,0.95)] z-2100 p-1 rounded-lg "
>>>>>>> simple
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

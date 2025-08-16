"use client";
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
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
          className=" modalmessage  fixed top-0 left-1/2  -translate-x-1/2 flex justify-center  items-center bg-[rgba(209,227,250,0.95)] z-2100 p-1 rounded-lg "
        >
          <div className="modalmessage-inner">
            <p className="modalmessage-message">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalMessage;

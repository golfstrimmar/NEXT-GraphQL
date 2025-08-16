"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "@/components/ModalMessage/ModalMessage.scss";
import Input from "@/components/ui/Input/Input";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
interface ModalMessageProps {
  message: string;
  open: boolean;
}

const ModalProject: React.FC<ModalMessageProps> = ({
  open,
  setOpenModalProject,
}) => {
  const [projectName, setProjectName] = useState<string>("");
  const {
    user,
    htmlJson,
    setHtmlJson,
    nodeToAdd,
    setNodeToAdd,
    setModalMessage,
    transformTo,
    setTransformTo,
    resHtml,
    setResHtml,
    resScss,
    setResScss,
  } = useStateContext();
  const handelSubmit = (e, projectName) => {
    e.preventDefault();
    console.log("<=====htmlJson====>", htmlJson);
    if (!projectName) return;
    const newJson = htmlJson.slice(0, -1);
    console.log("<====newJson====>", newJson);
    // setOpenModalProject(false);
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.8,
            y: -100,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -100 }}
          transition={{ duration: 0.3 }}
          className=" modalmessage   fixed top-0 left-0  flex justify-center  items-center bg-[rgba(0,0,0,0.95)] z-210  rounded-lg w-[100vw] h-[100vh]"
          onClick={(e) => {
            e.stopPropagation();
            if (!e.target.closest(".modalmessage-inner")) {
              setOpenModalProject(false);
            }
          }}
        >
          <button className="absolute block top-4 right-8 bg-white! rounded-full z-2140! p-2">
            <Image
              src="./svg/cross-com.svg"
              alt="close"
              width={20}
              height={20}
            />
          </button>
          <form
            className="modalmessage-inner p-4! relative  z-2110"
            onSubmit={(e) => handelSubmit(e, projectName)}
          >
            <Input
              typeInput="text"
              data="Project name"
              name="projectname"
              value={projectName}
              onChange={(e) => {
                e.preventDefault();
                setProjectName(e.target.value);
              }}
            />
            <button type="submit" className="btn btn-empty px-2 mt-2">
              Save
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalProject;

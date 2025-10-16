"use client";
import React, { useState, useEffect } from "react";
import "./modalcreatefigmaproject.scss";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Input from "@/components/ui/Input/Input";
import { useStateContext } from "@/providers/StateProvider";
import { CREATE_FIGMA_PROJECT } from "@/apollo/mutations";
import { useMutation } from "@apollo/client";
import Loading from "@/components/ui/Loading/Loading";
import FProject from "@/types/FProject";
interface ModalCreateFigmaProjectProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setProjects: React.Dispatch<React.SetStateAction<FProject[] | null>>;
}

const ModalCreateFigmaProject: React.FC<ModalCreateFigmaProjectProps> = ({
  modalOpen,
  setModalOpen,
  setProjects,
}) => {
  const { user } = useStateContext();
  const { setModalMessage } = useStateContext();
  const [name, setName] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [token, setToken] = useState("");
  const [FigmaLink, setFigmaLink] = useState<string>("");
  const [createFigmaProject, { loading }] = useMutation(CREATE_FIGMA_PROJECT);
  const fillForm = (link: string) => {
    if (!link) return;

    // Определяет fileKey как первый сегмент после домена — протокол://домен/<fileKey>/
    const fileKeyMatch = link.match(/figma\.com\/[^/]+\/([^/?]+)/);
    const tfileKey = fileKeyMatch ? fileKeyMatch[1] : null;

    // node-id ищем как параметр, заменяем все дефисы на двоеточия
    const nodeIdMatch = link.match(/node-id=([\w-]+)/);
    const tnodeId = nodeIdMatch ? nodeIdMatch[1].replace(/-/g, ":") : null;

    setFileKey(tfileKey);
    setNodeId(tnodeId);
  };

  useEffect(() => {
    if (FigmaLink) {
      fillForm(FigmaLink);
    }
  }, [FigmaLink]);

  // -----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name === "" || fileKey === "" || nodeId === "" || token === "") {
      setModalMessage("All fields are required.");
      return;
    }
    console.log("<========>", user.id, name, fileKey, nodeId, token);
    try {
      const { data } = await createFigmaProject({
        variables: { ownerId: user.id, name, fileKey, nodeId, token },
      });

      if (data.createFigmaProject) {
        console.log(
          "<========> Created figma project: <========>",
          data.createFigmaProject
        );
        setProjects((prev) => {
          // проверка, чтобы не было дубликатов
          if (!prev.find((p) => p.id === data.createFigmaProject)) {
            return [...prev, data.createFigmaProject];
          }
          return prev;
        });
        setModalOpen(false);
        setName("");
        setFileKey("");
        setNodeId("");
        setToken("");
      }
    } catch (err: any) {
      setModalOpen(false);
      setModalMessage(err.message);
    }
  };

  return (
    <AnimatePresence>
      {modalOpen && (
        <div onClick={() => setModalOpen(false)}>
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              y: -100,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -100 }}
            transition={{ duration: 0.3 }}
            className=" w-[100vw] h-[100vh] fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
            onClick={(e) => {
              e.stopPropagation();
              if (
                !e.target.closest(".modal-content") &&
                !e.target.classList.contains("modal-content")
              ) {
                setModalOpen(false);
              }
            }}
          >
            <button className="absolute top-[65px] right-2 z-3000">
              <Image
                src="./svg/cross.svg"
                alt="close"
                width={20}
                height={20}
                onClick={() => setModalOpen(false)}
              />
            </button>
            <form
              onSubmit={handleSubmit}
              className="modal-content flex flex-col min-w-[500px] bg-white p-6 rounded-lg gap-4"
            >
              <Input
                typeInput="text"
                id="name"
                data="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                typeInput="text"
                id="FigmaLink"
                data="Figma Link"
                value={FigmaLink}
                onChange={(e) => setFigmaLink(e.target.value)}
              />
              {/* <Input
                  typeInput="text"
                  id="name"
                  data="File Key"
                  value={fileKey}
                  onChange={(e) => setFileKey(e.target.value)}
                />

                <Input
                  typeInput="text"
                  id="name"
                  data="Node ID"
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                /> */}

              <Input
                typeInput="text"
                id="name"
                data="Figma Token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />

              <div className="flex gap-2">
                <button
                  className="btn btn-primary "
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-allert"
                  type="button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModalCreateFigmaProject;

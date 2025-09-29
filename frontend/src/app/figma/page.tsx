"use client";

import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  CREATE_FIGMA_PROJECT,
  REMOVE_FIGMA_PROJECT,
  FIGMA_PROJECT_CREATED_SUBSCRIPTION,
} from "@/apollo/mutations";
import {
  GET_FIGMA_PROJECTS_BY_USER,
  GET_FIGMA_PROJECT_DATA,
} from "@/apollo/queries";
import client from "@/apollo/apolloClient";
import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/Loading/Loading";
import Input from "@/components/ui/Input/Input";
import { AnimatePresence, motion } from "framer-motion";
import "./figma.scss";
import { set } from "lodash";

export default function FigmaPage() {
  const { user } = useStateContext();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const { setModalMessage } = useStateContext();
  const [name, setName] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [token, setToken] = useState("");
  const [loadingImg, setLoadingImg] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { data } = useQuery(GET_FIGMA_PROJECTS_BY_USER, {
    variables: { userId: user?.id },
    skip: !user,
    fetchPolicy: "cache-and-network",
  });
  useSubscription(FIGMA_PROJECT_CREATED_SUBSCRIPTION, {
    onData: ({ data }) => {
      if (!data.data) return;

      const newProject = data.data.figmaProjectCreated;
      console.log("New Figma project via subscription:", newProject);

      setProjects((prev) => {
        // проверка, чтобы не было дубликатов
        if (!prev.find((p) => p.id === newProject.id)) {
          return [...prev, newProject];
        }
        return prev;
      });
    },
  });

  const [createFigmaProject, { loading }] = useMutation(CREATE_FIGMA_PROJECT);
  const [removeFigmaProject] = useMutation(REMOVE_FIGMA_PROJECT);
  useEffect(() => {
    if (data?.figmaProjectsByUser) {
      setProjects(data.figmaProjectsByUser);
    }
  }, [data]);
  const handleSubmit = async (e: React.FormEvent) => {
    router.push("/login");
    console.log(
      "<====name, fileKey, nodeId, token====>",
      name,
      fileKey,
      nodeId,
      token
    );
    e.preventDefault();

    if (name === "" || fileKey === "" || nodeId === "" || token === "") {
      setModalMessage("All fields are required.");
      return;
    }
    try {
      setModalMessage(null);
      const { data } = await createFigmaProject({
        variables: { ownerId: user.id, name, fileKey, nodeId, token },
      });

      console.log("Created figma project:", data.createFigmaProject);

      // Запрос картинки из Figma API
      const res = await fetch(
        `https://api.figma.com/v1/images/${fileKey}?ids=${nodeId}&format=png`,
        {
          headers: { "X-Figma-Token": token },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch image from Figma API.");
      }

      const json = await res.json();
      console.log("Figma API response:", json);

      const url = json.images?.[nodeId];
      if (!url) {
        throw new Error("No image URL found in Figma API response.");
      }

      setImageUrl(url);

      setModalOpen(false);
      setName("");
      setFileKey("");
      setNodeId("");
      setToken("");
    } catch (err: any) {
      setModalMessage(err.message);
    }
  };
  const fetchFigmaImage = async (project: any) => {
    if (!project?.id) return;

    try {
      setLoadingImg(true);
      setModalMessage(null);

      // GraphQL-запрос к серверу за полными данными проекта
      const { data } = await client.query({
        query: GET_FIGMA_PROJECT_DATA,
        variables: { projectId: project.id },
        fetchPolicy: "network-only",
      });

      const projectData = data.getFigmaProjectData;

      if (!projectData?.images) throw new Error("Images not found");

      // Берём URL изображения по nodeId
      const url = projectData.images[project.nodeId];
      if (!url) throw new Error("Image URL not found");

      setImageUrl(url);
    } catch (err: any) {
      setModalMessage(err.message);
    } finally {
      setLoadingImg(false);
    }
  };
  const handleRemoved = async (id) => {
    const removedProject = await removeFigmaProject({
      variables: { figmaProjectId: id },
    });
    setProjects((prev) => {
      return prev.filter((p) => p.id !== id);
    });
    console.log("<====removedProject====>", removedProject);
  };
  return (
    <div className="figma">
      <div className="container">
        <div className="figma-projects">
          <h1 className="text-center mb-4">Figma projects</h1>

          {projects.length === 0 && <p>No projects found</p>}
          <ul className="flex flex-col gap-2">
            {projects.map((proj) => (
              <li key={proj.id} className="bg-[#f3f3f3] p-2">
                <div className="flex gap-2 items-center">
                  <p>Project name:</p>
                  <h3>{proj.name}</h3>
                  {/* <Image
                    src="./svg/click.svg"
                    alt="figma"
                    width={15}
                    height={15}
                    className="opacity-30 "
                  /> */}
                </div>
                <p>File Key: {proj.fileKey}</p>
                <p>Node ID: {proj.nodeId}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    className="btn btn-primary"
                    onClick={() => fetchFigmaImage(proj)}
                  >
                    See details
                  </button>
                  <button
                    className="btn btn-allert"
                    onClick={() => handleRemoved(proj.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="inline-block mt-2">
            {!modalOpen && (
              <Button
                onClick={() => {
                  if (!user) {
                    setModalMessage(
                      "You must be logged in to create a project."
                    );
                    setTimeout(() => {
                      router.push("/login");
                      return;
                    }, 2000);
                  } else {
                    setModalOpen(true);
                  }
                }}
                buttonText="Create project Figma"
              />
            )}
          </div>
        </div>

        {loadingImg && <Loading />}

        {imageUrl && (
          <div className="p-1  mt-4 mb-4">
            <div className="flex gap-2 items-center">
              <h2>Figma project Preview</h2>
              <button
                className="btn btn-allert cursor-pointer"
                onClick={() => setImageUrl("")}
              >
                Clear
              </button>
            </div>
            <img
              src={imageUrl}
              alt="Figma Preview"
              className="border mt-2 rounded-sm shadow-[0_0_10px_0_rgba(0,0,0,0.4)]"
            />
          </div>
        )}
      </div>
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
                />

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
    </div>
  );
}

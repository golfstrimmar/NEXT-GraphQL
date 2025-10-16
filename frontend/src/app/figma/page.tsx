"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { REMOVE_FIGMA_PROJECT } from "@/apollo/mutations";
import {
  GET_FIGMA_PROJECTS_BY_USER,
  GET_COLOR_VARIABLES_BY_FILE_KEY,
} from "@/apollo/queries";
import Button from "@/components/ui/Button/Button";
import ModalCreateFigmaProject from "@/components/ModalCreateFigmaProject/ModalCreateFigmaProject";
import "./figma.scss";
import Loading from "@/components/ui/Loading/Loading";
import FProject from "@/types/FProject";
// -------
export default function FigmaPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  // ---
  const [projects, setProjects] = useState<FProject[]>([]);
  const { user, setModalMessage } = useStateContext();

  const { data, loading } = useQuery(GET_FIGMA_PROJECTS_BY_USER, {
    variables: { userId: user?.id },
    skip: !user,
    fetchPolicy: "cache-and-network",
  });

  // ----------
  const [removeFigmaProject] = useMutation(REMOVE_FIGMA_PROJECT);
  // -----------------------
  useEffect(() => {
    if (data?.figmaProjectsByUser) {
      setProjects(data.figmaProjectsByUser);
    }
  }, [data]);

  useEffect(() => {
    if (projects.length > 0) {
      console.log("<====projects====>", projects);
    }
  }, [projects]);

  // -----------генерация цветовых переменных для фонов------------
  const generateFonVar = (fileKey: string) => {
    let hash = 0;
    for (let i = 0; i < fileKey.length; i++) {
      hash = fileKey.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = 170 + (Math.abs(hash) % 60); // синие оттенки
    const saturation = 40; // немного сочнее
    const lightness = 85; // мягкий светлый фон

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // =======================
  const handleRemoved = async (id: number) => {
    try {
      const removedProject = await removeFigmaProject({
        variables: { figmaProjectId: id },
        refetchQueries: [
          {
            query: GET_FIGMA_PROJECTS_BY_USER, // чтобы обновить список проектов
          },
          {
            query: GET_COLOR_VARIABLES_BY_FILE_KEY, // можно тоже обновить цвета
          },
        ],
      });

      setProjects((prev) => prev.filter((p) => p.id !== id));
      setModalMessage("Project removed");
      console.log("<====removedProject====>", removedProject);
    } catch (err) {
      console.error(err);
      setModalMessage("Error removing project");
    }
  };

  // =======================
  https: return (
    <div className="figma">
      <div className="container">
        {loading && <Loading />}
        <h2 className="text-center mb-4">Figma projects</h2>
        {/* 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹 */}
        <div className="figma-projects">
          {projects.length === 0 && <p>No projects found. </p>}
          <ul className="grid grid-cols-[repeat(auto-fit,_minmax(500px,_1fr))] gap-2">
            {projects.map((proj: FProject) => (
              <li
                key={proj.id}
                className="relative rounded-xl shadow-lg overflow-hidden flex flex-col justify-between"
                style={{
                  backgroundColor: generateFonVar(proj.fileKey),
                }}
              >
                {/* Верхняя часть: информация и превью */}
                <div className="p-4 flex flex-col gap-4">
                  {/* Информация */}
                  <div className="flex flex-col gap-2 text-gray-900">
                    <h3 className="text-2xl font-bold truncate">{proj.name}</h3>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">ID:</span> {proj.id}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">File Key:</span>{" "}
                      {proj.fileKey}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Node ID:</span>{" "}
                      {proj.nodeId}
                    </p>
                  </div>

                  {/* Превью — большой блок */}
                  {proj.previewUrl && (
                    <div className="w-full max-h-[400px] overflow-hidden rounded-md shadow-inner">
                      <img
                        src={proj.previewUrl}
                        alt="Figma Preview"
                        className="object-contain w-full h-full"
                      />
                    </div>
                  )}
                </div>

                {/* Нижняя часть: кнопки */}
                <div className="p-4 flex justify-end gap-2 border-t border-gray-200 bg-white/50 backdrop-blur-sm mt-auto">
                  <Link
                    href={`/figma/${proj.id}`}
                    className="btn btn-primary hover:bg-blue-600 transition-colors duration-200"
                  >
                    See details
                  </Link>

                  <button
                    className="btn btn-allert hover:bg-red-600 transition-colors duration-200"
                    onClick={() => handleRemoved(proj.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {/* 🔹🔹🔹🔹🔹🔹🔹  create project 🔹🔹🔹🔹🔹🔹🔹🔹🔹  */}
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
      </div>
      {/* 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹 */}
      <ModalCreateFigmaProject
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        setProjects={setProjects}
      />
    </div>
  );
}

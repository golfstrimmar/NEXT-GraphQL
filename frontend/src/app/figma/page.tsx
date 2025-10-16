"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { REMOVE_FIGMA_PROJECT } from "@/apollo/mutations";
import { GET_FIGMA_PROJECTS_BY_USER } from "@/apollo/queries";
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
    const removedProject = await removeFigmaProject({
      variables: { figmaProjectId: id },
    });
    setProjects((prev) => {
      return prev.filter((p) => p.id !== id);
    });
    setModalMessage("Project removed");
    console.log("<====removedProject====>", removedProject);
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
                style={{ backgroundColor: generateFonVar(proj.fileKey) }}
                className={` p-2 flex flex-col gap-2`}
              >
                <div className=" grid grid-cols-[max-content_1fr] gap-4">
                  <div className="flex flex-col gap-1 ">
                    <p>
                      Project id: <strong>{proj.id}</strong>
                    </p>{" "}
                    <p>
                      Project name: <strong>{proj.name}</strong>
                    </p>
                    <p>File Key: {proj.fileKey}</p>
                    <p>Node ID: {proj.nodeId}</p>
                  </div>
                  {proj.previewUrl && (
                    <div className="max-h-[300px] overflow-y-auto">
                      <img
                        src={proj.previewUrl}
                        alt="Figma Preview"
                        className="border   rounded-sm shadow-[0_0_10px_0_rgba(0,0,0,0.4)]"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 max-h-[26px] mt-auto">
                  <Link href={`/figma/${proj.id}`} className="btn btn-primary ">
                    See details
                  </Link>

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

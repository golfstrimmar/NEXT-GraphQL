"use client";

import React, { useState, useEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
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
import "./figma.scss";

export default function FigmaPage() {
  const { user } = useStateContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [token, setToken] = useState("");
  const [loadingImg, setLoadingImg] = useState(false);
  // для отображения результата
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a project.");
      return;
    }

    try {
      setError(null);
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
      setError(err.message);
    }
  };
  const fetchFigmaImage = async (project: any) => {
    if (!project?.id) return;

    try {
      setLoadingImg(true);
      setError(null);

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
      setError(err.message);
    } finally {
      setLoadingImg(false);
    }
  };
  const handleRemoved = async (id) => {
    const removedProject = await removeFigmaProject({
      variables: { figmaProjectId: id },
    });
    console.log("<====removedProject====>", removedProject);
  };
  return (
    <div className="figma">
      <div className="container">
        <div className="figma-projects">
          <h1>Figma projects</h1>
          <div className="inline-block">
            {!modalOpen && (
              <Button
                onClick={() => setModalOpen(true)}
                buttonText="Create project Figma"
              />
            )}
          </div>

          {modalOpen && (
            <div onClick={() => setModalOpen(false)}>
              <div onClick={(e) => e.stopPropagation()}>
                <h2>Creating Figma project</h2>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="File Key"
                    value={fileKey}
                    onChange={(e) => setFileKey(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Node ID"
                    value={nodeId}
                    onChange={(e) => setNodeId(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Figma Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />

                  {error && <p className="error">{error}</p>}

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
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {projects.length === 0 && <p>No projects found</p>}
          <ul>
            {projects.map((proj) => (
              <li key={proj.id} className="project-card">
                <div className="flex gap-2 items-center">
                  <p>Project name:</p>
                  <h3
                    className="cursor-pointer"
                    onClick={() => fetchFigmaImage(proj)}
                  >
                    {proj.name}
                  </h3>
                  <Image
                    src="./svg/click.svg"
                    alt="figma"
                    width={15}
                    height={15}
                    className="opacity-30 "
                  />
                </div>
                <p>File Key: {proj.fileKey}</p>
                <p>Node ID: {proj.nodeId}</p>
                <div className="flex gap-2">
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
        </div>

        {loadingImg && <Loading />}
        {imageUrl && (
          <div className="preview">
            <h2>Figma project Preview:</h2>
            <img src={imageUrl} alt="Figma Preview" />
          </div>
        )}
      </div>
    </div>
  );
}
// https://www.figma.com/design/wd09PaQQG0CuUfeHxSCccC/dreambit--Copy-?node-id=986-1860&t=B6WLVmoD0b7nCrIL-4

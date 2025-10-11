"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_FIGMA_PROJECT } from "@/apollo/queries";

const ProjectPage = () => {
  const params = useParams();
  const id = params?.id; // id из маршрута

  const [project, setProject] = useState<any>(null);

  const { data, loading, error } = useQuery(GET_FIGMA_PROJECT, {
    variables: { id },
    skip: !id,
  });

  useEffect(() => {
    if (data?.figmaProject) {
      setProject(data.figmaProject);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p>File Key: {project.fileKey}</p>
      <p>Node ID: {project.nodeId}</p>
      <p>Owner: {project.owner.name}</p>

      {/* Пример кнопки, состояния и другого интерактивного UI */}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => alert(`Нажата кнопка для проекта ${project.name}`)}
      >
        Кнопка действия
      </button>
    </div>
  );
};

export default ProjectPage;

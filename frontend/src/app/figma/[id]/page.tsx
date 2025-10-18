"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
import ColorsFromFigma from "@/components/ColorsFromFigma/ColorsFromFigma";
import ExtractImages from "@/components/ExtractImages/ExtractImages";
import {
  GET_FIGMA_PROJECT_DATA,
  GET_COLOR_VARIABLES_BY_FILE_KEY,
  GET_FIGMA_PROJECTS_BY_USER,
} from "@/apollo/queries";
import { REMOVE_FIGMA_PROJECT } from "@/apollo/mutations";
import Loading from "@/components/ui/Loading/Loading";

const ProjectPage = () => {
  const params = useParams();
  const id = params?.id;
  const { setModalMessage } = useStateContext();
  const router = useRouter();
  const [removeFigmaProject] = useMutation(REMOVE_FIGMA_PROJECT);
  // 🟢🟢🟢🟢🟢🟢🟢🟢  Queries
  const { data, loading, error } = useQuery(GET_FIGMA_PROJECT_DATA, {
    variables: { projectId: id },
    skip: !id,
  });

  //🟢🟢🟢🟢🟢🟢🟢 Состояния
  const [project, setProject] = useState<any>(null);

  //🟢🟢🟢🟢🟢🟢🟢 Обновление состояния при получении данных
  useEffect(() => {
    console.log("<====data====>", data);
    if (data?.getFigmaProjectData) {
      console.log(
        "<===data?.getFigmaProjectData====>",
        data?.getFigmaProjectData
      );
      setProject(data.getFigmaProjectData);
    }
  }, [data]);

  //🟢🟢🟢🟢🟢🟢🟢 Логирование для отладки
  useEffect(() => {
    if (project) console.log("<=====📦 project =====>", project);
  }, [project]);

  //🟢🟢🟢🟢🟢🟢🟢 Удаление проекта
  const handleRemoved = async (id) => {
    try {
      await removeFigmaProject({
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

      setModalMessage("Project removed");
      // setImages([]);
      // setSvgImages([]);
      setTimeout(() => {
        router.push("/figma");
      }, 2000);
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };

  return (
    <div className="p-4 mt-[60px] mb-8">
      {loading && <Loading />}
      <div className="border rounded-lg p-4 bg-white shadow-md max-w-md">
        {/* Заголовок проекта */}
        <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
          {project?.name}
        </h2>

        {/* Основная информация */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-semibold text-gray-700">ID:</span>{" "}
            {project?.id}
          </p>
          <p>
            <span className="font-semibold text-gray-700">File Key:</span>{" "}
            {project?.fileKey}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Node ID:</span>{" "}
            {project?.nodeId}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Owner:</span>{" "}
            {project?.owner.name}
          </p>
        </div>

        {/* Кнопка удаления */}
        <div className="flex justify-end mt-4">
          <button
            className="btn btn-allert hover:bg-red-600 transition-colors duration-200"
            onClick={() => handleRemoved(project?.id)}
          >
            Remove Project
          </button>
        </div>
      </div>

      {/* <pre> {JSON.stringify(project.file, null, 2)}</pre> */}
      <hr className="mt-4 mb-4" />
      <div className="mt-4 grid grid-cols-1 gap-2">
        {/* 🎨🎨🎨🎨🎨🎨colorVariables🎨🎨🎨🎨🎨🎨🎨 */}
        <ColorsFromFigma project={project} />
      </div>
      {/*🔹🔹🔹🔹🔹images & SVG🔹🔹🔹🔹🔹🔹*/}
      <ExtractImages project={project} />
      {/*🔹🔹🔹🔹🔹 Figma preview 🔹🔹🔹🔹🔹*/}
      <hr className="mt-4 mb-4" />
      {project?.previewUrl && (
        <div className="">
          <img
            src={project?.previewUrl}
            alt="Figma Preview"
            className="border rounded-sm shadow-[0_0_10px_0_rgba(0,0,0,0.4)]"
          />
        </div>
      )}
    </div>
  );
};

export default ProjectPage;

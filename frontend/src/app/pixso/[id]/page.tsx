"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useStateContext } from "@/providers/StateProvider";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client";
// import ColorsFromFigma from "@/components/ColorsFromFigma/ColorsFromFigma";
// import ExtractImages from "@/components/ExtractImages/ExtractImages";
// import FigmaViewer from "@/components/FigmaViewer/FigmaViewer";
import Plaza from "@/app/plaza/page";
import PrevProject from "@/components/PrevProject/PrevProject";
import {
  GET_FIGMA_PROJECT_DATA,
  GET_COLOR_VARIABLES_BY_FILE_KEY,
  GET_FIGMA_PROJECTS_BY_USER,
} from "@/apollo/queries";
import { REMOVE_FIGMA_PROJECT } from "@/apollo/mutations";
import Loading from "@/components/ui/Loading/Loading";
// import dynamic from "next/dynamic";
// const FigmaViewer = dynamic(
//   () => import("@/components/FigmaViewer/FigmaViewer"),
//   {
//     ssr: false,
//   }
// );
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
  const [project, setProject] = useState<any>(null);
  const [fontsToDisplay, setfontsToDisplay] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const ButtonPreview = useRef<HTMLDivElement>(null);
  //==== Обновление состояния при получении данных
  useEffect(() => {
    if (data?.getFigmaProjectData) {
      setProject(data.getFigmaProjectData);
    }
  }, [data]);

  //==== Удаление проекта
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

  //=====
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

      {/* <pre> {JSON.stringify(project?.file, null, 2)}</pre> */}
      <hr className="mt-4 mb-4" />
      <div className="mt-4 grid grid-cols-1 gap-2">
        {/* 🔹🔹🔹🔹🔹colorVariables🔹🔹🔹🔹🔹 */}
        {/* <ColorsFromFigma
          project={project}
          fontsToDisplay={fontsToDisplay}
          setfontsToDisplay={setfontsToDisplay} 
        /> */}
      </div>

      {/*🔹🔹🔹🔹🔹images & SVG🔹🔹🔹🔹🔹🔹*/}
      <hr className="mt-4 mb-4" />
      {/* <ExtractImages project={project} /> */}
      {/*🔹🔹🔹🔹🔹 FigmaViewer 🔹🔹🔹🔹🔹*/}
      <hr className="mt-4 mb-4" />
      {/* {project && (
        <FigmaViewer
          project={project}
          fileData={project?.file}
          nodeId={project?.nodeId}
          // fontsToDisplay={fontsToDisplay}
        />
      )} */}
      {/*🔹🔹🔹🔹🔹 Figma preview 🔹🔹🔹🔹🔹*/}
      <hr className="mt-4 mb-4" />
      <button
        type="button"
        className="btn btn-primary z-30 w-full mb-2 flex items-center justify-center gap-2"
        onClick={() => {
          setShowPreview(!showPreview);
          !showPreview
            ? ButtonPreview.current.classList.add("_isActive")
            : ButtonPreview.current.classList.remove("_isActive");
        }}
        ref={ButtonPreview}
      >
        <Image src="/svg/eye.svg" alt="preview" width={20} height={20} />
        {showPreview ? "Hide Preview" : "Show Preview"}
      </button>
      {showPreview && project?.previewUrl && <PrevProject project={project} />}
      {/*🔹🔹🔹🔹🔹 Plaza 🔹🔹🔹🔹🔹*/}
      <Plaza />
    </div>
  );
};

export default ProjectPage;

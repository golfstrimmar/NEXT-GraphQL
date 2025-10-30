"use client";
import React, { useState, useEffect, useMemo, useLayoutEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import Image from "next/image";
import { UPDATE_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
import {
  GET_JSON_DOCUMENT,
  GET_ALL_PROJECTS_BY_USER,
  FIND_PROJECT,
} from "@/apollo/queries";
import Loading from "@/components/ui/Loading/Loading";
import PProject from "@/types/PProject";
import PProjectDataElement from "@/types/PProject";
import InfoProject from "@/components/InfoProject/InfoProject";
import CreateNewProject from "@/components/CreateNewProject/CreateNewProject";
import createRenderNode from "@/utils/plaza/RenderNode.tsx";
import "./plaza.scss";
import { motion, AnimatePresence } from "framer-motion";
import AdminComponent from "@/components/AdminComponent/AdminComponent";
// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
type ProjectData = {
  tag: string;
  text: string;
  class: string;
  style: string;
  children: ProjectData[] | string;
};
type OpenInfo = {
  open: boolean;
  infoIndex: string;
};
// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
// ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
export default function Plaza() {
  const { htmlJson, setHtmlJson, user, setModalMessage } = useStateContext();
  const [projects, setProjects] = useState<PProject[]>([]);
  const [project, setProject] = useState<PProject>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [openInfoKey, setOpenInfoKey] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");

  const [editMode, setEditMode] = useState(false);
  const [nodeToDragEl, setNodeToDragEl] = useState<HTMLElement | null>(null);
  const [nodeToDrag, setNodeToDrag] = useState<any>(null);
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨

  const variables = React.useMemo(() => ({ userId: user?.id }), [user?.id]);
  const { data, loading, error } = useQuery(GET_ALL_PROJECTS_BY_USER, {
    variables,
    skip: !user?.id,
    fetchPolicy: "cache-and-network",
  });
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const [
    findProject,
    { data: dataProject, loading: loadingProject, error: errorProject },
  ] = useLazyQuery(FIND_PROJECT);

  const { data: jsonData, refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name: "initialTags" },
    fetchPolicy: "network-only",
  });

  const [removeProject] = useMutation(REMOVE_PROJECT, {
    refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
    awaitRefetchQueries: true,
  });
  const [updateProject] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
    awaitRefetchQueries: true,
  });

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  useEffect(() => {
    resetAll();
  }, []);
  useEffect(() => {
    if (!user) resetAll();
  }, [user]);
  useEffect(() => {
    if (!openInfoKey) return;
    console.log("<====openInfoKey====>", openInfoKey);
  }, [openInfoKey]);
  useEffect(() => {
    if (!htmlJson) return;
    console.log("<====htmlJson====>", htmlJson);
    // Преобразуем в структуру с ключами
    const withKeys = Array.isArray(htmlJson)
      ? htmlJson.map(addRuntimeKeys)
      : addRuntimeKeys(htmlJson);

    setProject(withKeys);
  }, [htmlJson]);

  useEffect(() => {
    console.log("<⇨⇨⇨⇨ data ⇨⇨⇨⇨>", data?.getAllProjectsByUser);
    if (data?.getAllProjectsByUser) {
      setProjects(data?.getAllProjectsByUser);
    }
  }, [data]);

  useEffect(() => {
    if (projects) {
      console.log("<==== projects====>", projects);
    }
  }, [projects]);

  useEffect(() => {
    if (dataProject?.findProject) {
      const proj = dataProject.findProject;
      setProjectId(proj.id);
      const withKeys = addRuntimeKeys(proj.data);
      // console.log(
      //   "🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹withKeys:🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹",
      //   withKeys
      // );
      setProject(withKeys);
      setHtmlJson(proj.data);
    }

    if (errorProject) {
      setModalMessage(errorProject.message || "Error fetching project");
    }
  }, [dataProject, errorProject]);

  useEffect(() => {
    if (editMode) {
      console.log("<==== editMode====>", editMode);
    }
  }, [editMode]);

  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  useLayoutEffect(() => {
    if (!project) return;
    console.log("<====🔹🔹🔹🔹🔹project🔹🔹🔹🔹🔹====>", project);
    if (project && editMode) {
      requestAnimationFrame(() => shiftNeighbors());
    }
  }, [project, editMode, openInfoKey]);

  //// ♻️♻️♻️♻️♻️♻️♻️♻️
  const shiftNeighbors = () => {
    const container = document.getElementById("plaza-render-area");
    if (!container) return;

    const renderTags = container.querySelectorAll<HTMLElement>(".render-tag");

    renderTags.forEach((tag) => {
      const prev = tag.previousElementSibling as HTMLElement | null;
      const next = tag.nextElementSibling as HTMLElement | null;

      const tagRect = tag.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Сброс старых сдвигов
      [prev, next].forEach((el) => {
        if (!el) return;
        el.style.position = "";
        el.style.top = "";
        el.style.left = "";
      });

      // Сдвигаем соседей, только если они плейсхолдеры
      if (prev && prev.classList.contains("placeholder")) {
        prev.style.position = "absolute";
        prev.style.top = `${tag.offsetTop}px`;
        prev.style.left = `${tag.offsetLeft}px`;
        prev.style.zIndex = "100";
        prev.style.height = `${tag.offsetHeight}px`;
      }
      if (next && next.classList.contains("placeholder")) {
        next.style.position = "absolute";
        next.style.top = `${tag.offsetTop}px`;
        next.style.left = `auto`;
        next.style.left = `${tag.offsetLeft + tag.offsetWidth - 15}px`;
        next.style.zIndex = "100";
        next.style.height = `${tag.offsetHeight}px`;
      }
    });
  };

  const resetAll = () => {
    setProject(null);
    setProjectId(undefined);
    setProjectName("");
    setOpenInfoKey(null);
    localStorage.removeItem("htmlJson");

    const initialJson = jsonData?.jsonDocumentByName?.content?.[0];
    if (initialJson) {
      setHtmlJson(initialJson);
      localStorage.setItem("htmlJson", JSON.stringify(initialJson));
    }
  };
  const removeKeys = (node: any): any => {
    if (typeof node === "string") return node;

    const { _key, children, ...rest } = node; // удаляем _key

    return {
      ...rest,
      children: Array.isArray(children) ? children.map(removeKeys) : children,
    };
  };
  const updateTempProject = async () => {
    console.log("<==♻️♻️==update projectId====>", projectId);

    if (!projectId || !project) return;

    // Убираем _key из всех узлов
    const cleanedProject = removeKeys(project);
    console.log("<=♻️♻️==update cleanedProject====>", cleanedProject);

    try {
      await updateProject({
        variables: {
          projectId,
          data: cleanedProject, // передаем объект/массив, без JSON.stringify
        },
      });
      setOpenInfoKey(null);
      setModalMessage("Project updated successfully.");
    } catch (error) {
      setModalMessage(error);
    }
  };

  // ♻️♻️♻️♻️♻️♻️♻️♻️
  const delProject = async (id) => {
    if (!id) return;
    await removeProject({ variables: { projectId: id } });
    resetAll();
    setModalMessage("Project removed");
  };
  // ♻️♻️♻️♻️♻️♻️♻️♻️render♻️♻️♻️♻️♻️♻️♻️♻️
  const addRuntimeKeys = (node: ProjectData | string): ProjectData | string => {
    if (typeof node === "string") return node;

    return {
      ...node,
      _key: node._key || crypto.randomUUID(),
      children: Array.isArray(node.children)
        ? node.children.map(addRuntimeKeys)
        : node.children,
    };
  };
  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  const renderNode = useMemo(
    () =>
      createRenderNode({
        editMode,
        openInfoKey,
        setOpenInfoKey,
        setProject,
        setNodeToDragEl,
        setNodeToDrag,
        nodeToDragEl,
        nodeToDrag,
        setModalMessage,
        setHtmlJson,
        project,
        removeKeys,
      }),
    [editMode, nodeToDrag, nodeToDragEl, openInfoKey]
  );
  //⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  return (
    <section className="pt-[100px] pb-[100px]">
      <div className="container">
        {user && (
          <h3 className="inline-block">
            <span className="font-normal text-[16px]">
              All projects of: &nbsp;
            </span>{" "}
            {user?.name}
          </h3>
        )}
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
        <hr className="bordered border-slate-200 mt-6 mb-6" />
        <AdminComponent />
        <hr className="bordered border-slate-200 mt-6 mb-6" />
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}

        <div className="flex flex-col">
          {user && (
            <div className="flex flex-col">
              {projects?.length === 0 && (
                <p className="text-red-300">No projects yet.</p>
              )}
              {loading ? (
                <Loading />
              ) : (
                <div className="flex flex-col gap-2">
                  {projects?.map((p) => (
                    <div className="relative" key={p.id}>
                      <button
                        className={`border absolute top-0 left-0 w-5 h-full flex items-center justify-center bg-red-400 hover:bg-red-600 z-20 transition duration-300 ${
                          projectId === p.id
                            ? "opacity-10 !cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={() => delProject(p?.id)}
                        disabled={projectId === p.id}
                      >
                        <Image
                          src="/svg/cross-com.svg"
                          alt="icon"
                          width={10}
                          height={10}
                        />
                      </button>
                      <button
                        className={`flex w-full flex-col gap-2 pl-6 text-start border rounded-md p-2 hover:bg-slate-200 ${
                          projectId === p.id
                            ? "opacity-10 !cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={async () => {
                          const res = await findProject({
                            variables: { id: p.id },
                          });
                          if (res.data?.findProject?.data) {
                            setProject(res.data.findProject.data);
                            setHtmlJson(res.data.findProject.data);
                            setProjectId(p.id);
                            setProjectName(p.name);
                          }
                        }}
                        type="button"
                        disabled={projectId === p.id}
                      >
                        <h4>{p?.name}</h4>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {user && <CreateNewProject project={project} />}

          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          <hr className="bordered border-slate-200 mt-2 " />
          <div className="flex items-center mt-2  gap-1">
            <button
              className=" cursor-pointer relative hover:bg-slate-200 flex items-center justify-center  w-6 h-6 rounded"
              type="button"
              onClick={() => {
                resetAll();
              }}
            >
              <Image
                src="/svg/clear.svg"
                alt="icon"
                width={20}
                height={20}
                className="prev"
              />
              <div className="nextafterButton" style={{}}>
                Clear the demo
              </div>
            </button>
            <button
              className={` hover:bg-slate-200 flex items-center    w-6 h-6 cursor-pointer justify-center  relative  rounded ${editMode ? "bg-slate-400" : ""}`}
              type="button"
              onClick={() => setEditMode((prev) => !prev)}
            >
              <Image
                src="/svg/drag.svg"
                alt="icon"
                width={15}
                height={15}
                className="prev"
              />
              <div className="nextafterButton">Drug & Drop</div>
            </button>
          </div>

          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          <hr className="bordered border-slate-200 mt-6 " />
          <div className="">
            {projectName && (
              <h3>
                <span className="font-normal text-[16px]">Project: </span>{" "}
                {projectName}
              </h3>
            )}

            {projectId && projectId !== "" && (
              <div className="flex items-center gap-1">
                <button
                  className="cursor-pointer relative hover:bg-slate-200 flex items-center justify-center  w-6 h-6 rounded"
                  type="button"
                  onClick={() => {
                    updateTempProject();
                  }}
                >
                  <Image
                    src="/svg/update.svg"
                    alt="icon"
                    width={15}
                    height={15}
                    className="prev"
                  />
                  <div className="nextafterButton">Update project</div>
                </button>

                <button
                  className="cursor-pointer relative hover:bg-slate-200 flex items-center justify-center  w-6 h-6 rounded"
                  type="button"
                  onClick={() => delProject(projectId)}
                >
                  <Image
                    src="/svg/cross.svg"
                    alt="icon"
                    width={15}
                    height={15}
                    className="prev"
                  />
                  <div className="nextafterButton">Remove project</div>
                </button>
              </div>
            )}
          </div>
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          <hr className="bordered border-slate-200 " />
          {/* {project && (
            <pre>
              <code>{JSON.stringify(project, null, 2)}</code>
            </pre>
          )} */}
          {/* {htmlJson && (
            <pre>
              <code>{JSON.stringify(htmlJson, null, 2)}</code>
            </pre>
          )} */}
          <motion.div
            id="plaza-container"
            className={`grid transition-all duration-300 py-2 gap-4 mt-2 ${editMode ? "bg-slate-400 rounded" : ""}
             overflow-hidden
           `}
          >
            <AnimatePresence mode="wait">
              {openInfoKey != null && project && (
                <motion.div
                  key="info-project"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.8, 0.5, 1] }}
                >
                  <InfoProject
                    setProject={setProject}
                    setHtmlJson={setHtmlJson}
                    project={project}
                    setOpenInfoKey={setOpenInfoKey}
                    openInfoKey={openInfoKey}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div
              id="plaza-render-area"
              className="flex flex-col gap-2 pt-2 -mt-2 relative"
            >
              {project &&
                (Array.isArray(project)
                  ? project.map(renderNode)
                  : renderNode(project))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

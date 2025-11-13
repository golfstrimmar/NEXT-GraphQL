"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useLayoutEffect,
  useCallback,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
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
import jsonToHtml from "@/utils/plaza/jsonToHtml";

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
  const {
    htmlJson,
    user,
    setModalMessage,
    updateHtmlJson,
    undo,
    redo,
    undoStack,
    redoStack,
    texts,
    setTexts,
  } = useStateContext();
  const pathname = usePathname();
  const [projects, setProjects] = useState<PProject[]>([]);
  const [project, setProject] = useState<PProject>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [openInfoKey, setOpenInfoKey] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  const [pId, setpId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [nodeToDragEl, setNodeToDragEl] = useState<HTMLElement | null>(null);
  const [nodeToDrag, setNodeToDrag] = useState<any>(null);
  const isSyncingRef = useRef(false);
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const isFigma = pathname === "/figma";
  const variables = React.useMemo(() => ({ userId: user?.id }), [user?.id]);
  const { data, loading, error } = useQuery(GET_ALL_PROJECTS_BY_USER, {
    variables,
    skip: !user?.id,
    fetchPolicy: "cache-and-network",
  });
  const {
    data: dataProject,
    loading: loadingProject,
    error: errorProject,
  } = useQuery(FIND_PROJECT, {
    variables: { id: Number(pId) || null },
    skip: !pId,
    fetchPolicy: "cache-and-network",
  });

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  const [removeProject] = useMutation(REMOVE_PROJECT, {
    refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
    awaitRefetchQueries: true,
  });
  const [updateProject] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
    awaitRefetchQueries: true,
  });

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️ добавление проекта
  // берем детей с пришедшего проекта и добавляем в htmlJson
  useEffect(() => {
    if (!dataProject) return;

    const proj = dataProject?.findProject;
    console.log("<==== proj from bd====>", proj);
    setProjectId(proj.id);
    setProjectName(proj.name);
    updateHtmlJson((prev) => {
      if (!prev) return prev;
      const newHtmlJson = { ...prev };
      newHtmlJson.children = [...newHtmlJson.children, ...proj.data.children];
      setpId(null);
      return newHtmlJson;
    });
  }, [dataProject]);

  // 🔻🔻🔻🔻🔻 // Преобразуем в структуру с ключами
  // 🔻🔻🔻🔻🔻
  // 🔻🔻🔻🔻🔻
  useEffect(() => {
    if (!htmlJson) return;
    isSyncingRef.current = true;

    const mergeWithExistingKeys = (
      node: ProjectData | string,
      existing?: ProjectData | string
    ): ProjectData | string => {
      if (typeof node === "string") return node;

      return {
        ...node,
        _key:
          existing && typeof existing !== "string" && existing._key
            ? existing._key
            : node._key || crypto.randomUUID(),
        children: Array.isArray(node.children)
          ? node.children.map((child, i) =>
              mergeWithExistingKeys(
                child,
                Array.isArray(existing?.children)
                  ? existing.children[i]
                  : undefined
              )
            )
          : node.children,
      };
    };

    setProject((prevProject) =>
      Array.isArray(htmlJson)
        ? htmlJson.map((node, i) =>
            mergeWithExistingKeys(node, prevProject?.[i])
          )
        : mergeWithExistingKeys(htmlJson, prevProject)
    );
  }, [htmlJson]);

  useEffect(() => {
    if (isSyncingRef.current) {
      isSyncingRef.current = false;
      return;
    }
    const newProject = removeKeys(project);
    updateHtmlJson(newProject);
  }, [project]);

  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  useEffect(() => {
    resetAll();
  }, []);
  useEffect(() => {
    if (!user) resetAll();
  }, [user]);

  useEffect(() => {
    if (data?.getAllProjectsByUser) {
      setProjects(data?.getAllProjectsByUser);
    }
  }, [data]);

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
    updateHtmlJson([]);
  };
  // ♻️♻️♻️♻️♻️♻️♻️♻️
  const removeKeys = (node: any): any => {
    if (!node) return node;
    if (typeof node === "string") return node;

    const { _key, children, ...rest } = node; // удаляем _key
    if (!_key) return;
    return {
      ...rest,
      children: Array.isArray(children) ? children.map(removeKeys) : children,
    };
  };
  // ♻️♻️♻️♻️♻️♻️♻️♻️
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
      _key: node._key || crypto.randomUUID(),
      ...node,
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
        updateHtmlJson,
        project,
        resetAll,
      }),
    [editMode, nodeToDrag, nodeToDragEl, openInfoKey]
  );
  //⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  const createHtml = async () => {
    if (htmlJson) {
      const { html } = jsonToHtml(htmlJson);
      console.log("<==== html ====>", html);
      try {
        await navigator.clipboard.writeText(html);
        setModalMessage("Html copied!");
      } catch {
        setModalMessage("Failed to copy");
      }
    }
  };
  const createSCSS = async () => {
    if (htmlJson) {
      const { scss } = jsonToHtml(htmlJson);
      console.log("<==== scss ====>", scss);
      try {
        await navigator.clipboard.writeText(scss);
        setModalMessage("Scss copied!");
      } catch {
        setModalMessage("Failed to copy");
      }
    }
  };
  const createPug = async () => {
    if (htmlJson) {
      const { pug } = jsonToHtml(htmlJson);
      console.log("<==== pug ====>", pug);
      try {
        await navigator.clipboard.writeText(pug);
        setModalMessage("Pug copied!");
      } catch {
        setModalMessage("Failed to copy");
      }
    }
  };
  //⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️

  //⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  return (
    <section className={` isFigma?pt-[100px]:pt-0`}>
      {/* <div className=" mt-6 mb-6 relative w-full h-1 ">
        <hr className="bordered border-slate-900 mt-6 mb-6" />
        <div className="bg-white text-slate-900 p-1 rounded-2xl  absolute top-[50%] left-[50%] translate-[-50%] ">
          Ulon projects
        </div>
      </div> */}

      <div className="flex flex-col">
        {/* ------готовые тэги-------- */}
        <hr className="bordered border-slate-200  mb-6" />
        <AdminComponent />
        {/* ------кнопки управления-------- */}
        <hr className="bordered border-slate-200 mt-2 " />
        <div className="flex items-center   gap-1">
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
            {/* <div className="nextafterButton" style={{}}>
                Clear the demo
              </div> */}
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
            {/* <div className="nextafterButton">Drug & Drop</div> */}
          </button>
          <button
            className={` hover:bg-slate-200 flex items-center    w-6 h-6 cursor-pointer justify-center  relative  rounded`}
            type="button"
            onClick={undo}
          >
            <Image
              src="/svg/chevron-left.svg"
              alt="icon"
              width={10}
              height={10}
              className="prev"
            />
          </button>
          <button
            className={` hover:bg-slate-200 flex items-center    w-6 h-6 cursor-pointer justify-center  relative  rounded`}
            type="button"
            onClick={redo}
          >
            <Image
              src="/svg/chevron-right.svg"
              alt="icon"
              width={10}
              height={10}
              className="prev"
            />
          </button>
          <button
            className={` hover:bg-slate-200 flex items-center    w-6 h-6 cursor-pointer justify-center  relative  rounded `}
            type="button"
            onClick={() => {
              createHtml();
            }}
          >
            <Image
              src="/svg/html.svg"
              alt="icon"
              width={20}
              height={20}
              className="prev"
            />
          </button>
          <button
            className={` hover:bg-slate-200 flex items-center    w-6 h-6 cursor-pointer justify-center  relative  rounded `}
            type="button"
            onClick={() => {
              createSCSS();
            }}
          >
            <Image
              src="/svg/scss.svg"
              alt="icon"
              width={20}
              height={20}
              className="prev"
            />
          </button>
          <button
            className={` hover:bg-slate-200 flex items-center    w-6 h-6 cursor-pointer justify-center  relative  rounded`}
            type="button"
            onClick={() => {
              createPug();
            }}
          >
            <Image
              src="/svg/pug.svg"
              alt="icon"
              width={20}
              height={20}
              className="prev"
            />
          </button>
          {/* {<pre>{createHtml()}</pre>} */}
        </div>
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀 рендеринг проекта🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
        <div
          id="plaza-render-area"
          className="flex flex-col gap-2 mb-2 relative"
        >
          {project &&
            (Array.isArray(project)
              ? project.map(renderNode)
              : renderNode(project))}
        </div>
        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
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
                  updateHtmlJson={updateHtmlJson}
                  project={project}
                  setOpenInfoKey={setOpenInfoKey}
                  openInfoKey={openInfoKey}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        {/* ------------- */}
        <hr className="bordered border-slate-200  " />
        <div className="">
          {projectName && (
            <h3>
              <span className="font-normal text-[16px] mr-2">
                Ulon Project:{" "}
              </span>
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
        {/* -------------------- */}
        {user && (
          <h3 className="inline-block mt-4">
            <span className="font-normal text-[16px]">
              All Ulon projects of: &nbsp;
            </span>
            {user?.name}
          </h3>
        )}
        {/* ------------- */}
        {user && (
          <div className="flex flex-col">
            {projects?.length === 0 && (
              <p className="text-red-300">No projects yet.</p>
            )}

            {/* ------------список прототипов проектов--------------- */}
            {loading ? (
              <Loading />
            ) : (
              <div className="flex gap-2">
                {projects?.map((p) => (
                  <div className="relative" key={p.id}>
                    <button
                      className={`border absolute top-0 left-0 w-5 h-full flex items-center justify-center bg-red-400 hover:bg-red-600 z-20 transition duration-300 
                        }`}
                      onClick={() => delProject(p?.id)}
                      // disabled={projectId === p.id}
                    >
                      <Image
                        src="/svg/cross-com.svg"
                        alt="icon"
                        width={10}
                        height={10}
                      />
                    </button>
                    <button
                      className={` flex  flex-col gap-2 pl-6 pr-2 text-start border rounded-md  hover:bg-slate-200 ${
                        projectId === p.id ? "bg-slate-400 " : "cursor-pointer"
                      }`}
                      onClick={async () => {
                        setpId(p.id);
                      }}
                      type="button"
                    >
                      <h5 className="w-[max-content] !lh-1">{p?.name}</h5>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ------флома создания проекта-------- */}
        {user && <CreateNewProject />}

        {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}

        <hr className="bordered border-slate-200 " />
        {/* {project && (
            <pre>
              <code>{JSON.stringify(project, null, 2)}</code>
            </pre>
          )}  */}
        {/* [{"tag":"div","text":"container","class":"","style": "background: mediumblue; padding: 2px 4px; border: 1px solid #adadad; ","children": []}] */}
        {/* {htmlJson && (
          <pre>
            <code>{JSON.stringify(htmlJson, null, 2)}</code>
          </pre>
        )} */}
      </div>
    </section>
  );
}

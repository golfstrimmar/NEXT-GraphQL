"use client";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import Image from "next/image";
import Input from "@/components/ui/Input/Input";
import {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  REMOVE_PROJECT,
} from "@/apollo/mutations";
import {
  GET_JSON_DOCUMENT,
  GET_ALL_PROJECTS_BY_USER,
  FIND_PROJECT,
} from "@/apollo/queries";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/Loading/Loading";
import PProject from "@/types/PProject";
import PProjectDataElement from "@/types/PProject";
import "./plaza.scss";
import { set } from "lodash";
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
  const [projectData, setProjectData] = useState<ProjectData>([]);
  const [newProjectName, setNewProjectName] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [openInfoKey, setOpenInfoKey] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>("");
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
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
  const [createProject] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
    awaitRefetchQueries: true,
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
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  useEffect(() => {
    resetAll();
  }, []);
  useEffect(() => {
    if (!user) resetAll();
  }, [user]);
  useEffect(() => {
    if (!htmlJson) return;

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
      console.log(
        "🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹withKeys:🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹",
        withKeys
      );
      setProject(withKeys);
      setHtmlJson(proj.data);
    }

    if (errorProject) {
      setModalMessage(errorProject.message || "Error fetching project");
    }
  }, [dataProject, errorProject]);

  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  useEffect(() => {
    if (project) {
      console.log("<🔹🔹🔹🔹🔹🔹🔹🔹🔹 project🔹🔹🔹🔹🔹🔹🔹🔹🔹>", project);
    }
  }, [project]);
  useEffect(() => {
    if (projectData) {
      console.log(
        "<🔹🔹🔹🔹🔹🔹🔹🔹🔹 projectData 🔹🔹🔹🔹🔹🔹🔹🔹🔹>",
        projectData
      );
    }
  }, [projectData]);

  const finPro = (id: string) => {};
  //// ♻️♻️♻️♻️♻️♻️♻️♻️
  //// ♻️♻️♻️♻️♻️♻️♻️♻️
  //// ♻️♻️♻️♻️♻️♻️♻️♻️
  //// ♻️♻️♻️♻️♻️♻️♻️♻️
  //// ♻️♻️♻️♻️♻️♻️♻️♻️
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
  //// ♻️♻️♻️♻️♻️♻️♻️♻️NewProject
  const prepareProjectDataForDB = (
    data: ProjectData | ProjectData[]
  ): string => {
    const arr = Array.isArray(data) ? data : [data];
    return JSON.stringify(arr); // вложенные children тоже будут строкой
  };

  //// ♻️♻️♻️♻️♻️♻️♻️♻️
  const createNewProject = async () => {
    if (!newProjectName || !user) {
      setModalMessage(" All fields are required.");
      return;
    }
    if (!projectData) {
      setModalMessage(" Data fields are required.");
      return;
    }
    try {
      await createProject({
        variables: {
          ownerId: user.id,
          name: newProjectName,
          data: project,
        },
      });

      setModalMessage(`Project ${newProjectName} created.`);
      setNewProjectName("");
    } catch (error) {
      setModalMessage(error);
    }
  };
  //// ♻️♻️♻️♻️♻️♻️♻️♻️
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

  //// ♻️♻️♻️♻️♻️♻️♻️♻️
  const delProject = async (id) => {
    if (!id) return;
    await removeProject({ variables: { projectId: id } });
    resetAll();
    setModalMessage("Project removed");
  };
  // ♻️♻️♻️♻️♻️♻️♻️♻️рендеринг♻️♻️♻️♻️♻️♻️♻️♻️
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
  // Функция для обновления узла по _key рекурсивно
  const updateNodeByKey = (
    nodes: ProjectData | ProjectData[],
    key: string,
    changes: Partial<ProjectData>
  ): ProjectData | ProjectData[] => {
    if (Array.isArray(nodes)) {
      return nodes.map((n) => updateNodeByKey(n, key, changes) as ProjectData);
    } else {
      if (nodes._key === key) {
        return { ...nodes, ...changes };
      }
      if (Array.isArray(nodes.children)) {
        return {
          ...nodes,
          children: nodes.children.map((child) =>
            typeof child === "string"
              ? child
              : updateNodeByKey(child, key, changes)
          ),
        };
      }
      return nodes;
    }
  };

  const infoProject = (node: ProjectData) => {
    return (
      <div className="mt-4 flex flex-col gap-4">
        <Input
          typeInput="text"
          data="Text"
          value={node?.text}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue === node?.text) return;

            const updatedProject = updateNodeByKey(project, node?._key, {
              text: newValue,
            });
            setProject(updatedProject);
            setHtmlJson(updatedProject); // если нужно синхронизировать json
          }}
        />
        <Input
          typeInput="text"
          data="Class"
          value={node?.class}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue === node?.class) return;

            const updatedProject = updateNodeByKey(project, node?._key, {
              class: newValue,
            });
            setProject(updatedProject);
            setHtmlJson(updatedProject);
          }}
        />
        <h5 className=" mb-1">Style</h5>
        <textarea
          ref={textareaRef}
          value={node?.style ?? ""}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue === node?.style) return;

            const updatedProject = updateNodeByKey(project, node?._key, {
              style: newValue,
            });
            setProject(updatedProject);
            setHtmlJson(updatedProject);

            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          className="textarea-styles"
        />
      </div>
    );
  };

  // ♻️♻️♻️♻️♻️♻️♻️♻️рендеринг♻️♻️♻️♻️♻️♻️♻️♻️
  // Функция для преобразования inline-стиля из строки в объект
  const parseInlineStyle = (styleString: string): React.CSSProperties => {
    if (!styleString) return {};
    return styleString.split(";").reduce((acc, rule) => {
      const [prop, value] = rule.split(":").map((s) => s.trim());
      if (prop && value) {
        const jsProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        (acc as any)[jsProp] = value;
      }
      return acc;
    }, {} as React.CSSProperties);
  };
  const getStyleLines = (styleString: string) => {
    if (!styleString) return [];
    return styleString
      .split(";")
      .map((line) => line.trim())
      .filter(Boolean);
  };

  // вне render / вне JSX
  const findNodeByKey = (
    nodes: ProjectData | ProjectData[],
    key: string
  ): ProjectData | null => {
    if (!nodes) return null;

    if (Array.isArray(nodes)) {
      for (const n of nodes) {
        const found = findNodeByKey(n, key);
        if (found) return found;
      }
      return null;
    } else {
      if (nodes._key === key) return nodes;
      if (Array.isArray(nodes.children))
        return findNodeByKey(nodes.children, key);
      return null;
    }
  };

  // Рекурсивный рендеринг
  const renderNode = (node: ProjectData | string) => {
    if (typeof node === "string")
      return <span key={crypto.randomUUID()}>{node}</span>;

    const Tag = node.tag as keyof JSX.IntrinsicElements;
    if (!Tag) return null;

    const children = Array.isArray(node.children)
      ? node.children.map(renderNode)
      : node.children || null;

    return (
      <Tag
        key={node._key}
        style={parseInlineStyle(node.style)}
        onClick={(e) => {
          e.stopPropagation();
          setOpenInfoKey((prev) => (prev === node._key ? null : node._key)); // открываем только этот узел
        }}
      >
        {node.text}
        {children}
      </Tag>
    );
  };

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  return (
    <section className="pt-[100px]">
      <div className="container">
        {user && (
          <h3 className="inline-block">
            <span className="font-normal text-[16px]">
              All projects of: &nbsp;
            </span>{" "}
            {user?.name}
          </h3>
        )}
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
                        // className="border absolute top-0 left-0 w-5 h-full flex items-center justify-center bg-red-400 hover:bg-red-600 z-20 transition duration-300"
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
          {user && (
            <>
              <hr className="bordered-2 border-slate-200 mt-2 mb-2" />
              <h5>Create a new project</h5>
              <div className="relative">
                <Input
                  typeInput="text"
                  data="Project name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
                <div className="absolute z-20 top-[50%] right-0 -translate-y-[50%]!">
                  <button
                    type="button"
                    className="btn btn-primary h-full"
                    onClick={createNewProject}
                  >
                    Create
                  </button>
                </div>
              </div>
            </>
          )}
          <hr className="bordered border-slate-200 mt-6 mb-2" />
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          <div className="flex items-center gap-2">
            {projectName && (
              <h3>
                <span className="font-normal text-[16px]">Project: </span>{" "}
                {projectName}
              </h3>
            )}
            {projectId && projectId !== "" && (
              <>
                <button
                  onClick={() => {
                    resetAll();
                  }}
                  className="btn btn-primary"
                >
                  Clear the project demo
                </button>
                <button
                  onClick={() => {
                    updateTempProject();
                  }}
                  className="btn btn-primary"
                >
                  Update project
                </button>
                <button
                  onClick={() => delProject(projectId)}
                  className="btn btn-allert"
                >
                  Remove project
                </button>
              </>
            )}
          </div>
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          <div className="mt-2">
            <div
              className={`grid  gap-4 ${openInfoKey !== null ? "grid-cols-[1fr_300px]" : "grid-cols-[1fr]"}`}
            >
              <div className="flex flex-col gap-2">
                {project &&
                  (Array.isArray(project)
                    ? project.map(renderNode)
                    : renderNode(project))}
              </div>

              <div>
                {openInfoKey &&
                  project &&
                  infoProject(findNodeByKey(project, openInfoKey))}
              </div>
            </div>

            {/* ))} */}
          </div>
        </div>
      </div>
    </section>
  );
}

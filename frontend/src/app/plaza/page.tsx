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
  const [
    findProject,
    { data: dataProject, loading: loadingProject, error: errorProject },
  ] = useLazyQuery(FIND_PROJECT);

  const { data: jsonData, refetch: refetchJson } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name: "flex-row" },
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
    console.log("<⇨⇨⇨⇨ htmlJson ⇨⇨⇨⇨⇨>", htmlJson);
    if (htmlJson) {
      setProject(htmlJson);
    }
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
      setProject(proj.data); // если project — это JSON структуры
      setHtmlJson(proj.data); // если используешь htmlJson для рендера
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

  //// ♻️♻️♻️♻️♻️♻️♻️♻️NewProject
  //// ♻️♻️♻️♻️♻️♻️♻️♻️NewProject
  //// ♻️♻️♻️♻️♻️♻️♻️♻️NewProject
  //// ♻️♻️♻️♻️♻️♻️♻️♻️NewProject
  //// ♻️♻️♻️♻️♻️♻️♻️♻️NewProject
  //// ♻️♻️♻️♻️♻️♻️♻️♻️NewProject
  //// ♻️♻️♻️♻️♻️♻️♻️♻️NewProject
  const prepareProjectDataForDB = (
    data: ProjectData | ProjectData[]
  ): string => {
    const arr = Array.isArray(data) ? data : [data];
    return JSON.stringify(arr); // вложенные children тоже будут строкой
  };
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

      setModalMessage(`Project ${newProjectName} created`);
      setNewProjectName("");
    } catch (error) {
      setModalMessage(error);
    }
  };

  //// ♻️♻️♻️♻️♻️♻️♻️♻️
  const delProject = async (id) => {
    if (!id) return;
    await removeProject({ variables: { projectId: id } });
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setModalMessage("Project removed");
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
  // Рекурсивный рендеринг
  const renderNode = (node: ProjectData | string, key?: number | string) => {
    if (typeof node === "string") return <span key={key}>{node}</span>;

    const Tag = node.tag as keyof JSX.IntrinsicElements;
    if (!Tag) return null;

    const children = Array.isArray(node.children)
      ? node.children.map((child, i) => renderNode(child, i))
      : node.children || null; // если children пустая строка или undefined

    return (
      <Tag key={key} style={parseInlineStyle(node.style)}>
        {node.text}
        {children}
      </Tag>
    );
  };

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
  return (
    <section className="pt-[100px]">
      <div className="container">
        <span>All projects of </span>
        {user && <h5 className="inline-block">{user?.name}</h5>}
        <div className="flex flex-col">
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
                      className="border absolute top-0 left-0 w-5 h-full flex items-center justify-center bg-red-400 hover:bg-red-600 z-20 transition duration-300"
                      onClick={() => delProject(p?.id)}
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
                          setProjectId(p.id); // <-- вот здесь присваиваем id выбранного проекта
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
              <button onClick={createNewProject}>Create</button>
            </div>
          </div>
          <hr className="bordered-2 border-slate-200 mt-2 mb-2" />
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}

          <button
            onClick={() => {
              setProject(null);
              setProjectId(undefined); // сбрасываем выбранный проект
              localStorage.removeItem("htmlJson");

              const initialJson = jsonData?.jsonDocumentByName?.content?.[0];
              if (initialJson) {
                setHtmlJson(initialJson);
                localStorage.setItem("htmlJson", JSON.stringify(initialJson));
              }
            }}
            className="btn btn-primary"
          >
            Clear project
          </button>

          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          {/* 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀 */}
          <div className="mt-2">
            {project &&
              (Array.isArray(project) ? (
                project.map((node, i) => (
                  <React.Fragment key={i}>
                    {renderNode(node)}
                    <div>
                      <p>class: {node.class}</p>
                      {/* Каждое правило стиля в отдельной строке */}
                      {getStyleLines(node.style).map((style, j) => (
                        <p key={j}>style: {style}</p>
                      ))}
                      <p>children: {JSON.stringify(node.children)}</p>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <div className="">
                  {renderNode(project)}
                  <div className="mt-4">
                    <Input
                      typeInput="text"
                      data="Text"
                      value={project.text}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue === project?.text) return;
                        setProject((prev) => ({
                          ...prev,
                          text: newValue,
                        }));
                      }}
                    />
                    <br className="mt-4" />
                    <Input
                      typeInput="text"
                      value={project.class}
                      data="Class"
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue === project?.class) return;
                        setProject((prev) => ({
                          ...prev,
                          class: newValue,
                        }));
                      }}
                    />
                    <h5 className="mt-4 mb-1">Style</h5>
                    <textarea
                      ref={textareaRef}
                      value={project?.style ?? ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        if (newValue === project?.style) return;
                        setProject((prev) => ({
                          ...prev,
                          style: newValue,
                        }));

                        e.target.style.height = "auto";
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                      className="textarea-styles"
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

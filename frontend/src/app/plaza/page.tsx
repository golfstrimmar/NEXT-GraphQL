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
  const [nodeToDrag, setNodeToDrag] = useState<any>(null);
  const [placeholders, setPlaceholders] = useState<
    { parentKey: string; index: number; type: "before" | "after" }[]
  >([]);
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
    if (!openInfoKey) return;
    console.log("<====openInfoKey====>", openInfoKey);
  }, [openInfoKey]);
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
      <div className=" flex flex-col gap-4">
        {node && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setProject((prev) => removeNodeByKey(prev, node._key));
              setOpenInfoKey(null);
            }}
            className="btn btn-allert"
          >
            Remove node
          </button>
        )}

        {node?.tag && <h5>Tag: {node?.tag}</h5>}
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
        <h5 className=" mb-1">Style:</h5>
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
  // const renderNode = (node: ProjectData | string) => {
  //   if (typeof node === "string")
  //     return <span key={crypto.randomUUID()}>{node}</span>;

  //   const Tag = node.tag as keyof JSX.IntrinsicElements;
  //   if (!Tag) return null;

  //   const children = Array.isArray(node.children)
  //     ? node.children.map(renderNode)
  //     : node.children || null;

  //   return (
  //     <Tag
  //       draggable
  //       key={node._key}
  //       style={{
  //         ...parseInlineStyle(node.style),
  //         ...(openInfoKey === node._key ? { outline: "2px solid red" } : {}),
  //       }}
  //       onClick={(e) => {
  //         e.stopPropagation();
  //         setOpenInfoKey((prev) => (prev === node._key ? null : node._key)); // открываем только этот узел
  //       }}
  //       className="cursor-grab"
  //       // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  //       onDragStart={(e) => handleDragStart(e, node)}
  //       onDragOver={(e) => handleDragOver(e, node)}
  //       onDragEnter={(e) => handleDragEnter(e, node)}
  //       onDragLeave={(e) => handleDragLeave(e, node)}
  //       onDrop={(e) => handleDrop(e, node)}
  //       onDragEnd={(e) => handleDragEnd(e, node)}
  //       // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  //     >
  //       {node.text}
  //       {children}
  //     </Tag>
  //   );
  // };
  const renderNode = (node: ProjectData | string) => {
    if (typeof node === "string")
      return <span key={crypto.randomUUID()}>{node}</span>;

    const Tag = node.tag as keyof JSX.IntrinsicElements;
    if (!Tag) return null;

    const children = Array.isArray(node.children)
      ? node.children.flatMap((child, idx) => {
          const before = placeholders.find(
            (p) =>
              p.parentKey === node._key &&
              p.index === idx &&
              p.type === "before"
          );
          const after = placeholders.find(
            (p) =>
              p.parentKey === node._key && p.index === idx && p.type === "after"
          );

          return [
            before && (
              <div
                key={`before-${child._key}`}
                className="placeholder"
                style={{
                  height: nodeToDrag?.height || 50,
                  border: "2px dashed #4d6a92",
                  margin: "2px 0",
                  background: "rgba(77,106,146,0.3)",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnPlaceholder(e, node._key, idx)}
              />
            ),
            renderNode(child),
            after && (
              <div
                key={`after-${child._key}`}
                className="placeholder"
                style={{
                  height: nodeToDrag?.height || 50,
                  border: "2px dashed #4d6a92",
                  margin: "2px 0",
                  background: "rgba(77,106,146,0.3)",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnPlaceholder(e, node._key, idx + 1)}
              />
            ),
          ].filter(Boolean);
        })
      : node.children || null;

    return (
      <Tag
        draggable
        key={node._key}
        style={{
          ...parseInlineStyle(node.style),
          ...(openInfoKey === node._key ? { outline: "2px solid red" } : {}),
        }}
        onClick={(e) => {
          e.stopPropagation();
          setOpenInfoKey((prev) => (prev === node._key ? null : node._key));
        }}
        className="cursor-grab"
        onDragStart={(e) => handleDragStart(e, node)}
        onDragOver={(e) => handleDragOver(e, node)}
        onDragEnter={(e) => handleDragEnter(e, node)}
        onDragLeave={(e) => handleDragLeave(e, node)}
        onDrop={(e) => handleDrop(e, node)}
        onDragEnd={(e) => handleDragEnd(e, node)}
      >
        {node.text}
        {children}
      </Tag>
    );
  };
  const handleDropOnPlaceholder = (
    e: React.DragEvent<HTMLElement>,
    parentKey: string,
    index: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!nodeToDrag) return;

    setProject((prevProject) => {
      if (!prevProject) return prevProject;
      const treeCopy = deepClone(prevProject);

      // 1) Удаляем nodeToDrag из старого места
      const withoutDragged = removeNodeByKey(treeCopy, nodeToDrag._key);

      // 2) Клонируем узел для вставки
      const nodeToInsert = deepClone(nodeToDrag);

      // 3) Находим родителя по parentKey
      const insertIntoParent = (node: any): any => {
        if (Array.isArray(node)) {
          return node.map(insertIntoParent);
        } else if (node._key === parentKey) {
          if (!Array.isArray(node.children)) node.children = [];
          const newChildren = [...node.children];
          newChildren.splice(index, 0, nodeToInsert);
          return { ...node, children: newChildren };
        } else if (Array.isArray(node.children)) {
          return {
            ...node,
            children: node.children.map(insertIntoParent),
          };
        }
        return node;
      };

      return insertIntoParent(withoutDragged);
    });
    setPlaceholders([]);
    setNodeToDrag(null);
  };

  // =========================================

  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️

  // Удаляет узел по _key и возвращает новый JSON без него
  // Полезные помощники
  const deepClone = (obj: any) => {
    // Если в среде есть structuredClone, используем её — быстрее и точнее.
    if (typeof structuredClone === "function") return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
  };

  // Удаление узла по _key — возвращает новый tree (массив или объект)
  const removeNodeByKey = (node: any, keyToRemove: string): any => {
    if (!node) return node;
    if (typeof node === "string") return node;

    // Если node — массив корневой
    if (Array.isArray(node)) {
      const res = [];
      for (const child of node) {
        const updated = removeNodeByKey(child, keyToRemove);
        if (updated !== null && updated !== undefined) res.push(updated);
      }
      return res;
    }

    // node — объект
    if (node._key === keyToRemove) {
      return null; // удаляем этот узел
    }

    if (Array.isArray(node.children)) {
      const newChildren = [];
      for (const c of node.children) {
        const updated = removeNodeByKey(c, keyToRemove);
        if (updated !== null && updated !== undefined)
          newChildren.push(updated);
      }
      return { ...node, children: newChildren };
    }

    return node;
  };

  // Вставка nodeToAdd внутрь узла с targetKey (в конец children)
  // Возвращает новый tree
  const addNodeToTargetByKey = (
    node: any,
    targetKey: string,
    nodeToAdd: any
  ): any => {
    if (!node) return node;
    if (typeof node === "string") return node;

    if (Array.isArray(node)) {
      return node.map((child) =>
        addNodeToTargetByKey(child, targetKey, nodeToAdd)
      );
    }

    if (node._key === targetKey) {
      const existingChildren = Array.isArray(node.children)
        ? node.children
        : [];
      return {
        ...node,
        children: [...existingChildren, nodeToAdd],
      };
    }

    if (Array.isArray(node.children)) {
      return {
        ...node,
        children: node.children.map((child) =>
          addNodeToTargetByKey(child, targetKey, nodeToAdd)
        ),
      };
    }

    return node;
  };

  // Вставка клона рядом с узлом в том же массиве детей родителя
  // Возвращает новый tree
  const duplicateNodeNextToIt = (node: any, targetKey: string): any => {
    if (!node) return node;
    if (typeof node === "string") return node;

    if (Array.isArray(node)) {
      const res: any[] = [];
      for (const child of node) {
        if (child._key === targetKey) {
          // push original, then push clone
          res.push(child);
          const clone = cloneNodeWithNewKeys(child);
          res.push(clone);
        } else {
          // рекурсивно ищем внутри child
          res.push(duplicateNodeNextToIt(child, targetKey));
        }
      }
      return res;
    }

    // node is object
    if (Array.isArray(node.children)) {
      // Пройдёмся по children и попробуем вставить рядом внутри них
      const newChildren = [];
      let changed = false;
      for (const child of node.children) {
        if (child._key === targetKey) {
          newChildren.push(child);
          newChildren.push(cloneNodeWithNewKeys(child));
          changed = true;
        } else {
          const updatedChild = duplicateNodeNextToIt(child, targetKey);
          newChildren.push(updatedChild);
          if (updatedChild !== child) changed = true;
        }
      }
      // Если ничего не изменилось в children — вернуть node как есть (чтобы сохранить === где возможно)
      if (!changed) return node;
      return { ...node, children: newChildren };
    }

    return node;
  };

  // Клонирование узла со всеми потомками, создавая новые _key
  const cloneNodeWithNewKeys = (node: any): any => {
    if (typeof node === "string") return node;
    const cloned: any = { ...deepClone(node) };
    const regenerate = (n: any) => {
      if (typeof n === "string") return n;
      n._key = crypto.randomUUID();
      if (Array.isArray(n.children)) {
        n.children = n.children.map((c: any) => regenerate(c));
      }
      return n;
    };
    return regenerate(cloned);
  };

  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️

  // const handleDragStart = (e: React.DragEvent<HTMLElement>, node: any) => {
  //   e.stopPropagation();
  //   const target = e.currentTarget as HTMLElement;
  //   console.log("<⚙️⚙️⚙️⚙️=node====>", node);
  //   console.log("<⚙️⚙️⚙️⚙️=target====>", target);
  //   const dragGhost = target.cloneNode(true) as HTMLElement;
  //   dragGhost.style.position = "absolute";
  //   dragGhost.style.top = "-9999px";
  //   dragGhost.style.backgroundColor = "#4d6a92";
  //   dragGhost.style.pointerEvents = "none";
  //   // Добавляем в DOM, чтобы браузер мог захватить изображение
  //   document.body.appendChild(dragGhost);
  //   // Передаём его в качестве drag image
  //   e.dataTransfer.setDragImage(dragGhost, 0, 0);
  //   // Убираем после небольшого таймаута
  //   setTimeout(() => {
  //     document.body.removeChild(dragGhost);
  //   }, 0);
  //   target.style.opacity = "0.4";
  //   target.style.transition = "opacity 0.2s ease";
  //   setNodeToDrag(node);
  //   // handleDeleteNode(node.attributes["data-index"]);
  // };
  const handleDragStart = (e: React.DragEvent<HTMLElement>, node: any) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;

    // Настраиваем dragGhost
    const dragGhost = target.cloneNode(true) as HTMLElement;
    dragGhost.style.position = "absolute";
    dragGhost.style.top = "-9999px";
    dragGhost.style.backgroundColor = "#4d6a92";
    dragGhost.style.pointerEvents = "none";
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
    setTimeout(() => document.body.removeChild(dragGhost), 0);

    target.style.opacity = "0.4";
    target.style.transition = "opacity 0.2s ease";

    setNodeToDrag(node);

    // Создаём placeholder-ы для всех блоков
    const generatePlaceholders = (
      n: ProjectData | string,
      parentKey: string | null = null
    ) => {
      if (typeof n === "string") return [];
      let result: typeof placeholders = [];
      if (Array.isArray(n.children)) {
        n.children.forEach((child, idx) => {
          // before
          result.push({ parentKey: n._key, index: idx, type: "before" });
          // рекурсивно для детей
          result = result.concat(generatePlaceholders(child, n._key));
          // after
          result.push({ parentKey: n._key, index: idx, type: "after" });
        });
      }
      return result;
    };

    const newPlaceholders = Array.isArray(project)
      ? project.flatMap((n) => generatePlaceholders(n))
      : generatePlaceholders(project);

    setPlaceholders(newPlaceholders);
  };
  // 🟡 Наведение на зону сброса
  const handleDragOver = (e: React.DragEvent<HTMLElement>, node: any) => {
    e.preventDefault(); // Обязательно, чтобы `drop` сработал
    e.stopPropagation();
    e.currentTarget.style.outline = "2px dashed #aaa";
    // console.log("🟡 dragOver", node);
  };

  // 🟢 Сброс
  const handleDrop = (e: React.DragEvent<HTMLElement>, targetNode: any) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).style.outline = "none";

    if (!nodeToDrag) return;

    // если дропаем на самого себя -> клонируем рядом в том же родителе
    if (nodeToDrag._key === targetNode._key) {
      setProject((prevProject) => {
        if (!prevProject) return prevProject;
        const treeCopy = deepClone(prevProject);
        const newTree = duplicateNodeNextToIt(treeCopy, nodeToDrag._key);
        return newTree;
      });

      // выделяем клонированный элемент (опционально)
      // нам нужно найти только что созданный клон, но поскольку у него новый _key,
      // можно найти его как ближайшего после оригинала при повторном поиске.
      setNodeToDrag(null);
      return;
    }

    // Иначе: обычное перемещение внутрь targetNode
    setProject((prevProject) => {
      if (!prevProject) return prevProject;
      const treeCopy = deepClone(prevProject);

      // 1) удалим узел из старого места
      const withoutDragged = removeNodeByKey(treeCopy, nodeToDrag._key);

      // 2) добавим nodeToDrag внутрь targetNode
      // ВАЖНО: nodeToDrag может ссылаться на объект из старого дерева.
      // Мы должны клонировать nodeToDrag (чтобы не оставить ссылки), но сохранить его _key.
      // Если хочешь перемещение (не клонирование), то можно оставить тот же _key.
      // Я использую глубокое клонирование, но *не* меняю _key, т.е. это перемещение.
      const nodeToInsert = deepClone(nodeToDrag);

      const updated = addNodeToTargetByKey(
        withoutDragged,
        targetNode._key,
        nodeToInsert
      );
      return updated;
    });

    setNodeToDrag(null);
  };
  // const handleDrop = (e: React.DragEvent<HTMLElement>, targetNode: any) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   (e.currentTarget as HTMLElement).style.outline = "none";

  //   if (!nodeToDrag) return;

  //   // Дублирование при броске на самого себя
  //   if (nodeToDrag._key === targetNode._key) {
  //     setProject((prev) => {
  //       if (!prev) return prev;
  //       const treeCopy = deepClone(prev);
  //       return duplicateNodeNextToIt(treeCopy, nodeToDrag._key);
  //     });
  //     setNodeToDrag(null);
  //     return;
  //   }

  //   setProject((prev) => {
  //     if (!prev) return prev;
  //     const treeCopy = deepClone(prev);

  //     // Удаляем узел с предыдущего места
  //     const withoutDragged = removeNodeByKey(treeCopy, nodeToDrag._key);

  //     // Находим родителя targetNode в treeCopy
  //     const findParentKey = (node: any, childKey: string): string | null => {
  //       if (!node || typeof node === "string") return null;
  //       if (Array.isArray(node.children)) {
  //         for (const c of node.children) {
  //           if (typeof c !== "string" && c._key === childKey) return node._key;
  //           const nested = findParentKey(c, childKey);
  //           if (nested) return nested;
  //         }
  //       }
  //       return null;
  //     };

  //     const parentKey = findParentKey(withoutDragged, targetNode._key);

  //     // Вставляем nodeToDrag в родителя между детьми
  //     return insertNodeBetweenParent(
  //       withoutDragged,
  //       parentKey || null,
  //       targetNode._key,
  //       nodeToDrag,
  //       e
  //     );
  //   });

  //   setNodeToDrag(null);
  // };

  // // Вспомогательная функция: вставка между детьми родителя
  // function insertNodeBetweenParent(
  //   tree: any,
  //   parentKey: string | null,
  //   targetKey: string,
  //   nodeToInsert: any,
  //   e: React.DragEvent<HTMLElement>
  // ): any {
  //   if (Array.isArray(tree)) {
  //     return tree.map((n) =>
  //       insertNodeBetweenParent(n, parentKey, targetKey, nodeToInsert, e)
  //     );
  //   } else if (parentKey === null || tree._key === parentKey) {
  //     if (!Array.isArray(tree.children)) tree.children = [];

  //     const rects = tree.children.map((child: any) => {
  //       const el = document.querySelector(
  //         `[data-key='${child._key}']`
  //       ) as HTMLElement;
  //       return el?.getBoundingClientRect();
  //     });

  //     const cursorX = e.clientX;
  //     const cursorY = e.clientY;

  //     let insertIndex = tree.children.findIndex((child: any, idx: number) => {
  //       const rect = rects[idx];
  //       if (!rect) return false;

  //       // Определяем направление: vertical или horizontal
  //       const parentEl = document.querySelector(
  //         `[data-key='${tree._key}']`
  //       ) as HTMLElement;
  //       const style = window.getComputedStyle(parentEl);
  //       const isVertical =
  //         style.display.includes("flex") &&
  //         style.flexDirection.includes("column");

  //       if (isVertical || style.display.includes("grid")) {
  //         return cursorY < rect.top + rect.height / 2;
  //       } else {
  //         return cursorX < rect.left + rect.width / 2;
  //       }
  //     });

  //     if (insertIndex === -1) insertIndex = tree.children.length;

  //     const newNode = deepClone(nodeToInsert);
  //     const newChildren = [...tree.children];
  //     newChildren.splice(insertIndex, 0, newNode);

  //     return { ...tree, children: newChildren };
  //   } else if (Array.isArray(tree.children)) {
  //     return {
  //       ...tree,
  //       children: tree.children.map((c: any) =>
  //         insertNodeBetweenParent(c, parentKey, targetKey, nodeToInsert, e)
  //       ),
  //     };
  //   }
  //   return tree;
  // }

  // 🟣 Наведение началось
  const handleDragEnter = (e: React.DragEvent<HTMLElement>, node: any) => {
    e.stopPropagation();
    e.currentTarget.style.outline = "2px dashed blue";
    // console.log("➡️ dragEnter", node);
  };
  // 🔘 Уход с зоны
  const handleDragLeave = (e: React.DragEvent<HTMLElement>, node: any) => {
    e.stopPropagation();
    e.currentTarget.style.outline = "none";
    // console.log("⬅️ dragLeave", node);
  };
  // 🔴 Завершение перетаскивания
  const handleDragEnd = (e: React.DragEvent<HTMLElement>, node: any) => {
    e.stopPropagation();
    e.currentTarget.style.outline = "none";
    (e.currentTarget as HTMLElement).style.opacity = "1";
  };

  // ⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨⇨
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
                {openInfoKey !== null &&
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

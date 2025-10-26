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
import { Value } from "sass";
import removeNodeByKey from "@/utils/plaza/removeNodeByKey";
import findNodeByKey from "@/utils/plaza/findNodeByKey";
import InfoProject from "@/components/InfoProject/InfoProject";
import CreateNewProject from "@/components/CreateNewProject/CreateNewProject";
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
  const [nodeToDrag, setNodeToDrag] = useState<any>(null);
  const [placeholders, setPlaceholders] = useState<
    { parentKey: string; index: number; type: "before" | "after" }[]
  >([]);
  const [editMode, setEditMode] = useState(false);
  const [nodeToDragEl, setNodeToDragEl] = useState<HTMLElement | null>(null);
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

  useEffect(() => {
    if (!editMode) {
      const outlined =
        document.querySelectorAll<HTMLElement>("[style*='outline']");
      outlined.forEach((el) => {
        el.style.outline = "none";
      });
    }
  }, [editMode]);

  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  // 🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹🔹Project
  useEffect(() => {
    if (project) {
      console.log("<🔹🔹🔹🔹🔹🔹🔹🔹🔹 project🔹🔹🔹🔹🔹🔹🔹🔹🔹>", project);
    }
  }, [project]);
  // useEffect(() => {
  //   if (projectData) {
  //     console.log(
  //       "<🔹🔹🔹🔹🔹🔹🔹🔹🔹 projectData 🔹🔹🔹🔹🔹🔹🔹🔹🔹>",
  //       projectData
  //     );
  //   }
  // }, [projectData]);

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
  // const prepareProjectDataForDB = (
  //   data: ProjectData | ProjectData[]
  // ): string => {
  //   const arr = Array.isArray(data) ? data : [data];
  //   return JSON.stringify(arr); // вложенные children тоже будут строкой
  // };

  //// ♻️♻️♻️♻️♻️♻️♻️♻️

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
  // const getStyleLines = (styleString: string) => {
  //   if (!styleString) return [];
  //   return styleString
  //     .split(";")
  //     .map((line) => line.trim())
  //     .filter(Boolean);
  // };

  // вне render / вне JSX

  // renderNode
  // renderNode
  // renderNode
  // renderNode
  // renderNode
  // renderNode
  // renderNode
  // renderNode
  // const renderNode = (node: ProjectData | string) => {
  //   if (typeof node === "string")
  //     return <span key={crypto.randomUUID()}>{node}</span>;

  //   const Tag = node.tag as keyof JSX.IntrinsicElements;
  //   if (!Tag) return null;
  //   const handleNodeClick = (e: React.MouseEvent) => {
  //     e.stopPropagation();
  //     // Если есть ожидающий таймаут, значит пришёл второй клик — это double
  //     if ((handleNodeClick as any).timeout) {
  //       clearTimeout((handleNodeClick as any).timeout);
  //       (handleNodeClick as any).timeout = null;
  //       handleDoubleClick(e);
  //     } else {
  //       (handleNodeClick as any).timeout = setTimeout(() => {
  //         handleSingleClick(e);
  //         (handleNodeClick as any).timeout = null;
  //       }, 300);
  //     }
  //   };
  //   const handleSingleClick = (e: React.MouseEvent) => {
  //     setOpenInfoKey((prev) => (prev === node._key ? null : node._key));
  //   };

  //   const handleDoubleClick = (e: React.MouseEvent) => {
  //     setProject((prev) => removeNodeByKey(prev, node._key));
  //     setOpenInfoKey(null);
  //   };
  //   const children = Array.isArray(node.children)
  //     ? node.children.flatMap((child, idx) => {
  //         const elements: JSX.Element[] = [];

  //         if (editMode) {
  //           elements.push(
  //             <div
  //               key={`before-${typeof child === "string" ? crypto.randomUUID() : child._key}`}
  //               className="placeholder"
  //               draggable={false}
  //               onDragOver={handleDragOver}
  //               onDragLeave={handleDragLeave}
  //               onDrop={(e) =>
  //                 handleDropOnPlaceholder(
  //                   e,
  //                   node._key,
  //                   Array.isArray(node.children)
  //                     ? node.children[idx]._key
  //                     : null,
  //                   "before"
  //                 )
  //               }
  //             />
  //           );
  //         }

  //         elements.push(renderNode(child));

  //         if (editMode) {
  //           elements.push(
  //             <div
  //               key={`before-${typeof child === "string" ? crypto.randomUUID() : child._key}`}
  //               className="placeholder"
  //               draggable={false}
  //               onDragOver={handleDragOver}
  //               onDragLeave={handleDragLeave}
  //               onDrop={(e) =>
  //                 handleDropOnPlaceholder(
  //                   e,
  //                   node._key,
  //                   Array.isArray(node.children)
  //                     ? node.children[idx]._key
  //                     : null,
  //                   "after"
  //                 )
  //               }
  //             />
  //           );
  //         }

  //         return elements;
  //       })
  //     : node.children || null;

  //   // парсим стиль
  //   const originalStyle = parseInlineStyle(node.style) || {};

  //   // оставляем только flex/grid свойства
  //   const filteredStyle = editMode
  //     ? Object.fromEntries(
  //         Object.entries(originalStyle).filter(([key]) =>
  //           /^(display|flex|grid|justify|align)/.test(key)
  //         )
  //       )
  //     : originalStyle;

  //   return (
  //     <Tag
  //       key={node._key}
  //       draggable={editMode}
  //       onDragStart={editMode ? (e) => handleDragStart(e, node) : undefined}
  //       onDragOver={editMode ? (e) => handleDragOver(e, node) : undefined}
  //       onDragLeave={editMode ? handleDragLeave : undefined}
  //       onDrop={editMode ? (e) => handleDrop(e, node, true) : undefined}
  //       className={`${editMode ? "card" : node.class} cursor-${
  //         editMode ? "grab" : "default"
  //       }`}
  //       style={{
  //         ...filteredStyle,
  //         outline: openInfoKey === node._key ? "2px solid red" : "none",
  //         position: "relative",
  //         transition: "opacity 0.2s ease",
  //         cursor: editMode ? "grab" : "pointer",
  //       }}
  //       onClick={handleNodeClick}
  //     >
  //       {node.text}
  //       {children}
  //     </Tag>
  //   );
  // };

  // const handleDrop = (
  //   e: React.DragEvent<HTMLElement>,
  //   node: any,
  //   duplicate = false
  // ) => {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   const el = e.currentTarget as HTMLElement;
  //   el.style.outline = "none";

  //   if (!nodeToDrag) return;

  //   setProject((prevProject) => {
  //     if (!prevProject) return prevProject;
  //     const treeCopy = deepClone(prevProject);

  //     // === Дроп на самого себя ===
  //     if (nodeToDrag._key === node._key) {
  //       return duplicateNodeNextToIt(treeCopy, node._key);
  //     }

  //     // === Дублирование через флаг ===
  //     if (duplicate) {
  //       return duplicateNodeNextToIt(treeCopy, node._key);
  //     }

  //     // === Обычный drag ===
  //     const withoutDragged = removeNodeByKey(treeCopy, nodeToDrag._key);

  //     const insertIntoNode = (n: any): any => {
  //       if (Array.isArray(n)) return n.map(insertIntoNode);
  //       if (n._key === node._key) {
  //         if (!Array.isArray(n.children)) n.children = [];
  //         return {
  //           ...n,
  //           children: [...n.children, cloneNodeWithNewKeys(nodeToDrag)],
  //         };
  //       }
  //       if (Array.isArray(n.children)) {
  //         return { ...n, children: n.children.map(insertIntoNode) };
  //       }
  //       return n;
  //     };

  //     return insertIntoNode(withoutDragged);
  //   });

  //   if (nodeToDragEl) {
  //     nodeToDragEl.style.opacity = "1";
  //     setNodeToDragEl(null);
  //   }

  //   if (!duplicate) setNodeToDrag(null);
  // };

  // Бросок на плейсхолдер

  // =========================================
  const renderNode = (node: ProjectData | string) => {
    if (!node) return null;
    console.log("<====typeof node====>", typeof node);
    if (typeof node === "string") {
      return <span key={crypto.randomUUID()}>{node}</span>;
    }

    const Tag = node.tag as keyof JSX.IntrinsicElements;
    if (!Tag) return null;

    // Клики: одиночный/двойной
    const handleNodeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if ((handleNodeClick as any).timeout) {
        clearTimeout((handleNodeClick as any).timeout);
        (handleNodeClick as any).timeout = null;
        handleDoubleClick(e);
      } else {
        (handleNodeClick as any).timeout = setTimeout(() => {
          handleSingleClick(e);
          (handleNodeClick as any).timeout = null;
        }, 300);
      }
    };
    const handleSingleClick = () =>
      setOpenInfoKey((prev) => (prev === node._key ? null : node._key));
    const handleDoubleClick = () => {
      setProject((prev) => removeNodeByKey(prev, node._key));
      setOpenInfoKey(null);
    };

    // Плейсхолдеры только в editMode
    const children = Array.isArray(node.children)
      ? node.children.flatMap((child, idx) => {
          const elements: JSX.Element[] = [];

          if (editMode) {
            elements.push(
              <div
                key={`before-${typeof child === "string" ? crypto.randomUUID() : child._key}`}
                className="placeholder"
                draggable={false}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) =>
                  handleDropOnPlaceholder(
                    e,
                    node._key,
                    node.children[idx]?._key || null,
                    "before"
                  )
                }
              />
            );
          }

          elements.push(renderNode(child));

          if (editMode) {
            elements.push(
              <div
                key={`after-${typeof child === "string" ? crypto.randomUUID() : child._key}`}
                className="placeholder"
                draggable={false}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) =>
                  handleDropOnPlaceholder(
                    e,
                    node._key,
                    node.children[idx]?._key || null,
                    "after"
                  )
                }
              />
            );
          }

          return elements;
        })
      : node.children || null;

    // Стили: editMode — только flex/grid, иначе все оригинальные
    const originalStyle = parseInlineStyle(node.style) || {};
    const filteredStyle = editMode
      ? Object.fromEntries(
          Object.entries(originalStyle).filter(([key]) =>
            /^(display|flex|grid|justify|align)/.test(key)
          )
        )
      : originalStyle;

    return (
      <Tag
        key={`${node._key}-${node.text}`}
        draggable={editMode}
        onDragStart={editMode ? (e) => handleDragStart(e, node) : undefined}
        onDragOver={editMode ? (e) => handleDragOver(e, node) : undefined}
        onDragLeave={editMode ? handleDragLeave : undefined}
        onDrop={editMode ? (e) => handleDrop(e, node, true) : undefined}
        className={`${editMode ? "card" : node.class} cursor-${editMode ? "grab" : "default"}`}
        style={{
          ...(editMode ? filteredStyle : originalStyle),
          outline: openInfoKey === node._key ? "2px solid red" : "none",
          position: "relative",
          transition: "opacity 0.2s ease",
          cursor: editMode ? "grab" : "pointer",
          padding: editMode ? "10px" : "0",
        }}
        onClick={handleNodeClick}
      >
        {node?.text}
        {children}
      </Tag>
    );
  };
  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️
  // ⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️⚙️

  // Полезные помощники
  const deepClone = (obj: any) => {
    // Если в среде есть structuredClone, используем её — быстрее и точнее.
    if (typeof structuredClone === "function") return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
  };

  // Вставка nodeToAdd внутрь узла с targetKey (в конец children)
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

  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️

  const handleDragStart = (e: React.DragEvent<HTMLElement>, node: any) => {
    if (!editMode) return; // 🧱 блокируем, если режим не включён

    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;

    const dragGhost = target.cloneNode(true) as HTMLElement;
    dragGhost.style.position = "absolute";
    dragGhost.style.top = "-9999px";
    dragGhost.style.backgroundColor = "#4d6a92";
    dragGhost.style.pointerEvents = "none";
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
    setTimeout(() => document.body.removeChild(dragGhost), 0);

    target.style.opacity = "0.1";
    target.style.transition = "opacity 0.2s ease";
    setNodeToDragEl(target);
    setNodeToDrag(node);
  };
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  const handleDropOnPlaceholder = (
    e: React.DragEvent<HTMLElement>,
    parentKey: string,
    siblingKey: string | null, // ключ целевого "соседа", ИМЕННО _key
    type: "before" | "after"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nodeToDrag) return;

    const el = e.currentTarget as HTMLElement;
    el.style.outline = "none";
    setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[style*='outline']")
        .forEach((el) => (el.style.outline = "none"));
    }, 0);
    setProject((prevProject) => {
      if (!prevProject) return prevProject;
      const treeCopy = deepClone(prevProject);
      const withoutDragged = removeNodeByKey(treeCopy, nodeToDrag._key);
      const nodeToInsert = cloneNodeWithNewKeys(nodeToDrag);

      const insertIntoParent = (node: any): any => {
        if (Array.isArray(node)) return node.map(insertIntoParent);

        if (node._key === parentKey) {
          if (!Array.isArray(node.children)) node.children = [];
          const newChildren = [...node.children];

          // Если нет ключа — вставлять в конец
          if (!siblingKey) {
            newChildren.push(nodeToInsert);
          } else {
            const idx = newChildren.findIndex((c) => c._key === siblingKey);
            // Вставка строго до или после найденного ключа (idx гарантированно актуален!)
            if (type === "before") {
              newChildren.splice(idx, 0, nodeToInsert);
            } else {
              newChildren.splice(idx + 1, 0, nodeToInsert);
            }
          }
          return { ...node, children: newChildren };
        }

        if (Array.isArray(node.children)) {
          return { ...node, children: node.children.map(insertIntoParent) };
        }
        return node;
      };

      return insertIntoParent(withoutDragged);
    });

    if (nodeToDragEl) {
      nodeToDragEl.style.opacity = "1";
      setNodeToDragEl(null);
    }
    setNodeToDrag(null);
  };
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  const handleDrop = (e: React.DragEvent<HTMLElement>, node: any) => {
    e.preventDefault();
    e.stopPropagation();

    const el = e.currentTarget as HTMLElement;
    el.style.outline = "none";

    if (!nodeToDrag) return;
    setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>("[style*='outline']")
        .forEach((el) => (el.style.outline = "none"));
    }, 0);
    // ✅ Если узел сбрасывают на самого себя — клонировать рядом
    if (nodeToDrag._key === node._key) {
      setProject((prevProject) => {
        if (!prevProject) return prevProject;
        const treeCopy = deepClone(prevProject);
        return duplicateNodeNextToIt(treeCopy, node._key);
      });

      // Очистка состояния
      if (nodeToDragEl) {
        nodeToDragEl.style.opacity = "1";
        setNodeToDragEl(null);
      }
      setNodeToDrag(null);
      return;
    }

    // ✅ Если узел сбрасывают на другой — добавить его в конец
    setProject((prevProject) => {
      if (!prevProject) return prevProject;
      const treeCopy = deepClone(prevProject);
      const cleaned = removeNodeByKey(treeCopy, nodeToDrag._key); // удаляем из старого места
      const toInsert = cloneNodeWithNewKeys(nodeToDrag); // создаем копию с новыми ключами
      return addNodeToTargetByKey(cleaned, node._key, toInsert); // добавляем в конец
    });

    // Сброс состояния
    if (nodeToDragEl) {
      nodeToDragEl.style.opacity = "1";
      setNodeToDragEl(null);
    }
    setNodeToDrag(null);
  };
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  const handleDragOver = (e: React.DragEvent<HTMLElement>, node?: any) => {
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    // if (el.classList.contains("placeholder")) {
    el.style.outline = "3px dashed #4d6a92";
    // }
  };
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    // if (el.classList.contains("placeholder")) {
    el.style.outline = "none";
    // }
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
          <hr className="bordered border-slate-200 mt-6 " />
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
                  className="cursor-pointer relative"
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
                    Clear the project demo
                  </div>
                </button>
                <button
                  className="cursor-pointer relative"
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
                  className={`cursor-pointer relative p-1 rounded ${editMode ? "bg-slate-400" : ""}`}
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
                <button
                  className={` cursor-pointer relative `}
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
              </>
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
          <div
            className={`grid pt-2 gap-4 ${openInfoKey !== null ? "grid-cols-[300px_1fr]" : "grid-cols-[1fr]"}`}
          >
            {openInfoKey !== null && openInfoKey !== undefined && project && (
              <InfoProject
                setProject={setProject}
                setHtmlJson={setHtmlJson}
                project={project}
                setOpenInfoKey={setOpenInfoKey}
                openInfoKey={openInfoKey}
              />
            )}

            <div className="flex flex-col gap-2  pt-2 -mt-2 ">
              {project &&
                (Array.isArray(project)
                  ? project.map(renderNode)
                  : renderNode(project))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import removeNodeByKey from "@/utils/plaza/removeNodeByKey";
import findNodeByKey from "@/utils/plaza/findNodeByKey";

const createRenderNode = ({
  project,
  editMode,
  openInfoKey,
  setOpenInfoKey,
  setProject,
  nodeToDragEl,
  nodeToDrag,
  setNodeToDragEl,
  setNodeToDrag,
  setHtmlJson,
  resetAll,
}: any) => {
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️

  const deepClone = (obj: any) => {
    // Если в среде есть structuredClone, используем её — быстрее и точнее.
    if (typeof structuredClone === "function") return structuredClone(obj);
    return JSON.parse(JSON.stringify(obj));
  };
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
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️

  const handleDragStart = (e: React.DragEvent<HTMLElement>, node: any) => {
    if (!editMode) return;
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

    target.style.opacity = "0.3";
    target.style.transition = "opacity 0.2s ease";

    setNodeToDragEl(target);
    setNodeToDrag(node);
  };
  const handleDragOver = (e: React.DragEvent<HTMLElement>, node?: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nodeToDrag && !node) return;
    console.log("<====node====>", node);
    const el = e.currentTarget as HTMLElement;
    let prev = el.previousElementSibling as HTMLElement | null;
    let next = el.nextElementSibling as HTMLElement | null;

    if (el.classList.contains("card") && prev && next) {
      el.style.background = "rgba(0, 0, 0, 0.3)";
      prev.style.opacity = "1";
      prev.style.height = `${el.offsetHeight}px`;
      next.style.opacity = "1";
      next.style.height = `${el.offsetHeight}px`;
    }
    if (el.classList.contains("placeholder")) {
      el.style.background =
        "repeating-linear-gradient(45deg, black, black 4px, yellow 4px, yellow 8px)";

      el.style.opacity = "1";
    }
    if (nodeToDrag._key === node._key && prev && next) {
      el.style.background = "rgb(236, 236, 236, 0.3)";
      prev.style.opacity = "0";
      next.style.opacity = "0";
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const prev = el.previousElementSibling as HTMLElement | null;
    const next = el.nextElementSibling as HTMLElement | null;

    setTimeout(() => {
      if (el.classList.contains("placeholder")) {
        el.style.opacity = "0";
      }
      if (el.classList.contains("card")) {
        el.style.background = "rgb(236, 236, 236)";
        if (prev && next) {
          prev.style.opacity = "0";
          next.style.opacity = "0";
        }
      }
    }, 0);
  };
  const handleDropOnPlaceholder = (
    e: React.DragEvent<HTMLElement>,
    parentKey: string,
    siblingKey: string | null,
    type: "before" | "after"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nodeToDrag) return;
    const el = e.currentTarget as HTMLElement;
    setTimeout(() => {
      el.style.opacity = "0";
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

  const handleDrop = (e: React.DragEvent<HTMLElement>, node: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nodeToDrag) return;
    const el = e.currentTarget as HTMLElement;
    const prev = el.previousElementSibling as HTMLElement | null;
    const next = el.nextElementSibling as HTMLElement | null;
    if (prev && next) {
      setTimeout(() => {
        el.style.background = "rgb(236, 236, 236)";
        prev.style.opacity = "0";
        next.style.opacity = "0";
      }, 0);
    }
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
  const parseInlineStyle = (styleString: string): React.CSSProperties => {
    if (!styleString) return {};
    // добавляем свойство cursor: pointer
    const finalStyle = styleString + ";cursor: pointer;";

    return finalStyle.split(";").reduce((acc, rule) => {
      const [prop, value] = rule.split(":").map((s) => s.trim());
      if (prop && value) {
        const jsProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        (acc as any)[jsProp] = value;
      }
      return acc;
    }, {} as React.CSSProperties);
  };

  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️

  // ⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️♻️⚙️
  const renderNode = (node: ProjectData | string): JSX.Element | null => {
    if (!node) return null;
    if (typeof node === "string") {
      return <span key={crypto.randomUUID()}>{node}</span>;
    }

    const Tag = node.tag as keyof JSX.IntrinsicElements;
    if (!Tag) return null;

    const voidTags = [
      "img",
      "input",
      "textarea",
      "br",
      "hr",
      "source",
      "track",
      "meta",
      "link",
      "canvas",
      "iframe",
    ];
    const isVoid = voidTags.includes(node.tag);

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
      setOpenInfoKey((prev: any) => (prev === node._key ? null : node._key));

    const handleDoubleClick = () => {
      setProject((prev) => {
        if (!prev) return prev;
        const updated = removeNodeByKey(prev, node._key);
        return updated || null;
      });
      setOpenInfoKey(null);
    };
    const getStyleProperty = (styleString: string, prop: string) => {
      if (!styleString) return "";
      const match = styleString.match(new RegExp(`${prop}\\s*:\\s*([^;]+);?`));
      return match ? match[1].trim() : "";
    };

    // ---------------- VOID ELEMENT ----------------
    if (isVoid) {
      return (
        <Tag
          key={node._key}
          {...(node.attributes || {})}
          draggable={editMode}
          onDragStart={editMode ? (e) => handleDragStart(e, node) : undefined}
          onDragOver={editMode ? (e) => handleDragOver(e, node) : undefined}
          onDragLeave={editMode ? handleDragLeave : undefined}
          onDrop={editMode ? (e) => handleDrop(e, node, true) : undefined}
          className={`${editMode ? "card" : node.class} render-tag relative cursor-${editMode ? "grab" : "default"}`}
          style={{
            ...parseInlineStyle(node.style),
            border:
              openInfoKey === node._key
                ? "2px solid red"
                : getStyleProperty(node.style, "border"),
          }}
          onClick={handleNodeClick}
        />
      );
    } else {
      // ---------------- NORMAL ELEMENT ----------------
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
        : null;

      return (
        <Tag
          key={`${node._key}-${node.text}`}
          draggable={editMode}
          onDragStart={editMode ? (e) => handleDragStart(e, node) : undefined}
          onDragOver={editMode ? (e) => handleDragOver(e, node) : undefined}
          onDragLeave={editMode ? handleDragLeave : undefined}
          onDrop={editMode ? (e) => handleDrop(e, node, true) : undefined}
          className={`${editMode ? "card" : node.class} render-tag relative cursor-${editMode ? "grab" : "default"}`}
          id={node.attributes?.id}
          htmlFor={node.attributes?.for}
          href={node.attributes?.href}
          rel={node.attributes?.rel}
          style={(() => {
            const originalStyle = {
              ...parseInlineStyle(node.style),
              border:
                openInfoKey === node._key
                  ? "2px solid red"
                  : getStyleProperty(node.style, "border"),
            };
            const baseStyle = editMode
              ? Object.fromEntries(
                  Object.entries(originalStyle).filter(([key]) =>
                    /^(display|flex|grid|justify|align)/i.test(key)
                  )
                )
              : originalStyle;

            if (!editMode) return baseStyle;

            const editorStyle: React.CSSProperties = {
              padding: "0 18px",
              fontSize: "12px",
              cursor: "grab",
              position: "relative",
              transition: "opacity 0.2s ease, border 0.2s ease",
              overflow: "hidden",
              border:
                openInfoKey === node._key ? "2px solid red" : "1px solid #aaa",
            };

            return { ...baseStyle, ...editorStyle };
          })()}
          onClick={handleNodeClick}
        >
          {node.class === "baza" ? "baza" : editMode ? node.text : node.text}
          {children}
        </Tag>
      );
    }
  };

  return renderNode;
};

export default createRenderNode;

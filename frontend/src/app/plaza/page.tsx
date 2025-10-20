"use client";
import React, { useEffect, useState } from "react";
import "./plaza.scss";
import Image from "next/image";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  REMOVE_PROJECT,
} from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER, GET_JSON_DOCUMENT } from "@/apollo/queries";
// import EditorComponent from "@/components/EditorComponent/EditorComponent";
import AdminComponent from "@/components/AdminComponent/AdminComponent";
import VisualComponent from "@/components/VisualComponent/VisualComponent";
import htmlUnitsToJson from "@/utils/htmlUnitsToJson";
import { useStateContext } from "@/providers/StateProvider";
import jsonToHtml from "@/utils/jsonToHtml";
import Input from "@/components/ui/Input/Input";
const Plaza = () => {
  const { htmlJson, setHtmlJson, user, setModalMessage } = useStateContext();
  const [code, setCode] = useState<Unit[]>([]);
  const [textContent, setTextContent] = useState<string>("");
  const [nameProject, setNameProject] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [projects, setProjects] = useState<any>([]);
  const [project, setProject] = useState<string>(null);
  // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  const {
    data: userData,
    loading,
    error,
  } = useQuery(GET_ALL_PROJECTS_BY_USER, {
    variables: { userId: user?.id },
  });

  const [createProject] = useMutation(CREATE_PROJECT);
  const [updateProject] = useMutation(UPDATE_PROJECT);
  const [removeProject] = useMutation(REMOVE_PROJECT);
  // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢

  useEffect(() => {
    console.log("<====isEditing====>", isEditing);
    if (!htmlJson || htmlJson.length === 0 || isEditing) return;
    console.log("<====htmlJson====>", htmlJson);
    const res = jsonToHtml(htmlJson);
    setCode(res);
    const firstText = res[0]?.unitText;
    if (firstText && firstText !== "") {
      setTextContent(firstText);
    }
  }, [htmlJson]);

  useEffect(() => {
    if (userData?.getAllProjectsByUser) {
      setProjects(userData.getAllProjectsByUser);
    }
  }, [userData]);

  useEffect(() => {
    if (code) {
      console.log("<==== code====>", code);
    }
  }, [code]);

  // 🔹 Обновляем unitText при изменении textContent
  useEffect(() => {
    if (!code || code.length === 0) return;
    const updated = code.map((el) => ({
      ...el,
      unitText: textContent, // ❗ всегда берем новое значение
    }));
    setCode(updated);
  }, [textContent]);

  useEffect(() => {
    if (textContent) {
      console.log("<====textContent====>", textContent);
    }
  }, [textContent]);
  // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  const handleSetProject = async (e) => {
    e.preventDefault();
    const result = htmlUnitsToJson(code, textContent);

    if (!user) {
      setModalMessage("Please log in to create a project.");
      return;
    }
    if (result.length === 0 || !nameProject) {
      setModalMessage("Please fill in all fields.");
      return;
    }
    try {
      await createProject({
        variables: {
          ownerId: user?.id,
          name: nameProject,
          data: JSON.stringify(result),
        },
        refetchQueries: [
          { query: GET_ALL_PROJECTS_BY_USER, variables: { userId: user.id } },
        ],
      });
      setNameProject("");
      setTextContent("");

      setModalMessage("Project created successfully!");
    } catch (err) {
      console.error("Error:", err);
      setModalMessage(`${err}`);
    }
  };
  // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  const handleRemoveProject = async (id) => {
    try {
      await removeProject({
        variables: {
          projectId: id,
        },
        refetchQueries: [
          { query: GET_ALL_PROJECTS_BY_USER, variables: { userId: user.id } },
        ],
      });
      setTextContent("");
      setModalMessage("Project removed successfully!");
    } catch (err) {
      console.error("Error:", err);
      setModalMessage(`${err}`);
    }
  };
  // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  const handleUpdateProject = async (id) => {
    await updateProject({
      variables: {
        projectId: id,
        data: JSON.stringify(htmlUnitsToJson(code, textContent)),
      },
      refetchQueries: [
        { query: GET_ALL_PROJECTS_BY_USER, variables: { userId: user.id } },
      ],
    });
    setModalMessage("Project updated successfully!");
  };
  // 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢
  return (
    <div className="plaza mt-20">
      <div className="container">
        <div className="flex flex-col ">
          <h5 className="text-3xl">New Project</h5>
          <div className="relative">
            <Input
              data="Project Name"
              typeInput="text"
              value={nameProject}
              onChange={(e) => setNameProject(e.target.value)}
            />{" "}
            <div className="absolute right-[0%] top-[50%] transform-[translateY(-50%)] z-50">
              <button
                className="btn btn-primary"
                onClick={(e) => {
                  handleSetProject(e);
                }}
              >
                Save as a project
              </button>
            </div>
          </div>
          <hr className="mt-4 mb-4 border-slate-200" />
          <h5 className="text-3xl">
            All Projects by user: &nbsp;
            {user && <span>{user.name}</span>}
          </h5>

          <div className="flex flex-col gap-2">
            {projects.length > 0 &&
              projects.map((pro) => (
                <div
                  key={pro.id}
                  className="border-1 border-slate-500  rounded bg-slate-100 relative"
                >
                  <button
                    className="btn w-full h-full p-1"
                    onClick={() => {
                      setIsEditing(false);
                      setProject(pro);
                      setHtmlJson(JSON.parse(pro.data));
                    }}
                  >
                    {pro.name}
                  </button>
                </div>
              ))}
          </div>
        </div>

        <hr className="mt-4 mb-4 border-slate-200" />

        {project && (
          <div className="flex items-center gap-2">
            Project: <h3> {project?.name} </h3>
            <button
              onClick={() => {
                setProject(null);
                setTextContent("");
                setCode([]);
                setHtmlJson(null);
                setIsEditing(false);
              }}
              className="btn btn-primary"
            >
              clear
            </button>
            <button
              className="btn btn-primary "
              onClick={() => {
                handleUpdateProject(project.id);
              }}
            >
              Update Project
            </button>
            <button
              className="btn btn-allert "
              onClick={(e) => {
                handleRemoveProject(project.id);
              }}
            >
              Remove Project
            </button>
          </div>
        )}

        <div className="h-full grid grid-cols-[15%_1fr] gap-2  mb-4">
          <AdminComponent />
          <VisualComponent
            code={code}
            setCode={setCode}
            textContent={textContent}
            setTextContent={setTextContent}
            setIsEditing={setIsEditing}
          />
        </div>
      </div>
    </div>
  );
};

export default Plaza;

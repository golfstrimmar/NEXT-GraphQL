"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_FIGMA_PROJECT, REMOVE_FIGMA_PROJECT } from "@/apollo/mutations";
import { GET_FIGMA_PROJECTS_BY_USER } from "@/apollo/queries";
import Image from "next/image";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/Loading/Loading";
import Input from "@/components/ui/Input/Input";
import { AnimatePresence, motion } from "framer-motion";
import "./figma.scss";

// -------
export default function FigmaPage() {
  const { user } = useStateContext();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  // ---
  const [projects, setProjects] = useState<any[]>([]);
  const { setModalMessage } = useStateContext();
  const [name, setName] = useState("");
  const [fileKey, setFileKey] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [token, setToken] = useState("");
  const { data } = useQuery(GET_FIGMA_PROJECTS_BY_USER, {
    variables: { userId: user?.id },
    skip: !user,
    fetchPolicy: "cache-and-network",
  });

  // ----------
  const [createFigmaProject, { loading }] = useMutation(CREATE_FIGMA_PROJECT);
  const [removeFigmaProject] = useMutation(REMOVE_FIGMA_PROJECT);

  // useSubscription(FIGMA_PROJECT_CREATED_SUBSCRIPTION, {
  //   onData: ({ data }) => {
  //     if (!data.data) return;
  //     console.log("<====data====>", data);
  //     const newProject = data.data.figmaProjectCreated;
  //     console.log("<==== New Figma project via subscription:====>", newProject);

  //     setProjects((prev) => {
  //       // проверка, чтобы не было дубликатов
  //       if (!prev.find((p) => p.id === newProject.id)) {
  //         return [...prev, newProject];
  //       }
  //       return prev;
  //     });
  //   },
  // });

  // -----------------------
  useEffect(() => {
    if (data?.figmaProjectsByUser) {
      setProjects(data.figmaProjectsByUser);
    }
  }, [data]);

  useEffect(() => {
    if (projects.length > 0) {
      console.log("<====projects====>", projects);
    }
  }, [projects]);

  // -----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name === "" || fileKey === "" || nodeId === "" || token === "") {
      setModalMessage("All fields are required.");
      return;
    }
    console.log("<========>", user.id, name, fileKey, nodeId, token);
    try {
      const { data } = await createFigmaProject({
        variables: { ownerId: user.id, name, fileKey, nodeId, token },
      });

      if (data.createFigmaProject) {
        console.log(
          "<========> Created figma project: <========>",
          data.createFigmaProject
        );
        setProjects((prev) => {
          // проверка, чтобы не было дубликатов
          if (!prev.find((p) => p.id === data.createFigmaProject)) {
            return [...prev, data.createFigmaProject];
          }
          return prev;
        });
        setModalOpen(false);
        setName("");
        setFileKey("");
        setNodeId("");
        setToken("");
      }
    } catch (err: any) {
      setModalOpen(false);
      setModalMessage(err.message);
    }
  };
  // -----------------------
  // const fetchFigma = async (project: any) => {
  //   if (!project?.id) return;
  //   console.log("<====📦 project ====>", project);
  //   setColors([]);
  //   setProjectName(project.name);

  //   try {
  //     setLoadingImg(true);
  //     setModalMessage(null);

  //     // 📡 Запрашиваем проект из GraphQL
  //     const { data } = await client.query({
  //       query: GET_FIGMA_PROJECT_DATA,
  //       variables: { projectId: project.id },
  //       fetchPolicy: "network-only",
  //     });

  //     const projectData = data.getFigmaProjectData;

  //     if (!projectData?.images) throw new Error("Images not found");

  //     const url = projectData.images[project.nodeId];
  //     if (!url) throw new Error("Image URL not found");

  //     setImageUrl(url);
  //     setFileData(projectData.file);

  //     // 🎨 Извлекаем цвета
  //     // const extractedColors = extractDesignColors(
  //     //   projectData.file,
  //     //   project.nodeId
  //     // );
  //     // setColors(extractedColors);

  //     // 🔤 Извлекаем шрифты
  //     // const extractedFonts = extractTypography(
  //     //   projectData.file,
  //     //   project.nodeId
  //     // );
  //     // setFonts(extractedFonts);

  //     // 🪄 Формируем строку импорта Google Fonts
  //     // const importString = generateGoogleFontsImport(extractedFonts);
  //     // setGoogleFontsImport(importString);

  //     // // ☁️ Загружаем изображения в Cloudinary через GraphQL
  //     // const uploadRes = await uploadFigmaImagesToCloudinary({
  //     //   variables: { projectId: project.id },
  //     // });

  //     // const uploaded = uploadRes.data?.uploadFigmaImagesToCloudinary || [];
  //     // console.log("☁️ Uploaded to Cloudinary:", uploaded);

  //     // if (uploaded.length > 0) {
  //     //   setImagesFromFigma(uploaded);
  //     //   setModalMessage(`Uploaded ${uploaded.length} images to Cloudinary.`);
  //     // } else {
  //     //   setModalMessage("No images were uploaded to Cloudinary.");
  //     //   setImagesFromFigma([]);
  //     // }
  //   } catch (err: any) {
  //     console.error("❌ Ошибка при загрузке:", err);
  //     setModalMessage(err.message);
  //   } finally {
  //     setLoadingImg(false);
  //   }
  // };

  // =======================
  const handleRemoved = async (id) => {
    const removedProject = await removeFigmaProject({
      variables: { figmaProjectId: id },
    });
    setProjects((prev) => {
      return prev.filter((p) => p.id !== id);
    });
    setModalMessage("Project removed");
    console.log("<====removedProject====>", removedProject);
  };

  // =======================
  return (
    <div className="figma">
      <div className="container">
        <h2 className="text-center mb-4">Figma projects</h2>
        <div className="figma-projects">
          {projects.length === 0 && <p>No projects found</p>}
          <ul className="grid grid-cols-[repeat(auto-fit,_minmax(500px,_1fr))] gap-2">
            {projects.map((proj) => (
              <li
                key={proj.id}
                className="bg-[#f3f3f3] p-2 flex flex-col gap-2"
              >
                <div className=" grid grid-cols-[max-content_1fr] gap-4">
                  <div className="flex flex-col gap-1 ">
                    <p>
                      Project id: <strong>{proj.id}</strong>
                    </p>{" "}
                    <p>
                      Project name: <strong>{proj.name}</strong>
                    </p>
                    <p>File Key: {proj.fileKey}</p>
                    <p>Node ID: {proj.nodeId}</p>
                  </div>
                  {proj.previewUrl && (
                    <div className="max-h-[300px] overflow-y-auto">
                      <img
                        src={proj.previewUrl}
                        alt="Figma Preview"
                        className="border   rounded-sm shadow-[0_0_10px_0_rgba(0,0,0,0.4)]"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 max-h-[26px] mt-auto">
                  <Link href={`/figma/${proj.id}`} className="btn btn-primary ">
                    See details
                  </Link>

                  <button
                    className="btn btn-allert"
                    onClick={() => handleRemoved(proj.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {/* =========== create project  ============ */}
          <div className="inline-block mt-2">
            {!modalOpen && (
              <Button
                onClick={() => {
                  if (!user) {
                    setModalMessage(
                      "You must be logged in to create a project."
                    );
                    setTimeout(() => {
                      router.push("/login");
                      return;
                    }, 2000);
                  } else {
                    setModalOpen(true);
                  }
                }}
                buttonText="Create project Figma"
              />
            )}
          </div>
        </div>

        {loading && <Loading />}
        {/* ✅✅✅✅✅✅ КАРТИНКИ */}
        {/* {imagesFromFigma.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            {imagesFromFigma.map((img) => (
              <div key={img.imageRef} className="flex flex-col items-center">
                <img
                  src={img.url}
                  alt={img.imageRef}
                  className="w-32 h-32 object-contain border rounded-lg shadow"
                />
                <p className="text-xs text-gray-500 mt-1">{img.imageRef}</p>
              </div>
            ))}
          </div>
        )} */}
      </div>
      <AnimatePresence>
        {modalOpen && (
          <div onClick={() => setModalOpen(false)}>
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.8,
                y: -100,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -100 }}
              transition={{ duration: 0.3 }}
              className=" w-[100vw] h-[100vh] fixed top-0 left-0 flex items-center justify-center bg-black bg-opacity-90 z-50"
              onClick={(e) => {
                e.stopPropagation();
                if (
                  !e.target.closest(".modal-content") &&
                  !e.target.classList.contains("modal-content")
                ) {
                  setModalOpen(false);
                }
              }}
            >
              <button className="absolute top-[65px] right-2 z-3000">
                <Image
                  src="./svg/cross.svg"
                  alt="close"
                  width={20}
                  height={20}
                  onClick={() => setModalOpen(false)}
                />
              </button>
              <form
                onSubmit={handleSubmit}
                className="modal-content flex flex-col min-w-[500px] bg-white p-6 rounded-lg gap-4"
              >
                <Input
                  typeInput="text"
                  id="name"
                  data="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Input
                  typeInput="text"
                  id="name"
                  data="File Key"
                  value={fileKey}
                  onChange={(e) => setFileKey(e.target.value)}
                />

                <Input
                  typeInput="text"
                  id="name"
                  data="Node ID"
                  value={nodeId}
                  onChange={(e) => setNodeId(e.target.value)}
                />

                <Input
                  typeInput="text"
                  id="name"
                  data="Figma Token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />

                <div className="flex gap-2">
                  <button
                    className="btn btn-primary "
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="btn btn-allert"
                    type="button"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

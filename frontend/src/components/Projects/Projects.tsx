"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "./projects.scss";
import { useStateContext } from "@/providers/StateProvider";
import { useMutation, useApolloClient } from "@apollo/client";
import { FIND_PROJECT, REMOVE_PROJECT } from "@/apollo/mutations";
import Image from "next/image";
const Projects = () => {
  const { user, setUser, setHtmlJson } = useStateContext();
  const [findProject] = useMutation(FIND_PROJECT);
  const [removeProject] = useMutation(REMOVE_PROJECT);

  const handleProjects = async (p) => {
    const { data } = await findProject({ variables: { projectId: p.id } });
    console.log("<====data====>", data.findProject.data);
    const projectData = JSON.parse(data.findProject.data);

    setHtmlJson((prev) => {
      const cart = {
        type: "div",
        attributes: {
          class: "cart",
        },
      };
      let temp;
      temp = prev.filter((p) => !p.attributes.class?.includes("cart"));
      console.log("<====temp====>", temp);
      if (prev.length === 0) {
        temp = projectData;
      } else {
        temp = [...temp, ...projectData];
      }

      return [...temp, cart];
    });
  };
  const handleRemoved = async (id) => {
    const removedProject = await removeProject({
      variables: { projectId: id },
    });
    console.log("<====removedProject====>", removedProject);
    setUser((prevUser) => ({
      ...prevUser,
      projects: prevUser.projects.filter(
        (p) => p.id !== removedProject.data.removeProject
      ),
    }));
  };
  return (
    <div>
      <h4> Your projects:</h4>
      <ul className="editor__projects grid grid-cols-[repeat(auto-fit,_minmax(50px,200px))]  gap-1">
        {user?.projects?.map((p, index) => (
          <li
            key={index}
            className="border relative center rounded-sm overflow-hidden"
          >
            <button
              className="w-full p-1  hover:bg-slate-200 transition-colors"
              onClick={() => handleProjects(p)}
            >
              {p.name}
            </button>
            <button
              onClick={() => {
                handleRemoved(p.id);
              }}
              className="hover:bg-red-200 transition-colors p-1 mr-1 rounded absolute top-[50%] right-1 transform translate-y-[-50%]"
            >
              <Image
                src="./svg/cross.svg"
                width={15}
                height={15}
                alt="remove"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;

"use client";
import React, { useState, useMemo } from "react";
import { useStateContext } from "@/providers/StateProvider";
import "./createnewproject.scss";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { CREATE_PROJECT } from "@/apollo/mutations";
import { GET_ALL_PROJECTS_BY_USER } from "@/apollo/queries";
import Input from "@/components/ui/Input/Input";
import PProject from "@/types/PProject";

interface CreateNewProjectProps {
  project: PProject;
}

const CreateNewProject = () => {
  const { htmlJson, user, setModalMessage } = useStateContext();
  const [newProjectName, setNewProjectName] = useState<string>("");
  const variables = useMemo(() => ({ userId: user?.id }), [user?.id]);
  const [createProject] = useMutation(CREATE_PROJECT, {
    refetchQueries: [{ query: GET_ALL_PROJECTS_BY_USER, variables }],
    awaitRefetchQueries: true,
  });

  const createNewProject = async () => {
    if (!newProjectName || !user) {
      setModalMessage(" All fields are required.");
      return;
    }
    if (!htmlJson) {
      setModalMessage(" Data fields are required.");
      return;
    }
    try {
      await createProject({
        variables: {
          ownerId: user.id,
          name: newProjectName,
          data: htmlJson,
        },
      });

      setModalMessage(`Project ${newProjectName} created.`);
      setNewProjectName("");
    } catch (error) {
      setModalMessage(error);
    }
  };
  return (
    <div className="createnewproject">
      <hr className="bordered-2 border-slate-200 mt-2 mb-2" />
      <h5>Create a new Ulon project</h5>
      <div className="relative">
        <Input
          typeInput="text"
          data="Project name"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
        <div className="absolute z-20 top-[50%] right-1 -translate-y-[50%]!">
          <button
            type="button"
            className="btn btn-primary h-full"
            onClick={createNewProject}
          >
            Create Ulon Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNewProject;

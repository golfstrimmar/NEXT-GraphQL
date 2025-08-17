"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import dynamic from "next/dynamic";

const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  { ssr: false }
);
import { USER_CREATED } from "@/apollo/subscriptions";
import { GET_USERS } from "@/apollo/queries";
import { useQuery, useSubscription } from "@apollo/client";
type HtmlNode = {
  type: string;
  attributes?: {
    class?: string;
    children?: HtmlNode[] | HtmlNode | string;
    [key: string]: any;
  };
};

type nodeToAdd = {
  type: number;
};
type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};
interface StateContextType {
  htmlJson: HtmlNode[];
  setHtmlJson: React.Dispatch<React.SetStateAction<HtmlNode[]>>;
  nodeToAdd: nodeToAdd | null;
  setNodeToAdd: React.Dispatch<React.SetStateAction<nodeToAdd | null>>;
  result: string | undefined;
  setResult: React.Dispatch<React.SetStateAction<string | undefined>>;
  transformTo: boolean;
  setTransformTo: React.Dispatch<React.SetStateAction<boolean>>;
  modalMessage: string;
  setModalMessage: React.Dispatch<React.SetStateAction<string>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: (message: string, duration?: number) => void;
  showIsModal: boolean;
  setShowIsModal: React.Dispatch<React.SetStateAction<boolean>>;
  resHtml: string;
  setResHtml: React.Dispatch<React.SetStateAction<string>>;
  resScss: string;
  setResScss: React.Dispatch<React.SetStateAction<string>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[] | null;
  setUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
}

const StateContext = createContext<StateContextType | null>(null);

export function StateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);
  const [users, setUsers] = useState<User[] | null>(null);
  const [htmlJson, setHtmlJson] = useState<HtmlNode[]>([]);
  const [nodeToAdd, setNodeToAdd] = useState<nodeToAdd | null>(null);
  const [result, setResult] = useState<string>();
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showIsModal, setShowIsModal] = useState<boolean>(false);
  const [transformTo, setTransformTo] = useState<boolean>(false);
  const [resHtml, setResHtml] = useState<string>("");
  const [resScss, setResScss] = useState<string>("");
  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const { data: subscriptionData } = useSubscription(USER_CREATED);
  useEffect(() => {
    if (data?.users) {
      console.log("<====data?.users====>", data.users);
      setUsers(data.users);
    }
  }, [data]);
  useEffect(() => {
    if (subscriptionData?.userCreated) {
      console.log(
        "<====subscriptionData?.userCreated====>",
        subscriptionData.userCreated
      );
      setUsers((prev) => [...(prev || []), subscriptionData.userCreated]);
      refetch();
    }
  }, [subscriptionData]);
  const showModal = (message: string, duration = 2000) => {
    setModalMessage(message);
    setIsModalOpen(true);
    setShowIsModal(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setModalMessage("");
    }, duration);
  };
  useEffect(() => {
    if (modalMessage) {
      showModal(modalMessage);
    }
  }, [modalMessage]);
  const initialize = async () => {
    try {
      // Проверяем доступность localStorage
      if (typeof window === "undefined") return;

      const stored = localStorage.getItem("htmlJson");
      if (stored) {
        setHtmlJson(JSON.parse(stored));
      } else {
        const res = await fetch("/data/initialTags.json");
        // const res = await fetch("/data/flex-col.json");
        if (!res.ok) throw new Error("Failed to fetch initial tags");
        const json = await res.json();
        localStorage.setItem("htmlJson", JSON.stringify(json));
        setHtmlJson(json);
      }
    } catch (error) {
      console.error("Initialization error:", error);
      setHtmlJson([]); // Fallback пустого состояния
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (htmlJson && htmlJson.length > 0) {
      localStorage.setItem("htmlJson", JSON.stringify(htmlJson));
    }
  }, [htmlJson]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (nodeToAdd) {
      console.log("<=====🧪nodeToAdd🧪=====>", nodeToAdd);
      // codeRemoveActive();
    }
  }, [nodeToAdd]);

  useEffect(() => {
    if (result) {
      console.log("<====💥💥💥 result====>", result);
    }
  }, [result]);

  useEffect(() => {
    if (resHtml) {
      console.log("<====💥💥💥 resHtml====>", resHtml);
    }
  }, [resHtml]);
  useEffect(() => {
    if (resScss) {
      console.log("<====💥💥💥 resScss====>", resScss);
    }
  }, [resScss]);

  // ----------------------------------------------
  return (
    <StateContext.Provider
      value={{
        htmlJson,
        setHtmlJson,
        nodeToAdd,
        setNodeToAdd,
        result,
        setResult,
        setModalMessage,
        transformTo,
        setTransformTo,
        resHtml,
        setResHtml,
        resScss,
        setResScss,
        user,
        setUser,
        users,
        setUsers,
      }}
    >
      {showIsModal && (
        <ModalMessage open={isModalOpen} message={modalMessage} />
      )}
      {children}
    </StateContext.Provider>
  );
}

export function useStateContext() {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
}

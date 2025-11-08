"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client";
import { GET_USERS, GET_JSON_DOCUMENT } from "@/apollo/queries";
import { USER_CREATED } from "@/apollo/subscriptions";

const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  { ssr: false }
);

type HtmlNode = {
  type: string;
  attributes?: {
    class?: string;
    children?: HtmlNode[] | HtmlNode | string;
    [key: string]: any;
  };
};

type nodeToAdd = { type: number };

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
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[] | null;
  setUsers: React.Dispatch<React.SetStateAction<User[] | null>>;
  modalMessage: string;
  setModalMessage: React.Dispatch<React.SetStateAction<string>>;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: (message: string, duration?: number) => void;
  updateHtmlJson: (next: HtmlNode[]) => void;
  undo: () => void;
  redo: () => void;
  undoStack: HtmlNode[][];
  redoStack: HtmlNode[][];
}

const StateContext = createContext<StateContextType | null>(null);

export function StateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [htmlJson, setHtmlJson] = useState<HtmlNode[]>([]);
  const [nodeToAdd, setNodeToAdd] = useState<nodeToAdd | null>(null);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { data: usersData, subscribeToMore: subscribeToUsers } = useQuery(
    GET_USERS,
    { fetchPolicy: "cache-and-network" }
  );

  const { data: jsonData } = useQuery(GET_JSON_DOCUMENT, {
    variables: { name: "initialTags" },
    fetchPolicy: "network-only",
  });
  const [undoStack, setUndoStack] = useState<HtmlNode[][]>([]);
  const [redoStack, setRedoStack] = useState<HtmlNode[][]>([]);

  // ===================================
  const updateHtmlJson = (
    nextHtmlJson: HtmlNode[] | ((prev: HtmlNode[]) => HtmlNode[])
  ) => {
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(htmlJson))]);
    setRedoStack([]);
    if (typeof nextHtmlJson === "function") {
      setHtmlJson((prev) => nextHtmlJson(JSON.parse(JSON.stringify(prev))));
    } else {
      setHtmlJson(JSON.parse(JSON.stringify(nextHtmlJson)));
    }
  };

  const undo = () => {
    console.log("<====undoStack====>", undoStack);

    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));
    setRedoStack((stack) => [...stack, JSON.parse(JSON.stringify(htmlJson))]);
    setHtmlJson(prev);
  };

  const redo = () => {
    console.log("<====redoStack====>", redoStack);
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, -1));
    setUndoStack((stack) => [...stack, JSON.parse(JSON.stringify(htmlJson))]);
    setHtmlJson(next);
  };

  // ==================== INIT USER ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // ==================== INIT USERS + SUB ====================
  useEffect(() => {
    if (usersData?.users) setUsers(usersData.users);

    const unsubscribe = subscribeToUsers({
      document: USER_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const newUser = subscriptionData.data.userCreated;
        setUsers((prevUsers) =>
          prevUsers ? [...prevUsers, newUser] : [newUser]
        );
        return { users: [...prev.users, newUser] };
      },
    });

    return () => unsubscribe();
  }, [usersData, subscribeToUsers]);

  // ==================== MODAL ====================
  const showModal = (message: string, duration = 2000) => {
    setModalMessage(message);
    setIsModalOpen(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setModalMessage("");
    }, duration);
  };
  useEffect(() => {
    if (modalMessage) showModal(modalMessage);
  }, [modalMessage]);
  // ==================== INIT HTML JSON ====================
  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log(
      "<=🚀🚀🚀🚀===jsonData.jsonDocumentByName Provider===🚀🚀🚀🚀=>",
      jsonData?.jsonDocumentByName
    );
    const stored = localStorage.getItem("htmlJson");
    if (stored && stored !== "[]") {
      setHtmlJson(JSON.parse(stored));
    } else if (jsonData) {
      const initialJson = jsonData?.jsonDocumentByName?.content[0];
      localStorage.setItem("htmlJson", JSON.stringify(initialJson));
      console.log("<=🚀🚀🚀🚀===initialJson====🚀🚀🚀🚀>", initialJson);
      setHtmlJson(initialJson);
      localStorage.setItem("htmlJson", JSON.stringify(initialJson));
    } else {
      setHtmlJson([]);
    }
  }, [jsonData]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (
      (htmlJson === null || htmlJson === undefined || htmlJson.length === 0) &&
      jsonData
    ) {
      // setUndoStack([]);
      // setRedoStack([]);
      const initialJson = jsonData?.jsonDocumentByName?.content[0];

      if (initialJson) {
        // 🧩 создаём новый объект (глубокая копия)
        const clone = JSON.parse(JSON.stringify(initialJson));

        // сохраняем в localStorage и в состояние
        localStorage.setItem("htmlJson", JSON.stringify(clone));
        updateHtmlJson(clone); // <-- гарантирует новое значение (новая ссылка)
      } else {
        // если вдруг jsonData пустое — обнуляем
        updateHtmlJson([]);
        localStorage.setItem("htmlJson", "[]");
      }
    } else {
      // сохраняем текущее состояние в localStorage
      localStorage.setItem("htmlJson", JSON.stringify(htmlJson));
    }
  }, [htmlJson, jsonData]);

  return (
    <StateContext.Provider
      value={{
        htmlJson,
        setHtmlJson,
        nodeToAdd,
        setNodeToAdd,
        user,
        setUser,
        users,
        setUsers,
        modalMessage,
        setModalMessage,
        isModalOpen,
        setIsModalOpen,
        showModal,
        updateHtmlJson,
        undo,
        redo,
        undoStack,
        redoStack,
      }}
    >
      {isModalOpen && (
        <ModalMessage open={isModalOpen} message={modalMessage} />
      )}
      {children}
    </StateContext.Provider>
  );
}

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context)
    throw new Error("useStateContext must be used within a StateProvider");
  return context;
}

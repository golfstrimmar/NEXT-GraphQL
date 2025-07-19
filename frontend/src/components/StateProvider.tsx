"use client";
<<<<<<< HEAD

=======
>>>>>>> simple
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import User from "@/types/user";
import dynamic from "next/dynamic";
const ModalMessage = dynamic(
  () => import("@/components/ModalMessage/ModalMessage"),
  { ssr: false }
);
interface StateContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  showModal: (message: string, duration?: number) => void;
  modalMessage: string;
  isModalOpen: boolean;
<<<<<<< HEAD
=======
  chats: Chat[];
>>>>>>> simple
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export function StateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showIsModal, setShowIsModal] = useState<boolean>(false);

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
    console.log("👀 user changed in StateProvider:", user);
  }, [user]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
      }
    } catch (err) {
      console.error("Error restoring user:", err);
    }
  }, []);

  return (
    <StateContext.Provider
      value={{ user, setUser, showModal, modalMessage, isModalOpen }}
    >
      {children}
      {showIsModal && (
        <ModalMessage open={isModalOpen} message={modalMessage} />
      )}
    </StateContext.Provider>
  );
}

export function useStateContext() {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
}

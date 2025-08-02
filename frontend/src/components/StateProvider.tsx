"use client";
import {createContext, ReactNode, useContext, useEffect, useState,} from "react";
import dynamic from "next/dynamic";

const ModalMessage = dynamic(
    () => import("@/components/ModalMessage/ModalMessage"),
    {ssr: false}
);
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

interface StateContextType {
    htmlJson: HtmlNode[];
    setHtmlJson: React.Dispatch<React.SetStateAction<HtmlNode[]>>;
    nodeToAdd: nodeToAdd | null;
    setNodeToAdd: React.Dispatch<React.SetStateAction<nodeToAdd | null>>;
    result: string | undefined;
    setResult: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const StateContext = createContext<StateContextType | null>(null);

export function StateProvider({children}: { children: ReactNode }) {
    const [htmlJson, setHtmlJson] = useState<HtmlNode[]>([]);
    const [nodeToAdd, setNodeToAdd] = useState<nodeToAdd | null>(null);
    const [result, setResult] = useState<string>();
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
            console.log('<=====🧪nodeToAdd🧪=====>', nodeToAdd)
            // codeRemoveActive();
        }
    }, [nodeToAdd]);

    useEffect(() => {
        if (result) {
            console.log("<====💥💥💥 result====>", result);
        }
    }, [result]);

    return (
        <StateContext.Provider
            value={{
                htmlJson,
                setHtmlJson,
                nodeToAdd,
                setNodeToAdd,
                result,
                setResult,
                setModalMessage
            }}
        >
            {showIsModal && (
                <ModalMessage open={isModalOpen} message={modalMessage}/>
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

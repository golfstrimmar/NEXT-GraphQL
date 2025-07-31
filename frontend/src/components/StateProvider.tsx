"use client";
import {createContext, ReactNode, useContext, useEffect, useState,} from "react";
import codeRemoveActive from "@/utils/codeRemoveActive";

type HtmlNode = {
    type: string;
    attributes?: {
        class?: string;
        children?: HtmlNode[] | HtmlNode | string;
        [key: string]: any;
    };
};

type NodeToEdit = {
    type: number;
};

interface StateContextType {
    htmlJson: HtmlNode[];
    setHtmlJson: React.Dispatch<React.SetStateAction<HtmlNode[]>>;
    nodeToEdit: NodeToEdit | null;
    setNodeToEdit: React.Dispatch<React.SetStateAction<NodeToEdit | null>>;
    result: string | undefined;
    setResult: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const StateContext = createContext<StateContextType | null>(null);

export function StateProvider({children}: { children: ReactNode }) {
    const [htmlJson, setHtmlJson] = useState<HtmlNode[]>([]);
    const [nodeToEdit, setNodeToEdit] = useState<NodeToEdit | null>(null);
    const [result, setResult] = useState<string>();

    const initialize = async () => {
        try {
            // Проверяем доступность localStorage
            if (typeof window === "undefined") return;

            const stored = localStorage.getItem("htmlJson");
            if (stored) {
                setHtmlJson(JSON.parse(stored));
            } else {
                // const res = await fetch("/data/initialTags.json");
                const res = await fetch("/data/flex-col.json");
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
        if (!nodeToEdit) {
            codeRemoveActive();
        }
    }, [nodeToEdit]);

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
                nodeToEdit,
                setNodeToEdit,
                result,
                setResult,
            }}
        >
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

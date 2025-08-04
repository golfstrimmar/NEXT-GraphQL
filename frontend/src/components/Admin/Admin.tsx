'use client';
import React, {useState} from 'react';
import './admin.scss';
import {useStateContext} from "@/components/StateProvider";
import ButtonUnit from "@/components/ButtonUnit/ButtonUnit";
import {AnimatePresence, motion} from "framer-motion";

interface PreviewProps {
    // Определи пропсы, если нужно
}

const Admin: React.FC<PreviewProps> = () => {
    const {htmlJson, setHtmlJson, nodeToAdd, setNodeToAdd} = useStateContext();
    const Buttons = [
        "section",
        "div",

        "p",
        "span",
        "a",
        "button",
        "ul",

        "li",
        "img",
        "svg",

        "br",
        "hr",
        "header",
        "footer",
        "nav",
        "strong",

        "ol",
    ];
    const headersByPanel = {
        // classes: ["flex", "flex-col"],
        snippets: [
            "imgs",
            "grid-2",
            "flex",
            "flex-col",
            "ul-grid-2",
            "ul-flex",
            "card",
        ],
        headers: ["h1", "h2", "h3", "h4", "h5", "h6"],
        tables: ["table1", "table", "tr", "td", "th", "thead", "tbody", "tfoot"],
    };

    const [openPanels, setOpenPanels] = useState({
        // classes: false,
        snippets: false,
        headers: false,
        tables: false,
    });
    // 📌📌📌📌📌📌📌📌📌📌📌
    const togglePanel = (panel: keyof typeof openPanels) => {
        setOpenPanels((prev) => {
            const newState = {};
            for (const key in prev) {
                newState[key] = false;
            }
            newState[panel] = !prev[panel];
            return newState;
        });
    };
// 🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️🗑️
    const clearStoreJsonHtml = async () => {
        const res = await fetch("/data/initialTags.json");
        if (!res.ok) throw new Error("Failed to fetch initial tags");
        const json = await res.json();
        localStorage.setItem("htmlJson", JSON.stringify(json));
        setHtmlJson(json);
    };


    return (
        <div className="admin
fixed
top-0
right-0
z-50
bg-gray-400
border-2 border-slate-500
rounded-sm
p-2
grid
grid-rows-[repeat(auto-fill,30px)]
gap-1
h-[100vh]
opacity-90">
            <button
                onClick={clearStoreJsonHtml}
                className=" btn btn-allert"
            >
                Clear
            </button>
            <button
                // onClick={(e) => {
                //     handleCopy(e);
                // }}
                className=" btn btn-primary"
            >
                ⇨ Result
            </button>

            {/*----------------------*/}
            {Buttons.map((button, index) => (
                <ButtonUnit info={button} key={index}/>
            ))}
            {/*----------------------*/}
            {Object.entries(openPanels).map(([key, value]) => (
                <div key={key} className="relative">
                    <button
                        onClick={() => togglePanel(key as keyof typeof openPanels)}
                        className="bg-amber-500 hover:bg-amber-800 py-1 px-1 text-sm rounded w-full"
                    >
                        ⇦ {key}
                    </button>

                    <AnimatePresence>
                        {value && (
                            <motion.div
                                initial={{opacity: 0, translateX: 0}}
                                animate={{opacity: 0.9, translateX: "-110%"}}
                                exit={{opacity: 0, translateX: 0}}
                                transition={{duration: 0.2, ease: [0.25, 0.8, 0.5, 1]}}
                                className="absolute
                        bg-gray-400
                        grid
                        grid-flow-row
                        auto-rows-[minmax(25px,_auto)]
                        gap-2
                        bottom-0
                        left-0
                        z-48
                        border-2  rounded-sm p-2  border-slate-500"
                            >
                                {headersByPanel[key]?.map((but, index) => (
                                    <ButtonUnit key={index} info={but}/>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}

            {/*----------------------*/}
        </div>
    );
};

export default Admin;
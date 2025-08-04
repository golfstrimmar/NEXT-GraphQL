'use client';
import React, {useState} from 'react';
import './testjson.scss';
import {useStateContext} from "@/components/StateProvider";

const TestJson: React.FC<TestJsonProps> = () => {
    const {
        htmlJson,
        setHtmlJson,
        nodeToEdit,
        setNodeToEdit,
        result,
        setResult
    } = useStateContext();
    const [open, setOpen] = useState<boolen>(false);


    return (
        <div className="w-full">
            <button
                onClick={() => {
                    setOpen(!open);
                }}
                className="btn btn-primary"
            >JSON
            </button>
            {open && (
                <div className="bg-orange-100">
                    {htmlJson && <pre>{JSON.stringify(htmlJson, null, 2)}</pre>}
                </div>
            )}
        </div>
    );
};

export default TestJson;
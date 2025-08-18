"use client";
import React, { useEffect } from "react";
import "./plaza.scss";
import EditorComponent from "@/components/EditorComponent/EditorComponent";
import TestJson from "@/components/TestJson/TestJson";
import Tab from "@/components/ui/Tab/Tab";
const Plaza = () => {
  return (
    <div className="plaza mt-20">
      <div className="container">
        {/* <TestJson /> */}
        <Tab />
        <EditorComponent />
      </div>
    </div>
  );
};

export default Plaza;

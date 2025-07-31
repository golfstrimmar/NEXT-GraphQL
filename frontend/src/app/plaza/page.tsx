"use client";
import React from "react";
import "./plaza.scss";
import EditorComponent from "@/components/EditorComponent/EditorComponent";
import TestJson from "@/components/TestJson/TestJson";

const Plaza = () => {
  return (
    <div className="plaza">
      <div className="container">
        <TestJson />
        {/*<Preview />*/}
        <EditorComponent />
      </div>
    </div>
  );
};

export default Plaza;

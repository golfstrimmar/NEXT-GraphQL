"use client";
import React, { useEffect } from "react";
import "./plaza.scss";
import EditorComponent from "@/components/EditorComponent/EditorComponent";
import TestJson from "@/components/TestJson/TestJson";

const Plaza = () => {
  return (
    <div className="plaza">
      <div className="container">
        <TestJson />
        <EditorComponent />
      </div>
    </div>
  );
};

export default Plaza;

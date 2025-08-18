"use client";
import React, { useEffect, useState } from "react";
import "./plaza.scss";
import EditorComponent from "@/components/EditorComponent/EditorComponent";
const Plaza = () => {
  return (
    <div className="plaza mt-20">
      <div className="container">
        <EditorComponent />
      </div>
    </div>
  );
};

export default Plaza;

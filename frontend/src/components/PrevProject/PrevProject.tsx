"use client";

import { useState, useEffect, useRef } from "react";

function PrevProject({ project }) {
  const [preSize, setPreSize] = useState(1);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const imgRef = useRef(null);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <button
          className="btn btn-empty px-2"
          onClick={() => setPreSize((p) => Math.max(p - 0.1, 0.1))}
        >
          -
        </button>
        <span className="min-w-[50px] text-center">
          {Math.round(preSize * 100)}%
        </span>
        <button
          className="btn btn-empty px-2"
          onClick={() => setPreSize((p) => Math.min(p + 0.1, 2))}
        >
          +
        </button>
      </div>
      <div
        style={{
          overflowX: "auto",
          overflowY: "auto",
          maxWidth: "100%",
          maxHeight: "100vh",
        }}
        className="border rounded-sm shadow-[0_0_10px_0_rgba(0,0,0,0.4)] mt-2"
      >
        <div style={{ minWidth: imgSize.width * preSize }}>
          <img
            ref={imgRef}
            src={project?.previewUrl}
            alt="Figma Preview"
            className="transition-all duration-300 ease-in-out block"
            style={{
              width: imgSize.width * preSize,
              height: imgSize.height * preSize,
              objectFit: "cover",
            }}
            onLoad={() => {
              setImgSize({
                width: imgRef.current.naturalWidth,
                height: imgRef.current.naturalHeight,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PrevProject;

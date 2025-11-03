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
          onClick={() => setPreSize((p) => Math.min(p + 0.1, 2))}
        >
          +
        </button>
        <span>{Math.round(preSize * 100)}%</span>
        {/* <span>{imgSize.width.toFixed(2)}</span> */}
        {/* <span>{imgSize.height.toFixed(2)}</span> */}
        <button
          className="btn btn-empty px-2"
          onClick={() => setPreSize((p) => Math.max(p - 0.1, 0.1))}
        >
          -
        </button>
      </div>
      <div
        style={{
          overflow: preSize > 1 ? "scroll" : "auto",
        }}
        className="border rounded-sm shadow-[0_0_10px_0_rgba(0,0,0,0.4)] mt-2  max-w-[100vw - 40px]"
      >
        <img
          ref={imgRef}
          src={project?.previewUrl}
          alt="Figma Preview"
          className=" transition-all duration-300 ease-in-out "
          style={{
            objectFit: "contain",
            width: imgSize.width * preSize,
            height: imgSize.height * preSize,
            scale: preSize > 1 ? preSize : 1,
          }}
          onLoad={(e) => {
            setImgSize({
              width: imgRef.current.naturalWidth,
              height: imgRef.current.naturalHeight,
            });
          }}
        />
      </div>
    </div>
  );
}

export default PrevProject;

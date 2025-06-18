import React from "react";
import "./Loading.scss";
const Loading = () => {
  return (
    <div id="loader-box" className="closeout loading">
      <div id="loader-complete-circle"></div>
      <div id="loader-wrapper">
        <svg className="loader">
          <circle
            cx="75"
            cy="75"
            r="60"
            fill="transparent"
            stroke="#8ad3ff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="385"
            strokeDashoffset="385"
          ></circle>
        </svg>
        <svg className="loader loader-2">
          <circle
            cx="75"
            cy="75"
            r="60"
            fill="transparent"
            stroke="#ce9178"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="385"
            strokeDashoffset="385"
          ></circle>
        </svg>
        <svg className="loader loader-3">
          <circle
            cx="75"
            cy="75"
            r="60"
            fill="transparent"
            stroke="#b869a0"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="385"
            strokeDashoffset="385"
          ></circle>
        </svg>
        <svg className="loader loader-4">
          <circle
            cx="75"
            cy="75"
            r="60"
            fill="transparent"
            stroke="#5d8a4e"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="385"
            strokeDashoffset="385"
          ></circle>
        </svg>
        <svg className="loader loader-5">
          <circle
            cx="75"
            cy="75"
            r="60"
            fill="transparent"
            stroke="black"
            strokeWidth="6"
            strokeLinecap="round"
          ></circle>
        </svg>
        <svg className="loader loader-6">
          <circle
            cx="75"
            cy="75"
            r="60"
            fill="transparent"
            stroke="#4387cf"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="385"
            strokeDashoffset="385"
          ></circle>
        </svg>
        <svg className="loader loader-7">
          <circle
            cx="75"
            cy="75"
            r="60"
            fill="transparent"
            stroke="b86cb4"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="385"
            strokeDashoffset="385"
          ></circle>
        </svg>
        <svg className="loader loader-8">
          <circle
            cx="75"
            cy="75"
            r="60"
            fill="transparent"
            stroke="#d4d797"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="385"
            strokeDashoffset="385"
          ></circle>
        </svg>
      </div>
    </div>
  );
};

export default Loading;

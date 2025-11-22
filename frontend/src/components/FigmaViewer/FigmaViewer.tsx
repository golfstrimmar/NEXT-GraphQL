"use client";
import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "@/providers/StateProvider";
import { GET_COLOR_VARIABLES_BY_FILE_KEY } from "@/apollo/queries";
import Button from "../ui/Button/Button";
import { useQuery, useMutation } from "@apollo/client";
import { EXTRACT_AND_SAVE_FONTS } from "@/apollo/mutations";
interface FigmaViewerProps {
  fileData: any;
  nodeId: string;
}

const FigmaViewer: React.FC<FigmaViewerProps> = ({
  project,
  fileData,
  nodeId,
  // fontsToDisplay,
}) => {
  // const [Texts, setTexts] = useState<string[]>([]);
  const [Fonts, setFonts] = useState<string[]>([]);
  const { htmlJson, setHtmlJson, user, setModalMessage, texts, setTexts } =
    useStateContext();
  const [colors, setColors] = useState<any[]>([]);
  const { data: colorVarsData } = useQuery(GET_COLOR_VARIABLES_BY_FILE_KEY, {
    variables: { fileKey: project?.fileKey },
    fetchPolicy: "network-only",
  });
  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  const [extractAndSaveFonts, { loading }] = useMutation(
    EXTRACT_AND_SAVE_FONTS,
    {
      // mutation: extractAndSaveFonts(fileKey, figmaFile, nodeId)
      onCompleted: (data) => {
        setTexts(data.extractAndSaveFonts);
      },
      onError: (err) => {
        setModalMessage(`Error: ${err.message}`);
      },
    }
  );
  // 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺
  useEffect(() => {
    if (colorVarsData?.getColorVariablesByFileKey) {
      setColors(colorVarsData.getColorVariablesByFileKey);
    }
  }, [colorVarsData]);

  useEffect(() => {
    if (texts) {
      console.log("<==== texts====>", texts);
    }
  }, [texts]);

  // 🔻🔻🔻🔻🔻🔻🔻🔻🔻🔻
  // Рекурсивный поиск узла по id
  const findNodeById = (node: any, id: string): any | null => {
    if (node.id === id) return node;
    if (!node.children) return null;
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  // const Refesh = () => {
  // console.log("<====texts====>", texts);
  // setTexts([]);
  // extractAndSaveFonts({
  //   variables: {
  //     fileKey: project?.fileKey,
  //     figmaFile: fileData,
  //     nodeId: nodeId,
  //   },
  // });
  // if (!fileData) return;
  // const targetNode = findNodeById(fileData.document, nodeId);
  // if (!targetNode) {
  //   setTexts([]);
  //   return;
  // }
  // fetch("/api/figmaToHtml", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ figmaData: targetNode }),
  // })
  //   .then((res) => res.json())
  //   .then((data) => {
  //     if (data.texts && Array.isArray(data.texts)) {
  //       console.log("<==RESPONSE texts==>", data.texts);
  //       setTexts(data.texts);
  //       setModalMessage("Texts copied!");
  //     } else {
  //       console.log("<==SERVER RESPONSE==>", data);
  //     }
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });
  // };

  // useEffect(() => {
  //   console.log("<====fileData, nodeId====>", fileData, nodeId);
  //   if (!fileData) return;
  //   Refesh();
  // }, [fileData, nodeId]);

  return (
    <button
      type="button"
      className="btn btn-primary  px-1 w-full"
      // onClick={() => {
      //   Refesh();
      // }}
    >
      Refresh Text Elements for this Figma Project
    </button>
  );
};

export default FigmaViewer;

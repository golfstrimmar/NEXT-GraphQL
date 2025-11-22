"use client";
import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { UPLOAD_FIGMA_JSON_PROJECT } from "@/apollo/mutations";
import Button from "@/components/ui/Button/Button";
import "../figma/figma.scss";
import Loading from "@/components/ui/Loading/Loading";
import { useStateContext } from "@/providers/StateProvider";
import { useRouter } from "next/navigation";
import { set } from "lodash";

// --------

export default function FigmaPage() {
  const router = useRouter();
  const { user, setModalMessage } = useStateContext();
  const [file, setFile] = useState<File | null>(null); // archive
  const [name, setName] = useState<string>("");
  const [colors, setColors] = useState<string[]>([]);
  const [fonts, setFonts] = useState<string[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  // Apollo
  const [uploadFigmaJsonProject, { loading }] = useMutation(
    UPLOAD_FIGMA_JSON_PROJECT
  );
  //

  useEffect(() => {
    if (user) {
      console.log("<==== user====>", user);
    }
  }, [user]);
  //
  const handleUpload = async () => {
    if (!file) return;
    if (!user) {
      setModalMessage("You are not logged in.");
      return;
    }
    if (name.length === 0) {
      setModalMessage("Please enter a name.");
      return;
    }
    // Открываем FileReader
    const reader = new FileReader();
    reader.onload = async (e) => {
      const jsonString = e.target.result;
      const jsonContent = JSON.parse(jsonString);
      const { data } = await uploadFigmaJsonProject({
        variables: { ownerId: user.id, name, jsonContent },
      });
      console.log(
        "<========>",
        data.uploadFigmaJsonProject.colors,
        data.uploadFigmaJsonProject.fonts,
        data.uploadFigmaJsonProject.textNodes
      );
      setColors(data.uploadFigmaJsonProject.colors);
      setFonts(data.uploadFigmaJsonProject.fonts);
      setTexts(data.uploadFigmaJsonProject.textNodes);
    };

    // file — это instance of File
    reader.readAsText(file);
  };

  //

  // Получение SVG для одной картинки
  // const handleTraceSVG = async (filename: string) => {
  //   if (!file) return;
  //   try {
  //     const { data } = await traceImage({
  //       variables: {
  //         imageName: filename,
  //         archiveBuffer: file,
  //       },
  //     });
  //     // Удаляем сконвертированную из images
  //     setImages((prev) => prev.filter((img) => img.filename !== filename));
  //     // Добавляем в SVG-массив
  //     setSvgs((prev) => [...prev, data.traceImageFromFig]);
  //   } catch (e) {
  //     setModalMessage("SVG conversion error: " + e.message);
  //   }
  // };

  return (
    <div className="figma">
      <div className="container">
        <h2 className="text-center mb-4">Figma projects</h2>
        <form>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border rounded p-2 mb-2"
            placeholder="Select a file"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded p-2 mb-2"
            placeholder="Project name"
          />
          <Button disabled={!file || loading} onClick={handleUpload}>
            {loading ? "Uploading..." : "Upload file"}
          </Button>
        </form>

        {colors.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4>Colors</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {colors.map((value, index) => (
                <div
                  key={index}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: value,
                      borderRadius: 6,
                      border: "1px solid #ccc rounded-full",
                      marginRight: 8,
                    }}
                  />
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {fonts && Object.keys(fonts).length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4>Fonts</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {Object.entries(fonts).map(([key, fontObj]) => (
                <div
                  key={key}
                  style={{
                    padding: 8,
                    border: "1px solid #eee",
                    borderRadius: 8,
                  }}
                >
                  <b>{fontObj.family || key}</b>
                  <div style={{ fontSize: 13, opacity: 0.6 }}>{key}</div>
                  {fontObj.sizes && (
                    <div>sizes: {Object.values(fontObj.sizes).join(", ")}</div>
                  )}
                  {fontObj.weights && (
                    <div>
                      weights: {Object.values(fontObj.weights).join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {texts.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <h4>Texts</h4>
            <div className="flex flex-col gap-2">
              {texts.map((text) => (
                <div key={text}>{text}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import "./extractimages.scss";
import { useQuery, useMutation } from "@apollo/client";
import {
  UPLOAD_FIGMA_IMAGES_TO_CLOUDINARY,
  UPLOAD_FIGMA_SVGS_TO_CLOUDINARY,
  TRANSFORM_RASTER_TO_SVG,
  REMOVE_FIGMA_IMAGE,
} from "@/apollo/mutations";
import { useStateContext } from "@/providers/StateProvider";
import FProject from "@/types/FProject";
interface ExtractImagesProps {
  proect: FProject;
}

const ExtractImages: React.FC<ExtractImagesProps> = ({ project }) => {
  const { setModalMessage } = useStateContext();
  const [images, setImages] = useState<any[]>([]);
  const [svgImages, setSvgImages] = useState<any[]>([]);
  const [tempId, setTempId] = useState<string>("");
  const [imgMess, setImgMess] = useState<string>("");
  const [imagesToShow, setImagesToShow] = useState<boolean>(false);
  const [svgToShow, setSvgToShow] = useState<boolean>(false);
  const ButtonImg = useRef<HTMLDivElement>(null);
  const ButtonSvg = useRef<HTMLDivElement>(null);
  const ButtonSvgToShow = useRef<HTMLDivElement>(null);
  // ======== Mutatons
  const [
    uploadFigmaImagesToCloudinary,
    { loading: uploading, error: uploadError },
  ] = useMutation(UPLOAD_FIGMA_IMAGES_TO_CLOUDINARY);
  const [
    uploadFigmaSvgsToCloudinary,
    { loading: uploadingSvgs, error: uploadSvgError },
  ] = useMutation(UPLOAD_FIGMA_SVGS_TO_CLOUDINARY);
  const [transformRasterToSvg, { loading: transformLoading }] = useMutation(
    TRANSFORM_RASTER_TO_SVG
  );

  const [removeFigmaImage] = useMutation(REMOVE_FIGMA_IMAGE);
  //=========== Логирование
  useEffect(() => {
    if (images.length > 0) console.log("<==== images====>", images);
  }, [images]);
  useEffect(() => {
    if (svgImages.length > 0) console.log("<==== svgImages====>", svgImages);
  }, [svgImages]);

  // ============ Обработка изображений
  const handlerImages = async () => {
    if (!project?.id) return;

    try {
      const { data } = await uploadFigmaImagesToCloudinary({
        variables: { projectId: project.id },
      });
      if (data.uploadFigmaImagesToCloudinary.length === 0) {
        setImgMess("No images found");
      } else {
        setImgMess("");
      }
      setImages(data.uploadFigmaImagesToCloudinary);
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };
  const downloadImage = async (url: string, fileName: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch image");

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const finalFileName = `${fileName}.webp`;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = finalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(blobUrl);
  };
  const downloadImages = () => {
    images?.forEach((image, index) => {
      downloadImage(image.filePath, `image-${index + 1}`);
    });
  };
  const handleTransform = async (nodeId) => {
    if (!nodeId) return;
    setTempId(nodeId);
    try {
      const { data } = await transformRasterToSvg({
        variables: { nodeId },
      });
      const newSvgImage = data.transformRasterToSvg;
      setSvgImages([...svgImages, newSvgImage]);
      setImages((prev) => prev.filter((img) => img.nodeId !== nodeId));
      setTempId("");
    } catch (err) {
      console.error("❌ Error transforming raster to SVG:", err);
      setModalMessage(`Error: ${err.message}`);
    }
  };
  const deleteImg = async (img) => {
    try {
      await removeFigmaImage({
        variables: {
          nodeId: img.nodeId,
          figmaProjectId: Number(project.id),
        },
      });
      setImages(images.filter((i) => i.nodeId !== img.nodeId));
      setSvgImages(svgImages.filter((i) => i.nodeId !== img.nodeId));
      setModalMessage(`Image ${img.nodeId} removed`);
    } catch (err) {
      console.error("❌ Error:", err);
      setModalMessage(err.message);
    }
  };

  //============ Обработка SVG
  const handlerSvg = async () => {
    try {
      const { data } = await uploadFigmaSvgsToCloudinary({
        variables: { projectId: project.id },
      });
      setSvgImages(data.uploadFigmaSvgsToCloudinary);
    } catch (err) {
      console.error("❌ SVG upload error:", err);
      setModalMessage(err.message);
    }
  };

  const downloadOneSvgImage = (img) => {
    const filePath = img.filePath;
    const nodeId = img.nodeId;
    const baseName = nodeId.replace(/[:/\\]/g, "_").replace(/\.svg$/i, "");
    const finalFileName = `${baseName}.svg`;
    const a = document.createElement("a");
    a.href = filePath;
    a.download = finalFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {/*🔹🔹🔹🔹🔹images🔹🔹🔹🔹🔹🔹*/}
      <div className="">
        {!images.length > 0 && (
          <button
            className="btn btn-primary w-full"
            onClick={() => {
              handlerImages();
              ButtonImg.current.classList.add("_isActive");
            }}
            ref={ButtonImg}
          >
            {uploading ? "🌤️ Loading images..." : "☁️ Upload Images"}
          </button>
        )}
        {images.length > 0 && (
          <button
            className="btn btn-primary w-full"
            onClick={() => {
              setImagesToShow(!imagesToShow);
            }}
          >
            {imagesToShow ? "☁️ Hide Images" : "☁️ Show Images"}
          </button>
        )}
        {imgMess && <p className="mt-2 text-center text-red-500">{imgMess}</p>}
        {images.length > 0 && imagesToShow && (
          <div className="mt-2">
            <h5 className="">Uploaded Images ({images.length})</h5>
            <button onClick={downloadImages} className="btn-primary btn">
              💾 Download Images
            </button>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="border rounded flex flex-col gap-2 shadow-sm p-1 bg-[rgb(145_145_145)] "
                >
                  <button
                    onClick={() => handleTransform(img.nodeId)}
                    className="btn-primary btn"
                  >
                    {transformLoading && img.nodeId === tempId
                      ? "🌤️ Converting..."
                      : "🔄 Convert Raster to SVG"}
                  </button>
                  <button
                    className="btn btn-allert"
                    onClick={() => deleteImg(img)}
                  >
                    🗑️ Delete
                  </button>
                  <div
                    style={{
                      width: "50%",
                      height: "50%",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={img.filePath}
                      alt={`Image ${index + 1}`}
                      className="object-cover mt-2 block"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/*🔹🔹🔹🔹🔹🔹 SVG 🔹🔹🔹🔹🔹*/}
      <div className="">
        {!svgImages.length > 0 && (
          <button
            className="btn btn-primary w-full"
            onClick={() => {
              handlerSvg();
              ButtonSvg.current.classList.add("_isActive");
            }}
            ref={ButtonSvg}
          >
            {uploading ? "🌤️ Loading Svg..." : "☁️ Upload Svg"}
          </button>
        )}
        {svgImages.length > 0 && (
          <button
            className="btn btn-primary w-full"
            onClick={() => {
              setSvgToShow(!svgToShow);
              !svgToShow
                ? ButtonSvgToShow.current.classList.add("_isActive")
                : ButtonSvgToShow.current.classList.remove("_isActive");
            }}
            ref={ButtonSvgToShow}
          >
            {svgToShow ? "☁️ Hide Svg" : "☁️ Show Svg"}
          </button>
        )}
        {svgImages.length > 0 && svgToShow && (
          <>
            <h5 className="">Uploaded SVG ({svgImages.length})</h5>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {svgImages.map((img, index) => (
                <div
                  key={index}
                  className="border rounded shadow-sm p-1 bg-[rgb(145_145_145)]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => downloadOneSvgImage(img)}
                    >
                      💾 Download
                    </button>
                    <button
                      className="btn btn-allert"
                      onClick={() => deleteImg(img)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                  <img src={img.filePath} type="image/svg+xml" />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExtractImages;

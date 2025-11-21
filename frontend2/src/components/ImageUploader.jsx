// src/components/AdvancedImageEditor.jsx
import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import {
  Upload,
  X,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  Download,
  RotateCcw,
  Eye,
  EyeOff,
} from "lucide-react";

const API_UPLOAD = "http://localhost:5000/api/blogs/upload";

const AdvancedImageEditor = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setPreviewMode(false);
  };

  const getCroppedAndFilteredBlob = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      throw new Error("No image or crop area");
    }

    return new Promise(async (resolve, reject) => {
      try {
        const imgBlob = await fetch(imageSrc).then((r) => r.blob());
        const bitmap = await createImageBitmap(imgBlob);

        const canvas = document.createElement("canvas");
        const w = croppedAreaPixels.width;
        const h = croppedAreaPixels.height;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");

        ctx.filter = `
          brightness(${brightness}%)
          contrast(${contrast}%)
          saturate(${saturation}%)
          blur(${blur}px)
        `;

        ctx.save();
        ctx.translate(w / 2, h / 2);
        const rad = (rotation * Math.PI) / 180;
        ctx.rotate(rad);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);

        ctx.drawImage(
          bitmap,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          -w / 2,
          -h / 2,
          w,
          h
        );

        ctx.restore();

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas returned empty blob"));
              return;
            }
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleUpload = async () => {
    try {
      setUploading(true);

      const croppedBlob = await getCroppedAndFilteredBlob();

      const compressed = await imageCompression(croppedBlob, {
        maxSizeMB: 0.7,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("image", compressed, "edited-image.jpg");

      const res = await fetch(API_UPLOAD, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.imageUrl) {
        throw new Error("No imageUrl returned from upload");
      }

      onChange(data.imageUrl);
      setIsOpen(false);
      setImageSrc(null);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const resetEditor = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setPreviewMode(false);
  };

  const openEditor = () => {
    resetEditor();
    setIsOpen(true);
  };

  const closeEditor = () => {
    setIsOpen(false);
    setImageSrc(null);
  };

  const hasChanges =
    rotation !== 0 ||
    flipX ||
    flipY ||
    brightness !== 100 ||
    contrast !== 100 ||
    saturation !== 100 ||
    blur !== 0;

  return (
    <div className="space-y-4">
      {/* Trigger Button & Preview */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <button
          type="button"
          onClick={openEditor}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          <Upload size={18} />
          {value ? "Edit Image" : "Upload Image"}
        </button>

        {value && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            Image selected
          </div>
        )}
      </div>

      {/* Preview */}
      {value && (
        <div className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
          <img
            src={value}
            alt="Featured"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={openEditor}
              className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  Advanced Image Editor
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Crop, adjust, and enhance your image
                </p>
              </div>
              <button
                onClick={closeEditor}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close editor"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden gap-4 lg:gap-6 p-4 lg:p-6">
              {/* Left: Cropper area */}
              <div className="flex-1 bg-gray-900 rounded-lg relative overflow-hidden flex flex-col">
                {!imageSrc ? (
                  <div className="flex flex-col items-center justify-center h-full text-white gap-4">
                    <div className="text-center">
                      <Upload size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="font-medium">Select an image to get started</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Supports JPG, PNG, WebP
                      </p>
                    </div>
                    <label className="bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-lg cursor-pointer font-medium transition-colors inline-flex items-center gap-2">
                      <Upload size={16} />
                      Choose Image
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSelectFile}
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    {previewMode ? (
                      <div className="flex-1 flex items-center justify-center relative overflow-auto p-4">
                        <img
                          src={imageSrc}
                          alt="Preview"
                          style={{
                            filter: `
                              brightness(${brightness}%)
                              contrast(${contrast}%)
                              saturate(${saturation}%)
                              blur(${blur}px)
                            `,
                            transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1}) rotate(${rotation}deg)`,
                          }}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={16 / 9}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        cropShape="rect"
                        showGrid
                      />
                    )}

                    {/* Toolbar */}
                    <div className="bg-white/95 backdrop-blur border-t border-gray-200 p-3 flex items-center justify-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="Rotate counter-clockwise"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="Rotate clockwise"
                      >
                        <RotateCw size={18} />
                      </button>
                      <div className="w-px h-6 bg-gray-300"></div>
                      <button
                        type="button"
                        onClick={() => setFlipX((v) => !v)}
                        className={`p-2 rounded-lg transition-colors ${
                          flipX
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        title="Flip horizontally"
                      >
                        <FlipHorizontal size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipY((v) => !v)}
                        className={`p-2 rounded-lg transition-colors ${
                          flipY
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        title="Flip vertically"
                      >
                        <FlipVertical size={18} />
                      </button>
                      <div className="w-px h-6 bg-gray-300"></div>
                      <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`p-2 rounded-lg transition-colors ${
                          previewMode
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        title={previewMode ? "Exit preview" : "Preview image"}
                      >
                        {previewMode ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <div className="w-px h-6 bg-gray-300"></div>
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <ZoomIn size={16} className="text-gray-600" />
                        <input
                          type="range"
                          min={1}
                          max={3}
                          step={0.1}
                          value={zoom}
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-xs font-medium text-gray-600 w-8">
                          {(zoom * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right: Controls panel */}
              <div className="w-full lg:w-80 space-y-4 flex flex-col">
                {/* File input */}
                {!imageSrc ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-2">No image selected</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-2">
                      Image loaded successfully
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Choose different image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleSelectFile}
                    />
                  </div>
                )}

                {/* Adjustments */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4 flex-1 overflow-y-auto">
                  <h3 className="font-bold text-gray-900 text-sm">Adjustments</h3>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-700">
                        Brightness
                      </label>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {brightness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={150}
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-700">
                        Contrast
                      </label>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {contrast}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={150}
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-700">
                        Saturation
                      </label>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {saturation}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={200}
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-gray-700">
                        Blur
                      </label>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {blur}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 border-t border-gray-200 pt-4">
                  {hasChanges && (
                    <button
                      type="button"
                      onClick={resetEditor}
                      className="w-full py-2.5 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors"
                    >
                      Reset Adjustments
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || !imageSrc || !croppedAreaPixels}
                    className="w-full py-2.5 text-sm font-medium rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    {uploading ? "Uploading..." : "Save & Upload"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedImageEditor;
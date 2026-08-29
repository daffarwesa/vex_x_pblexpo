"use client";

import { useId } from "react";
import { FaCloudUploadAlt, FaLink, FaGoogleDrive } from "react-icons/fa";

export type PosterMode = "file" | "drive";

interface Props {
  mode: PosterMode;
  onModeChange: (mode: PosterMode) => void;
  preview: string;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  driveUrl: string;
  onDriveUrlChange: (url: string) => void;
  error?: string;
  readOnly?: boolean;
}

export function extractDriveDirectUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http") && !trimmed.includes("drive.google.com")) {
    return trimmed;
  }
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}

export default function DetailPoster({
  mode,
  onModeChange,
  preview,
  onUploadFile,
  driveUrl,
  onDriveUrlChange,
  error,
  readOnly,
}: Props) {
  const inputId = useId();

  return (
    <div className="w-full font-poppins">
      <div className="flex items-center justify-between mt-10 mb-2">
        <p className="text-xl font-semibold">
          Poster<span className="text-red-500">*</span>
        </p>
      </div>

      {/* Mode Selection Tabs */}
      {!readOnly && (
        <div className="flex bg-gray-100 p-1 rounded-xl mb-3 border border-gray-200">
          <button
            type="button"
            onClick={() => onModeChange("file")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "file"
                ? "bg-white text-main-blue shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <FaCloudUploadAlt size={15} />
            <span>Upload File PNG/JPG</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange("drive")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "drive"
                ? "bg-white text-main-blue shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <FaGoogleDrive size={13} className="text-emerald-600" />
            <span>Link Google Drive</span>
          </button>
        </div>
      )}

      {/* Mode Drive Input Field */}
      {!readOnly && mode === "drive" && (
        <div className="mb-3 space-y-1">
          <div className="relative">
            <input
              type="text"
              value={driveUrl}
              onChange={(e) => onDriveUrlChange(e.target.value)}
              placeholder="Tempel link Google Drive (https://drive.google.com/...)"
              className="w-full p-2.5 px-3.5 pl-9 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-main-blue/30 focus:border-main-blue text-xs transition"
            />
            <FaLink className="absolute left-3 top-3 text-gray-400" size={13} />
          </div>
          <p className="text-[11px] text-gray-400 italic">
            *Pastikan akses link Google Drive diset ke &quot;Siapa saja yang memiliki link&quot;.
          </p>
        </div>
      )}

      {/* Poster Preview Box 3:4 */}
      <div className="w-full aspect-[3/4] mt-2">
        <label
          htmlFor={mode === "file" && !readOnly ? inputId : undefined}
          className={`relative w-full h-full flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-2xl overflow-hidden transition-all duration-200 ${
            readOnly
              ? "cursor-default border-gray-200"
              : mode === "file"
              ? error
                ? "cursor-pointer border-red-400 bg-red-50"
                : "cursor-pointer border-gray-300 hover:border-main-blue hover:bg-blue-50"
              : "cursor-not-allowed border-gray-200 opacity-90"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview poster"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400 pointer-events-none p-6 flex flex-col items-center gap-3">
              {mode === "file" ? (
                <>
                  <FaCloudUploadAlt className="text-7xl text-gray-300" />
                  <div>
                    <p className="text-base font-semibold text-gray-600">
                      {readOnly ? "Tidak ada gambar" : "Klik untuk upload poster"}
                    </p>
                    {!readOnly && (
                      <p className="text-xs mt-1 text-gray-400">PNG, JPG, JPEG · Maks 2MB</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <FaGoogleDrive className="text-6xl text-emerald-500/60" />
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      {driveUrl ? "Memuat Preview Drive..." : "Tempel link Google Drive di atas"}
                    </p>
                    <p className="text-xs mt-1 text-gray-400">Preview poster akan muncul di sini</p>
                  </div>
                </>
              )}
            </div>
          )}

          {!readOnly && mode === "file" && (
            <input
              id={inputId}
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/jpg"
              onChange={onUploadFile}
              onClick={(e) => {
                e.currentTarget.value = "";
              }}
            />
          )}
        </label>
      </div>

      {/* Error / Info */}
      {!readOnly && error && (
        <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
}
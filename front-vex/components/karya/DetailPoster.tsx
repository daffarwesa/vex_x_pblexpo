"use client";

import { useId } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";

interface Props {
  preview: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  readOnly?: boolean;
}

export default function DetailPoster({
  preview,
  onUpload,
  error,
  readOnly,
}: Props) {
  const inputId = useId();

  return (
    <div className="w-full">
      <p className="text-xl font-semibold mt-10 mb-1.5">
        Poster<span className="text-red-500">*</span>
      </p>

      <p className="text-xs text-gray-400 mt-1">
        Format yang didukung hanya PNG/JPG
      </p>

      {/* Poster */}
      <div className="w-full max-w-[1000px] aspect-[3/4] mt-3">
        <label
          htmlFor={inputId}
          className={`relative w-full h-full flex items-center justify-center bg-gray-50 border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200 ${
            readOnly
              ? "cursor-default border-gray-200"
              : error
                ? "cursor-pointer border-red-400 bg-red-50"
                : "cursor-pointer border-gray-300 hover:border-main-blue hover:bg-blue-50"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview poster"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400 pointer-events-none p-4">
              <FaCloudUploadAlt className="text-5xl mx-auto mb-3" />

              <p className="text-sm font-medium">
                {readOnly ? "Tidak ada gambar" : "Klik untuk upload"}
              </p>

              {!readOnly && (
                <p className="text-xs mt-1">
                  PNG, JPG, JPEG
                </p>
              )}
            </div>
          )}

          {!readOnly && (
            <input
              id={inputId}
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/jpg"
              onChange={onUpload}
              onClick={(e) => {
                e.currentTarget.value = "";
              }}
            />
          )}
        </label>
      </div>

      {/* Error / Info */}
      {!readOnly && (
        error ? (
          <p className="text-xs text-red-500 mt-1.5">
            {error}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-2">
            Format: PNG, JPG, JPEG.
          </p>
        )
      )}
    </div>
  );
}
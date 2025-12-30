"use client";

import { Upload, Loader2, X } from "lucide-react";
import { useState, useRef } from "react";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [roastResult, setRoastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diperbolehkan!");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB!");
      return;
    }

    setError(null);
    setRoastResult(null);

    // Convert to base64 and show preview
    const base64 = await convertToBase64(file);
    setSelectedImage(base64);
  };

  const handleRoast = async () => {
    if (!selectedImage || isLoading) return;

    setIsLoading(true);
    setError(null);
    setRoastResult(null);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: selectedImage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses gambar");
      }

      setRoastResult(data.roasting);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses gambar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setRoastResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="text-center py-8 px-6">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-orange-500">
          AI Roaster 💀
        </h1>
        <p className="text-lg sm:text-xl text-zinc-400">
          Seberapa hancur selera kamu?
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-6 pb-6">
        <div className="w-full max-w-md space-y-6">
          {/* Upload Area */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              disabled={isLoading}
              className="hidden"
            />

            {!selectedImage ? (
              <div
                onClick={handleUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-8 sm:p-12
                  transition-all duration-300 cursor-pointer text-center
                  ${isDragging 
                    ? "border-orange-500 bg-orange-500/10" 
                    : "border-zinc-700 hover:border-orange-500 hover:bg-zinc-900/50"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <div className="flex flex-col items-center gap-4">
                  <Upload size={48} className="text-zinc-500" />
                  <p className="text-base sm:text-lg font-medium text-zinc-300">
                    Lempar fotomu ke sini
                  </p>
                  <p className="text-sm text-zinc-500">
                    Drag & Drop atau klik untuk upload
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="absolute top-2 right-2 z-10 p-2 bg-zinc-900/90 rounded-full hover:bg-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Hapus gambar"
                >
                  <X size={20} />
                </button>
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full rounded-lg border border-zinc-800"
                />
              </div>
            )}
          </div>

          {/* Roast Button */}
          {selectedImage && !roastResult && (
            <button
              onClick={handleRoast}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Sedang mencari celah hinaan...</span>
                </>
              ) : (
                <>
                  Roast Saya! 🔥
                </>
              )}
            </button>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-500" />
              <p className="text-zinc-400 text-sm">
                Sedang mencari celah hinaan...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-center">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Result Card */}
          {roastResult && !isLoading && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-orange-500 text-3xl font-bold leading-none">"</span>
                <blockquote className="flex-1">
                  <p className="text-base sm:text-lg text-zinc-100 leading-relaxed">
                    {roastResult}
                  </p>
                </blockquote>
                <span className="text-orange-500 text-3xl font-bold leading-none self-end">"</span>
              </div>
            </div>
          )}

          {/* Reset Button */}
          {roastResult && !isLoading && (
            <button
              onClick={handleReset}
              className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors duration-200"
            >
              Upload Foto Baru
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

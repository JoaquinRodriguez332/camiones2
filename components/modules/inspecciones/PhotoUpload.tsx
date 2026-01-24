"use client";

import { useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils-cn";

interface PhotoUploadProps {
  onPhotosChange: (fotos: string[]) => void;
  maxFiles?: number;
  maxSizeKB?: number;
}

/**
 * COMPONENTE DE CARGA DE FOTOS
 * - Drag & drop
 * - Preview en miniatura
 * - Validación de tamaño
 * - Eliminación rápida
 */
export function PhotoUpload({
  onPhotosChange,
  maxFiles = 5,
  maxSizeKB = 5000, // 5MB
}: PhotoUploadProps) {
  const { toast } = useToast();
  const [fotos, setFotos] = useState<Array<{ id: string; url: string; nombre: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "❌ Tipo de archivo no válido",
        description: "Solo se aceptan imágenes",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSizeKB * 1024) {
      toast({
        title: "❌ Archivo muy grande",
        description: `Máximo ${maxSizeKB}KB. Tu archivo es ${Math.round(file.size / 1024)}KB`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files)
      .filter(validateFile)
      .slice(0, maxFiles - fotos.length);

    if (fotos.length + validFiles.length > maxFiles) {
      toast({
        title: "❌ Límite de fotos excedido",
        description: `Máximo ${maxFiles} fotos`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const newFotos = await Promise.all(
        validFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/truck-photo", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Error al subir foto");
          }

          const data = await response.json();
          return {
            id: Math.random().toString(36),
            url: data.url || data.data?.url,
            nombre: file.name,
          };
        })
      );

      const updated = [...fotos, ...newFotos];
      setFotos(updated);
      onPhotosChange(updated.map((f) => f.url));

      toast({
        title: "✅ Fotos subidas",
        description: `${newFotos.length} foto(s) agregadas`,
        duration: 3000,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "❌ Error al subir fotos",
        description: error instanceof Error ? error.message : "Intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFoto = (id: string) => {
    const updated = fotos.filter((f) => f.id !== id);
    setFotos(updated);
    onPhotosChange(updated.map((f) => f.url));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* ÁREA DE DRAG & DROP */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        )}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-600" />
        <p className="font-semibold text-gray-900">Arrastra fotos aquí</p>
        <p className="text-sm text-gray-600">o haz clic para seleccionar</p>
        <p className="text-xs text-gray-500 mt-1">
          Máx {maxFiles} fotos, {maxSizeKB}KB cada una
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={isUploading || fotos.length >= maxFiles}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onClick={(e) => e.currentTarget.click()}
        />
      </div>

      {/* BUTTON ALTERNATIVO */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading || fotos.length >= maxFiles}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.multiple = true;
            input.onchange = (e) => handleFiles((e.target as HTMLInputElement).files);
            input.click();
          }}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          {isUploading ? "Subiendo..." : "Seleccionar fotos"}
        </Button>
        {fotos.length > 0 && (
          <span className="text-sm text-gray-600 self-center">
            {fotos.length}/{maxFiles} foto(s)
          </span>
        )}
      </div>

      {/* GRID DE MINIATURAS */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt={foto.nombre}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFoto(foto.id)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                {foto.nombre}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ESTADO VACÍO */}
      {fotos.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No hay fotos. Sube al menos una para completar la inspección.
        </p>
      )}
    </div>
  );
}

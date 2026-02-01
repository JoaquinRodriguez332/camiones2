"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  Camera,
  Image as ImageIcon,
  Upload,
  X,
  RotateCcw,
  Check,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils-cn";

interface FotoRequerida {
  id: string;
  nombre: string;
  descripcion: string;
  obligatoria: boolean;
  url?: string;
}

const FOTOS_REQUERIDAS: FotoRequerida[] = [
  {
    id: "frontal",
    nombre: "Vista Frontal",
    descripcion: "Foto completa del frente del camión",
    obligatoria: true,
  },
  {
    id: "lateral_izq",
    nombre: "Lateral Izquierdo",
    descripcion: "Foto completa del lado izquierdo",
    obligatoria: true,
  },
  {
    id: "lateral_der",
    nombre: "Lateral Derecho",
    descripcion: "Foto completa del lado derecho",
    obligatoria: true,
  },
  {
    id: "trasera",
    nombre: "Vista Trasera",
    descripcion: "Foto completa de la parte trasera",
    obligatoria: true,
  },
  {
    id: "neumaticos",
    nombre: "Neumáticos",
    descripcion: "Foto de los neumáticos mostrando su estado",
    obligatoria: false,
  },
  {
    id: "interior",
    nombre: "Interior Cabina",
    descripcion: "Foto del interior de la cabina",
    obligatoria: false,
  },
  {
    id: "kilometraje",
    nombre: "Kilometraje",
    descripcion: "Foto del odómetro mostrando kilometraje",
    obligatoria: true,
  },
  {
    id: "patente",
    nombre: "Patente",
    descripcion: "Foto clara de la patente del vehículo",
    obligatoria: true,
  },
];

export default function FotosInspeccionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const camionId = params.camionId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [fotos, setFotos] = useState<FotoRequerida[]>(FOTOS_REQUERIDAS);
  const [selectedFoto, setSelectedFoto] = useState<FotoRequerida | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);

  useEffect(() => {
    // Simular carga inicial
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fotoId: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Crear URL de preview
      const previewUrl = URL.createObjectURL(file);

      // Simular subida (en producción esto iría a la API)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualizar estado
      setFotos((prev) =>
        prev.map((foto) =>
          foto.id === fotoId ? { ...foto, url: previewUrl } : foto
        )
      );

      setSelectedFoto(null);

      toast({
        title: "Foto guardada",
        description: "La foto se ha subido correctamente",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFoto = (fotoId: string) => {
    setFotos((prev) =>
      prev.map((foto) =>
        foto.id === fotoId ? { ...foto, url: undefined } : foto
      )
    );
  };

  const handleContinue = () => {
    // Verificar fotos obligatorias
    const faltantes = fotos.filter((f) => f.obligatoria && !f.url);

    if (faltantes.length > 0) {
      toast({
        title: "Fotos pendientes",
        description: `Faltan ${faltantes.length} fotos obligatorias`,
        variant: "destructive",
      });
      return;
    }

    router.push(`/inspector/inspeccion/${camionId}`);
  };

  const completadas = fotos.filter((f) => f.url).length;
  const obligatorias = fotos.filter((f) => f.obligatoria).length;
  const obligatoriasCompletadas = fotos.filter((f) => f.obligatoria && f.url).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="h-10 w-10 text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>

            <h1 className="font-semibold text-gray-900">Fotos del Vehículo</h1>

            <div className="w-10" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Info Card */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Truck className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="font-semibold text-teal-900 mb-1">
                Captura de Imágenes
              </h2>
              <p className="text-sm text-teal-700">
                Toma fotos claras del vehículo desde diferentes ángulos.
                Las fotos marcadas con * son obligatorias.
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">
              Progreso: {completadas}/{fotos.length} fotos
            </span>
            <span className="text-teal-600 font-medium">
              {obligatoriasCompletadas}/{obligatorias} obligatorias
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all"
              style={{ width: `${(completadas / fotos.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 gap-3">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              onClick={() => !foto.url && setSelectedFoto(foto)}
              className={cn(
                "relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all",
                foto.url
                  ? "border-green-200 bg-green-50"
                  : foto.obligatoria
                  ? "border-dashed border-teal-300 bg-teal-50/50"
                  : "border-dashed border-gray-200 bg-gray-50"
              )}
            >
              {foto.url ? (
                <>
                  {/* Preview Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={foto.url}
                    alt={foto.nombre}
                    className="w-full h-full object-cover"
                  />

                  {/* Success Badge */}
                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFoto(foto.id);
                    }}
                    className="absolute top-2 left-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-xs font-medium truncate">
                      {foto.nombre}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-3 cursor-pointer">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-2",
                      foto.obligatoria ? "bg-teal-100" : "bg-gray-100"
                    )}
                  >
                    <Camera
                      className={cn(
                        "h-6 w-6",
                        foto.obligatoria ? "text-teal-600" : "text-gray-400"
                      )}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center">
                    {foto.nombre}
                    {foto.obligatoria && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
                    {foto.descripcion}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Photo Capture Modal */}
      {selectedFoto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedFoto(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[80vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{selectedFoto.nombre}</h2>
              <button
                onClick={() => setSelectedFoto(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">{selectedFoto.descripcion}</p>

              {/* Camera Preview / Upload Area */}
              <div className="aspect-[4/3] bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Selecciona o toma una foto
                  </p>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleFileSelect(e, selectedFoto.id)}
                className="hidden"
              />

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute("capture");
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={uploading}
                  className="py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <ImageIcon className="h-5 w-5" />
                  Galería
                </button>

                <button
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.setAttribute("capture", "environment");
                      fileInputRef.current.click();
                    }
                  }}
                  disabled={uploading}
                  className="py-3 px-4 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Spinner className="h-5 w-5" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5" />
                      Cámara
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.back()}
            className="py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            ATRÁS
          </button>
          <button
            onClick={handleContinue}
            className="py-3 px-6 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors"
          >
            CONTINUAR
          </button>
        </div>
      </div>
    </div>
  );
}

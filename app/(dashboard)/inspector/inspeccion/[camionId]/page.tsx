"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  Truck,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Camera,
  ClipboardList,
  Thermometer,
  Box,
  Container,
  FileText,
  Clock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils-cn";

interface CamionDetalle {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  tipo_remolque: string | null;
  empresa: string;
  ultimaInspeccion: {
    fecha: string;
    nota: number;
    resultado: string;
  } | null;
}

// Tipos de remolque con sus iconos y categorías
const TIPOS_REMOLQUE = [
  {
    id: "refrigerado",
    nombre: "Refrigerado",
    icon: Thermometer,
    categorias: ["Sistema de frío", "Temperatura", "Aislamiento"],
  },
  {
    id: "caja_seca",
    nombre: "Caja Seca",
    icon: Box,
    categorias: ["Puertas", "Piso", "Paredes"],
  },
  {
    id: "plataforma",
    nombre: "Plataforma",
    icon: Container,
    categorias: ["Anclajes", "Barandas", "Superficie"],
  },
  {
    id: "tanque",
    nombre: "Tanque",
    icon: Container,
    categorias: ["Válvulas", "Sellos", "Mangueras"],
  },
];

// Categorías base de inspección
const CATEGORIAS_BASE = [
  { id: "frenos", nombre: "Frenos", items: 4 },
  { id: "neumaticos", nombre: "Neumáticos", items: 4 },
  { id: "luces", nombre: "Luces", items: 6 },
  { id: "chasis", nombre: "Chasis", items: 3 },
  { id: "cabina", nombre: "Cabina", items: 5 },
  { id: "documentos", nombre: "Documentos", items: 3 },
];

export default function PreInspeccionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const camionId = params.camionId as string;

  const [loading, setLoading] = useState(true);
  const [camion, setCamion] = useState<CamionDetalle | null>(null);
  const [tipoRemolqueSeleccionado, setTipoRemolqueSeleccionado] = useState<string | null>(null);

  useEffect(() => {
    async function loadCamion() {
      try {
        const res = await fetch(`/api/inspector/inspecciones/camion/${camionId}`);
        if (!res.ok) throw new Error("Error al cargar datos");

        const data = await res.json();
        setCamion(data.data);

        // Auto-seleccionar tipo de remolque si viene de la BD
        if (data.data?.tipo_remolque) {
          setTipoRemolqueSeleccionado(data.data.tipo_remolque);
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del camión",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadCamion();
  }, [camionId, toast]);

  const handleStartInspection = () => {
    // Guardar tipo de remolque seleccionado en sessionStorage para usarlo en la inspección
    if (tipoRemolqueSeleccionado) {
      sessionStorage.setItem(`remolque_${camionId}`, tipoRemolqueSeleccionado);
    }
    router.push(`/inspector/inspeccion/${camionId}/activa`);
  };

  const getTipoRemolqueInfo = (tipoId: string | null) => {
    return TIPOS_REMOLQUE.find((t) => t.id === tipoId);
  };

  const getResultadoColor = (resultado: string | undefined) => {
    switch (resultado?.toLowerCase()) {
      case "aprobado":
      case "aprobada":
        return "text-green-600 bg-green-100";
      case "observado":
      case "parcial":
        return "text-yellow-600 bg-yellow-100";
      case "rechazado":
      case "rechazada":
        return "text-red-600 bg-red-100";
      default:
        return "text-neutral-600 bg-neutral-100";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <Spinner className="h-10 w-10 mx-auto text-red-600" />
          <p className="text-neutral-500">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!camion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 font-medium">Camión no encontrado</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-red-600 font-medium"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const tipoRemolqueInfo = getTipoRemolqueInfo(tipoRemolqueSeleccionado);
  const totalItems =
    CATEGORIAS_BASE.reduce((acc, cat) => acc + cat.items, 0) +
    (tipoRemolqueInfo?.categorias.length || 0) * 3;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>

            <h1 className="font-semibold text-white">Pre-Inspección</h1>

            <div className="w-9" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Información del Camión */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-5 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-600/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
              <Truck className="h-7 w-7 text-red-500" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {camion.patente}
                </span>
                <span className="text-neutral-400 text-xs">
                  {camion.tipo}
                </span>
              </div>
              <h2 className="text-lg font-bold truncate">
                {camion.marca} {camion.modelo}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-sm text-neutral-400">
                <Building2 className="h-4 w-4" />
                <span className="truncate">{camion.empresa}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Última Inspección */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            Última Inspección
          </h3>

          {camion.ultimaInspeccion ? (
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {new Date(camion.ultimaInspeccion.fecha).toLocaleDateString("es-CL", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Hace {Math.floor((Date.now() - new Date(camion.ultimaInspeccion.fecha).getTime()) / (1000 * 60 * 60 * 24))} días
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-lg font-bold text-neutral-900">
                    {camion.ultimaInspeccion.nota}
                  </span>
                  <span className="text-xs text-neutral-400">/100</span>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    getResultadoColor(camion.ultimaInspeccion.resultado)
                  )}
                >
                  {camion.ultimaInspeccion.resultado}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-neutral-50 rounded-xl text-center">
              <AlertCircle className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">
                Sin inspecciones previas registradas
              </p>
            </div>
          )}
        </div>

        {/* Tipo de Remolque */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
            <Container className="h-5 w-5 text-red-600" />
            Tipo de Remolque
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {TIPOS_REMOLQUE.map((tipo) => {
              const Icon = tipo.icon;
              const isSelected = tipoRemolqueSeleccionado === tipo.id;

              return (
                <button
                  key={tipo.id}
                  onClick={() => setTipoRemolqueSeleccionado(tipo.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    isSelected
                      ? "border-red-500 bg-red-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-2",
                      isSelected ? "bg-red-100" : "bg-neutral-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isSelected ? "text-red-600" : "text-neutral-600"
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-red-700" : "text-neutral-700"
                    )}
                  >
                    {tipo.nombre}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    +{tipo.categorias.length} categorías
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categorías a Inspeccionar */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-red-600" />
              Categorías a Inspeccionar
            </h3>
            <span className="text-sm text-neutral-500">
              ~{totalItems} items
            </span>
          </div>

          <div className="space-y-2">
            {/* Categorías base */}
            {CATEGORIAS_BASE.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-neutral-700">{cat.nombre}</span>
                </div>
                <span className="text-xs text-neutral-400">{cat.items} items</span>
              </div>
            ))}

            {/* Categorías del tipo de remolque seleccionado */}
            {tipoRemolqueInfo && (
              <>
                <div className="my-3 border-t border-neutral-200" />
                <p className="text-xs font-medium text-red-600 uppercase tracking-wide mb-2">
                  Específico de {tipoRemolqueInfo.nombre}
                </p>
                {tipoRemolqueInfo.categorias.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100"
                  >
                    <div className="flex items-center gap-3">
                      <tipoRemolqueInfo.icon className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">{cat}</span>
                    </div>
                    <span className="text-xs text-red-400">3 items</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Camera className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 mb-1">
                Prepara tu cámara
              </p>
              <p className="text-xs text-neutral-500">
                Durante la inspección podrás tomar fotos de evidencia para documentar
                cualquier falla o anomalía encontrada.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón Fijo Inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 z-40">
        <button
          onClick={handleStartInspection}
          disabled={!tipoRemolqueSeleccionado}
          className={cn(
            "w-full py-4 px-6 font-bold rounded-xl transition-all flex items-center justify-center gap-2",
            tipoRemolqueSeleccionado
              ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/30"
              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
          )}
        >
          <Camera className="h-5 w-5" />
          COMENZAR INSPECCIÓN
        </button>

        {!tipoRemolqueSeleccionado && (
          <p className="text-xs text-center text-neutral-500 mt-2">
            Selecciona un tipo de remolque para continuar
          </p>
        )}
      </div>
    </div>
  );
}

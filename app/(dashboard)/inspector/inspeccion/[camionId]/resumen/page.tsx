"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import {
  ChevronLeft,
  Truck,
  Calendar,
  MapPin,
  Building2,
  Gauge,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Camera,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils-cn";

interface VehiculoInfo {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  empresa: string;
  proveedor?: string;
  ultimaInspeccion?: {
    fecha: string;
    resultado: string;
    nota: number;
  };
  historial?: {
    totalInspecciones: number;
    completadas: number;
    programadas: number;
    notaPromedio: number;
  };
  alertas?: {
    tipo: "warning" | "error" | "info";
    mensaje: string;
  }[];
}

export default function ResumenInspeccionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const camionId = params.camionId as string;

  const [loading, setLoading] = useState(true);
  const [vehiculo, setVehiculo] = useState<VehiculoInfo | null>(null);
  const [inspector, setInspector] = useState<{ nombre: string; id: string } | null>(
    null
  );

  useEffect(() => {
    async function loadData() {
      try {
        // Cargar datos del inspector
        const meRes = await fetch("/api/inspector/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          setInspector(meData.data);
        }

        // Cargar datos del vehículo
        const res = await fetch("/api/inspector/inspecciones/hoy");
        if (!res.ok) throw new Error("Error al cargar datos");

        const data = await res.json();
        const found = (data.data || []).find(
          (insp: any) => String(insp.camion_id) === camionId
        );

        if (found) {
          setVehiculo({
            id: found.camion_id,
            patente: found.patente,
            marca: found.marca,
            modelo: found.modelo,
            anio: found.anio || 2020,
            tipo: found.tipo || "Camión",
            empresa: found.empresa,
            proveedor: found.proveedor,
            ultimaInspeccion: {
              fecha: "2024-01-15",
              resultado: "APROBADA",
              nota: 92,
            },
            historial: {
              totalInspecciones: 12,
              completadas: 10,
              programadas: 2,
              notaPromedio: 88,
            },
            alertas: [],
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [camionId]);

  const handleStartInspection = () => {
    router.push(`/inspector/inspeccion/${camionId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner className="h-10 w-10 text-red-600" />
      </div>
    );
  }

  if (!vehiculo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600">Vehículo no encontrado</p>
        </div>
      </div>
    );
  }

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

            <h1 className="font-semibold text-white">Inicio Inspección</h1>

            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {inspector?.nombre?.charAt(0) || "I"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Vehicle Hero Card */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-red-600/20 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0">
              <Truck className="h-8 w-8 text-red-500" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-neutral-400 text-xs font-medium">
                  {vehiculo.patente}
                </span>
                <span className="bg-red-600/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                  {vehiculo.tipo}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-1 truncate">
                {vehiculo.marca} {vehiculo.modelo}
              </h2>
              <p className="text-neutral-400 text-sm">Año {vehiculo.anio}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {vehiculo.historial?.totalInspecciones || 0}
              </p>
              <p className="text-xs text-neutral-400">Inspecciones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {vehiculo.historial?.notaPromedio || 0}
              </p>
              <p className="text-xs text-neutral-400">Nota Prom.</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {vehiculo.ultimaInspeccion?.nota || "-"}
              </p>
              <p className="text-xs text-neutral-400">Última Nota</p>
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            Información del Vehículo
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-neutral-400" />
                <span className="text-sm text-neutral-600">Empresa</span>
              </div>
              <span className="text-sm font-medium text-neutral-900">
                {vehiculo.empresa}
              </span>
            </div>

            {vehiculo.proveedor && (
              <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-neutral-400" />
                  <span className="text-sm text-neutral-600">Proveedor</span>
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  {vehiculo.proveedor}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-neutral-400" />
                <span className="text-sm text-neutral-600">Tipo</span>
              </div>
              <span className="text-sm font-medium text-neutral-900">
                {vehiculo.tipo}
              </span>
            </div>
          </div>
        </div>

        {/* Inspection History */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600" />
            Historial Reciente
          </h3>

          {vehiculo.ultimaInspeccion ? (
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800">
                  Última Inspección
                </span>
                <span
                  className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    vehiculo.ultimaInspeccion.resultado === "APROBADA"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  )}
                >
                  {vehiculo.ultimaInspeccion.resultado}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-green-700">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(vehiculo.ultimaInspeccion.fecha).toLocaleDateString(
                    "es-CL"
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Nota: {vehiculo.ultimaInspeccion.nota}/100
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-neutral-50 rounded-xl text-center">
              <p className="text-neutral-500 text-sm">
                Sin inspecciones previas registradas
              </p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <p className="text-2xl font-bold text-red-700">
                {vehiculo.historial?.completadas || 0}
              </p>
              <p className="text-xs text-red-600">Completadas</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-700">
                {vehiculo.historial?.programadas || 0}
              </p>
              <p className="text-xs text-yellow-600">Programadas</p>
            </div>
          </div>
        </div>

        {/* Alerts (if any) */}
        {vehiculo.alertas && vehiculo.alertas.length > 0 && (
          <div className="space-y-3">
            {vehiculo.alertas.map((alerta, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 rounded-xl flex items-start gap-3",
                  alerta.tipo === "error" && "bg-red-50 border border-red-200",
                  alerta.tipo === "warning" &&
                    "bg-yellow-50 border border-yellow-200",
                  alerta.tipo === "info" && "bg-blue-50 border border-blue-200"
                )}
              >
                <AlertCircle
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    alerta.tipo === "error" && "text-red-500",
                    alerta.tipo === "warning" && "text-yellow-500",
                    alerta.tipo === "info" && "text-blue-500"
                  )}
                />
                <p
                  className={cn(
                    "text-sm",
                    alerta.tipo === "error" && "text-red-700",
                    alerta.tipo === "warning" && "text-yellow-700",
                    alerta.tipo === "info" && "text-blue-700"
                  )}
                >
                  {alerta.mensaje}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Inspector Info */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-red-600" />
            Inspector Asignado
          </h3>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-red-600">
                {inspector?.nombre?.charAt(0) || "I"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-neutral-900">
                {inspector?.nombre || "Inspector"}
              </p>
              <p className="text-sm text-neutral-500">ID: {inspector?.id || "-"}</p>
            </div>
          </div>
        </div>

        {/* Inspection Checklist Preview */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-red-600" />
              Categorías a Inspeccionar
            </h3>
            <span className="text-sm text-neutral-500">13 categorías</span>
          </div>

          <div className="space-y-2">
            {[
              { name: "Frenos", items: 4, nivel: "N1" },
              { name: "Neumáticos y Ruedas", items: 4, nivel: "N1" },
              { name: "Chasis y Estructura", items: 3, nivel: "N1" },
              { name: "Luces y Señalización", items: 3, nivel: "N1" },
            ].map((cat, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-1 rounded",
                      cat.nivel === "N1"
                        ? "bg-red-100 text-red-700"
                        : "bg-neutral-100 text-neutral-700"
                    )}
                  >
                    {cat.nivel}
                  </span>
                  <span className="text-sm text-neutral-900">{cat.name}</span>
                </div>
                <span className="text-xs text-neutral-500">{cat.items} items</span>
              </div>
            ))}
            <div className="text-center py-2">
              <span className="text-xs text-neutral-400">+ 9 categorías más</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 z-40">
        <button
          onClick={handleStartInspection}
          className="w-full py-4 px-6 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
        >
          <Camera className="h-5 w-5" />
          COMENZAR INSPECCIÓN
        </button>
      </div>
    </div>
  );
}

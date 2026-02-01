"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import {
  Truck,
  Search,
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils-cn";
import { TruckSelectionModal } from "@/components/modules/inspecciones/TruckSelectionModal";

interface Camion {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  empresa: string;
  estado?: "disponible" | "en_inspeccion" | "programado";
  ultimaInspeccion?: string;
  proximaInspeccion?: string;
}

interface Inspector {
  id: string;
  nombre: string;
  email: string;
}

type FilterType = "all" | "available" | "scheduled" | "inspecting";

export default function InspectorFleetPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [filteredCamiones, setFilteredCamiones] = useState<Camion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedTruck, setSelectedTruck] = useState<Camion | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [inspector, setInspector] = useState<Inspector | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCamiones();
  }, [searchQuery, activeFilter, camiones]);

  async function fetchData() {
    try {
      // Obtener datos del inspector
      const meRes = await fetch("/api/inspector/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setInspector(meData.data);
      }

      // Obtener camiones disponibles para inspección
      const res = await fetch("/api/inspector/inspecciones/hoy");
      if (!res.ok) throw new Error("Error al cargar datos");

      const data = await res.json();
      const camionesData = (data.data || []).map((insp: any) => ({
        id: insp.camion_id,
        patente: insp.patente,
        marca: insp.marca,
        modelo: insp.modelo,
        anio: insp.anio || 2020,
        tipo: insp.tipo || "Camión",
        empresa: insp.empresa,
        estado: insp.estado === "PROGRAMADA" ? "programado" :
                insp.estado === "EN_PROGRESO" ? "en_inspeccion" : "disponible",
        proximaInspeccion: insp.fecha_programada,
      }));

      setCamiones(camionesData);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function filterCamiones() {
    let filtered = [...camiones];

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.patente.toLowerCase().includes(query) ||
          c.marca.toLowerCase().includes(query) ||
          c.modelo.toLowerCase().includes(query) ||
          c.empresa.toLowerCase().includes(query)
      );
    }

    // Filtro por estado
    if (activeFilter !== "all") {
      const estadoMap: Record<FilterType, string> = {
        all: "",
        available: "disponible",
        scheduled: "programado",
        inspecting: "en_inspeccion",
      };
      filtered = filtered.filter((c) => c.estado === estadoMap[activeFilter]);
    }

    setFilteredCamiones(filtered);
  }

  const handleSelectTruck = (camion: Camion) => {
    setSelectedTruck(camion);
    setShowModal(true);
  };

  const handleStartInspection = (camionId: number) => {
    router.push(`/inspector/inspeccion/${camionId}/resumen`);
  };

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case "disponible":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Disponible
          </span>
        );
      case "programado":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" />
            Programado
          </span>
        );
      case "en_inspeccion":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <AlertTriangle className="h-3 w-3" />
            En inspección
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="text-center space-y-4">
          <Spinner className="h-10 w-10 mx-auto text-red-500" />
          <p className="text-neutral-400">Cargando flota...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: camiones.length,
    disponibles: camiones.filter((c) => c.estado === "disponible").length,
    programados: camiones.filter((c) => c.estado === "programado").length,
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide">
                  TRUCK CHECKS
                </span>
              </div>
            </div>
            <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {inspector?.nombre?.charAt(0) || "I"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Tu Flota</h1>
          <p className="text-neutral-400 text-sm">
            Bienvenido, {inspector?.nombre || "Inspector"}. Selecciona para comenzar inspección.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar tu flota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wide">
            Vehículos Asignados
          </h2>
          <button className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
            <Filter className="h-4 w-4 text-neutral-500" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
          {[
            { key: "all", label: "Todos", count: stats.total },
            { key: "scheduled", label: "Programados", count: stats.programados },
            { key: "available", label: "Disponibles", count: stats.disponibles },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as FilterType)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeFilter === filter.key
                  ? "bg-red-600 text-white"
                  : "bg-neutral-900 border border-neutral-700 text-neutral-300 hover:border-neutral-600"
              )}
            >
              {filter.label}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeFilter === filter.key
                    ? "bg-red-500 text-white"
                    : "bg-neutral-800 text-neutral-400"
                )}
              >
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Truck List */}
        <div className="space-y-3">
          {filteredCamiones.length === 0 ? (
            <div className="bg-neutral-900 rounded-2xl p-8 text-center border border-neutral-800">
              <Truck className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-white font-semibold mb-1">
                No se encontraron vehículos
              </p>
              <p className="text-neutral-500 text-sm">
                {searchQuery
                  ? "Intenta con otra búsqueda"
                  : "No hay vehículos asignados"}
              </p>
            </div>
          ) : (
            filteredCamiones.map((camion) => (
              <div
                key={camion.id}
                onClick={() => handleSelectTruck(camion)}
                className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  {/* Truck Icon */}
                  <div className="w-14 h-14 bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Truck className="h-7 w-7 text-red-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">
                        {camion.patente}
                      </h3>
                      {getEstadoBadge(camion.estado)}
                    </div>
                    <p className="text-sm text-neutral-300 truncate">
                      {camion.marca} {camion.modelo}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Año: {camion.anio} • {camion.empresa}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="h-5 w-5 text-neutral-600 flex-shrink-0" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Start New Inspection Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              if (filteredCamiones.length > 0) {
                handleSelectTruck(filteredCamiones[0]);
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg shadow-red-600/30"
          >
            INICIAR NUEVA INSPECCIÓN
          </button>
        </div>
      </div>

      {/* Truck Selection Modal */}
      {showModal && selectedTruck && (
        <TruckSelectionModal
          truck={selectedTruck}
          onClose={() => setShowModal(false)}
          onStartInspection={handleStartInspection}
        />
      )}
    </div>
  );
}

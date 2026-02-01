"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import {
  Truck,
  Search,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils-cn";

interface InspeccionHistorial {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  empresa: string;
  fecha: string;
  resultado: "APROBADA" | "OBSERVACION" | "RECHAZADA";
  nota: number;
}

export default function HistorialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inspecciones, setInspecciones] = useState<InspeccionHistorial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInspecciones, setFilteredInspecciones] = useState<InspeccionHistorial[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "approved" | "rejected">("all");

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setInspecciones([
        {
          id: 1,
          patente: "BJFP-32",
          marca: "Volvo",
          modelo: "FH16",
          empresa: "Transportes ABC",
          fecha: "2024-01-28T10:30:00",
          resultado: "APROBADA",
          nota: 92,
        },
        {
          id: 2,
          patente: "CKLM-45",
          marca: "Mercedes",
          modelo: "Actros",
          empresa: "Logística XYZ",
          fecha: "2024-01-27T14:15:00",
          resultado: "OBSERVACION",
          nota: 75,
        },
        {
          id: 3,
          patente: "DFGH-78",
          marca: "Scania",
          modelo: "R500",
          empresa: "Transportes Norte",
          fecha: "2024-01-26T09:00:00",
          resultado: "APROBADA",
          nota: 88,
        },
        {
          id: 4,
          patente: "WXYZ-12",
          marca: "DAF",
          modelo: "XF",
          empresa: "Carga Sur",
          fecha: "2024-01-25T16:45:00",
          resultado: "RECHAZADA",
          nota: 45,
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    let filtered = [...inspecciones];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.patente.toLowerCase().includes(query) ||
          i.marca.toLowerCase().includes(query) ||
          i.empresa.toLowerCase().includes(query)
      );
    }

    if (activeFilter !== "all") {
      filtered = filtered.filter((i) =>
        activeFilter === "approved"
          ? i.resultado === "APROBADA"
          : i.resultado === "RECHAZADA"
      );
    }

    setFilteredInspecciones(filtered);
  }, [searchQuery, activeFilter, inspecciones]);

  const getResultadoConfig = (resultado: string) => {
    switch (resultado) {
      case "APROBADA":
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
        };
      case "OBSERVACION":
        return {
          icon: AlertTriangle,
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
        };
      case "RECHAZADA":
        return {
          icon: XCircle,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
        };
      default:
        return {
          icon: AlertTriangle,
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner className="h-10 w-10 text-teal-600" />
      </div>
    );
  }

  const stats = {
    total: inspecciones.length,
    aprobadas: inspecciones.filter((i) => i.resultado === "APROBADA").length,
    rechazadas: inspecciones.filter((i) => i.resultado === "RECHAZADA").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-gray-900">Historial</h1>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Inspecciones realizadas</p>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <p className="text-2xl font-bold text-green-600">{stats.aprobadas}</p>
            <p className="text-xs text-green-600">Aprobadas</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="text-2xl font-bold text-red-600">{stats.rechazadas}</p>
            <p className="text-xs text-red-600">Rechazadas</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por patente, marca o empresa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Todos" },
            { key: "approved", label: "Aprobadas" },
            { key: "rejected", label: "Rechazadas" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeFilter === filter.key
                  ? "bg-teal-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredInspecciones.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold mb-1">
                Sin inspecciones
              </p>
              <p className="text-gray-500 text-sm">
                No hay inspecciones que coincidan con tu búsqueda
              </p>
            </div>
          ) : (
            filteredInspecciones.map((insp) => {
              const config = getResultadoConfig(insp.resultado);
              const Icon = config.icon;

              return (
                <div
                  key={insp.id}
                  onClick={() =>
                    router.push(`/inspector/inspeccion/${insp.id}/reporte`)
                  }
                  className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                        config.bg
                      )}
                    >
                      <Icon className={cn("h-6 w-6", config.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">
                          {insp.patente}
                        </h3>
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            config.bg,
                            config.color
                          )}
                        >
                          {insp.nota}/100
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {insp.marca} {insp.modelo}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(insp.fecha).toLocaleDateString("es-CL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

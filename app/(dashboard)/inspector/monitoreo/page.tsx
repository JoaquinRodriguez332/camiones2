"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  Truck,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils-cn";

interface Stats {
  hoy: {
    completadas: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
  };
  semana: {
    total: number;
    cambio: number;
    tendencia: "up" | "down";
  };
  promedioNota: number;
  tiempoPromedio: string;
}

export default function MonitoreoPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setStats({
        hoy: {
          completadas: 5,
          pendientes: 3,
          aprobadas: 4,
          rechazadas: 1,
        },
        semana: {
          total: 23,
          cambio: 15,
          tendencia: "up",
        },
        promedioNota: 87,
        tiempoPromedio: "32 min",
      });
      setLoading(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner className="h-10 w-10 text-red-600" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 sticky top-0 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-white mb-1">Monitoreo</h1>
          <p className="text-sm text-neutral-400">
            Resumen de tu actividad de inspecciones
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Today's Progress */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Progreso de Hoy</h2>
            <Calendar className="h-5 w-5 text-neutral-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.hoy.completadas}</p>
              <p className="text-sm text-neutral-300">Completadas</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-3xl font-bold">{stats.hoy.pendientes}</p>
              <p className="text-sm text-neutral-300">Pendientes</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-300">Progreso</span>
              <span className="font-semibold">
                {Math.round(
                  (stats.hoy.completadas /
                    (stats.hoy.completadas + stats.hoy.pendientes)) *
                    100
                )}
                %
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{
                  width: `${
                    (stats.hoy.completadas /
                      (stats.hoy.completadas + stats.hoy.pendientes)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-red-600" />
            Resultados de Hoy
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.hoy.aprobadas}
                </p>
                <p className="text-xs text-green-600">Aprobadas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.hoy.rechazadas}
                </p>
                <p className="text-xs text-red-600">Rechazadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-red-600" />
            Resumen Semanal
          </h3>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <div>
              <p className="text-3xl font-bold text-neutral-900">
                {stats.semana.total}
              </p>
              <p className="text-sm text-neutral-500">Inspecciones esta semana</p>
            </div>

            <div
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
                stats.semana.tendencia === "up"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {stats.semana.tendencia === "up" ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {stats.semana.cambio}%
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Tu Rendimiento</h3>

          <div className="space-y-4">
            {/* Average Score */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Nota Promedio
                  </p>
                  <p className="text-xs text-neutral-500">De tus inspecciones</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-2xl font-bold",
                    stats.promedioNota >= 80
                      ? "text-green-600"
                      : stats.promedioNota >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  )}
                >
                  {stats.promedioNota}
                </p>
                <p className="text-xs text-neutral-500">/100</p>
              </div>
            </div>

            {/* Average Time */}
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    Tiempo Promedio
                  </p>
                  <p className="text-xs text-neutral-500">Por inspección</p>
                </div>
              </div>
              <p className="text-lg font-bold text-neutral-900">
                {stats.tiempoPromedio}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-4">
          <h3 className="font-semibold text-neutral-900 mb-4">Acciones Rápidas</h3>

          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-red-50 rounded-xl text-center hover:bg-red-100 transition-colors">
              <Truck className="h-6 w-6 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-700">
                Nueva Inspección
              </p>
            </button>

            <button className="p-4 bg-neutral-100 rounded-xl text-center hover:bg-neutral-200 transition-colors">
              <BarChart3 className="h-6 w-6 text-neutral-700 mx-auto mb-2" />
              <p className="text-sm font-medium text-neutral-700">Ver Reportes</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

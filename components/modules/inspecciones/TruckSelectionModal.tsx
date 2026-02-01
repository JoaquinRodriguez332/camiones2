"use client";

import { useState } from "react";
import {
  X,
  Truck,
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils-cn";

interface Truck {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  empresa: string;
  estado?: string;
  proximaInspeccion?: string;
}

interface TruckSelectionModalProps {
  truck: Truck;
  onClose: () => void;
  onStartInspection: (truckId: number) => void;
}

export function TruckSelectionModal({
  truck,
  onClose,
  onStartInspection,
}: TruckSelectionModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("09:00");

  const currentMonth = selectedDate.toLocaleString("es-CL", { month: "long", year: "numeric" });

  // Generar días del mes
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (number | null)[] = [];

    // Días vacíos al inicio
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Días del mes
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }

    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const today = new Date();

  const navigateMonth = (direction: "prev" | "next") => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-400" />
          </button>
          <span className="text-sm text-neutral-400 font-medium">
            {new Date().toLocaleDateString("es-CL", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
          >
            <Calendar className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Truck Image Placeholder */}
          <div className="relative h-40 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl mb-4 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Truck className="h-20 w-20 text-neutral-700" />
            </div>
            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              {truck.estado === "programado" ? "Programado" : "Disponible"}
            </span>
          </div>

          {/* Truck Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs text-neutral-500">Truck ID: {truck.patente}</p>
                <h2 className="text-lg font-bold text-white">
                  {truck.marca} {truck.modelo}
                </h2>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                Detalles
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="font-medium text-neutral-300">Tipo:</span>
                <span>{truck.tipo || "Camión"}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="font-medium text-neutral-300">Año:</span>
                <span>{truck.anio}</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400 col-span-2">
                <MapPin className="h-4 w-4" />
                <span>{truck.empresa}</span>
              </div>
            </div>
          </div>

          {/* Inspection Types - Scrollable */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-300 mb-3">
              Tipo de Inspección
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {[
                { id: "all", label: "Todos", count: 0 },
                { id: "complete", label: "Completa", count: 0 },
                { id: "quick", label: "Rápida", count: 3 },
                { id: "specific", label: "Específica", count: 0 },
              ].map((type, idx) => (
                <button
                  key={type.id}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    idx === 0
                      ? "bg-red-600 text-white"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  )}
                >
                  {type.label}
                  {type.count > 0 && (
                    <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                      {type.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-300 mb-3">
              Seleccionar Fecha
            </h3>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-neutral-400" />
              </button>
              <span className="font-semibold text-white capitalize">
                {currentMonth}
              </span>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-neutral-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => (
                <button
                  key={idx}
                  disabled={day === null}
                  onClick={() => {
                    if (day) {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(day);
                      setSelectedDate(newDate);
                    }
                  }}
                  className={cn(
                    "aspect-square flex items-center justify-center text-sm rounded-lg transition-all",
                    day === null && "invisible",
                    day && isToday(day) && "bg-red-900/50 text-red-400 font-bold",
                    day && isSelected(day) && "bg-red-600 text-white font-bold",
                    day &&
                      !isToday(day) &&
                      !isSelected(day) &&
                      "text-neutral-300 hover:bg-neutral-800"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Inspections */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-neutral-300 mb-3">
              Últimas Inspecciones
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-900/50 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Inspección Completa
                    </p>
                    <p className="text-xs text-neutral-500">Hace 3 días</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-neutral-800 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3 px-6 bg-neutral-800 text-white font-semibold rounded-xl hover:bg-neutral-700 transition-colors"
          >
            CANCELAR
          </button>
          <button
            onClick={() => onStartInspection(truck.id)}
            className="py-3 px-6 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            CONTINUAR
          </button>
        </div>
      </div>
    </div>
  );
}

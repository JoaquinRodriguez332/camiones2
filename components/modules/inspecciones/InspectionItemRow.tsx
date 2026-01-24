"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ItemChecklist, RespuestaItem } from "@/lib/inspection/types";
import { cn } from "@/lib/utils-cn";

interface InspectionItemRowProps {
  item: ItemChecklist;
  respuesta: RespuestaItem;
  onChange: (respuesta: RespuestaItem) => void;
}

/**
 * FILA DE ITEM DE INSPECCIÓN
 * - Muestra pregunta y opciones
 * - Campos condicionales (falla/no aplica)
 * - Agrupa en secciones
 */
export function InspectionItemRow({
  item,
  respuesta,
  onChange,
}: InspectionItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleResultadoChange = (estado: "cumple" | "no_cumple" | "no_aplica") => {
    onChange({
      ...respuesta,
      estado,
      descripcionFalla: estado === "no_cumple" ? respuesta.descripcionFalla : undefined,
      motivoNoAplica: estado === "no_aplica" ? respuesta.motivoNoAplica : undefined,
    });
  };

  const statusColor: Record<string, string> = {
    cumple: "border-l-4 border-l-green-500 bg-green-50",
    no_cumple: "border-l-4 border-l-red-500 bg-red-50",
    no_aplica: "border-l-4 border-l-gray-400 bg-gray-50",
  };

  const nivelColor = {
    1: "bg-red-100 text-red-900",
    2: "bg-orange-100 text-orange-900",
    3: "bg-yellow-100 text-yellow-900",
    4: "bg-blue-100 text-blue-900",
  };

  return (
    <Card className={cn(statusColor[respuesta.estado || "cumple"])}>
      <CardContent className="p-4">
        {/* HEADER */}
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn("px-2 py-1 text-xs font-bold rounded", nivelColor[item.nivel as 1 | 2 | 3 | 4])}>
                N{item.nivel}
              </span>
              <span className="text-xs text-gray-600">{item.seccion}</span>
            </div>
            <div className="font-semibold text-sm">{item.titulo}</div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 flex-shrink-0 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-600" />
          )}
        </div>

        {/* DETALLES EXPANDIBLES */}
        {isExpanded && (
          <div className="mt-4 space-y-4 pt-4 border-t">
            {/* OPCIONES DE RESPUESTA */}
            <RadioGroup value={respuesta.estado || ""}>
              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="cumple"
                  id={`${item.id}-ok`}
                  onClick={() => handleResultadoChange("cumple")}
                />
                <Label
                  htmlFor={`${item.id}-ok`}
                  className="cursor-pointer font-medium text-green-700"
                >
                  ✓ OK / Conforme
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="no_cumple"
                  id={`${item.id}-falla`}
                  onClick={() => handleResultadoChange("no_cumple")}
                />
                <Label
                  htmlFor={`${item.id}-falla`}
                  className="cursor-pointer font-medium text-red-700"
                >
                  ✗ Falla / No conforme
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <RadioGroupItem
                  value="no_aplica"
                  id={`${item.id}-no-aplica`}
                  onClick={() => handleResultadoChange("no_aplica")}
                />
                <Label
                  htmlFor={`${item.id}-no-aplica`}
                  className="cursor-pointer font-medium text-gray-700"
                >
                  - No aplica
                </Label>
              </div>
            </RadioGroup>

            {/* CAMPO CONDICIONAL: DESCRIPCIÓN DE FALLA */}
            {respuesta.estado === "no_cumple" && (
              <div className="space-y-2 p-3 bg-red-100/50 rounded">
                <Label htmlFor={`${item.id}-falla-desc`} className="text-sm font-semibold">
                  Descripción de la falla
                </Label>
                <Textarea
                  id={`${item.id}-falla-desc`}
                  placeholder="Describe qué está mal, ubicación, severidad, etc."
                  value={respuesta.descripcionFalla || ""}
                  onChange={(e) =>
                    onChange({
                      ...respuesta,
                      descripcionFalla: e.target.value,
                    })
                  }
                  className="text-sm"
                  rows={3}
                />
              </div>
            )}

            {/* CAMPO CONDICIONAL: MOTIVO NO APLICA */}
            {respuesta.estado === "no_aplica" && (
              <div className="space-y-2 p-3 bg-gray-100/50 rounded">
                <Label htmlFor={`${item.id}-no-aplica-motivo`} className="text-sm font-semibold">
                  Motivo por el que no aplica
                </Label>
                <Textarea
                  id={`${item.id}-no-aplica-motivo`}
                  placeholder="Ej: Camión no tiene acople, tipo de carrocería diferente, etc."
                  value={respuesta.motivoNoAplica || ""}
                  onChange={(e) =>
                    onChange({
                      ...respuesta,
                      motivoNoAplica: e.target.value,
                    })
                  }
                  className="text-sm"
                  rows={2}
                />
              </div>
            )}

            {/* INFO DE NIVEL */}
            <div className="text-xs text-gray-600 p-2 bg-gray-100 rounded">
              <strong>Nivel:</strong> N{item.nivel} • <strong>ID:</strong> {item.id}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

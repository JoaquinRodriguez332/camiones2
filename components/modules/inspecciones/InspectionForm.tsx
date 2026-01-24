"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { ITEMS } from "@/lib/inspection/catalogo";
import type { RespuestaItem } from "@/lib/inspection/types";
import { InspectionItemRow } from "./InspectionItemRow";
import { PhotoUpload } from "./PhotoUpload";
import { calcularNotaResultado } from "@/lib/inspection/rules";

const inspectionFormSchema = z.object({
  camionId: z.string().min(1, "Selecciona un camión"),
  observacionesGenerales: z.string().optional(),
});

type InspectionFormValues = z.infer<typeof inspectionFormSchema>;

interface InspectionFormProps {
  camionId: string;
  inspectorId: string;
  onComplete?: (inspeccionId: string) => void;
  onCancel?: () => void;
}

export function InspectionForm({
  camionId,
  inspectorId,
  onComplete,
  onCancel,
}: InspectionFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("N1");
  const [fotosEvidencia, setFotosEvidencia] = useState<string[]>([]);

  const [respuestas, setRespuestas] = useState<Record<string, RespuestaItem>>(() => {
    const initial: Record<string, RespuestaItem> = {};
    ITEMS.forEach((item) => {
      initial[item.id] = {
        estado: undefined,
        fotos: [],
      };
    });
    return initial;
  });

  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      camionId: camionId,
      observacionesGenerales: "",
    },
  });

  // Calcular nota en tiempo real
  const notaFinal = useMemo(() => {
    const itemsConRespuesta = ITEMS.filter((item) => respuestas[item.id]?.estado);
    if (itemsConRespuesta.length === 0) return 0;

    const respuestasArray = itemsConRespuesta.map((item) => ({
      item_id: item.id,
      nivel: item.nivel,
      estado: respuestas[item.id].estado,
    }));

    const resultado = calcularNotaResultado(respuestasArray as any, ITEMS);
    return typeof resultado.nota === "number" ? resultado.nota : 0;
  }, [respuestas]);

  // Contar fallos por nivel
  const fallosPorNivel = useMemo(() => {
    const counts = { N1: 0, N2: 0, N3: 0, N4: 0 };
    Object.entries(respuestas).forEach(([itemId, resp]) => {
      const item = ITEMS.find((i) => i.id === itemId);
      if (item && resp.estado === "no_cumple") {
        counts[`N${item.nivel}` as keyof typeof counts]++;
      }
    });
    return counts;
  }, [respuestas]);

  const handleSubmit = async (values: InspectionFormValues) => {
    try {
      setIsSubmitting(true);

      // Convertir respuestas a array
      const respuestasArray = ITEMS.map((item) => ({
        itemId: item.id,
        ...respuestas[item.id],
      }));

      const response = await fetch(
        `/api/inspector/inspecciones/${camionId}/completar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            camionId,
            respuestas: respuestasArray,
            observacionesGenerales: values.observacionesGenerales,
            notaFinal: Math.round(notaFinal),
            fotos_evidencia: fotosEvidencia,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al guardar");
      }

      const result = await response.json();
      toast({
        title: "✅ Inspección completada",
        description: `Nota final: ${notaFinal.toFixed(1)}/100`,
        duration: 5000,
      });

      onComplete?.(result.data?.inspeccion_id || camionId);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "❌ Error",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const levels = ["N1", "N2", "N3", "N4"];

  return (
    <div className="w-full space-y-6">
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Inspección de Camión</CardTitle>
              <CardDescription>
                Camión ID: {camionId} • Inspector: {inspectorId}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Nota actual</div>
              <div className={`text-4xl font-bold ${
                notaFinal >= 80
                  ? "text-green-600"
                  : notaFinal >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}>
                {notaFinal.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">/100</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {levels.map((level) => (
              <div key={level} className="text-center p-2 bg-gray-50 rounded">
                <div className="text-xs font-semibold text-gray-600">{level}</div>
                <div className="text-lg font-bold text-red-600">
                  {fallosPorNivel[level as keyof typeof fallosPorNivel]}
                </div>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              {levels.map((level) => (
                <TabsTrigger key={level} value={level}>
                  {level}
                  {fallosPorNivel[level as keyof typeof fallosPorNivel] > 0 && (
                    <span className="ml-1 text-red-600 font-bold">
                      {fallosPorNivel[level as keyof typeof fallosPorNivel]}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {levels.map((level) => {
              const nivelNum = parseInt(level.replace("N", "")) as 1 | 2 | 3 | 4;
              const itemsForLevel = ITEMS.filter((item) => item.nivel === nivelNum);

              return (
                <TabsContent key={level} value={level} className="space-y-4 mt-4">
                  {itemsForLevel.map((item) => (
                    <InspectionItemRow
                      key={item.id}
                      item={item}
                      respuesta={respuestas[item.id] || { estado: undefined, fotos: [] }}
                      onChange={(newRespuesta) => {
                        setRespuestas((prev) => ({
                          ...prev,
                          [item.id]: newRespuesta,
                        }));
                      }}
                    />
                  ))}
                </TabsContent>
              );
            })}
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fotos de Evidencia</CardTitle>
              <CardDescription>Sube fotos de la inspección</CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                onPhotosChange={setFotosEvidencia}
                maxFiles={10}
              />
            </CardContent>
          </Card>

          <FormField
            control={form.control}
            name="observacionesGenerales"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones Generales</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder="Notas adicionales"
                    className="w-full min-h-[100px] p-2 border rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                "Completar Inspección"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

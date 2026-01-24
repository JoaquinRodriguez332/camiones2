"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import InspeccionForm from "@/components/modules/inspecciones/inspeccion-form";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface Inspeccion {
  id: number;
  camionId: number;
  patente: string;
  estado: string;
  resultado: string;
  nota: number | null;
  fechaProgramada: string;
  fechaInspeccion: string | null;
}

export default function InspectorInspeccionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInspeccion, setSelectedInspeccion] = useState<Inspeccion | null>(null);

  // Parámetro opcional: inspeccion_id
  const inspeccionId = searchParams.get("inspeccion_id");

  useEffect(() => {
    loadInspecciones();
  }, []);

  async function loadInspecciones() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inspector/inspecciones", {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al cargar inspecciones");
      }

      setInspecciones(Array.isArray(data.inspecciones) ? data.inspecciones : []);

      // Si viene un ID en URL, seleccionarlo
      if (inspeccionId) {
        const found = data.inspecciones.find((i: any) => i.id === Number(inspeccionId));
        if (found) setSelectedInspeccion(found);
      }
    } catch (err: any) {
      setError(err.message || "Error interno");
    } finally {
      setLoading(false);
    }
  }

  const handleSuccess = () => {
    alert("Inspección guardada exitosamente");
    setSelectedInspeccion(null);
    loadInspecciones();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Inspecciones</h1>
          <p className="text-slate-600">Realiza y gestiona inspecciones de camiones</p>
        </div>

        {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}

        {selectedInspeccion ? (
          <div>
            <button
              onClick={() => setSelectedInspeccion(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Volver a lista
            </button>
            <InspeccionForm
              camionId={selectedInspeccion.camionId}
              patente={selectedInspeccion.patente}
              inspeccionProgramadaId={selectedInspeccion.id}
              onSuccess={handleSuccess}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-slate-900">
              Inspecciones Programadas
            </h2>

            {inspecciones.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-slate-500">No hay inspecciones programadas</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {inspecciones
                  .filter((i) => i.estado === "PROGRAMADA")
                  .map((inspeccion) => (
                    <Card
                      key={inspeccion.id}
                      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setSelectedInspeccion(inspeccion)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {inspeccion.patente}
                          </h3>
                          <p className="text-sm text-slate-600">
                            Programada: {new Date(inspeccion.fechaProgramada).toLocaleString()}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Realizar Inspección
                        </button>
                      </div>
                    </Card>
                  ))}
              </div>
            )}

            {inspecciones.filter((i) => i.estado !== "PROGRAMADA").length > 0 && (
              <>
                <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-900">
                  Historial
                </h2>
                <div className="grid gap-4">
                  {inspecciones
                    .filter((i) => i.estado !== "PROGRAMADA")
                    .map((inspeccion) => (
                      <Card key={inspeccion.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {inspeccion.patente}
                            </h3>
                            <p className="text-sm text-slate-600">
                              Estado: {inspeccion.estado}
                            </p>
                            {inspeccion.nota !== null && (
                              <p className="text-sm font-semibold text-slate-700">
                                Nota: {inspeccion.nota}/100 - {inspeccion.resultado}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

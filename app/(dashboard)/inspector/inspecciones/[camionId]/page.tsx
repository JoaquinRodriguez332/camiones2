"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { InspectionForm } from "@/components/modules/inspecciones/InspectionForm";
import type { InspeccionState } from "@/lib/inspection/types";

interface PageProps {
  params: {
    camionId: string;
  };
}

export default function InspectionPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { camionId } = params;
  const [inspectorId, setInspectorId] = useState<string>("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Obtener inspector_id del JWT
  useEffect(() => {
    const getMe = async () => {
      try {
        const response = await fetch("/api/inspector/me");
        if (!response.ok) throw new Error("No autorizado");
        const data = await response.json();
        setInspectorId(data.data?.id || "");
      } catch {
        toast({
          title: "❌ Error",
          description: "No se pudo verificar tu identidad",
          variant: "destructive",
        });
        router.push("/login/inspector");
      } finally {
        setLoading(false);
      }
    };

    getMe();
  }, []);

  const handleComplete = (inspeccionId: string) => {
    setCompleted(true);
    toast({
      title: "✅ Inspección completada",
      description: "Los datos han sido guardados en el servidor",
      duration: 5000,
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p>Cargando...</p>
        </div>
      </main>
    );
  }

  if (completed) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">¡Inspección Completada!</h1>
          <p className="text-gray-600 mb-6">
            Tus respuestas y fotos han sido guardadas con éxito
          </p>
          <Button onClick={() => router.push("/dashboard/inspector")} className="w-full">
            Volver al Panel
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      {/* HEADER */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Atrás
        </Button>
        <h1 className="text-3xl font-bold">Formulario de Inspección</h1>
        <p className="text-gray-600 mt-2">
          Completa todos los ítems y sube fotos como evidencia
        </p>
      </div>

      {/* FORMULARIO */}
      <div className="max-w-4xl mx-auto">
        <InspectionForm
          camionId={camionId}
          inspectorId={inspectorId}
          onComplete={handleComplete}
          onCancel={() => router.back()}
        />
      </div>
    </main>
  );
}

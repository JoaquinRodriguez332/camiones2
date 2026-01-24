"use client";

import { useReducer, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  createInitialState,
  setEstadoItem,
  setDescripcionFalla,
  setMotivoNoAplica,
  addFoto,
  removeFoto,
  calcularNotaResultado,
  validarParaFinalizar,
} from "@/lib/inspection/rules";
import { ITEMS, groupItems } from "@/lib/inspection/catalogo";
import type { InspeccionState, ItemChecklist, RespuestaItem } from "@/lib/inspection/types";

interface InspeccionFormProps {
  camionId: number;
  patente: string;
  inspeccionProgramadaId?: number;
  onSuccess?: () => void;
}

type Action =
  | { type: "SET_META"; key: string; value: string }
  | { type: "SET_ESTADO"; itemId: string; estado: "cumple" | "no_cumple" | "no_aplica" }
  | { type: "SET_DESCRIPCION"; itemId: string; descripcion: string }
  | { type: "SET_MOTIVO"; itemId: string; motivo: string }
  | { type: "ADD_FOTO"; itemId: string; foto: any }
  | { type: "REMOVE_FOTO"; itemId: string; fotoId: string };

function reducer(state: InspeccionState, action: Action): InspeccionState {
  switch (action.type) {
    case "SET_META":
      return {
        ...state,
        meta: { ...state.meta, [action.key]: action.value },
      };
    case "SET_ESTADO":
      return setEstadoItem(state, action.itemId, action.estado);
    case "SET_DESCRIPCION":
      return setDescripcionFalla(state, action.itemId, action.descripcion);
    case "SET_MOTIVO":
      return setMotivoNoAplica(state, action.itemId, action.motivo);
    case "ADD_FOTO":
      return addFoto(state, action.itemId, action.foto);
    case "REMOVE_FOTO":
      return removeFoto(state, action.itemId, action.fotoId);
    default:
      return state;
  }
}

export default function InspeccionForm({
  camionId,
  patente,
  inspeccionProgramadaId,
  onSuccess,
}: InspeccionFormProps) {
  const [state, dispatch] = useReducer(reducer, ITEMS, (items) =>
    createInitialState(items)
  );

  const [saving, setSaving] = useReducer((s) => !s, false);
  const [error, setError] = useState("");

  // Calcular nota
  const notaResultado = useMemo(
    () => calcularNotaResultado(state, ITEMS),
    [state]
  );

  // Validar
  const validation = useMemo(
    () => validarParaFinalizar(state, ITEMS),
    [state]
  );

  const handleSetMeta = useCallback(
    (key: string, value: string) => {
      dispatch({ type: "SET_META", key, value });
    },
    []
  );

  const handleSetEstado = useCallback(
    (itemId: string, estado: "cumple" | "no_cumple" | "no_aplica") => {
      dispatch({ type: "SET_ESTADO", itemId, estado });
    },
    []
  );

  const handleSetDescripcion = useCallback(
    (itemId: string, descripcion: string) => {
      dispatch({ type: "SET_DESCRIPCION", itemId, descripcion });
    },
    []
  );

  const handleSetMotivo = useCallback(
    (itemId: string, motivo: string) => {
      dispatch({ type: "SET_MOTIVO", itemId, motivo });
    },
    []
  );

  const handleAddFoto = useCallback(
    (itemId: string, file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string)?.split(",")[1];
        if (base64) {
          dispatch({
            type: "ADD_FOTO",
            itemId,
            foto: {
              id: `foto_${Date.now()}`,
              base64,
              nombreArchivo: file.name,
              tipoMime: file.type,
              fechaCaptura: new Date().toISOString(),
            },
          });
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleRemoveFoto = useCallback(
    (itemId: string, fotoId: string) => {
      dispatch({ type: "REMOVE_FOTO", itemId, fotoId });
    },
    []
  );

  const handleSubmit = async () => {
    if (!validation.ok) {
      setError(validation.errores.join("\n"));
      return;
    }

    setSaving();
    setError("");

    try {
      // Preparar detalles
      const detalles = Object.entries(state.respuestas).map(([itemId, respuesta]) => ({
        itemId,
        estado: respuesta.estado,
        descripcionFalla: respuesta.descripcionFalla,
        motivoNoAplica: respuesta.motivoNoAplica,
        fotos: respuesta.fotos.map((f) => ({
          base64: f.previewUrl, // Nota: necesitaremos convertir esto
          nombreArchivo: f.file?.name || "foto",
          tipoMime: f.file?.type || "image/jpeg",
          fechaCaptura: f.createdAtISO,
        })),
      }));

      const response = await fetch("/api/inspector/inspecciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspeccionProgramadaId,
          camionId,
          estadoInspeccion: "COMPLETADA",
          detalles,
          nota: notaResultado.nota,
          resultado: notaResultado.resultado,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Error interno");
    } finally {
      setSaving();
    }
  };

  const grouped = useMemo(() => groupItems(ITEMS), []);

  return (
    <div className="space-y-6">
      {/* Meta */}
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Datos de la Inspección</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Inspector</label>
            <Input
              value={state.meta.inspector}
              onChange={(e) => handleSetMeta("inspector", e.target.value)}
              placeholder="Nombre del inspector"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Empresa</label>
            <Input
              value={state.meta.empresa}
              onChange={(e) => handleSetMeta("empresa", e.target.value)}
              placeholder="Nombre de empresa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lugar</label>
            <Input
              value={state.meta.lugar}
              onChange={(e) => handleSetMeta("lugar", e.target.value)}
              placeholder="Lugar de inspección"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Patente Camión</label>
            <Input value={patente} disabled />
          </div>
        </div>
      </Card>

      {/* Checklist */}
      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([grupo, bySeccion]) => (
          <div key={grupo}>
            <h3 className="text-lg font-bold mb-2 text-slate-900">{grupo}</h3>
            {Array.from(bySeccion.entries()).map(([seccion, items]) => (
              <div key={seccion} className="mb-3">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">{seccion}</h4>
                <div className="space-y-2">
                  {items.map((item) => (
                    <ChecklistItemComponent
                      key={item.id}
                      item={item}
                      respuesta={state.respuestas[item.id]}
                      onSetEstado={(estado) => handleSetEstado(item.id, estado)}
                      onSetDescripcion={(desc) => handleSetDescripcion(item.id, desc)}
                      onSetMotivo={(motivo) => handleSetMotivo(item.id, motivo)}
                      onAddFoto={(file) => handleAddFoto(item.id, file)}
                      onRemoveFoto={(fotoId) => handleRemoveFoto(item.id, fotoId)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Resultado */}
      <Card className="p-4 bg-slate-50">
        <h3 className="text-lg font-bold mb-2">Resultado</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Nota Final</p>
            <p className="text-3xl font-bold">{notaResultado.nota}/100</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Estado</p>
            <p className={`text-xl font-bold ${
              notaResultado.resultado === "RECHAZADO" ? "text-red-600" :
              notaResultado.resultado === "OBSERVACION" ? "text-yellow-600" :
              "text-green-600"
            }`}>
              {notaResultado.resultado}
            </p>
          </div>
        </div>
      </Card>

      {/* Errores */}
      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Botones */}
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={saving} variant="default">
          {saving ? "Guardando..." : "Guardar Inspección"}
        </Button>
      </div>
    </div>
  );
}

function ChecklistItemComponent({
  item,
  respuesta,
  onSetEstado,
  onSetDescripcion,
  onSetMotivo,
  onAddFoto,
  onRemoveFoto,
}: {
  item: ItemChecklist;
  respuesta: RespuestaItem;
  onSetEstado: (estado: "cumple" | "no_cumple" | "no_aplica") => void;
  onSetDescripcion: (desc: string) => void;
  onSetMotivo: (motivo: string) => void;
  onAddFoto: (file: File) => void;
  onRemoveFoto: (fotoId: string) => void;
}) {
  return (
    <Card className="p-3 border border-slate-200">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h5 className="font-semibold text-slate-900">{item.titulo}</h5>
          <p className="text-xs text-slate-500 mt-1">{item.id}</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={respuesta.estado === "cumple" ? "default" : "outline"}
            onClick={() => onSetEstado("cumple")}
          >
            Cumple
          </Button>
          <Button
            size="sm"
            variant={respuesta.estado === "no_cumple" ? "destructive" : "outline"}
            onClick={() => onSetEstado("no_cumple")}
          >
            No Cumple
          </Button>
          <Button
            size="sm"
            variant={respuesta.estado === "no_aplica" ? "secondary" : "outline"}
            onClick={() => onSetEstado("no_aplica")}
          >
            N/A
          </Button>
        </div>
      </div>

      {respuesta.estado === "no_cumple" && (
        <div className="mt-3 space-y-2 border-t pt-3">
          <Textarea
            value={respuesta.descripcionFalla || ""}
            onChange={(e) => onSetDescripcion(e.target.value)}
            placeholder="Descripción de la falla (mín. 10 caracteres)"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onAddFoto(e.target.files[0])}
            />
            {respuesta.fotos?.map((foto) => (
              <div key={foto.id} className="flex items-center gap-2 mt-2">
                <img src={foto.previewUrl} alt="preview" className="w-16 h-16 object-cover rounded" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveFoto(foto.id)}
                >
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {respuesta.estado === "no_aplica" && (
        <div className="mt-3 border-t pt-3">
          <Textarea
            value={respuesta.motivoNoAplica || ""}
            onChange={(e) => onSetMotivo(e.target.value)}
            placeholder="Motivo por el que no aplica"
          />
        </div>
      )}
    </Card>
  );
}

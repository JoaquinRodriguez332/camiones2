// lib/inspection/rules.ts
// =========================================================
// PETRAN — Reglas completas (ACTUALIZADO para Plantillas)
// =========================================================

import type {
  ConteoFallas,
  InspeccionState,
  ItemChecklist,
  Nivel,
  NotaResultado,
  RespuestaItem,
  ValidationResult,
} from "./types";

import {
  PENALIZACION_POR_NIVEL,
  emptyRespuesta,
  nowISO,
} from "./types";

// ---------------- Inicialización ----------------

export function createInitialState(items: ItemChecklist[]): InspeccionState {
  const respuestas: Record<string, RespuestaItem> = {};
  for (const it of items) respuestas[it.id] = emptyRespuesta();

  return {
    meta: {
      fechaHoraISO: nowISO(),
      inspector: "",
      empresa: "",
      lugar: "",
      patenteCamion: "",
      patenteRemolque: "",
    },
    respuestas,
  };
}

// ---------------- Conteo / Nota / Resultado ----------------

export function contarFallasPorNivel(
  state: InspeccionState,
  items: ItemChecklist[]
): ConteoFallas {
  const c: ConteoFallas = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const it of items) {
    const r = state.respuestas[it.id];
    if (r?.estado === "no_cumple") c[it.nivel] += 1;
  }
  return c;
}

export function calcularNotaResultado(
  state: InspeccionState,
  items: ItemChecklist[]
): NotaResultado {
  const fallas = contarFallasPorNivel(state, items);
  const descuento =
    fallas[1] * PENALIZACION_POR_NIVEL[1] +
    fallas[2] * PENALIZACION_POR_NIVEL[2] +
    fallas[3] * PENALIZACION_POR_NIVEL[3] +
    fallas[4] * PENALIZACION_POR_NIVEL[4];

  const nota = Math.max(0, 100 - descuento);

  let resultado: NotaResultado["resultado"] = "APROBADO";
  if (fallas[1] >= 1) resultado = "RECHAZADO";
  else if (fallas[2] >= 1) resultado = "OBSERVACION";

  return { nota, descuento, fallas, resultado };
}

// ---------------- Validación para finalizar ----------------

export function validarMeta(state: InspeccionState): string[] {
  const e: string[] = [];
  const m = state.meta;

  if (!m.inspector.trim()) e.push("Falta Inspector.");
  if (!m.empresa.trim()) e.push("Falta Empresa / Cliente.");
  if (!m.lugar.trim()) e.push("Falta Lugar.");
  if (!m.patenteCamion.trim()) e.push("Falta Patente del Camión.");

  return e;
}

export function validarParaFinalizar(
  state: InspeccionState,
  items: ItemChecklist[]
): ValidationResult {
  const errores: string[] = [];
  let faltantes = 0;

  errores.push(...validarMeta(state));

  for (const it of items) {
    const r = state.respuestas[it.id];

    if (!r?.estado) {
      faltantes += 1;
      errores.push(`Falta responder: ${it.seccion} — ${it.titulo} (${it.id})`);
      continue;
    }

    if (r.estado === "no_cumple") {
      const desc = (r.descripcionFalla ?? "").trim();
      if (desc.length < 10) {
        errores.push(
          `Falta descripción (mín. 10 caracteres): ${it.seccion} — ${it.titulo} (${it.id})`
        );
      }
      if (!r.fotos || r.fotos.length < 1) {
        errores.push(
          `Falta foto evidencia (mín. 1): ${it.seccion} — ${it.titulo} (${it.id})`
        );
      }
    }

    if (r.estado === "no_aplica") {
      const motivo = (r.motivoNoAplica ?? "").trim();
      if (motivo.length < 3) {
        errores.push(
          `Falta motivo "No aplica": ${it.seccion} — ${it.titulo} (${it.id})`
        );
      }
    }
  }

  return { ok: errores.length === 0, errores, faltantes };
}

// ---------------- Helpers UI ----------------

export function levelTagClass(nivel: Nivel): string {
  return `level-tag level-${nivel}`;
}

export function resultadoPillText(res: NotaResultado["resultado"]): string {
  if (res === "RECHAZADO") return "RECHAZADO";
  if (res === "OBSERVACION") return "APROBADO CON OBSERVACIONES";
  return "APROBADO";
}

// ---------------- Mutators seguros ----------------

export function setEstadoItem(
  state: InspeccionState,
  itemId: string,
  estado: "cumple" | "no_cumple" | "no_aplica"
): InspeccionState {
  const prev = state.respuestas[itemId] ?? emptyRespuesta();

  if (estado === "cumple") {
    return {
      ...state,
      respuestas: {
        ...state.respuestas,
        [itemId]: { estado, descripcionFalla: "", motivoNoAplica: "", fotos: [] },
      },
    };
  }

  if (estado === "no_aplica") {
    return {
      ...state,
      respuestas: {
        ...state.respuestas,
        [itemId]: {
          ...prev,
          estado,
          descripcionFalla: "",
          fotos: [],
          motivoNoAplica: prev.motivoNoAplica ?? "",
        },
      },
    };
  }

  return {
    ...state,
    respuestas: {
      ...state.respuestas,
      [itemId]: { ...prev, estado, motivoNoAplica: "" },
    },
  };
}

export function setDescripcionFalla(
  state: InspeccionState,
  itemId: string,
  descripcion: string
): InspeccionState {
  const prev = state.respuestas[itemId] ?? emptyRespuesta();
  return {
    ...state,
    respuestas: {
      ...state.respuestas,
      [itemId]: { ...prev, descripcionFalla: descripcion },
    },
  };
}

export function setMotivoNoAplica(
  state: InspeccionState,
  itemId: string,
  motivo: string
): InspeccionState {
  const prev = state.respuestas[itemId] ?? emptyRespuesta();
  return {
    ...state,
    respuestas: {
      ...state.respuestas,
      [itemId]: { ...prev, motivoNoAplica: motivo },
    },
  };
}

export function addFoto(
  state: InspeccionState,
  itemId: string,
  foto: { id: string; file: File; previewUrl: string; createdAtISO: string }
): InspeccionState {
  const prev = state.respuestas[itemId] ?? emptyRespuesta();
  return {
    ...state,
    respuestas: {
      ...state.respuestas,
      [itemId]: { ...prev, fotos: [...(prev.fotos ?? []), foto] },
    },
  };
}

export function removeFoto(
  state: InspeccionState,
  itemId: string,
  fotoId: string
): InspeccionState {
  const prev = state.respuestas[itemId] ?? emptyRespuesta();
  return {
    ...state,
    respuestas: {
      ...state.respuestas,
      [itemId]: { ...prev, fotos: (prev.fotos ?? []).filter((f) => f.id !== fotoId) },
    },
  };
}

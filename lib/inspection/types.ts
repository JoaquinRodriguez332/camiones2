// types.ts
// =========================================================
// PETRAN — Inspección General (TypeScript)
// Tipos + helpers de estado (sin framework)
// =========================================================

export type Nivel = 1 | 2 | 3 | 4;
export type EstadoItem = "cumple" | "no_cumple" | "no_aplica";

export type ItemChecklist = {
  id: string;          // ej: "N1-01"
  nivel: Nivel;        // 1..4
  grupo: string;       // ej: "NIVEL 1 — CRÍTICO"
  seccion: string;     // ej: "Frenos (visual)"
  titulo: string;      // ej: "Fugas de aire (frenos neumáticos)"
  obligatorio?: boolean; // por defecto true
};

export type Foto = {
  id: string;          // uuid simple
  file: File;
  previewUrl: string;  // URL.createObjectURL(file)
  createdAtISO: string;
};

export type RespuestaItem = {
  estado?: EstadoItem;

  // Si estado === "no_cumple"
  descripcionFalla?: string;
  fotos: Foto[];

  // Si estado === "no_aplica"
  motivoNoAplica?: string;
};

export type InspeccionMeta = {
  fechaHoraISO: string;     // auto
  inspector: string;
  empresa: string;
  lugar: string;
  patenteCamion: string;
  patenteRemolque?: string;
};

export type InspeccionState = {
  meta: InspeccionMeta;
  respuestas: Record<string, RespuestaItem>; // key: ItemChecklist.id
};

export type ConteoFallas = Record<Nivel, number>;

export type NotaResultado = {
  nota: number;        // 0..100
  descuento: number;
  fallas: ConteoFallas;
  resultado: "APROBADO" | "OBSERVACION" | "RECHAZADO";
};

export type Plantilla = {
  key: string;
  nombre: string;
  descripcion?: string;
  items: ItemChecklist[];
};

export type ValidationResult = {
  ok: boolean;
  errores: string[];
  faltantes: number;
};

// -------------------- Helpers --------------------

export const PENALIZACION_POR_NIVEL: Record<Nivel, number> = {
  1: 30,
  2: 15,
  3: 7,
  4: 2,
};

export function nowISO(): string {
  return new Date().toISOString();
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

/** Crea una foto con previewUrl listo para mostrar (recuerda revocar al eliminar/terminar). */
export function createFoto(file: File): Foto {
  return {
    id: uid("foto"),
    file,
    previewUrl: URL.createObjectURL(file),
    createdAtISO: nowISO(),
  };
}

/** Revoca preview URLs para evitar leaks */
export function revokeFotoPreview(f: Foto) {
  try {
    URL.revokeObjectURL(f.previewUrl);
  } catch {
    // noop
  }
}

export function emptyRespuesta(): RespuestaItem {
  return {
    estado: undefined,
    descripcionFalla: "",
    motivoNoAplica: "",
    fotos: [],
  };
}

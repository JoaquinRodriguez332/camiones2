import type { ItemChecklist, Plantilla } from "../types";

/**
 * PLANTILLA: CAJA SECA / PAQUETERO
 * Fuente: Paquetero.docx
 */
export const PAQUETERO_ITEMS: ItemChecklist[] = [
  //  NIVEL 1 – CRÍTICO
  { id: "PAQ-N1-01", nivel: 1, grupo: "PAQUETERO — NIVEL 1 (CRÍTICO)", seccion: "Estructura y seguridad", titulo: "Fijación de la caja al chasis (pernos, soportes, anclajes firmes)" },
  { id: "PAQ-N1-02", nivel: 1, grupo: "PAQUETERO — NIVEL 1 (CRÍTICO)", seccion: "Estructura y seguridad", titulo: "Estructura principal (paneles sin grietas estructurales / sin deformaciones graves)" },
  { id: "PAQ-N1-03", nivel: 1, grupo: "PAQUETERO — NIVEL 1 (CRÍTICO)", seccion: "Puertas y cierre", titulo: "Puertas traseras (bisagras firmes, cerraduras/trabas operativas, cierre seguro)" },
  { id: "PAQ-N1-04", nivel: 1, grupo: "PAQUETERO — NIVEL 1 (CRÍTICO)", seccion: "Puertas y cierre", titulo: "Marco trasero (alineado, sin fisuras ni torceduras)" },
  { id: "PAQ-N1-05", nivel: 1, grupo: "PAQUETERO — NIVEL 1 (CRÍTICO)", seccion: "Piso de carga", titulo: "Piso de carga (sin roturas/perforaciones, capacidad estructural intacta)" },
  { id: "PAQ-N1-06", nivel: 1, grupo: "PAQUETERO — NIVEL 1 (CRÍTICO)", seccion: "Identificación", titulo: "Línea/indicación de carga máxima visible" },

  //  NIVEL 2 – ALTO
  { id: "PAQ-N2-07", nivel: 2, grupo: "PAQUETERO — NIVEL 2 (ALTO)", seccion: "Carrocería", titulo: "Paneles laterales (golpes profundos, ondulaciones, fatiga del material)" },
  { id: "PAQ-N2-08", nivel: 2, grupo: "PAQUETERO — NIVEL 2 (ALTO)", seccion: "Carrocería", titulo: "Techo (abolladuras, filtraciones de agua)" },
  { id: "PAQ-N2-09", nivel: 2, grupo: "PAQUETERO — NIVEL 2 (ALTO)", seccion: "Estructura", titulo: "Postes estructurales (esquinas y laterales) rectos y sin corrosión avanzada" },
  { id: "PAQ-N2-10", nivel: 2, grupo: "PAQUETERO — NIVEL 2 (ALTO)", seccion: "Trasera", titulo: "Parachoques/defensa trasera bien fijado y sin deformaciones severas" },
  { id: "PAQ-N2-11", nivel: 2, grupo: "PAQUETERO — NIVEL 2 (ALTO)", seccion: "Riesgos", titulo: "Elementos sobresalientes o cortantes (tornillos/perfiles/chapas sueltas)" },

  //  NIVEL 3 – MEDIO
  { id: "PAQ-N3-12", nivel: 3, grupo: "PAQUETERO — NIVEL 3 (MEDIO)", seccion: "Interior", titulo: "Revestimiento interior (golpes, desprendimientos parciales)" },
  { id: "PAQ-N3-13", nivel: 3, grupo: "PAQUETERO — NIVEL 3 (MEDIO)", seccion: "Interior", titulo: "Rieles o puntos de amarre firmes y no deformados" },
  { id: "PAQ-N3-14", nivel: 3, grupo: "PAQUETERO — NIVEL 3 (MEDIO)", seccion: "Piso", titulo: "Estado superficial del piso (desgaste normal, sin zonas peligrosas)" },
  { id: "PAQ-N3-15", nivel: 3, grupo: "PAQUETERO — NIVEL 3 (MEDIO)", seccion: "Ventilación", titulo: "Ventilación pasiva (si existe): rejillas limpias, sin obstrucciones" },
  { id: "PAQ-N3-16", nivel: 3, grupo: "PAQUETERO — NIVEL 3 (MEDIO)", seccion: "Iluminación", titulo: "Iluminación interior (si existe): funcional y cableado protegido" },

  //  NIVEL 4 – BAJO
  { id: "PAQ-N4-17", nivel: 4, grupo: "PAQUETERO — NIVEL 4 (BAJO)", seccion: "Estética", titulo: "Pintura exterior (rayones, decoloración)" },
  { id: "PAQ-N4-18", nivel: 4, grupo: "PAQUETERO — NIVEL 4 (BAJO)", seccion: "Estética", titulo: "Detalles estéticos interiores (marcas de uso, golpes menores)" },
  { id: "PAQ-N4-19", nivel: 4, grupo: "PAQUETERO — NIVEL 4 (BAJO)", seccion: "Estética", titulo: "Rotulación y gráficas (desgaste visual)" },
];

export const PLANTILLA_PAQUETERO: Plantilla = {
  key: "paquetero",
  nombre: "Caja Seca / Paquetero",
  descripcion: "Checklist específico para inspección de caja seca (paquetero).",
  items: PAQUETERO_ITEMS,
};

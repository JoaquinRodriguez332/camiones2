import type { ItemChecklist, Plantilla } from "../types";

/**
 * Plantilla: CARRO DE CAMIÓN
 * Fuente: documento "Carro.docx"
 */
export const CARRO_ITEMS: ItemChecklist[] = [
  // NIVEL 1 – CRÍTICO
  { id: "CAR-N1-01", nivel: 1, grupo: "CARRO — NIVEL 1 (CRÍTICO)", seccion: "Seguridad operativa", titulo: "Fijación de la caja al chasis (enganche)" },
  { id: "CAR-N1-02", nivel: 1, grupo: "CARRO — NIVEL 1 (CRÍTICO)", seccion: "Seguridad operativa", titulo: "Sistema de frenos" },
  { id: "CAR-N1-03", nivel: 1, grupo: "CARRO — NIVEL 1 (CRÍTICO)", seccion: "Seguridad operativa", titulo: "Ejes" },
  { id: "CAR-N1-04", nivel: 1, grupo: "CARRO — NIVEL 1 (CRÍTICO)", seccion: "Seguridad operativa", titulo: "Ruedas y neumáticos" },
  { id: "CAR-N1-05", nivel: 1, grupo: "CARRO — NIVEL 1 (CRÍTICO)", seccion: "Seguridad operativa", titulo: "Suspensión" },
  { id: "CAR-N1-06", nivel: 1, grupo: "CARRO — NIVEL 1 (CRÍTICO)", seccion: "Seguridad operativa", titulo: "Luces y señalización" },
  { id: "CAR-N1-07", nivel: 1, grupo: "CARRO — NIVEL 1 (CRÍTICO)", seccion: "Seguridad operativa", titulo: "Plataforma de carga (suelo)" },

  // NIVEL 2 – ALTO
  { id: "CAR-N2-01", nivel: 2, grupo: "CARRO — NIVEL 2 (ALTO)", seccion: "Funcionamiento continuo seguro", titulo: "Paneles laterales" },
  { id: "CAR-N2-02", nivel: 2, grupo: "CARRO — NIVEL 2 (ALTO)", seccion: "Funcionamiento continuo seguro", titulo: "Postes y travesaños (crossmembers)" },
  { id: "CAR-N2-03", nivel: 2, grupo: "CARRO — NIVEL 2 (ALTO)", seccion: "Funcionamiento continuo seguro", titulo: "Marco trasero (parachoques)" },
  { id: "CAR-N2-04", nivel: 2, grupo: "CARRO — NIVEL 2 (ALTO)", seccion: "Funcionamiento continuo seguro", titulo: "Sistema de enganche o quinta rueda" },
  { id: "CAR-N2-05", nivel: 2, grupo: "CARRO — NIVEL 2 (ALTO)", seccion: "Funcionamiento continuo seguro", titulo: "Protección de componentes eléctricos" },

  // NIVEL 3 – MEDIO
  { id: "CAR-N3-01", nivel: 3, grupo: "CARRO — NIVEL 3 (MEDIO)", seccion: "Funcional / Preventivo", titulo: "Revestimiento interior de la caja" },
  { id: "CAR-N3-02", nivel: 3, grupo: "CARRO — NIVEL 3 (MEDIO)", seccion: "Funcional / Preventivo", titulo: "Rieles de amarre" },
  { id: "CAR-N3-03", nivel: 3, grupo: "CARRO — NIVEL 3 (MEDIO)", seccion: "Funcional / Preventivo", titulo: "Piso de aluminio o acero" },
  { id: "CAR-N3-04", nivel: 3, grupo: "CARRO — NIVEL 3 (MEDIO)", seccion: "Funcional / Preventivo", titulo: "Ventilación pasiva (si aplica)" },
  { id: "CAR-N3-05", nivel: 3, grupo: "CARRO — NIVEL 3 (MEDIO)", seccion: "Funcional / Preventivo", titulo: "Sistema de drenaje (si existe)" },

  // NIVEL 4 – BAJO
  { id: "CAR-N4-01", nivel: 4, grupo: "CARRO — NIVEL 4 (BAJO)", seccion: "Estético / Secundario", titulo: "Pintura exterior" },
  { id: "CAR-N4-02", nivel: 4, grupo: "CARRO — NIVEL 4 (BAJO)", seccion: "Estético / Secundario", titulo: "Detalles estéticos interiores" },
  { id: "CAR-N4-03", nivel: 4, grupo: "CARRO — NIVEL 4 (BAJO)", seccion: "Estético / Secundario", titulo: "Rotulación y gráficos" },
];

export const PLANTILLA_CARRO: Plantilla = {
  key: "carro",
  nombre: "Carro de Camión",
  descripcion: "Checklist específico para inspección de carro/remolque",
  items: CARRO_ITEMS,
};

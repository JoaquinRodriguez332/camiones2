import type { ItemChecklist, Plantilla } from "../types";

/**
 * PLANTILLA: RIFER / REEFER (caja refrigerada)
 * Fuente: Rifer.docx
 */
export const RIFER_ITEMS: ItemChecklist[] = [
  // 🔴 NIVEL 1 — CRÍTICO (Operación + Sanidad + Seguridad)
  {
    id: "RIF-N1-01",
    nivel: 1,
    grupo: "RIFER — NIVEL 1 (CRÍTICO)",
    seccion: "Unidad de refrigeración / Compresor",
    titulo: "Sin golpes, ruidos anormales ni fugas (operación segura)",
  },
  {
    id: "RIF-N1-02",
    nivel: 1,
    grupo: "RIFER — NIVEL 1 (CRÍTICO)",
    seccion: "Panel frontal / maquinaria",
    titulo: "Integridad estructural y fijaciones firmes",
  },
  {
    id: "RIF-N1-03",
    nivel: 1,
    grupo: "RIFER — NIVEL 1 (CRÍTICO)",
    seccion: "Aislación térmica (poliuretano)",
    titulo: "Sin humedad, deformaciones ni pérdida de frío",
  },
  {
    id: "RIF-N1-04",
    nivel: 1,
    grupo: "RIFER — NIVEL 1 (CRÍTICO)",
    seccion: "Panel techo",
    titulo: "Sin fisuras ni filtraciones de agua",
  },
  {
    id: "RIF-N1-05",
    nivel: 1,
    grupo: "RIFER — NIVEL 1 (CRÍTICO)",
    seccion: "Puertas (panel puertas)",
    titulo: "Sellos intactos y cierre hermético",
  },
  {
    id: "RIF-N1-06",
    nivel: 1,
    grupo: "RIFER — NIVEL 1 (CRÍTICO)",
    seccion: "Sanidad",
    titulo: "Tapón de drenado presente y funcional",
  },
  {
    id: "RIF-N1-07",
    nivel: 1,
    grupo: "RIFER — NIVEL 1 (CRÍTICO)",
    seccion: "Seguridad estructural",
    titulo: "Línea de máxima carga visible y respetada",
  },

  // 🟠 NIVEL 2 — ALTO (Funcionamiento seguro y continuo)
  {
    id: "RIF-N2-01",
    nivel: 2,
    grupo: "RIFER — NIVEL 2 (ALTO)",
    seccion: "Ventilación",
    titulo: "Ventila/ventiladores: flujo de aire correcto",
  },
  {
    id: "RIF-N2-02",
    nivel: 2,
    grupo: "RIFER — NIVEL 2 (ALTO)",
    seccion: "Riel frontal superior",
    titulo: "Soporte de carga y canalización de aire correcta",
  },
  {
    id: "RIF-N2-03",
    nivel: 2,
    grupo: "RIFER — NIVEL 2 (ALTO)",
    seccion: "Riel trasero superior",
    titulo: "Distribución homogénea del frío",
  },
  {
    id: "RIF-N2-04",
    nivel: 2,
    grupo: "RIFER — NIVEL 2 (ALTO)",
    seccion: "Poste frontal",
    titulo: "Rigidez estructural (sin deformaciones críticas)",
  },
  {
    id: "RIF-N2-05",
    nivel: 2,
    grupo: "RIFER — NIVEL 2 (ALTO)",
    seccion: "Poste trasero",
    titulo: "Soporte y alineación correctos",
  },
  {
    id: "RIF-N2-06",
    nivel: 2,
    grupo: "RIFER — NIVEL 2 (ALTO)",
    seccion: "Postes laterales",
    titulo: "Integridad estructural interna",
  },
  {
    id: "RIF-N2-07",
    nivel: 2,
    grupo: "RIFER — NIVEL 2 (ALTO)",
    seccion: "Placa deflectora",
    titulo: "Dirección correcta del flujo de aire",
  },

  // 🟡 NIVEL 3 — MEDIO (Funcional / Preventivo)
  {
    id: "RIF-N3-01",
    nivel: 3,
    grupo: "RIFER — NIVEL 3 (MEDIO)",
    seccion: "Panel lateral interior",
    titulo: "Sin golpes/fisuras relevantes y condiciones de higiene aceptables",
  },
  {
    id: "RIF-N3-02",
    nivel: 3,
    grupo: "RIFER — NIVEL 3 (MEDIO)",
    seccion: "Riel lateral interior",
    titulo: "Soporte de carga en buen estado",
  },
  {
    id: "RIF-N3-03",
    nivel: 3,
    grupo: "RIFER — NIVEL 3 (MEDIO)",
    seccion: "Piso de aluminio tipo T",
    titulo: "Sin deformaciones relevantes y con higiene adecuada",
  },
  {
    id: "RIF-N3-04",
    nivel: 3,
    grupo: "RIFER — NIVEL 3 (MEDIO)",
    seccion: "Ventilado / rejillas internas",
    titulo: "Sin obstrucciones",
  },
  {
    id: "RIF-N3-05",
    nivel: 3,
    grupo: "RIFER — NIVEL 3 (MEDIO)",
    seccion: "Huecos para horquillas",
    titulo: "Sin deformaciones ni fisuras",
  },

  // 🟢 NIVEL 4 — BAJO (Control / Accesorios)
  {
    id: "RIF-N4-01",
    nivel: 4,
    grupo: "RIFER — NIVEL 4 (BAJO)",
    seccion: "Control",
    titulo: "Display y teclado: lectura visible",
  },
  {
    id: "RIF-N4-02",
    nivel: 4,
    grupo: "RIFER — NIVEL 4 (BAJO)",
    seccion: "Control",
    titulo: "Caja de control: protección y fijación correctas",
  },
  {
    id: "RIF-N4-03",
    nivel: 4,
    grupo: "RIFER — NIVEL 4 (BAJO)",
    seccion: "Energía / conexión",
    titulo: "Cable y plug en buen estado (aislante sin daños)",
  },
  {
    id: "RIF-N4-04",
    nivel: 4,
    grupo: "RIFER — NIVEL 4 (BAJO)",
    seccion: "Estética",
    titulo: "Detalles estéticos internos (rayones, marcas superficiales)",
  },

  // ⚠️ Aspectos críticos que muchos olvidan (los dejamos registrables)
  {
    id: "RIF-N2-08",
    nivel: 2,
    grupo: "RIFER — ASPECTOS CLAVE",
    seccion: "Sanidad / contaminación",
    titulo: "Olores extraños (posible contaminación)",
  },
  {
    id: "RIF-N2-09",
    nivel: 2,
    grupo: "RIFER — ASPECTOS CLAVE",
    seccion: "Humedad",
    titulo: "Condensación excesiva",
  },
  {
    id: "RIF-N2-10",
    nivel: 2,
    grupo: "RIFER — ASPECTOS CLAVE",
    seccion: "Temperatura",
    titulo: "Diferencias de temperatura por zonas",
  },
  {
    id: "RIF-N2-11",
    nivel: 2,
    grupo: "RIFER — ASPECTOS CLAVE",
    seccion: "Flujo de aire",
    titulo: "Golpes internos que alteran/rompen el flujo de aire",
  },
  {
    id: "RIF-N2-12",
    nivel: 2,
    grupo: "RIFER — ASPECTOS CLAVE",
    seccion: "Drenaje",
    titulo: "Drenaje obstruido",
  },
];

export const PLANTILLA_RIFER: Plantilla = {
  key: "rifer",
  nombre: "Rifer / Reefer",
  descripcion: "Checklist específico para cajas refrigeradas (reefer).",
  items: RIFER_ITEMS,
};

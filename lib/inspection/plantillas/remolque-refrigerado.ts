import type { ItemChecklist, Plantilla } from "../types";

/**
 * PLANTILLA: REMOLQUE REFRIGERADO
 * Estructura alineada con: carro.ts y paquetero.ts
 */
export const REMOLQUE_REFRIGERADO_ITEMS: ItemChecklist[] = [
  //  NIVEL 1 — CRÍTICO
  {
    id: "REF-N1-01",
    nivel: 1,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 1 (CRÍTICO)",
    seccion: "Sistema de refrigeración",
    titulo: "Equipo de refrigeración operativo y sin fallas visibles",
  },
  {
    id: "REF-N1-02",
    nivel: 1,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 1 (CRÍTICO)",
    seccion: "Sistema de refrigeración",
    titulo: "Aislamiento térmico íntegro (sin roturas ni filtraciones)",
  },
  {
    id: "REF-N1-03",
    nivel: 1,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 1 (CRÍTICO)",
    seccion: "Puertas y cierre",
    titulo: "Puertas traseras con cierre hermético y sellos en buen estado",
  },
  {
    id: "REF-N1-04",
    nivel: 1,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 1 (CRÍTICO)",
    seccion: "Piso interior",
    titulo: "Piso del remolque íntegro, antideslizante y sin roturas",
  },

  //  NIVEL 2 — ALTO
  {
    id: "REF-N2-05",
    nivel: 2,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 2 (ALTO)",
    seccion: "Ventilación",
    titulo: "Respiraderos operativos y sin obstrucciones",
  },
  {
    id: "REF-N2-06",
    nivel: 2,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 2 (ALTO)",
    seccion: "Señalización",
    titulo: "Luces de señalización operativas (laterales y superiores)",
  },
  {
    id: "REF-N2-07",
    nivel: 2,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 2 (ALTO)",
    seccion: "Estructura",
    titulo: "Vigas laterales (superior e inferior) sin deformaciones ni corrosión",
  },
  {
    id: "REF-N2-08",
    nivel: 2,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 2 (ALTO)",
    seccion: "Seguridad vial",
    titulo: "Reflectores delanteros y traseros presentes y visibles",
  },

  //  NIVEL 3 — MEDIO
  {
    id: "REF-N3-09",
    nivel: 3,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 3 (MEDIO)",
    seccion: "Estabilidad",
    titulo: "Calzos disponibles para inmovilización en desacople",
  },
  {
    id: "REF-N3-10",
    nivel: 3,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 3 (MEDIO)",
    seccion: "Soporte",
    titulo: "Pata de apoyo funcional y regulable",
  },
  {
    id: "REF-N3-11",
    nivel: 3,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 3 (MEDIO)",
    seccion: "Control y monitoreo",
    titulo: "Caja de control operativa y con lectura visible",
  },
  {
    id: "REF-N3-12",
    nivel: 3,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 3 (MEDIO)",
    seccion: "Sistema de refrigeración",
    titulo: "Filtros de aire limpios y correctamente instalados",
  },
  {
    id: "REF-N3-13",
    nivel: 3,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 3 (MEDIO)",
    seccion: "Monitoreo",
    titulo: "Sistema de monitoreo de temperatura (sensores/GPS) funcional",
  },

  //  NIVEL 4 — BAJO
  {
    id: "REF-N4-14",
    nivel: 4,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 4 (BAJO)",
    seccion: "Accesos",
    titulo: "Puertas de acceso lateral en buen estado (si aplica)",
  },
  {
    id: "REF-N4-15",
    nivel: 4,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 4 (BAJO)",
    seccion: "Higiene",
    titulo: "Sistema de drenaje de humedad operativo",
  },
  {
    id: "REF-N4-16",
    nivel: 4,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 4 (BAJO)",
    seccion: "Seguridad",
    titulo: "Cierre de seguridad (cadenas o candado) presente",
  },
  {
    id: "REF-N4-17",
    nivel: 4,
    grupo: "REMOLQUE REFRIGERADO — NIVEL 4 (BAJO)",
    seccion: "Energía",
    titulo: "Sistema de respaldo de energía (batería) funcional",
  },
];

export const PLANTILLA_REMOLQUE_REFRIGERADO: Plantilla = {
  key: "remolque_refrigerado",
  nombre: "Remolque Refrigerado",
  descripcion: "Checklist específico para inspección de semirremolques refrigerados.",
  items: REMOLQUE_REFRIGERADO_ITEMS,
};

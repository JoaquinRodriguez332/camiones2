/**
 * PLANTILLAS DE INSPECCIÓN
 * Exporta todos los templates específicos por tipo de carrocería
 */

export { PLANTILLA_CARRO, CARRO_ITEMS } from "./carro";
export { PLANTILLA_PAQUETERO, PAQUETERO_ITEMS } from "./paquetero";
export { PLANTILLA_REMOLQUE_REFRIGERADO, REMOLQUE_REFRIGERADO_ITEMS } from "./remolque-refrigerado";
export { PLANTILLA_RIFER, RIFER_ITEMS } from "./rifer";

import type { Plantilla } from "../types";
import { PLANTILLA_CARRO } from "./carro";
import { PLANTILLA_PAQUETERO } from "./paquetero";
import { PLANTILLA_REMOLQUE_REFRIGERADO } from "./remolque-refrigerado";
import { PLANTILLA_RIFER } from "./rifer";

/**
 * Mapa de todas las plantillas disponibles
 * Usa como: PLANTILLAS_DISPONIBLES[tipo_carroceria]
 */
export const PLANTILLAS_DISPONIBLES: Record<string, Plantilla> = {
  carro: PLANTILLA_CARRO,
  paquetero: PLANTILLA_PAQUETERO,
  remolque_refrigerado: PLANTILLA_REMOLQUE_REFRIGERADO,
  rifer: PLANTILLA_RIFER,
};

/**
 * Obtener plantilla por clave de carrocería
 * @param key - Tipo de carrocería (ej: "carro", "paquetero", "rifer")
 * @returns Plantilla o undefined si no existe
 */
export function getPlantilla(key: string): Plantilla | undefined {
  return PLANTILLAS_DISPONIBLES[key.toLowerCase()];
}

/**
 * Obtener todas las plantillas disponibles
 * @returns Array de plantillas
 */
export function getAllPlantillas(): Plantilla[] {
  return Object.values(PLANTILLAS_DISPONIBLES);
}

/**
 * Obtener nombres de todas las plantillas
 * @returns Array de nombres para usar en dropdowns/selects
 */
export function getPlantillaNames(): Array<{ key: string; nombre: string }> {
  return Object.values(PLANTILLAS_DISPONIBLES).map((p) => ({
    key: p.key,
    nombre: p.nombre,
  }));
}

import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/azure-sql";
import { requireInspector } from "@/lib/shared/security/staff-auth";

/**
 * GET /api/inspector/inspecciones/hoy
 * Obtiene las inspecciones programadas para el inspector de HOY
 * Solo inspectores pueden acceder
 */
export async function GET(req: NextRequest) {
  try {
    // Verificar JWT y rol
    const session = requireInspector(req);
    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const inspector_id = session.userId;

    const pool = await getPool();
    const result = await pool
      .request()
      .input("inspector_id", inspector_id)
      .input("hoy", new Date().toISOString().split("T")[0])
      .query(`
        SELECT 
          i.id,
          i.camion_id,
          i.estado,
          i.fecha_programada,
          c.patente,
          c.marca,
          c.modelo,
          c.tipo,
          c.carroceria,
          e.nombre as empresa,
          COUNT(di.id) as item_count
        FROM inspecciones i
        JOIN camiones c ON i.camion_id = c.id
        JOIN proveedores p ON c.proveedor_id = p.id
        JOIN empresas e ON p.empresa_id = e.id
        LEFT JOIN detalle_inspeccion di ON i.id = di.inspeccion_id
        WHERE 
          i.inspector_id = @inspector_id
          AND CAST(i.fecha_programada AS DATE) = @hoy
          AND i.estado IN ('PROGRAMADA', 'EN_PROGRESO')
        GROUP BY 
          i.id, i.camion_id, i.estado, i.fecha_programada,
          c.patente, c.marca, c.modelo, c.tipo, c.carroceria,
          e.nombre
        ORDER BY i.fecha_programada ASC
      `);

    return NextResponse.json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
    });
  } catch (error) {
    console.error("Error fetching inspector inspections:", error);
    return NextResponse.json(
      { error: "Error al obtener inspecciones" },
      { status: 500 }
    );
  }
}

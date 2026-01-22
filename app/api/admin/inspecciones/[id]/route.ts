import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { requireAdmin } from "@/lib/staff-auth";

let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool({
      user: process.env.AZURE_SQL_USER,
      password: process.env.AZURE_SQL_PASSWORD,
      server: process.env.AZURE_SQL_SERVER!,
      database: process.env.AZURE_SQL_DATABASE!,
      options: { encrypt: true, trustServerCertificate: false },
    }).connect();
  }
  return poolPromise;
}

function isValidDatetimeLocal(s: unknown) {
  return typeof s === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const inspeccionId = Number(params.id);
    if (!Number.isInteger(inspeccionId) || inspeccionId <= 0) {
      return NextResponse.json({ ok: false, error: "id inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    if (!body || body.action !== "REAGENDAR") {
      return NextResponse.json({ ok: false, error: "Acción inválida" }, { status: 400 });
    }

    const fechaLocal = body.fechaProgramada;
    const obs = typeof body.observaciones === "string" ? body.observaciones.trim() : null;

    if (!isValidDatetimeLocal(fechaLocal)) {
      return NextResponse.json({ ok: false, error: "fechaProgramada inválida" }, { status: 400 });
    }

    const fechaSql = `${fechaLocal.replace("T", " ")}:00`;
    const pool = await getPool();

    await pool.request()
      .input("fecha", sql.NVarChar(19), fechaSql)
      .query(`
        IF (CONVERT(datetime2, @fecha, 120) < DATEADD(minute, 1, SYSDATETIME()))
          THROW 50001, 'La fecha debe ser futura', 1;
      `);

    await pool.request()
      .input("id", sql.Int, inspeccionId)
      .input("fecha", sql.NVarChar(19), fechaSql)
      .input("obs", sql.NVarChar(sql.MAX), obs)
      .query(`
        UPDATE dbo.inspecciones
        SET
          fecha_programada = CONVERT(datetime2, @fecha, 120),
          fecha_inspeccion = CONVERT(datetime2, @fecha, 120),
          observaciones_generales = COALESCE(NULLIF(@obs, ''), observaciones_generales)
        WHERE id = @id AND estado = 'PROGRAMADA'
      `);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

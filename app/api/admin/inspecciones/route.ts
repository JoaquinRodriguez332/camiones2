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

export async function POST(req: NextRequest) {
  try {
    if (!requireAdmin(req)) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, error: "Body inválido" }, { status: 400 });
    }

    const camionId = body.camionId;
    const fechaLocal = body.fechaProgramada;
    const obs = typeof body.observaciones === "string" ? body.observaciones.trim() : null;

    if (!Number.isInteger(camionId) || camionId <= 0) {
      return NextResponse.json({ ok: false, error: "camionId inválido" }, { status: 400 });
    }

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

    const ins = await pool.request()
      .input("camionId", sql.Int, camionId)
      .input("fecha", sql.NVarChar(19), fechaSql)
      .input("obs", sql.NVarChar(sql.MAX), obs)
      .query(`
        INSERT INTO dbo.inspecciones
          (camion_id, inspector_id, fecha_inspeccion, fecha_programada, estado, resultado_general, observaciones_generales)
        OUTPUT INSERTED.id
        VALUES
          (@camionId, NULL,
           CONVERT(datetime2, @fecha, 120),
           CONVERT(datetime2, @fecha, 120),
           'PROGRAMADA', 'observado', @obs)
      `);

    return NextResponse.json({ ok: true, inspeccionId: ins.recordset[0].id });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}

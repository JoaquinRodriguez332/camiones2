-- Variables
DECLARE @inspector_id INT;
DECLARE @empresa_id INT;
DECLARE @camion_id INT;
DECLARE @hoy DATE = CAST(GETDATE() AS DATE);
DECLARE @rut_user VARCHAR(20) = '200707532';

-- 1. Obtener el ID del inspector
SELECT @inspector_id = id FROM usuarios WHERE email = 'juako332@gmail.com';

-- 2. Manejo de Empresa
SELECT @empresa_id = id FROM empresas WHERE rut = @rut_user;
IF @empresa_id IS NULL
BEGIN
    INSERT INTO empresas (nombre, rut, direccion, created_at)
    VALUES ('Empresa de Prueba', @rut_user, 'Dirección Test', GETDATE());
    SET @empresa_id = SCOPE_IDENTITY();
END

-- 3. Crear Camión (Usando 'camion' exacto, sin tilde)
SELECT @camion_id = id FROM camiones WHERE patente = 'TEST-01';

IF @camion_id IS NULL
BEGIN
    INSERT INTO camiones (patente, marca, modelo, anio, tipo, proveedor_id, created_at)
    VALUES ('TEST-01', 'Volvo', 'FH16', 2022, 'camion', @empresa_id, GETDATE()); 
    SET @camion_id = SCOPE_IDENTITY();
    PRINT '✅ Camión TEST-01 creado con éxito';
END

-- 4. Crear Inspección
IF @camion_id IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM inspecciones WHERE camion_id = @camion_id AND CAST(fecha_programada AS DATE) = @hoy)
    BEGIN
        INSERT INTO inspecciones (
            camion_id, 
            inspector_id, 
            fecha_programada, 
            estado, 
            created_at, 
            fecha_inspeccion,
            resultado_general -- Obligatorio
        )
        VALUES (
            @camion_id, 
            @inspector_id, 
            GETDATE(), 
            'PROGRAMADA', 
            GETDATE(), 
            @hoy,
            'PENDIENTE' -- Valor inicial para evitar el error 515
        );
        PRINT '✅ ¡Inspección creada exitosamente para hoy!';
    END
    ELSE PRINT 'ℹ️ Ya existe una inspección para este camión hoy';
END

-- Verificación final
SELECT i.id as folio, c.patente, i.estado, i.resultado_general
FROM inspecciones i 
JOIN camiones c ON i.camion_id = c.id 
WHERE c.patente = 'TEST-01';
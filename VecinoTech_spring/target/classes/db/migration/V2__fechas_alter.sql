-- Pasar a TIMESTAMPTZ (coherente con Instant)
ALTER TABLE usuario
ALTER COLUMN fecha_creacion TYPE TIMESTAMPTZ USING fecha_creacion AT TIME ZONE 'UTC',
  ALTER COLUMN fecha_creacion SET DEFAULT now();

ALTER TABLE solicitud
ALTER COLUMN fecha_creacion TYPE TIMESTAMPTZ USING fecha_creacion AT TIME ZONE 'UTC',
  ALTER COLUMN fecha_creacion SET DEFAULT now();

ALTER TABLE valoracion
ALTER COLUMN fecha_creacion TYPE TIMESTAMPTZ USING fecha_creacion AT TIME ZONE 'UTC',
  ALTER COLUMN fecha_creacion SET DEFAULT now();

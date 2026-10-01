-- ============================================================
-- Auditoría: usuarios registrados sin evidencia de aceptación legal
-- ============================================================
-- Por qué existe: el insert de legal_acceptances en registerAction()
-- (src/app/actions/auth.ts) es resiliente — reintenta 2 veces con backoff
-- corto y, si aun así falla, NO revierte la cuenta recién creada (revertir
-- en el camino crítico del registro es más riesgoso que loggear y quedar
-- detectable). Esta query es esa red de seguridad: encuentra a mano lo que
-- el insert no pudo garantizar solo.
--
-- Cuándo correrla: cuando se vean logs con el prefijo
-- [LEGAL_EVIDENCE_MISSING] o [LEGAL_DOCUMENT_SYNC_FAILED] en el servidor,
-- o periódicamente como chequeo de rutina.
--
-- Cómo correrla: SQL Editor del dashboard de Supabase, o
-- `supabase db execute -f scripts/audit-legal-acceptances.sql` / psql.
-- Es de solo lectura — no modifica nada.
--
-- Qué hace: un LEFT JOIN de auth.users contra legal_acceptances (a través
-- de legal_documents, para poder filtrar por slug) agregado con bool_or();
-- HAVING se queda con los usuarios a los que les falta evidencia de
-- "terminos" y/o "privacidad" (los dos documentos que el registro exige
-- aceptar hoy).
--
-- Remediación manual sugerida al encontrar un usuario en esta lista:
-- confirmar por otro medio que aceptó (o volver a pedírselo), y si
-- corresponde, insertar la fila faltante a mano en legal_acceptances con
-- el document_id vigente correspondiente.

SELECT
  u.id                                                             AS user_id,
  u.email,
  u.created_at                                                     AS registered_at,
  bool_or(ld.slug = 'terminos')                                    AS has_terminos,
  bool_or(ld.slug = 'privacidad')                                  AS has_privacidad
FROM auth.users u
LEFT JOIN legal_acceptances la ON la.user_id = u.id
LEFT JOIN legal_documents ld ON ld.id = la.document_id
GROUP BY u.id, u.email, u.created_at
HAVING
  NOT bool_or(ld.slug = 'terminos')
  OR NOT bool_or(ld.slug = 'privacidad')
ORDER BY u.created_at DESC;

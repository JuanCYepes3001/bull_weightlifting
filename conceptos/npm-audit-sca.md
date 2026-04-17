---
tags: [seguridad, dependencias, npm, ci-cd, supply-chain]
created: 2026-04-16
aliases: [npm audit, SCA, Software Composition Analysis, dependabot]
---

# npm audit y Análisis de Dependencias (SCA)

## Qué es SCA

Software Composition Analysis (SCA) es el proceso de escanear las dependencias de un proyecto en busca de vulnerabilidades conocidas. En proyectos Node.js, `npm audit` es la herramienta principal.

## npm audit

```bash
npm audit                    # muestra todas las vulnerabilidades
npm audit --audit-level=high # solo muestra high y critical
npm audit fix                # aplica fixes automáticos (dentro del rango ^ del package.json)
```

## Vulnerabilidades encontradas en este proyecto

| Paquete | CVE | Problema | Fix |
|---|---|---|---|
| `xlsx@0.18.5` | GHSA-4r6h-8v6p-xvw6 | Prototype Pollution | Migrar a `exceljs` |
| `xlsx@0.18.5` | GHSA-5pgg-2g8v-p4x9 | ReDoS en js-cfb | Migrar a `exceljs` |
| `next@16.2.2` | GHSA-q4gf-8mx6-v5v3 | DoS en Server Components | `npm audit fix` |

## Por qué xlsx no se puede parchear

`xlsx@0.18.5` es la última versión gratuita en npm. El mantenedor migró a un modelo comercial de pago y no publica fixes de seguridad en npm. `npm audit fix` no puede hacer nada — la solución es cambiar de librería.

## Cómo automatizar con GitHub Actions

```yaml
# .github/workflows/security.yml
- run: npm audit --audit-level=high
```

Esto hace que el CI falle automáticamente si aparece una nueva vulnerabilidad de severidad high o critical.

## Dependabot

`.github/dependabot.yml` le indica a GitHub que revise las dependencias semanalmente y abra PRs automáticos cuando hay actualizaciones de seguridad.

## Reglas del proyecto

- CI usa `npm ci` (no `npm install`) — respeta `package-lock.json` exactamente
- `.npmrc` tiene `audit=true` — npm advierte en cada install
- Dependabot abre PRs automáticos cada semana

## Conceptos relacionados

- [[prototype-pollution]] — una de las vulnerabilidades encontradas en xlsx
- [[http-security-headers]] — otra capa de defensa
- [[rate-limiting]] — protección de runtime (vs las dependencias que son supply chain)

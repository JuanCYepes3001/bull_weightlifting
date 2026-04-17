---
tags: [concepto, seguridad, javascript, nodejs, CWE-1321]
created: 2026-04-16
aliases: [contaminación de prototipo, prototype pollution, CWE-1321]
---

# Prototype Pollution

La **prototype pollution** es una vulnerabilidad JavaScript que permite a un atacante modificar `Object.prototype`, el objeto del que heredan todos los objetos en JS. Si logra inyectar una propiedad en el prototipo raíz, esa propiedad aparece "mágicamente" en todos los objetos de la aplicación.

El vector más común: parseo de datos externos (JSON, YAML, hojas de cálculo) que contienen claves especiales como `__proto__` o `constructor`.

---

## El problema

```javascript
// El prototipo raíz de todos los objetos
const obj = {};
console.log(obj.isAdmin); // undefined

// Si el atacante logra inyectar en Object.prototype:
Object.prototype.isAdmin = true;

// Ahora TODOS los objetos tienen esa propiedad
const newObj = {};
console.log(newObj.isAdmin); // true  ← sin haber asignado nada
```

**¿Cómo llega el atacante a `Object.prototype`?**

```javascript
// Parsing de JSON con clave especial
const input = JSON.parse('{"__proto__": {"isAdmin": true}}');
Object.assign({}, input);
// → Object.prototype.isAdmin === true en todo el proceso

// Parsing de YAML inseguro
yaml.load('__proto__:\n  isAdmin: true');

// Parsing de xlsx con celda: __proto__.isAdmin = true
// → SheetJS 0.18.5 es vulnerable a esta inyección
```

---

## Por qué `xlsx@0.18.5` es vulnerable

SheetJS parsea spreadsheets y construye objetos JavaScript a partir de los datos de las celdas. En la versión 0.18.5 (y anteriores), no sanitiza las claves antes de asignarlas a objetos — por lo tanto, una celda con el valor `__proto__` como nombre de campo puede contaminar el prototipo.

```
Celda A1: __proto__
Celda B1: isAdmin
Celda A2: (valor vacío)
Celda B2: true
→ xlsx lo parsea y asigna: resultado.__proto__.isAdmin = true
→ Todos los objetos de la app ahora tienen .isAdmin === true
```

El paquete fue abandonado en npm en 2022 — no existe patch disponible.

---

## Impacto en una aplicación

```javascript
// Código de la app que verifica admin (simplificado)
function checkAccess(user) {
  // user.isAdmin viene de la DB: undefined (usuario normal)
  // Pero gracias a prototype pollution, undefined || Object.prototype.isAdmin
  // devuelve el valor inyectado en el prototipo
  if (user.isAdmin) {
    grantAdminAccess();
  }
}
```

Consecuencias típicas:
- Escalada de privilegios
- Bypass de validaciones
- Corrupción de lógica de negocio
- En casos extremos, RCE (en entornos Node.js con `vm` module)

---

## Mitigación

```javascript
// 1. Usar Object.create(null) para objetos de datos (sin prototipo)
const safe = Object.create(null);
Object.assign(safe, parsedData);

// 2. Filtrar claves peligrosas antes de asignar
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
    target[key] = source[key];
  }
}

// 3. Migrar a exceljs (librería activamente mantenida, no vulnerable)
import ExcelJS from "exceljs";
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile("archivo.xlsx");
```

---

## En Bull Weightlifting

`xlsx@0.18.5` está presente en `package.json`. Sin embargo, en el uso actual solo se usa para **generar** (escribir) archivos Excel en `ReportDownloader.tsx` y `orders/route.ts` — no para parsear archivos subidos por usuarios. El riesgo inmediato es menor, pero el paquete seguirá reportando CVEs en cualquier `npm audit` y debe migrarse a `exceljs` (hallazgo CN-006, pendiente).

---

## Conceptos relacionados

- [[conceptos/operacion-atomica-sql]] — otra clase de corrupción de estado, pero en DB en lugar de en memoria
- [[conceptos/http-security-headers]] — CSP es una capa de mitigación adicional si la pollution lleva a XSS

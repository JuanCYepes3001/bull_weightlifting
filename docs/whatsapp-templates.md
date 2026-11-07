# WhatsApp — configuración en Meta y plantillas

La tienda envía WhatsApp automáticos al cliente (confirmación de compra y cada
cambio de estado del pedido) usando la **WhatsApp Cloud API de Meta**. Código:
`src/lib/whatsapp.ts`.

**Por qué plantillas:** Meta solo entrega mensajes de texto libre si el cliente
le escribió al negocio en las últimas 24 h. A un cliente que nunca nos ha
escrito solo le llegan **plantillas aprobadas**. Por eso todos los mensajes
de la tienda son plantillas.

---

## 1. Decidir qué número envía los mensajes

El remitente es el número que registres en la Cloud API, con el nombre visible
del negocio. Para que sea el WhatsApp de la tienda hay dos caminos:

| Opción | Cómo funciona | Respuestas del cliente |
|---|---|---|
| **A. Coexistencia (recomendada)** | El número que la tienda ya usa en la app **WhatsApp Business** se conecta también a la Cloud API. Se sigue usando la app del celular normalmente. | Llegan a la app del celular, como siempre. Ahí el equipo atiende la personalización. |
| **B. Migrar el número a la Cloud API** | El número deja de funcionar en la app del celular y queda solo en la API. | Necesitan una bandeja de entrada aparte (proveedor/BSP o desarrollo propio). Sin eso, las respuestas no las ve nadie. |

La plantilla de personalización le pide al cliente **"responde a este mensaje"**.
Eso solo funciona bien con la **opción A**, o con la B si tienen bandeja de entrada.

> La coexistencia depende del país y de que la cuenta sea elegible. Se activa
> con el flujo "Embedded Signup" de Meta: el número debe estar en la app
> WhatsApp Business actualizada y se escanea un código QR desde la app. Si
> WhatsApp Manager no les ofrece la opción directamente, se hace a través de un
> proveedor (Tech Provider/BSP). Confírmenlo antes de empezar.

---

## 2. Crear la cuenta de negocio y la app

1. **Portafolio comercial:** en <https://business.facebook.com> creen (o usen)
   el portafolio de Bull Weightlifting. En *Configuración → Centro de
   seguridad*, inicien la **verificación del negocio** (RUT/Cámara de
   Comercio). Sin verificar hay límites bajos de envío.
2. **App:** en <https://developers.facebook.com/apps> → *Crear app* → tipo
   **Negocio** → asóciela al portafolio de Bull Weightlifting.
3. En la app, agreguen el producto **WhatsApp**. Esto crea (o vincula) la
   cuenta de WhatsApp Business (WABA).
4. **Número:** en *WhatsApp Manager → Teléfonos → Agregar número* (o por
   coexistencia, opción A). Verifíquenlo con el código por SMS o llamada.
5. **Nombre visible:** pongan "Bull Weightlifting". Meta lo revisa y debe
   coincidir con la marca del negocio verificado.
6. **Método de pago:** en *WhatsApp Manager → Configuración de pagos*, agreguen
   una tarjeta. Las plantillas de *Utilidad* se cobran por mensaje entregado
   (consulten la tarifa vigente para Colombia en la página de precios de Meta).

## 3. Token permanente (no usen el token temporal de 24 h)

1. *business.facebook.com → Configuración → Usuarios → Usuarios del sistema →
   Agregar*, con rol **Administrador**.
2. *Asignar activos*: la **app** (control total) y la **cuenta de WhatsApp**
   (control total).
3. *Generar token* → seleccionen la app → caducidad **Nunca** → permisos
   `whatsapp_business_messaging` y `whatsapp_business_management`.
4. Guarden el token: es `WHATSAPP_ACCESS_TOKEN`. Trátenlo como una contraseña.

## 4. Identificador del número

En la app → *WhatsApp → Configuración de la API* (o en WhatsApp Manager →
Teléfonos), copien el **Identificador del número de teléfono** (Phone number
ID). Es un número largo, **no** el teléfono. Va en `WHATSAPP_PHONE_NUMBER_ID`.

---

## 5. Crear las 3 plantillas

*WhatsApp Manager → Plantillas de mensajes → Crear plantilla*:

- **Categoría:** Utilidad
- **Idioma:** Español (`es`). Si eligen otro (ej. `es_MX`), pongan ese mismo
  código en `WHATSAPP_TEMPLATE_LANG`.
- **Nombre:** exactamente el indicado (minúsculas y guiones bajos).
- **Cuerpo:** copien el texto **tal cual**. El código envía las variables en
  ese orden.
- **Pie de página (opcional):** `Bull Weightlifting`
- **Sin botones.**
- Meta pide **valores de ejemplo** para cada variable; usen los de la tabla.

### 5.1 `bull_pedido_confirmado`

Se envía cuando el pago queda confirmado (Wompi aprobado, PayPal capturado) o
al confirmar un pedido contra entrega.

```
Hola {{1}}, gracias por tu compra en Bull Weightlifting.

Orden: #{{2}}
Estado del pedido: {{3}}
Productos: {{4}}
Total: {{5}}
Método de pago: {{6}}
Envío a: {{7}}

Te avisaremos por este medio cada avance de tu pedido.
```

| Variable | Contenido | Ejemplo |
|---|---|---|
| {{1}} | Nombre | `Ana` |
| {{2}} | Orden | `A1B2C3D4` |
| {{3}} | Estado | `Pago recibido, en preparación` |
| {{4}} | Productos | `Wristbands (U / Rojo) x2` |
| {{5}} | Total | `60.000 COP` |
| {{6}} | Método de pago | `Wompi (tarjeta / PSE / Nequi)` |
| {{7}} | Dirección | `Cra 1 #2-3, Medellín, Antioquia` |

### 5.2 `bull_pedido_confirmado_personalizacion`

Igual que la anterior, pero se usa **solo cuando el pedido incluye una trusa
personalizada**: Clásica, Mangas o Albornoz (ver `src/lib/customization.ts`).

Cuándo se envía (siempre después de que el cliente pagó):
- **Wompi / PayPal:** cuando la pasarela aprueba el pago.
- **Nequi / Daviplata / Dollar App / Global66:** cuando el admin verifica el
  pago y pasa el pedido de *pendiente* a *en preparación*. En ese caso
  reemplaza al aviso `bull_pedido_actualizacion` de "En preparación", y {{3}}
  dice `Pago confirmado, en preparación`.
- **Contra entrega:** al confirmar el pedido (se paga al recibir, pero la
  trusa hay que fabricarla antes de enviarla).

> ⚠️ El texto fijo debe hablar de "una trusa personalizada", no de un modelo
> concreto: el mismo mensaje sirve para los 3 modelos (el modelo exacto ya va
> en {{4}}). Si la plantilla ya se envió a Meta con "Trusa Clásica
> Personalizada", hay que editarla y reenviarla a aprobación.

```
Hola {{1}}, gracias por tu compra en Bull Weightlifting.

Orden: #{{2}}
Estado del pedido: {{3}}
Productos: {{4}}
Total: {{5}}
Método de pago: {{6}}
Envío a: {{7}}

Tu pedido incluye una trusa personalizada. Por favor responde a este mensaje describiendo cómo la quieres: nombre, número, diseño y color del estampado. Una persona de nuestro equipo se pondrá en contacto contigo para confirmar el proceso de personalización.

Te avisaremos por este medio cada avance de tu pedido.
```

Las variables son las mismas de 5.1. Ejemplo de {{4}}:
`Trusa Mangas Personalizada (M / PERSONALIZADO) x1`.

### 5.3 `bull_pedido_actualizacion`

Se envía cuando el admin cambia el estado del pedido a *en preparación,
enviado, entregado, cancelado* o *reembolsado*.

```
Hola {{1}}, hay una actualización de tu pedido #{{2}} en Bull Weightlifting.

Nuevo estado: {{3}}
Detalle: {{4}}

Gracias por confiar en nosotros.
```

| Variable | Contenido | Ejemplo |
|---|---|---|
| {{1}} | Nombre | `Ana` |
| {{2}} | Orden | `A1B2C3D4` |
| {{3}} | Estado | `En camino` |
| {{4}} | Detalle | `Tu pedido fue despachado. Entrega estimada: 2 a 5 días hábiles.` |

La aprobación suele tardar de minutos a 24 h. Si Meta cambia la categoría a
*Marketing*, revisen el texto. No agreguen promociones ni descuentos a estas
plantillas.

---

## 6. Variables de entorno

En `.env.local` (desarrollo) y en Vercel → *Settings → Environment Variables*
(producción):

```
WHATSAPP_ACCESS_TOKEN=<token del paso 3>
WHATSAPP_PHONE_NUMBER_ID=<id del paso 4>
WHATSAPP_TEMPLATE_LANG=es
```

Reinicien `next dev` o vuelvan a desplegar.

## 7. Prueba manual

Con las plantillas en estado **Activa**, envíen una a su propio WhatsApp
(cambien `57300XXXXXXX`):

```bash
curl -X POST "https://graph.facebook.com/v25.0/$WHATSAPP_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer $WHATSAPP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "57300XXXXXXX",
    "type": "template",
    "template": {
      "name": "bull_pedido_actualizacion",
      "language": { "code": "es" },
      "components": [{ "type": "body", "parameters": [
        { "type": "text", "text": "Ana" },
        { "type": "text", "text": "A1B2C3D4" },
        { "type": "text", "text": "En camino" },
        { "type": "text", "text": "Prueba de configuración." }
      ]}]
    }
  }'
```

## 8. Errores frecuentes (aparecen en los logs como `[WhatsApp] Meta API error`)

| Código | Causa | Solución |
|---|---|---|
| 190 | Token vencido o inválido | Generar token permanente (paso 3) |
| 131030 | Destinatario no está en la lista permitida | Pasa con el número de prueba de Meta: usen un número propio registrado |
| 132000 | Cantidad de variables no coincide | El cuerpo de la plantilla no es idéntico al de esta guía |
| 132001 | La plantilla no existe | Nombre o idioma distintos, o la plantilla aún no está aprobada |
| 132018 | Formato de variable inválido | El código ya quita saltos de línea; revisen valores vacíos |
| 131026 | No se pudo entregar | El número no tiene WhatsApp |

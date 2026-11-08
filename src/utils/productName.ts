// Muchos productos están guardados en CamelCase ("CamisaClasicaLogo"). No se
// renombran en la DB porque las fotos se resuelven por el nombre exacto
// ("CamisaClasicaLogo AMARILLO.jpeg", ver lib/storage.ts): solo se separan
// las palabras al mostrarlos.
export function displayProductName(name: string): string {
  return name.replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2");
}

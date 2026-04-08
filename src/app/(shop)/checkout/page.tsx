"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, CreditCard, Truck, CheckCircle2, MapPin } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { createOrderAction } from "@/app/actions/checkout";
import { getUserAddressesAction } from "@/app/actions/addresses";
import { AddressForm, EMPTY_ADDRESS, type AddressValue } from "@/components/ui/AddressForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { STATES_BY_COUNTRY } from "@/lib/locationData";
import type { Address } from "@/types";

const PAYMENT_METHODS = [
  { id: "nequi",         label: "Nequi",          icon: "📱" },
  { id: "daviplata",     label: "Daviplata",       icon: "💳" },
  { id: "contraentrega", label: "Contra entrega",  icon: "🚚" },
  { id: "simulado",      label: "Pago simulado ✓", icon: "🧪" },
];

function stateName(countryCode: string, stateCode: string): string {
  return STATES_BY_COUNTRY[countryCode]?.find((s) => s.code === stateCode)?.name ?? stateCode;
}

export default function CheckoutPage() {
  const items      = useCartStore((s) => s.items);
  const total      = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  const clearCart  = useCartStore((s) => s.clearCart);

  const [paymentMethod, setPaymentMethod] = useState("simulado");
  const [serverError, setServerError]     = useState<string | null>(null);
  const [isPending, startTransition]      = useTransition();
  const router = useRouter();

  // Contact fields
  const [contact, setContact] = useState({ full_name: "", phone: "", notes: "" });
  const setC = (key: keyof typeof contact, val: string) =>
    setContact((c) => ({ ...c, [key]: val }));

  // Address
  const [addrValue, setAddrValue] = useState<AddressValue>(EMPTY_ADDRESS);

  // Saved addresses (for logged-in users)
  const [savedAddresses, setSavedAddresses]           = useState<Address[]>([]);
  const [selectedSavedId, setSelectedSavedId]         = useState<string | null>(null);

  useEffect(() => {
    getUserAddressesAction().then(setSavedAddresses);
  }, []);

  const applySavedAddress = (addr: Address) => {
    setSelectedSavedId(addr.id);
    setAddrValue({
      country: addr.country ?? "CO",
      state:   addr.state ?? addr.department ?? "",
      city:    addr.city ?? "",
      address: addr.street ?? "",
      zip_code: addr.zip_code ?? "",
    });
  };

  const isFormValid =
    contact.full_name.trim() &&
    contact.phone.trim() &&
    addrValue.country &&
    addrValue.state &&
    addrValue.city &&
    addrValue.address.trim();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
        <ShoppingBag size={40} className="text-white/10" />
        <h1 className="text-white text-2xl">CARRITO VACÍO</h1>
        <p className="font-body text-sm text-white/30">
          No tienes productos en el carrito para pagar.
        </p>
        <Link href="/products">
          <Button size="lg">Ver Colección</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setServerError(null);

    const checkoutItems = items.map((i) => ({
      variantId:   i.variantId,
      productName: i.productName,
      size:        i.size,
      color:       i.color,
      price:       i.price,
      quantity:    i.quantity,
    }));

    startTransition(async () => {
      const result = await createOrderAction(
        checkoutItems,
        {
          full_name: contact.full_name,
          phone:     contact.phone,
          country:   addrValue.country,
          state:     stateName(addrValue.country, addrValue.state),
          city:      addrValue.city,
          address:   addrValue.address,
          zip_code:  addrValue.zip_code || undefined,
          notes:     contact.notes || undefined,
        },
        paymentMethod
      );
      if (result && "error" in result) {
        setServerError(result.error);
      } else if (result && "orderId" in result) {
        clearCart();
        router.push(`/checkout/success?order=${result.orderId}`);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="font-impact text-[10px] tracking-[0.5em] text-crimson uppercase mb-1">
          BULL WEIGHTLIFTING
        </p>
        <h1 className="text-3xl md:text-4xl text-white">CHECKOUT</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10">
        {/* LEFT */}
        <div className="flex-1 space-y-8">

          {/* Saved addresses */}
          {savedAddresses.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <MapPin size={13} className="text-crimson" />
                <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
                  Direcciones guardadas
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => applySavedAddress(addr)}
                    className={`text-left px-4 py-3 border transition-all ${
                      selectedSavedId === addr.id
                        ? "border-crimson bg-crimson/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <p className="font-body text-xs text-white">{addr.label}</p>
                    <p className="font-body text-[10px] text-white/40 mt-0.5">
                      {addr.street}, {addr.city}
                    </p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setSelectedSavedId(null); setAddrValue(EMPTY_ADDRESS); }}
                  className={`text-left px-4 py-3 border transition-all ${
                    selectedSavedId === null
                      ? "border-crimson bg-crimson/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <p className="font-body text-xs text-white">+ Nueva dirección</p>
                </button>
              </div>
            </section>
          )}

          {/* Contacto */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Truck size={13} className="text-crimson" />
              <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
                Datos de contacto y envío
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre completo"
                placeholder="Juan García"
                value={contact.full_name}
                onChange={(e) => setC("full_name", e.target.value)}
                required
              />
              <Input
                label="Teléfono / WhatsApp"
                placeholder="3001234567"
                value={contact.phone}
                onChange={(e) => setC("phone", e.target.value)}
                required
              />
            </div>

            {/* Address selects */}
            <AddressForm value={addrValue} onChange={setAddrValue} />

            <div>
              <label className="block font-body text-[11px] tracking-widest uppercase text-white/50 mb-1.5">
                Notas (opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Instrucciones especiales para la entrega..."
                className="w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm text-white placeholder-white/20 focus:outline-none focus:border-crimson/60 resize-none"
                value={contact.notes}
                onChange={(e) => setC("notes", e.target.value)}
              />
            </div>
          </section>

          {/* Método de pago */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <CreditCard size={13} className="text-crimson" />
              <h2 className="font-body text-[10px] tracking-[0.3em] uppercase text-white/40">
                Método de pago
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex items-center gap-3 px-4 py-3 border text-left transition-all ${
                    paymentMethod === m.id
                      ? "border-crimson bg-crimson/10 text-white"
                      : "border-white/10 text-white/40 hover:border-white/30 hover:text-white/70"
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <span className="font-body text-xs tracking-wide">{m.label}</span>
                  {paymentMethod === m.id && (
                    <CheckCircle2 size={13} className="ml-auto text-crimson" />
                  )}
                </button>
              ))}
            </div>
            <p className="font-body text-[10px] text-white/20 tracking-wide">
              "Pago simulado" confirma la orden sin procesar ningún cobro real.
            </p>
          </section>

          {serverError && (
            <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 font-body">
              {serverError}
            </div>
          )}
        </div>

        {/* RIGHT — Resumen */}
        <aside className="lg:w-80 shrink-0">
          <div className="border border-white/5 p-6 space-y-5 sticky top-24">
            <h2 className="text-white text-xl">RESUMEN</h2>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="w-12 h-14 bg-[#222] flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#2a2a2a]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-white truncate">{item.productName}</p>
                    <p className="font-body text-[10px] text-white/30">{item.size} · {item.color}</p>
                    <p className="font-body text-[10px] text-white/40">
                      {item.quantity} × ${item.price.toLocaleString("es-CO")}
                    </p>
                    {item.maxStock !== undefined && item.quantity >= item.maxStock && (
                      <p className="font-body text-[9px] text-yellow-500/70 mt-0.5">
                        Stock máximo alcanzado
                      </p>
                    )}
                  </div>
                  <p className="font-bebas text-sm tracking-wider text-white shrink-0">
                    ${(item.price * item.quantity).toLocaleString("es-CO")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4 space-y-2">
              <div className="flex justify-between text-xs font-body text-white/40">
                <span>Subtotal</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-xs font-body text-white/40">
                <span>Envío</span>
                <span>Por confirmar</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-white/5">
                <span className="font-body text-sm text-white/60 uppercase tracking-wider">Total</span>
                <span className="font-bebas text-2xl tracking-wider text-white">
                  ${total.toLocaleString("es-CO")}
                  <span className="font-body text-[10px] text-white/30 ml-1 normal-case tracking-normal">COP</span>
                </span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isPending}
              disabled={!isFormValid || isPending}
            >
              {isPending ? "Procesando..." : "Confirmar pedido"}
            </Button>

            <Link
              href="/cart"
              className="flex items-center justify-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-white/30 hover:text-white transition-colors"
            >
              <ArrowLeft size={11} />
              Volver al carrito
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}

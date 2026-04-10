"use client";

import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { COUNTRIES, STATES_BY_COUNTRY } from "@/lib/locationData";

export interface AddressValue {
  country: string;
  state: string;
  city: string;
  address: string;
  zip_code: string;
}

export const EMPTY_ADDRESS: AddressValue = {
  country: "CO",
  state: "",
  city: "",
  address: "",
  zip_code: "",
};

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
}

function SelectField({ label, value, onChange, options, placeholder, required, disabled }: SelectFieldProps) {
  return (
    <div>
      <label className="block font-body text-[11px] tracking-widest uppercase text-white/50 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={`w-full bg-white/5 border border-white/10 px-4 py-3 font-body text-sm focus:outline-none focus:border-crimson/60 appearance-none ${
            disabled ? "text-white/20 cursor-not-allowed opacity-50" : "text-white cursor-pointer"
          }`}
        >
          <option value="" className="bg-[#1a1a1a] text-white">
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#1a1a1a] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
      </div>
    </div>
  );
}

interface AddressFormProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
}

export function AddressForm({ value, onChange }: AddressFormProps) {
  const countryData = COUNTRIES.find((c) => c.code === value.country);

  const stateOptions = value.country
    ? (STATES_BY_COUNTRY[value.country] ?? []).map((s) => ({ value: s.code, label: s.name }))
    : [];

  const cityOptions =
    value.country && value.state
      ? (
          STATES_BY_COUNTRY[value.country]?.find((s) => s.code === value.state)?.cities ?? []
        ).map((c) => ({ value: c, label: c }))
      : [];

  const handleCountryChange = (country: string) => {
    onChange({ ...value, country, state: "", city: "", zip_code: "" });
  };

  const handleStateChange = (state: string) => {
    onChange({ ...value, state, city: "" });
  };

  return (
    <div className="space-y-4">
      <SelectField
        label="País"
        value={value.country}
        onChange={handleCountryChange}
        options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
        placeholder="Selecciona un país"
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label={countryData?.stateLabel ?? "Departamento / Estado"}
          value={value.state}
          onChange={handleStateChange}
          options={stateOptions}
          placeholder={
            stateOptions.length > 0
              ? `Selecciona ${countryData?.stateLabel?.toLowerCase() ?? "departamento"}`
              : "Selecciona un país primero"
          }
          required
          disabled={stateOptions.length === 0}
        />

        <SelectField
          label={countryData?.cityLabel ?? "Ciudad"}
          value={value.city}
          onChange={(city) => onChange({ ...value, city })}
          options={cityOptions}
          placeholder={
            value.state
              ? "Selecciona ciudad"
              : `Selecciona ${countryData?.stateLabel?.toLowerCase() ?? "departamento"} primero`
          }
          required
          disabled={!value.state || cityOptions.length === 0}
        />
      </div>

      <Input
        label="Dirección detallada"
        placeholder="Calle 80 #25-40, Apto 301"
        value={value.address}
        onChange={(e) => onChange({ ...value, address: e.target.value })}
        required
      />

      {countryData?.hasPostalCode && (
        <Input
          label={countryData.postalCodeLabel}
          placeholder="Ej: 110111"
          value={value.zip_code}
          onChange={(e) => onChange({ ...value, zip_code: e.target.value })}
        />
      )}
    </div>
  );
}

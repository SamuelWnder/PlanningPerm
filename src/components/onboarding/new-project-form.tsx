"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ProjectType, PropertyType } from "@/types/database";

// ---- Step configuration ----

type Step = 1 | 2 | 3 | 4;

const PROJECT_TYPES: { value: ProjectType; label: string; description: string }[] = [
  { value: "rear_extension", label: "Rear extension", description: "Single or double-storey at the back" },
  { value: "side_extension", label: "Side extension", description: "Extending to the side of the property" },
  { value: "loft_conversion", label: "Loft conversion", description: "Converting your roof space" },
  { value: "garage_conversion", label: "Garage conversion", description: "Converting an existing garage" },
  { value: "outbuilding", label: "Outbuilding", description: "Garden room, studio, or shed" },
  { value: "new_dwelling", label: "New dwelling", description: "Building a new house or flat" },
  { value: "change_of_use", label: "Change of use", description: "Changing how a building is used" },
  { value: "other", label: "Other", description: "Something else" },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "detached", label: "Detached house" },
  { value: "semi_detached", label: "Semi-detached house" },
  { value: "terraced", label: "Terraced house" },
  { value: "bungalow", label: "Bungalow" },
  { value: "flat", label: "Flat / apartment" },
  { value: "commercial", label: "Commercial property" },
];

// ---- Form state ----

interface FormData {
  address: string;
  uprn: string | null;
  lpa_code: string | null;
  lpa_name: string | null;
  project_type: ProjectType | null;
  property_type: PropertyType | null;
  is_listed: boolean;
  is_conservation_area: boolean;
  description: string;
}

const DEFAULT_FORM: FormData = {
  address: "",
  uprn: null,
  lpa_code: null,
  lpa_name: null,
  project_type: null,
  property_type: null,
  is_listed: false,
  is_conservation_area: false,
  description: "",
};

// ---- Address autocomplete ----

interface AddressSuggestion {
  text: string;
  uprn: string | null;
}

export function NewProjectForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address autocomplete
  const handleAddressInput = useCallback(
    async (value: string) => {
      setAddressQuery(value);
      if (value.length < 4) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const resp = await fetch(
          `/api/address/autocomplete?q=${encodeURIComponent(value)}`
        );
        const data = await resp.json();
        setSuggestions(data.results || []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    },
    []
  );

  const selectAddress = async (suggestion: AddressSuggestion) => {
    setAddressQuery(suggestion.text);
    setSuggestions([]);

    if (suggestion.uprn) {
      try {
        const resp = await fetch(`/api/address/resolve?uprn=${suggestion.uprn}`);
        const data = await resp.json();
        setForm((f) => ({
          ...f,
          address: suggestion.text,
          uprn: suggestion.uprn,
          lpa_code: data.lpa_code || null,
          lpa_name: data.lpa_name || null,
        }));
      } catch {
        setForm((f) => ({ ...f, address: suggestion.text, uprn: suggestion.uprn }));
      }
    } else {
      setForm((f) => ({ ...f, address: suggestion.text }));
    }
  };

  const canAdvance = () => {
    if (step === 1) return form.address.trim().length > 5;
    if (step === 2) return form.project_type !== null && form.property_type !== null;
    if (step === 3) return form.description.trim().length > 20;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const resp = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error("Failed to create project");
      const data = await resp.json();
      router.push(`/dashboard/projects/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                step === s
                  ? "bg-[#1A3A2A] text-white"
                  : step > s
                  ? "bg-[#1A3A2A]/20 text-[#1A3A2A]"
                  : "bg-[#E5E0D8] text-[#9CA3AF]"
              )}
            >
              {s}
            </div>
            {s < 4 && <div className={cn("h-px w-8 transition-colors", step > s ? "bg-[#1A3A2A]/30" : "bg-[#E5E0D8]")} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-[#6B7280]">
          {step === 1 && "Your address"}
          {step === 2 && "Project type"}
          {step === 3 && "Describe your project"}
          {step === 4 && "Final details"}
        </span>
      </div>

      {/* Step 1: Address */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="address" className="text-base font-semibold">
              What is the address of the property?
            </Label>
            <p className="text-sm text-[#6B7280] mt-1 mb-3">
              We use this to identify your local planning authority and find comparable decisions nearby.
            </p>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <Input
                id="address"
                value={addressQuery}
                onChange={(e) => handleAddressInput(e.target.value)}
                placeholder="Start typing your address..."
                className="pl-10"
                autoComplete="off"
              />
              {loadingSuggestions && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#9CA3AF]" />
              )}
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="mt-1 rounded-lg border border-[#E5E0D8] bg-white shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => selectAddress(s)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#F0EDE6] transition-colors border-b border-[#E5E0D8] last:border-0"
                  >
                    {s.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {form.lpa_name && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm text-green-800">
                <strong>Local authority identified:</strong> {form.lpa_name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Project & property type */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">What type of project is this?</Label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {PROJECT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => setForm((f) => ({ ...f, project_type: pt.value }))}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    form.project_type === pt.value
                      ? "border-[#1A3A2A] bg-[#1A3A2A]/5 ring-1 ring-[#1A3A2A]"
                      : "border-[#E5E0D8] bg-white hover:border-[#1A3A2A]/30"
                  )}
                >
                  <p className="text-sm font-medium">{pt.label}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5">{pt.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">What type of property is it?</Label>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => setForm((f) => ({ ...f, property_type: pt.value }))}
                  className={cn(
                    "rounded-lg border p-3 text-left text-sm font-medium transition-all",
                    form.property_type === pt.value
                      ? "border-[#1A3A2A] bg-[#1A3A2A]/5 ring-1 ring-[#1A3A2A]"
                      : "border-[#E5E0D8] bg-white hover:border-[#1A3A2A]/30"
                  )}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Description */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="description" className="text-base font-semibold">
              Describe your project
            </Label>
            <p className="text-sm text-[#6B7280] mt-1 mb-3">
              Include key details: dimensions, materials, how close to boundaries,
              number of storeys. The more detail, the better the assessment.
            </p>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Single-storey rear extension, 4 metres deep by 5 metres wide, flat roof with lantern light, brick to match existing. Property is a semi-detached Victorian terrace. Extension would sit 300mm from the side boundary."
              className="min-h-[160px]"
            />
            <p className="text-xs text-[#9CA3AF] mt-1">
              {form.description.length} characters
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Final flags */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">A couple of final questions</Label>
            <p className="text-sm text-[#6B7280] mt-1 mb-4">
              These affect planning policy significantly.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setForm((f) => ({ ...f, is_listed: !f.is_listed }))}
                className={cn(
                  "w-full rounded-lg border p-4 text-left transition-all flex items-center justify-between",
                  form.is_listed
                    ? "border-[#1A3A2A] bg-[#1A3A2A]/5"
                    : "border-[#E5E0D8] bg-white hover:border-[#1A3A2A]/30"
                )}
              >
                <div>
                  <p className="font-medium">Listed building</p>
                  <p className="text-sm text-[#6B7280]">
                    Is your property on the Statutory List of Buildings of Special
                    Architectural or Historic Interest?
                  </p>
                </div>
                <div className={cn(
                  "ml-4 h-5 w-5 rounded border-2 flex-shrink-0",
                  form.is_listed ? "bg-[#1A3A2A] border-[#1A3A2A]" : "border-[#E5E0D8]"
                )} />
              </button>

              <button
                onClick={() => setForm((f) => ({ ...f, is_conservation_area: !f.is_conservation_area }))}
                className={cn(
                  "w-full rounded-lg border p-4 text-left transition-all flex items-center justify-between",
                  form.is_conservation_area
                    ? "border-[#1A3A2A] bg-[#1A3A2A]/5"
                    : "border-[#E5E0D8] bg-white hover:border-[#1A3A2A]/30"
                )}
              >
                <div>
                  <p className="font-medium">Conservation area</p>
                  <p className="text-sm text-[#6B7280]">
                    Is your property within a designated Conservation Area?
                  </p>
                </div>
                <div className={cn(
                  "ml-4 h-5 w-5 rounded border-2 flex-shrink-0",
                  form.is_conservation_area ? "bg-[#1A3A2A] border-[#1A3A2A]" : "border-[#E5E0D8]"
                )} />
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E0D8]">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
          disabled={step === 1}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {step < 4 ? (
          <Button
            onClick={() => setStep((s) => ((s + 1) as Step))}
            disabled={!canAdvance()}
            className="gap-1"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Creating project..." : "Run feasibility assessment"}
          </Button>
        )}
      </div>
    </div>
  );
}

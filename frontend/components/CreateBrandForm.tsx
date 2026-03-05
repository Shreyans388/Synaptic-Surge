"use client";

import { useState } from "react";
import { useBrandStore } from "@/state/brand.store";

interface CreateBrandFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateBrandForm({
  onSuccess,
  onCancel,
}: CreateBrandFormProps) {
  const { createBrand, isCreatingBrand, setActiveBrand } =
    useBrandStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [brandStyle, setBrandStyle] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [ctaStyle, setCtaStyle] = useState("");

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const newBrand = await createBrand({
        name: name.trim(),
        description: description.trim() || undefined,
        brandVoice: brandVoice.trim() || undefined,
        brandStyle: brandStyle.trim() || undefined,
        brandColors: brandColors
          ? brandColors
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : undefined,
        ctaStyle: ctaStyle.trim() || undefined,
      });

      setActiveBrand(newBrand._id);

      // reset form
      setName("");
      setDescription("");
      setBrandVoice("");
      setBrandStyle("");
      setBrandColors("");
      setCtaStyle("");

      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create brand";
      setError(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <h2 className="text-xl font-semibold">
        Create Brand
      </h2>

      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="text"
          placeholder="Brand Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="ui-input md:col-span-2"
        />

        <textarea
          placeholder="Brand Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="ui-input md:col-span-2"
        />

        <input
          type="text"
          placeholder="Brand Voice"
          value={brandVoice}
          onChange={(e) => setBrandVoice(e.target.value)}
          className="ui-input"
        />

        <input
          type="text"
          placeholder="Brand Style"
          value={brandStyle}
          onChange={(e) => setBrandStyle(e.target.value)}
          className="ui-input"
        />

        <input
          type="text"
          placeholder="Brand Colors (#0ea5e9,#111827)"
          value={brandColors}
          onChange={(e) => setBrandColors(e.target.value)}
          className="ui-input"
        />

        <input
          type="text"
          placeholder="CTA Style"
          value={ctaStyle}
          onChange={(e) => setCtaStyle(e.target.value)}
          className="ui-input"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="ui-btn-secondary"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={isCreatingBrand}
          className="ui-btn-primary"
        >
          {isCreatingBrand ? "Creating..." : "Save Brand"}
        </button>
      </div>
    </form>
  );
}

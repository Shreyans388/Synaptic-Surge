"use client";

import { useState } from "react";
import { useBrandStore } from "@/state/brand.store";

interface CreateBrandFormProps {
  onSuccess?: () => void;
}

export default function CreateBrandForm({
  onSuccess,
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
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0B0E14] space-y-4"
    >
      <h2 className="text-lg font-bold dark:text-white">
        Create Brand
      </h2>

      <input
        type="text"
        placeholder="Brand Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent"
      />

      <textarea
        placeholder="Brand Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent"
      />

      <input
        type="text"
        placeholder="Brand Voice"
        value={brandVoice}
        onChange={(e) => setBrandVoice(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent"
      />

      <input
        type="text"
        placeholder="Brand Style"
        value={brandStyle}
        onChange={(e) => setBrandStyle(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent"
      />

      <input
        type="text"
        placeholder="Brand Colors (#0ea5e9,#111827)"
        value={brandColors}
        onChange={(e) => setBrandColors(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent"
      />

      <input
        type="text"
        placeholder="CTA Style"
        value={ctaStyle}
        onChange={(e) => setCtaStyle(e.target.value)}
        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent"
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isCreatingBrand}
        className="px-5 py-2 bg-sky-600 text-white rounded-xl font-semibold hover:bg-sky-700 transition disabled:opacity-50"
      >
        {isCreatingBrand ? "Creating..." : "Save Brand"}
      </button>
    </form>
  );
}
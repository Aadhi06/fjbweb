"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import type { DynamicForm, FormField } from "@/lib/types";
import { showFormError, showFormSuccess, showFormWarning } from "@/lib/alerts";

const MAX_PHOTOS = 5;

function PhotoUploadField({ field }: { field: FormField }) {
  const [selectedCount, setSelectedCount] = useState(0);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) {
      setSelectedCount(0);
      return;
    }
    if (files.length > MAX_PHOTOS) {
      const limited = new DataTransfer();
      Array.from(files).slice(0, MAX_PHOTOS).forEach((file) => limited.items.add(file));
      e.target.files = limited.files;
      setSelectedCount(MAX_PHOTOS);
      void showFormWarning("Up to 5 images", "You can upload up to 5 images. Extra pictures were not added.");
      return;
    }
    setSelectedCount(files.length);
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-2">
        You can upload up to 5 images. Please upload more pictures for an easy reply.
      </p>
      <input
        type="file"
        name={`${field.name}[]`}
        required={field.required}
        accept="image/*"
        multiple
        onChange={handleChange}
        className="w-full text-sm text-muted-foreground file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
      />
      {selectedCount > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedCount} of {MAX_PHOTOS} images selected
        </p>
      )}
    </div>
  );
}

function FormFieldComponent({ field, defaultValue }: { field: FormField; defaultValue?: string }) {
  const baseClasses = "w-full px-4 py-3 rounded-xl border border-border bg-white text-secondary placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  switch (field.type) {
    case "textarea":
      return <textarea name={field.name} placeholder={field.placeholder} required={field.required} rows={4} defaultValue={defaultValue} className={baseClasses + " resize-none"} />;
    case "select":
      return (
        <select name={field.name} required={field.required} defaultValue={defaultValue || ""} className={baseClasses + " cursor-pointer"}>
          <option value="">{field.placeholder || "Select..."}</option>
          {field.options?.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
        </select>
      );
    case "radio":
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label key={opt} className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name={field.name} value={opt} required={field.required} defaultChecked={defaultValue === opt} className="w-4 h-4 text-primary focus:ring-primary accent-[#A16207]" />
              <span className="text-sm text-secondary-light">{opt}</span>
            </label>
          ))}
        </div>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name={field.name} required={field.required} className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#A16207]" />
          <span className="text-sm text-secondary-light">{field.placeholder || field.label}</span>
        </label>
      );
    case "file":
      return <PhotoUploadField field={field} />;
    default:
      return <input type={field.type} name={field.name} placeholder={field.placeholder} required={field.required} className={baseClasses} />;
  }
}

export function DynamicFormRenderer({
  form,
  defaultValues,
  highlighted,
}: {
  form: DynamicForm;
  defaultValues?: Record<string, string>;
  highlighted?: boolean;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(() => Date.now());
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - formLoadedAt < 3000) {
      await showFormWarning("Please wait", "Please wait a moment before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    const formEl = e.currentTarget;
    const formData = new FormData(formEl);
    formData.append("_honeypot", honeypot);
    formData.append("_loaded_at", String(formLoadedAt));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/forms/${form.slug}/submit`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Submission failed");
      await showFormSuccess(
        "Thank You!",
        form.success_message || "Your submission has been received. We'll be in touch within 24 hours."
      );
      formEl.reset();
      setFormKey((key) => key + 1);
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).gtag) {
        (window as unknown as { gtag: (...args: unknown[]) => void }).gtag("event", "conversion", { send_to: "form_submission", event_category: "form", event_label: form.slug });
      }
    } catch {
      setError("Something went wrong. Please try again or call us directly.");
      await showFormError("Submission Failed", "Something went wrong. Please try again or call us directly.");
    } finally { setSubmitting(false); }
  }

  return (
    <form
      id="valuation-form"
      onSubmit={handleSubmit}
      className={`space-y-6 transition-shadow duration-500 ${highlighted ? "ring-2 ring-gold/40 ring-offset-4 rounded-2xl" : ""}`}
    >
      {form.description && <p className="text-muted-foreground mb-6">{form.description}</p>}
      {form.fields.sort((a, b) => a.order - b.order).map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-semibold text-secondary mb-2">
            {field.label}{field.required && <span className="text-destructive ml-1">*</span>}
          </label>
          <FormFieldComponent key={`${field.id}-${formKey}`} field={field} defaultValue={defaultValues?.[field.name]} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <label htmlFor="website_url">Website</label>
        <input type="text" name="website_url" id="website_url" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
      <button type="submit" disabled={submitting} className="w-full py-4 bg-black text-white font-bold rounded-full hover:bg-black/80 transition-colors shadow-lg disabled:opacity-50 text-base cursor-pointer">
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GripVertical, Loader2, Plus, RefreshCw, Trash2, X } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type FormField = {
  id: number;
  name: string;
  label: string;
  type: string;
  placeholder?: string | null;
  required: boolean;
  options?: string[] | null;
  order: number;
  is_active: boolean;
};

type FormRecord = {
  id: number;
  title: string;
  slug: string;
  description?: string;
  is_active: boolean;
  fields_count: number;
  fields: FormField[];
};

const FIELD_TYPES = ["text", "textarea", "email", "phone", "number", "select", "checkbox", "radio", "file", "date"];

const emptyField = {
  name: "",
  label: "",
  type: "text",
  placeholder: "",
  required: false,
  options: "",
};

export function FormsContent({
  showToast,
}: {
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [forms, setForms] = useState<FormRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [showAddField, setShowAddField] = useState(false);
  const [fieldForm, setFieldForm] = useState({ ...emptyField });
  const [saving, setSaving] = useState(false);
  const [orderedFields, setOrderedFields] = useState<FormField[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const orderedFieldsRef = useRef<FormField[]>([]);
  const startOrderRef = useRef<number[]>([]);

  const fetchForms = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/forms`, { headers: getAuthHeaders() });
      const data = await res.json();
      const list: FormRecord[] = data.data || [];
      setForms(list);
      if (!selectedSlug && list.length > 0) setSelectedSlug(list[0].slug);
    } catch {
      showToast("Failed to load forms", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedSlug, showToast]);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  const selectedForm = forms.find((f) => f.slug === selectedSlug);

  useEffect(() => {
    if (!selectedForm) {
      setOrderedFields([]);
      return;
    }
    setOrderedFields([...selectedForm.fields].sort((a, b) => a.order - b.order));
  }, [selectedForm]);

  useEffect(() => {
    orderedFieldsRef.current = orderedFields;
  }, [orderedFields]);

  async function saveFieldOrder(nextFields: FormField[]) {
    if (!selectedForm) return;
    setReordering(true);
    try {
      const fieldIds = nextFields.map((f) => f.id);
      const res = await fetch(`${API_URL}/admin/forms/${selectedForm.id}/fields/reorder`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ field_ids: fieldIds }),
      });

      if (res.ok) {
        showToast("Field order saved", "success");
        fetchForms();
        return;
      }

      // Fallback: update each field order (works if bulk reorder route is missing)
      const results = await Promise.all(
        nextFields.map((field, index) =>
          fetch(`${API_URL}/admin/forms/${selectedForm.id}/fields/${field.id}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({ order: index + 1 }),
          })
        )
      );

      if (results.every((r) => r.ok)) {
        showToast("Field order saved", "success");
        fetchForms();
        return;
      }

      const errBody = await results.find((r) => !r.ok)?.json().catch(() => null);
      throw new Error(errBody?.message || "Save failed");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save field order", "error");
      if (selectedForm) {
        setOrderedFields([...selectedForm.fields].sort((a, b) => a.order - b.order));
      }
    } finally {
      setReordering(false);
    }
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
    startOrderRef.current = orderedFieldsRef.current.map((f) => f.id);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setOrderedFields((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      orderedFieldsRef.current = next;
      return next;
    });
    setDragIndex(index);
  }

  function handleDragEnd() {
    const newOrder = orderedFieldsRef.current.map((f) => f.id);
    setDragIndex(null);
    if (startOrderRef.current.join(",") !== newOrder.join(",")) {
      saveFieldOrder(orderedFieldsRef.current);
    }
  }

  async function addField(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedForm) return;
    setSaving(true);
    try {
      const options = fieldForm.options
        ? fieldForm.options.split(",").map((o) => o.trim()).filter(Boolean)
        : null;
      const res = await fetch(`${API_URL}/admin/forms/${selectedForm.id}/fields`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: fieldForm.name.toLowerCase().replace(/\s+/g, "_"),
          label: fieldForm.label,
          type: fieldForm.type,
          placeholder: fieldForm.placeholder || null,
          required: fieldForm.required,
          options,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("Field added", "success");
      setShowAddField(false);
      setFieldForm({ ...emptyField });
      fetchForms();
    } catch {
      showToast("Failed to add field", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteField(fieldId: number) {
    if (!selectedForm || !confirm("Delete this field?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/forms/${selectedForm.id}/fields/${fieldId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      showToast("Field deleted", "success");
      fetchForms();
    } catch {
      showToast("Failed to delete field", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Form Fields</h2>
          <p className="text-gray-500">Add or manage fields on contact, valuation, and other forms</p>
        </div>
        <button onClick={() => { setLoading(true); fetchForms(); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Forms</p>
          <div className="space-y-1">
            {forms.map((form) => (
              <button
                key={form.id}
                onClick={() => setSelectedSlug(form.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedSlug === form.slug ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {form.title}
                <span className={`block text-xs mt-0.5 ${selectedSlug === form.slug ? "text-white/70" : "text-gray-400"}`}>
                  {form.fields_count} fields
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {selectedForm ? (
            <>
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-black">{selectedForm.title}</h3>
                  <p className="text-xs text-gray-500">slug: {selectedForm.slug}</p>
                </div>
                <button
                  onClick={() => setShowAddField(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-black/80"
                >
                  <Plus className="w-4 h-4" /> Add Field
                </button>
              </div>
              <p className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 bg-gray-50/30">
                Drag rows by the handle to change field order on the website form.
                {reordering && <span className="ml-2 text-amber-600">Saving order…</span>}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="w-10 px-2 py-3" aria-label="Reorder" />
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Label</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Required</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderedFields.map((field, index) => (
                      <tr
                        key={field.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`border-b border-gray-50 transition-colors ${
                          dragIndex === index ? "bg-amber-50" : "hover:bg-gray-50/50"
                        }`}
                      >
                        <td className="px-2 py-3 text-gray-400 cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4 mx-auto" />
                        </td>
                        <td className="px-4 py-3 font-medium">{field.label}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{field.name}</td>
                        <td className="px-4 py-3 text-gray-600">{field.type}</td>
                        <td className="px-4 py-3">{field.required ? "Yes" : "No"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteField(field.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedForm.slug === "gold-valuation" && (
                <p className="p-4 text-xs text-amber-700 bg-amber-50 border-t border-amber-100">
                  Note: Gold calculator also sends calculated items (gold_items, estimated_total) automatically — these are not form fields.
                </p>
              )}
            </>
          ) : (
            <p className="p-8 text-center text-gray-500">Select a form</p>
          )}
        </div>
      </div>

      {showAddField && selectedForm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddField(false)} />
          <form onSubmit={addField} className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-black">Add Field to {selectedForm.title}</h3>
              <button type="button" onClick={() => setShowAddField(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field Name (slug)</label>
              <input required value={fieldForm.name} onChange={(e) => setFieldForm((f) => ({ ...f, name: e.target.value }))} placeholder="expected_price" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input required value={fieldForm.label} onChange={(e) => setFieldForm((f) => ({ ...f, label: e.target.value }))} placeholder="Expected Price" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={fieldForm.type} onChange={(e) => setFieldForm((f) => ({ ...f, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
              <input value={fieldForm.placeholder} onChange={(e) => setFieldForm((f) => ({ ...f, placeholder: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            {(fieldForm.type === "select" || fieldForm.type === "radio") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options (comma separated)</label>
                <input value={fieldForm.options} onChange={(e) => setFieldForm((f) => ({ ...f, options: e.target.value }))} placeholder="Option 1, Option 2" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={fieldForm.required} onChange={(e) => setFieldForm((f) => ({ ...f, required: e.target.checked }))} />
              Required field
            </label>
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-black text-white font-medium rounded-lg disabled:opacity-50">
              {saving ? "Adding..." : "Add Field"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

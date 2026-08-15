"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ChevronDown, Loader2, Mail, RefreshCw, X, Bell } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

type BookingRecord = {
  id: number;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes?: string;
  created_at: string;
};

type EmailTemplate = {
  id: string;
  name: string;
  description: string;
  subject: string;
  html: string;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    confirmed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${styles[status] || "bg-gray-50 text-gray-600"}`}>
      {status}
    </span>
  );
}

export function BookingsContent({
  showToast,
}: {
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [rescheduleBooking, setRescheduleBooking] = useState<BookingRecord | null>(null);
  const [detailBooking, setDetailBooking] = useState<BookingRecord | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ booking_date: "", booking_time: "", confirm: true });
  const [cancelReason, setCancelReason] = useState("");
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [savingDetails, setSavingDetails] = useState(false);

  function openDetail(b: BookingRecord) {
    setDetailBooking(b);
    setEditForm({
      name: b.name || "",
      email: b.email || "",
      phone: b.phone || "",
      notes: b.notes || "",
    });
  }

  function applyBookingUpdate(updated: BookingRecord) {
    setBookings((list) => list.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
    setDetailBooking((current) => (current?.id === updated.id ? { ...current, ...updated } : current));
  }

  function formatBookingDate(date: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatCreatedAt(date: string) {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/bookings`, { headers: getAuthHeaders() });
      const data = await res.json();
      setBookings(data.data || []);
    } catch {
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/booking-email-templates`, { headers: getAuthHeaders() });
      const data = await res.json();
      setTemplates(data.data || []);
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchTemplates();
  }, [fetchBookings, fetchTemplates]);

  async function updateStatus(id: number, status: string, reason?: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) throw new Error();
      showToast(`Booking ${status} — customer emailed`, "success");
      fetchBookings();
    } catch {
      showToast("Failed to update booking", "error");
    } finally {
      setUpdatingId(null);
      setCancelReason("");
    }
  }

  async function saveDetails(): Promise<boolean> {
    if (!detailBooking) return false;
    if (!editForm.email.trim()) {
      showToast("Email is required", "error");
      return false;
    }
    setSavingDetails(true);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${detailBooking.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(editForm),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed");
      applyBookingUpdate(data.booking);
      showToast("Customer details saved", "success");
      return true;
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save details", "error");
      return false;
    } finally {
      setSavingDetails(false);
    }
  }

  async function sendReminder(booking: BookingRecord) {
    setUpdatingId(booking.id);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${booking.id}/remind`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Failed");
      showToast(data?.message || "Reminder sent", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to send reminder", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleReschedule(e: React.FormEvent) {
    e.preventDefault();
    if (!rescheduleBooking) return;
    setUpdatingId(rescheduleBooking.id);
    try {
      const res = await fetch(`${API_URL}/admin/bookings/${rescheduleBooking.id}/reschedule`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          booking_date: rescheduleForm.booking_date,
          booking_time: rescheduleForm.booking_time,
          status: rescheduleForm.confirm ? "confirmed" : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed");
      }
      showToast("Booking rescheduled — customer emailed", "success");
      setRescheduleBooking(null);
      fetchBookings();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reschedule", "error");
    } finally {
      setUpdatingId(null);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Bookings</h2>
          <p className="text-gray-500">Confirm, remind, or reschedule — customers are emailed automatically. Admin gets today &amp; tomorrow each morning at 8am.</p>
        </div>
        <button onClick={() => { setLoading(true); fetchBookings(); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-black">Booking Email Templates</span>
            <span className="text-xs text-gray-400">({templates.length} templates)</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showTemplates ? "rotate-180" : ""}`} />
        </button>
        {showTemplates && (
          <div className="border-t border-gray-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className="text-left p-4 rounded-lg border border-gray-200 hover:border-amber-400 hover:bg-amber-50/30 transition-colors"
              >
                <p className="font-medium text-black text-sm">{t.name}</p>
                <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                <p className="text-xs text-amber-700 mt-2 truncate">Subject: {t.subject}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
          <p className="text-gray-500 text-sm">Bookings appear here when customers book on the website.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Service</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date / Time</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Notes</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => openDetail(b)}
                    className="border-b border-gray-100 hover:bg-amber-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-black">{b.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{b.email}</div>
                      <div className="text-xs">{b.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{b.service_type}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatBookingDate(b.booking_date)}
                      <br /><span className="text-xs">{b.booking_time}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[120px] truncate">{b.notes || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1">
                        {b.status === "pending" && (
                          <button onClick={() => updateStatus(b.id, "confirmed")} disabled={updatingId === b.id} className="px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-700 border border-green-200 disabled:opacity-50">Confirm</button>
                        )}
                        {b.status !== "cancelled" && b.status !== "completed" && (
                          <>
                            <button
                              onClick={() => {
                                setRescheduleBooking(b);
                                setRescheduleForm({
                                  booking_date: b.booking_date?.slice(0, 10) || "",
                                  booking_time: b.booking_time,
                                  confirm: b.status !== "confirmed",
                                });
                              }}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 text-xs font-medium rounded bg-blue-50 text-blue-700 border border-blue-200 disabled:opacity-50"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => sendReminder(b)}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 text-xs font-medium rounded bg-amber-50 text-amber-800 border border-amber-200 disabled:opacity-50"
                            >
                              Remind
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Cancellation reason (optional):");
                                updateStatus(b.id, "cancelled", reason || undefined);
                              }}
                              disabled={updatingId === b.id}
                              className="px-2 py-1 text-xs font-medium rounded bg-red-50 text-red-700 border border-red-200 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button onClick={() => updateStatus(b.id, "completed")} disabled={updatingId === b.id} className="px-2 py-1 text-xs font-medium rounded bg-gray-50 text-gray-700 border border-gray-200 disabled:opacity-50">Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailBooking && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailBooking(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-start justify-between gap-3 p-5 border-b">
              <div>
                <p className="text-xs text-gray-400 mb-1">Booking #{detailBooking.id}</p>
                <h3 className="text-lg font-semibold text-black">{detailBooking.name}</h3>
                <div className="mt-2"><StatusBadge status={detailBooking.status} /></div>
              </div>
              <button type="button" onClick={() => setDetailBooking(null)} className="p-1 rounded-lg hover:bg-gray-100" aria-label="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1 block">Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Reminders and booking emails go here. Fix typos before sending.</p>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1 block">Phone</label>
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Service</p>
                  <p className="text-sm text-black">{detailBooking.service_type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Date &amp; Time</p>
                  <p className="text-sm text-black">
                    {formatBookingDate(detailBooking.booking_date)}
                    {detailBooking.booking_time ? ` · ${detailBooking.booking_time}` : ""}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Submitted</p>
                  <p className="text-sm text-black">{formatCreatedAt(detailBooking.created_at)}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1 block">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={saveDetails}
                disabled={savingDetails}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-black text-white disabled:opacity-50"
              >
                {savingDetails ? "Saving…" : "Save customer details"}
              </button>
            </div>

            <div className="border-t p-4 flex flex-wrap gap-2 bg-white">
              {detailBooking.status === "pending" && (
                <button
                  type="button"
                  onClick={async () => {
                    await updateStatus(detailBooking.id, "confirmed");
                    setDetailBooking(null);
                  }}
                  disabled={updatingId === detailBooking.id}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-green-50 text-green-700 border border-green-200 disabled:opacity-50"
                >
                  Confirm
                </button>
              )}
              {detailBooking.status !== "cancelled" && detailBooking.status !== "completed" && (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      const dirty =
                        editForm.email !== (detailBooking.email || "") ||
                        editForm.name !== (detailBooking.name || "") ||
                        editForm.phone !== (detailBooking.phone || "") ||
                        editForm.notes !== (detailBooking.notes || "");
                      if (dirty) {
                        const saved = await saveDetails();
                        if (!saved) return;
                      }
                      await sendReminder(detailBooking);
                    }}
                    disabled={updatingId === detailBooking.id || savingDetails}
                    className="px-3 py-2 text-xs font-medium rounded-lg bg-amber-50 text-amber-800 border border-amber-200 disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    <Bell className="w-3.5 h-3.5" /> Remind
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRescheduleBooking(detailBooking);
                      setRescheduleForm({
                        booking_date: detailBooking.booking_date?.slice(0, 10) || "",
                        booking_time: detailBooking.booking_time,
                        confirm: detailBooking.status !== "confirmed",
                      });
                      setDetailBooking(null);
                    }}
                    disabled={updatingId === detailBooking.id}
                    className="px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 border border-blue-200 disabled:opacity-50"
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const reason = prompt("Cancellation reason (optional):");
                      await updateStatus(detailBooking.id, "cancelled", reason || undefined);
                      setDetailBooking(null);
                    }}
                    disabled={updatingId === detailBooking.id}
                    className="px-3 py-2 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
              {detailBooking.status === "confirmed" && (
                <button
                  type="button"
                  onClick={async () => {
                    await updateStatus(detailBooking.id, "completed");
                    setDetailBooking(null);
                  }}
                  disabled={updatingId === detailBooking.id}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-50 text-gray-700 border border-gray-200 disabled:opacity-50"
                >
                  Complete
                </button>
              )}
              <button
                type="button"
                onClick={() => setDetailBooking(null)}
                className="ml-auto px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTemplate && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedTemplate(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-semibold text-black">{selectedTemplate.name}</h3>
                <p className="text-xs text-gray-500">{selectedTemplate.subject}</p>
              </div>
              <button onClick={() => setSelectedTemplate(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="overflow-y-auto p-4 bg-gray-50 flex-1" dangerouslySetInnerHTML={{ __html: selectedTemplate.html }} />
          </div>
        </div>
      )}

      {rescheduleBooking && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRescheduleBooking(null)} />
          <form onSubmit={handleReschedule} className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-semibold text-black">Reschedule — {rescheduleBooking.name}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
              <input type="date" required value={rescheduleForm.booking_date} onChange={(e) => setRescheduleForm((f) => ({ ...f, booking_date: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Time (HH:MM)</label>
              <input type="time" required value={rescheduleForm.booking_time} onChange={(e) => setRescheduleForm((f) => ({ ...f, booking_time: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={rescheduleForm.confirm} onChange={(e) => setRescheduleForm((f) => ({ ...f, confirm: e.target.checked }))} />
              Also confirm booking (sends confirmation email)
            </label>
            <button type="submit" disabled={updatingId === rescheduleBooking.id} className="w-full py-2.5 bg-black text-white font-medium rounded-lg disabled:opacity-50">
              Reschedule &amp; Notify Customer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

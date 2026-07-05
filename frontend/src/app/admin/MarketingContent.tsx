"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Users,
  Mail,
  Send,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  Download,
  Megaphone,
  FileText,
} from "lucide-react";
import { EMAIL_TEMPLATE_PRESETS, audienceLabel } from "@/lib/emailTemplates";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

type ToastType = "success" | "error";

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg border text-sm font-medium ${type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
      {message}
    </div>
  );
}

type Contact = {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  tags: string[] | null;
  sources: { type: string; label: string; at: string }[] | null;
  is_subscribed: boolean;
  first_seen_at: string | null;
  last_seen_at: string | null;
  last_contacted_at: string | null;
  notes: string | null;
  created_at: string;
};

type Campaign = {
  id: number;
  name: string;
  subject: string;
  body_html: string;
  status: string;
  audience: string;
  filter_tags: string[] | null;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
};

type ContactStats = {
  total: number;
  subscribed: number;
  unsubscribed: number;
  newsletter_subscribers?: number;
};

function ContactDetailModal({ contact, onClose, onSaved }: { contact: Contact; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(contact.name || "");
  const [phone, setPhone] = useState(contact.phone || "");
  const [notes, setNotes] = useState(contact.notes || "");
  const [isSubscribed, setIsSubscribed] = useState(contact.is_subscribed);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/contacts/${contact.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, phone, notes, is_subscribed: isSubscribed }),
      });
      if (!res.ok) throw new Error();
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-black">Contact Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
            <p className="text-black font-medium">{contact.email}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isSubscribed} onChange={(e) => setIsSubscribed(e.target.checked)} className="rounded" />
            <span className="text-sm text-gray-700">Subscribed to marketing emails</span>
          </label>
          {contact.tags && contact.tags.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {contact.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          )}
          {contact.sources && contact.sources.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">Sources</label>
              <ul className="text-xs text-gray-600 space-y-1">
                {contact.sources.map((s, i) => (
                  <li key={i}>{s.label} · {new Date(s.at).toLocaleDateString("en-GB")}</li>
                ))}
              </ul>
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-black/90 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CampaignFormModal({
  campaign,
  onClose,
  onSaved,
}: {
  campaign: Campaign | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const defaultPreset = EMAIL_TEMPLATE_PRESETS[0];
  const [name, setName] = useState(campaign?.name || "");
  const [subject, setSubject] = useState(campaign?.subject || "");
  const [bodyHtml, setBodyHtml] = useState(campaign?.body_html || defaultPreset.body_html);
  const [audience, setAudience] = useState<"subscribed" | "newsletter" | "all">(
    campaign?.filter_tags?.includes("newsletter-popup") ? "newsletter" : (campaign?.audience as "subscribed" | "all") || "newsletter"
  );
  const [saving, setSaving] = useState(false);

  function applyTemplate(templateId: string) {
    const preset = EMAIL_TEMPLATE_PRESETS.find((t) => t.id === templateId);
    if (!preset) return;
    setName(preset.name);
    setSubject(preset.subject);
    setBodyHtml(preset.body_html);
    setAudience(preset.audience);
  }

  function buildPayload() {
    const filterTags = audience === "newsletter" ? ["newsletter-popup"] : [];
    return {
      name,
      subject,
      body_html: bodyHtml,
      audience: audience === "newsletter" ? "subscribed" : audience,
      filter_tags: filterTags,
    };
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = campaign ? `${API_URL}/admin/campaigns/${campaign.id}` : `${API_URL}/admin/campaigns`;
      const method = campaign ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(buildPayload()),
      });
      if (!res.ok) throw new Error();
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-black">{campaign ? "Edit Campaign" : "New Email Campaign"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-900 font-medium mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Start from a template
            </p>
            <div className="flex flex-wrap gap-2">
              {EMAIL_TEMPLATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyTemplate(preset.id)}
                  className="text-xs px-3 py-1.5 bg-white border border-amber-200 rounded-full hover:bg-amber-100 text-amber-900 font-medium"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Campaign Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gold Rate Alert" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Send To</label>
              <select value={audience} onChange={(e) => setAudience(e.target.value as "subscribed" | "newsletter" | "all")} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="newsletter">Newsletter popup subscribers</option>
                <option value="subscribed">All subscribed contacts</option>
                <option value="all">All contacts</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Email Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Gold prices are up — great time to sell" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-1">Email Message</label>
            <p className="text-xs text-gray-400 mb-2">
              Type your message below. Use {"{{name}}"} for the customer&apos;s name. A branded gold &amp; black email design is added automatically when sent.
            </p>
            <textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)} rows={14} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono resize-none" />
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-black px-4 py-3 text-center">
              <p className="text-gold text-sm font-bold">Fine Jewellery Buyers</p>
              <p className="text-white/70 text-xs">Email preview (header/footer added automatically)</p>
            </div>
            <div className="p-4 bg-white text-sm text-gray-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: bodyHtml.replace(/\{\{name\}\}/gi, "John") }} />
            <div className="bg-gray-50 px-4 py-3 text-center border-t border-gray-200">
              <span className="inline-block px-5 py-2 bg-black text-white text-xs font-bold rounded-full">Get Free Valuation</span>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving || !name || !subject} className="w-full py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-black/90 disabled:opacity-50">
            {saving ? "Saving..." : campaign ? "Update Campaign" : "Create Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MarketingContent() {
  const [subTab, setSubTab] = useState<"contacts" | "campaigns">("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  const fetchContacts = useCallback(async () => {
    const params = new URLSearchParams({ per_page: "50" });
    if (search) params.set("search", search);
    const res = await fetch(`${API_URL}/admin/contacts?${params}`, { headers: getAuthHeaders() });
    const data = await res.json();
    setContacts(data.data || []);
  }, [search]);

  const fetchCampaigns = useCallback(async () => {
    const res = await fetch(`${API_URL}/admin/campaigns`, { headers: getAuthHeaders() });
    const data = await res.json();
    setCampaigns(data.data || []);
  }, []);

  const fetchStats = useCallback(async () => {
    const res = await fetch(`${API_URL}/admin/contacts/stats`, { headers: getAuthHeaders() });
    setStats(await res.json());
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchContacts(), fetchCampaigns(), fetchStats()]);
    } catch {
      showToast("Failed to load marketing data", "error");
    } finally {
      setLoading(false);
    }
  }, [fetchContacts, fetchCampaigns, fetchStats]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/admin/contacts/sync`, { method: "POST", headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error();
      showToast(`Synced: ${data.data.created} new, ${data.data.updated} updated (${data.data.total} total)`, "success");
      loadAll();
    } catch {
      showToast("Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  }

  async function handleSendCampaign(campaign: Campaign) {
    const label = audienceLabel(campaign.audience, campaign.filter_tags);
    if (!confirm(`Send "${campaign.subject}" to ${label}?`)) return;
    setSendingId(campaign.id);
    try {
      const res = await fetch(`${API_URL}/admin/campaigns/${campaign.id}/send`, { method: "POST", headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast(data.message, "success");
      fetchCampaigns();
      fetchStats();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Send failed", "error");
    } finally {
      setSendingId(null);
    }
  }

  async function handleDeleteCampaign(id: number) {
    if (!confirm("Delete this campaign?")) return;
    try {
      await fetch(`${API_URL}/admin/campaigns/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      showToast("Campaign deleted", "success");
      fetchCampaigns();
    } catch {
      showToast("Delete failed", "error");
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => setSelectedContact(null)}
          onSaved={() => { showToast("Contact updated", "success"); loadAll(); }}
        />
      )}
      {(showCampaignForm || editCampaign) && (
        <CampaignFormModal
          campaign={editCampaign}
          onClose={() => { setShowCampaignForm(false); setEditCampaign(null); }}
          onSaved={() => { showToast(editCampaign ? "Campaign updated" : "Campaign created", "success"); fetchCampaigns(); setShowCampaignForm(false); setEditCampaign(null); }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Email Marketing</h2>
          <p className="text-gray-500">All customer contacts in one place — no duplicates</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleSync} disabled={syncing} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            <Download className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from Forms & Bookings"}
          </button>
          <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Contacts", value: stats.total, icon: Users },
            { label: "Subscribed", value: stats.subscribed, icon: Mail },
            { label: "Newsletter Popup", value: stats.newsletter_subscribers ?? 0, icon: Megaphone },
            { label: "Unsubscribed", value: stats.unsubscribed, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
              <Icon className="w-5 h-5 text-[#D97706] mb-2" />
              <p className="text-2xl font-bold text-black">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {(["contacts", "campaigns"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${subTab === tab ? "border-[#D97706] text-black" : "border-transparent text-gray-500 hover:text-black"}`}
          >
            {tab === "contacts" ? "Contacts" : "Campaigns"}
          </button>
        ))}
      </div>

      {subTab === "contacts" && (
        <>
          <div className="mb-4">
            <input
              type="search"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchContacts()}
              className="w-full max-w-md px-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          {contacts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">No contacts yet</h3>
              <p className="text-gray-500 text-sm mb-4">Contacts are added automatically when customers submit forms or book appointments.</p>
              <button onClick={handleSync} className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg">Sync Existing Data</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Contact</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tags</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Last Seen</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span className="block font-medium text-black">{c.name || "—"}</span>
                        <span className="text-xs text-gray-400">{c.email}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(c.tags || []).slice(0, 2).map((t) => (
                            <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                          {(c.tags?.length || 0) > 2 && <span className="text-[10px] text-gray-400">+{(c.tags?.length || 0) - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.is_subscribed ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                          {c.is_subscribed ? "Subscribed" : "Unsubscribed"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {c.last_seen_at ? new Date(c.last_seen_at).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedContact(c)} className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 hover:bg-gray-200 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {subTab === "campaigns" && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditCampaign(null); setShowCampaignForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-black/90">
              <Plus className="w-4 h-4" /> New Campaign
            </button>
          </div>
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 text-sm">Create an email campaign to reach your customers.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-black">{c.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${c.status === "sent" ? "bg-green-50 text-green-700 border-green-200" : c.status === "draft" ? "bg-gray-50 text-gray-600 border-gray-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{c.subject}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Audience: {audienceLabel(c.audience, c.filter_tags)}</p>
                    {c.status === "sent" && (
                      <p className="text-xs text-gray-400 mt-1">Sent to {c.sent_count}/{c.total_recipients} · {c.failed_count} failed</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {c.status === "draft" && (
                      <>
                        <button onClick={() => setEditCampaign(c)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleSendCampaign(c)} disabled={sendingId === c.id} className="flex items-center gap-1.5 px-4 py-2 bg-[#D97706] text-white text-sm font-semibold rounded-lg hover:bg-[#B45309] disabled:opacity-50">
                          {sendingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Send
                        </button>
                      </>
                    )}
                    {c.status !== "sending" && (
                      <button onClick={() => handleDeleteCampaign(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

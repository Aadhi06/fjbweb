"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  CalendarDays,
  FileText,
  LogOut,
  Gem,
  ChevronRight,
  ChevronDown,
  Users,
  TrendingUp,
  Package,
  Menu,
  X,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Building2,
  Key,
  Mail,
  BarChart3,
  Star,
  Loader2,
  RefreshCw,
  Upload,
  Image,
  Check,
  Trash2,
  Pencil,
  Plus,
  UserPlus,
  Newspaper,
  Info,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  Megaphone,
  HardHat,
} from "lucide-react";
import { MarketingContent } from "./MarketingContent";
import { FormsContent } from "./FormsContent";
import { BookingsContent } from "./BookingsContent";
import { UsersContent } from "./UsersContent";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002") + "/api";

type AdminUser = { name: string; email: string };
type ActiveTab = "dashboard" | "settings" | "reviews" | "bookings" | "forms" | "submissions" | "marketing" | "blogs" | "users" | "about";

const navItems: { id: ActiveTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "forms", label: "Form Fields", icon: FileText },
  { id: "submissions", label: "Form Submissions", icon: Package },
  { id: "marketing", label: "Email Marketing", icon: Megaphone },
  { id: "blogs", label: "Blogs", icon: Newspaper },
  { id: "about", label: "About Us", icon: Info },
  { id: "users", label: "Users", icon: Users },
];

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";

function Toast({ message, type, onClose }: { message: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-top-2 ${
        type === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const showToast = useCallback((message: string, type: ToastType) => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast(null), []);
  return { toast, showToast, clearToast };
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Users; label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color || "bg-gray-100"}`}>
          <Icon className={`w-5 h-5 ${color ? "text-white" : "text-gray-600"}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-black">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  new: "bg-yellow-50 text-yellow-700 border-yellow-200",
  reviewed: "bg-green-50 text-green-700 border-green-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Input Components ─────────────────────────────────────────────────────────

const inputClass = "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/30 focus:border-[#D97706] transition-colors";

function FormInput({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
    </div>
  );
}

function PasswordInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass + " pr-11"} />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={inputClass + " resize-none"} />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: typeof Building2; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <span className="font-semibold text-black flex-1">{title}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-6 pb-6 pt-2 border-t border-gray-100">{children}</div>}
    </div>
  );
}

// ─── Logo Upload ─────────────────────────────────────────────────────────────

function LogoUpload({ currentUrl, onUploaded }: { currentUrl: string; onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  async function handleFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be under 2MB");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      const res = await fetch(`${API_URL}/admin/upload-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Upload failed");
      }

      const data = await res.json();
      setPreview(data.logo_url);
      onUploaded(data.logo_url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
        onChange={handleChange}
        className="hidden"
      />

      {preview ? (
        <div className="flex items-center gap-4">
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Logo preview" className="max-h-[120px] w-auto object-contain" />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="bg-[#D97706] text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-[#B45309] disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading…" : "Change Logo"}
          </button>
          {success && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <Check className="w-4 h-4" /> Uploaded
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#D97706] transition-colors cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
          ) : (
            <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          )}
          <p className="text-sm font-medium text-gray-600">
            {uploading ? "Uploading…" : "Click to upload"}
          </p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG, or WebP (max 2MB)</p>
        </button>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}

// ─── Google Review Status (used inside Settings) ─────────────────────────────

function GoogleReviewStatus() {
  const [status, setStatus] = useState<{ cached_google_reviews: number; manual_reviews: number; last_fetched_at: string | null } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/admin/reviews/status`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  async function handleFetch() {
    setFetching(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/admin/reviews/fetch`, { method: "POST", headers: getAuthHeaders() });
      const data = await res.json();
      setResult({ success: data.success, message: data.message });
      if (data.success) {
        setStatus((s) => s ? { ...s, cached_google_reviews: data.cached_google_reviews, last_fetched_at: data.last_fetched_at } : s);
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className="mt-5 pt-5 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">Fetch Status</p>
        <button
          onClick={handleFetch}
          disabled={fetching}
          className="bg-[#D97706] text-white font-semibold rounded-lg px-5 py-2 hover:bg-[#B45309] disabled:opacity-50 flex items-center gap-2 transition-colors text-sm"
        >
          {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Fetch Reviews Now
        </button>
      </div>
      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
            <p className="text-xs text-gray-500">Cached Google Reviews</p>
            <p className="text-lg font-bold text-black">{status.cached_google_reviews}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
            <p className="text-xs text-gray-500">Manual Reviews</p>
            <p className="text-lg font-bold text-black">{status.manual_reviews}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
            <p className="text-xs text-gray-500">Last Fetched</p>
            <p className="text-sm font-medium text-black">
              {status.last_fetched_at ? new Date(status.last_fetched_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
            </p>
          </div>
        </div>
      )}
      {result && (
        <div className={`mt-3 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2 ${result.success ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {result.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {result.message}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS CONTENT ─────────────────────────────────────────────────────────

function SettingsContent() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [tickerItems, setTickerItems] = useState<{ text: string; url: string; enabled: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [smtpTestLog, setSmtpTestLog] = useState<{ ok: boolean; lines: string[] } | null>(null);
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    fetch(`${API_URL}/admin/settings`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        const flat: Record<string, string> = {};
        if (d.data) Object.entries(d.data).forEach(([k, v]) => (flat[k] = String(v ?? "")));
        setSettings(flat);
        try {
          const raw = d.data?.top_bar_ticker ?? flat.top_bar_ticker;
          const parsed = typeof raw === "string" ? JSON.parse(raw || "[]") : raw;
          setTickerItems(
            Array.isArray(parsed)
              ? parsed.map((item: { text?: string; url?: string; enabled?: boolean }) => ({
                  text: String(item.text ?? ""),
                  url: String(item.url ?? "/"),
                  enabled: item.enabled !== false,
                }))
              : []
          );
        } catch {
          setTickerItems([]);
        }
      })
      .catch(() => showToast("Failed to load settings", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const update = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  async function saveSettings(keys: string[]) {
    setSaving(true);
    const payload: Record<string, string | { text: string; url: string; enabled: boolean }[]> = {};
    keys.forEach((k) => {
      if (k === "top_bar_ticker") {
        payload[k] = tickerItems.filter((item) => item.text.trim());
      } else {
        payload[k] = settings[k] ?? "";
      }
    });
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ settings: payload }),
      });
      if (!res.ok) throw new Error();
      showToast("Settings saved successfully", "success");
    } catch {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  }

  async function sendTestEmail() {
    if (!testEmail.trim()) {
      showToast("Enter an email address to test", "error");
      return;
    }
    setTestingEmail(true);
    setSmtpTestLog(null);
    try {
      const res = await fetch(`${API_URL}/admin/settings/test-email`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: testEmail.trim(),
          smtp: {
            smtp_host: settings.smtp_host ?? "",
            smtp_port: settings.smtp_port ?? "587",
            smtp_username: settings.smtp_username ?? "",
            smtp_password: settings.smtp_password ?? "",
            smtp_encryption: settings.smtp_encryption ?? "tls",
            smtp_from_address: settings.smtp_from_address ?? "",
            smtp_from_name: settings.smtp_from_name ?? "",
          },
        }),
      });

      const raw = await res.text();
      let data: { ok?: boolean; error?: string; message?: string; log?: string[] } = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        const lines = [
          `HTTP ${res.status} ${res.statusText}`,
          "Could not read JSON from API — backend file may not be uploaded.",
          raw.slice(0, 300) || "(empty response)",
        ];
        setSmtpTestLog({ ok: false, lines });
        throw new Error(`Server returned ${res.status} — upload SettingController.php to Hostinger`);
      }

      const logLines = Array.isArray(data.log) && data.log.length > 0
        ? data.log
        : [data.error || data.message || `HTTP ${res.status}`];

      if (!res.ok || data.ok === false) {
        setSmtpTestLog({ ok: false, lines: logLines });
        const errMsg = data.error || data.message || "Test email failed";
        if (String(errMsg).includes("could not be found") || res.status === 404) {
          logLines.push("FIX: Upload routes/api.php to Hostinger public_html/api/routes/");
          logLines.push("Then open: /clear-cache.php?key=CRON_SECRET on your API domain");
          setSmtpTestLog({ ok: false, lines: logLines });
        }
        throw new Error(errMsg);
      }

      setSmtpTestLog({ ok: true, lines: logLines });
      showToast("Test email sent — check your inbox", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Test email failed";
      showToast(msg.length > 120 ? msg.slice(0, 120) + "…" : msg, "error");
    } finally {
      setTestingEmail(false);
    }
  }

  function SaveButton({ keys }: { keys: string[] }) {
    return (
      <div className="pt-4 flex justify-end">
        <button onClick={() => saveSettings(keys)} disabled={saving} className="bg-[#D97706] text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-[#B45309] disabled:opacity-50 flex items-center gap-2 transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const businessKeys = ["business_name", "tagline", "phone", "email", "address", "opening_hours", "logo_url", "logo_size", "favicon_url", "social_share_image", "whatsapp", "admin_email"];
  const maintenanceKeys = ["maintenance_mode", "maintenance_message"];
  const tickerKeys = ["top_bar_ticker", "top_bar_ticker_speed"];
  const newsletterKeys = [
    "newsletter_popup_enabled",
    "newsletter_popup_title",
    "newsletter_popup_message",
    "newsletter_popup_button_text",
    "newsletter_popup_success_message",
    "newsletter_popup_delay_seconds",
    "newsletter_popup_cookie_days",
    "newsletter_popup_show_name",
  ];
  const metalKeys = ["metal_api_provider", "metal_api_key", "buying_percentage"];
  const googleKeys = ["google_place_id", "google_api_key", "google_review_url", "trustpilot_url"];
  const smtpKeys = ["smtp_host", "smtp_port", "smtp_username", "smtp_password", "smtp_from_address", "smtp_from_name", "smtp_encryption"];
  const trackingKeys = ["gtm_id", "ga_id", "meta_pixel_id"];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      <h2 className="text-2xl font-bold text-black mb-1">Settings</h2>
      <p className="text-gray-500 mb-8">Manage site settings, API keys, and configuration</p>

      <div className="space-y-4">
        <CollapsibleSection title="Maintenance Mode" icon={HardHat} defaultOpen>
          <div
            className={`mt-4 rounded-xl border p-5 ${
              settings.maintenance_mode !== "0" && settings.maintenance_mode !== "false"
                ? "border-amber-300 bg-amber-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenance_mode !== "0" && settings.maintenance_mode !== "false"}
                onChange={(e) => update("maintenance_mode", e.target.checked ? "1" : "0")}
                className="mt-1 rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
              />
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  Enable maintenance mode
                </span>
                <span className="block text-sm text-gray-600 mt-1">
                  Shows a gold-themed &ldquo;We Buy Gold&rdquo; page with WhatsApp and phone. Admin panel stays accessible.
                </span>
              </span>
            </label>
          </div>
          <div className="mt-4">
            <FormTextarea
              label="Maintenance message"
              value={settings.maintenance_message ?? ""}
              onChange={(v) => update("maintenance_message", v)}
              placeholder="We are making a few improvements. We still buy gold — connect with us on WhatsApp."
            />
          </div>
          <SaveButton keys={maintenanceKeys} />
        </CollapsibleSection>

        <CollapsibleSection title="Business Details" icon={Building2} defaultOpen>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormInput label="Business Name" value={settings.business_name ?? ""} onChange={(v) => update("business_name", v)} />
            <FormInput label="Tagline" value={settings.tagline ?? ""} onChange={(v) => update("tagline", v)} />
            <FormInput label="Phone Number" value={settings.phone ?? ""} onChange={(v) => update("phone", v)} />
            <FormInput label="Email" value={settings.email ?? ""} onChange={(v) => update("email", v)} type="email" />
            <FormInput label="WhatsApp Number" value={settings.whatsapp ?? ""} onChange={(v) => update("whatsapp", v)} />
            <FormInput label="Opening Hours" value={settings.opening_hours ?? ""} onChange={(v) => update("opening_hours", v)} />
            <FormInput label="Admin Notification Email" value={settings.admin_email ?? "info@finejewellerybuyers.co.uk"} onChange={(v) => update("admin_email", v)} type="email" placeholder="Email for receiving notifications" />
            <div className="md:col-span-2">
              <LogoUpload currentUrl={settings.logo_url ?? ""} onUploaded={(url) => update("logo_url", url)} />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Size: {settings.logo_size || 48}px</label>
                <input
                  type="range"
                  min="24"
                  max="120"
                  step="4"
                  value={settings.logo_size || 48}
                  onChange={(e) => update("logo_size", e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D97706]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>24px</span>
                  <span>72px</span>
                  <span>120px</span>
                </div>
              </div>
            </div>
            <FormInput
              label="Favicon URL (optional)"
              value={settings.favicon_url ?? ""}
              onChange={(v) => update("favicon_url", v)}
              placeholder="Square PNG — uses logo if empty"
            />
            <FormInput
              label="Social share image URL (WhatsApp / Facebook)"
              value={settings.social_share_image ?? ""}
              onChange={(v) => update("social_share_image", v)}
              placeholder="https://finejewellerybuyers.co.uk/images/og-share.jpg"
            />
            <p className="md:col-span-2 text-xs text-gray-500">
              Social image: 1200×630 px JPG or PNG. Upload your logo above and paste the URL here, or deploy{" "}
              <code className="bg-gray-100 px-1 rounded">frontend/public/images/og-share.jpg</code> to the site.
            </p>
            <div className="md:col-span-2">
              <FormTextarea label="Address" value={settings.address ?? ""} onChange={(v) => update("address", v)} />
            </div>
          </div>
          <SaveButton keys={businessKeys} />
        </CollapsibleSection>

        <CollapsibleSection title="Top Bar Running Ticker" icon={Megaphone} defaultOpen>
          <p className="text-sm text-gray-500 mt-3 mb-4">
            Scrolling messages in the black bar above market rates. Each line can link to any page on your site.
          </p>
          <div className="space-y-3">
            {tickerItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) =>
                      setTickerItems((rows) =>
                        rows.map((row, i) => (i === index ? { ...row, text: e.target.value } : row))
                      )
                    }
                    placeholder="Sell Your Gold Today"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/40"
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) =>
                      setTickerItems((rows) =>
                        rows.map((row, i) => (i === index ? { ...row, url: e.target.value } : row))
                      )
                    }
                    placeholder="/live-rates"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/40"
                  />
                </div>
                <div className="md:col-span-2 flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) =>
                        setTickerItems((rows) =>
                          rows.map((row, i) => (i === index ? { ...row, enabled: e.target.checked } : row))
                        )
                      }
                      className="rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
                    />
                    On
                  </label>
                  <button
                    type="button"
                    onClick={() => setTickerItems((rows) => rows.filter((_, i) => i !== index))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    aria-label="Remove message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTickerItems((rows) => [...rows, { text: "", url: "/", enabled: true }])}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#D97706] hover:text-[#B45309]"
          >
            <Plus className="w-4 h-4" /> Add ticker message
          </button>
          <div className="mt-6 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scroll speed: {settings.top_bar_ticker_speed || 35} seconds per loop
            </label>
            <input
              type="range"
              min="15"
              max="90"
              step="5"
              value={settings.top_bar_ticker_speed || 35}
              onChange={(e) => update("top_bar_ticker_speed", e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#D97706]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Faster (15s)</span>
              <span>Slower (90s)</span>
            </div>
          </div>
          <SaveButton keys={tickerKeys} />
        </CollapsibleSection>

        <CollapsibleSection title="Newsletter Popup" icon={Mail} defaultOpen>
          <p className="text-sm text-gray-500 mt-3 mb-4">
            Welcome popup for customers — edit the greeting, wish message and subscribe button. Subscribers are saved to Email Marketing contacts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <label className="md:col-span-2 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  settings.newsletter_popup_enabled !== "0" &&
                  settings.newsletter_popup_enabled !== "false"
                }
                onChange={(e) => update("newsletter_popup_enabled", e.target.checked ? "1" : "0")}
                className="rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
              />
              <span className="text-sm font-medium text-gray-800">Enable newsletter popup on website</span>
            </label>
            <FormInput
              label="Popup Title"
              value={settings.newsletter_popup_title ?? "Stay in Touch"}
              onChange={(v) => update("newsletter_popup_title", v)}
              placeholder="Stay in Touch"
            />
            <FormInput
              label="Subscribe Button Text"
              value={settings.newsletter_popup_button_text ?? "Subscribe"}
              onChange={(v) => update("newsletter_popup_button_text", v)}
              placeholder="Subscribe"
            />
            <div className="md:col-span-2">
              <FormTextarea
                label="Welcome / Wish Message"
                value={settings.newsletter_popup_message ?? ""}
                onChange={(v) => update("newsletter_popup_message", v)}
                placeholder="Join our list for gold price alerts, selling tips and exclusive offers from Hatton Garden."
              />
            </div>
            <div className="md:col-span-2">
              <FormTextarea
                label="Success Message (after subscribe)"
                value={settings.newsletter_popup_success_message ?? ""}
                onChange={(v) => update("newsletter_popup_success_message", v)}
                placeholder="Thank you! We look forward to keeping you updated."
              />
            </div>
            <FormInput
              label="Show After (seconds)"
              value={settings.newsletter_popup_delay_seconds ?? "8"}
              onChange={(v) => update("newsletter_popup_delay_seconds", v)}
              type="number"
              placeholder="8"
            />
            <FormInput
              label="Remind Me Later — hide for (days)"
              value={settings.newsletter_popup_cookie_days ?? "14"}
              onChange={(v) => update("newsletter_popup_cookie_days", v)}
              type="number"
              placeholder="14"
            />
            <label className="md:col-span-2 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.newsletter_popup_show_name === "1" || settings.newsletter_popup_show_name === "true"}
                onChange={(e) => update("newsletter_popup_show_name", e.target.checked ? "1" : "0")}
                className="rounded border-gray-300 text-[#D97706] focus:ring-[#D97706]"
              />
              <span className="text-sm font-medium text-gray-800">Ask for customer name (optional field)</span>
            </label>
          </div>
          <SaveButton keys={newsletterKeys} />
        </CollapsibleSection>

        <CollapsibleSection title="Metal Price API" icon={TrendingUp}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormSelect
              label="API Provider"
              value={settings.metal_api_provider ?? "metalpriceapi"}
              onChange={(v) => update("metal_api_provider", v)}
              options={[
                { value: "metalpriceapi", label: "MetalPriceAPI" },
                { value: "goldapi", label: "GoldAPI" },
              ]}
            />
            <FormInput label="Buying Percentage" value={settings.buying_percentage ?? "95"} onChange={(v) => update("buying_percentage", v)} type="number" placeholder="95" />
            <div className="md:col-span-2">
              <PasswordInput label="API Key" value={settings.metal_api_key ?? ""} onChange={(v) => update("metal_api_key", v)} placeholder="Enter your API key" />
            </div>
          </div>
          <SaveButton keys={metalKeys} />
        </CollapsibleSection>

        <CollapsibleSection title="Google Reviews" icon={Star}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormInput label="Google Place ID" value={settings.google_place_id ?? ""} onChange={(v) => update("google_place_id", v)} placeholder="ChIJ..." />
            <PasswordInput label="Google API Key" value={settings.google_api_key ?? ""} onChange={(v) => update("google_api_key", v)} placeholder="AIza..." />
            <div className="md:col-span-2">
              <FormInput
                label="Review Us on Google — Button URL"
                value={settings.google_review_url ?? ""}
                onChange={(v) => update("google_review_url", v)}
                placeholder="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank to auto-use Place ID write-review link on the website.</p>
            </div>
            <div className="md:col-span-2">
              <FormInput
                label="Trustpilot Review — Button URL"
                value={settings.trustpilot_url ?? ""}
                onChange={(v) => update("trustpilot_url", v)}
                placeholder="https://www.trustpilot.com/review/finejewellerybuyers.co.uk"
              />
              <p className="text-xs text-gray-400 mt-1">Your Trustpilot review page URL. Button shows on homepage when set.</p>
            </div>
          </div>
          <SaveButton keys={googleKeys} />
          <GoogleReviewStatus />
        </CollapsibleSection>

        <CollapsibleSection title="SMTP / Email" icon={Mail}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormInput label="SMTP Host" value={settings.smtp_host ?? ""} onChange={(v) => update("smtp_host", v)} placeholder="smtp.gmail.com" />
            <FormInput label="SMTP Port" value={settings.smtp_port ?? ""} onChange={(v) => update("smtp_port", v)} type="number" placeholder="587" />
            <FormInput label="SMTP Username" value={settings.smtp_username ?? ""} onChange={(v) => update("smtp_username", v)} />
            <PasswordInput label="SMTP Password" value={settings.smtp_password ?? ""} onChange={(v) => update("smtp_password", v)} />
            <FormInput label="From Email" value={settings.smtp_from_address ?? ""} onChange={(v) => update("smtp_from_address", v)} type="email" />
            <FormInput label="From Name" value={settings.smtp_from_name ?? ""} onChange={(v) => update("smtp_from_name", v)} />
            <FormSelect
              label="Encryption"
              value={settings.smtp_encryption ?? "tls"}
              onChange={(v) => update("smtp_encryption", v)}
              options={[
                { value: "tls", label: "TLS" },
                { value: "ssl", label: "SSL" },
                { value: "none", label: "None" },
              ]}
            />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <FormInput
                label="Send test email to"
                value={testEmail}
                onChange={setTestEmail}
                type="email"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="button"
              onClick={sendTestEmail}
              disabled={testingEmail}
              className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 h-[42px] mb-0.5"
            >
              {testingEmail ? "Sending..." : "Send Test Email"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Brevo: host <code className="bg-gray-100 px-1 rounded">smtp-relay.brevo.com</code>, port{" "}
            <strong>587</strong>, encryption <strong>TLS</strong>. From email must be verified in Brevo.
          </p>
          {smtpTestLog && (
            <div
              className={`mt-4 rounded-xl border p-4 ${
                smtpTestLog.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-300"
              }`}
            >
              <p className={`text-sm font-bold mb-2 ${smtpTestLog.ok ? "text-green-800" : "text-red-800"}`}>
                {smtpTestLog.ok ? "SMTP test log — success" : "SMTP test log — failed"}
              </p>
              <pre className="text-xs font-mono whitespace-pre-wrap break-words text-gray-800 leading-relaxed max-h-64 overflow-y-auto">
                {smtpTestLog.lines.join("\n")}
              </pre>
            </div>
          )}
          <SaveButton keys={smtpKeys} />
        </CollapsibleSection>

        <CollapsibleSection title="Tracking & Ads" icon={BarChart3}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormInput label="Google Tag Manager ID" value={settings.gtm_id ?? ""} onChange={(v) => update("gtm_id", v)} placeholder="GTM-XXXXXXX" />
            <FormInput label="Google Analytics ID" value={settings.ga_id ?? ""} onChange={(v) => update("ga_id", v)} placeholder="G-XXXXXXXXXX" />
            <FormInput label="Meta Pixel ID" value={settings.meta_pixel_id ?? ""} onChange={(v) => update("meta_pixel_id", v)} placeholder="123456789" />
          </div>
          <SaveButton keys={trackingKeys} />
        </CollapsibleSection>
      </div>
    </div>
  );
}

// ─── SUBMISSIONS CONTENT ──────────────────────────────────────────────────────

type SubmissionRecord = {
  id: number;
  form_name: string;
  form_slug?: string;
  data: Record<string, string>;
  files?: {
    id: number;
    field_name: string;
    original_name: string;
    url: string;
    mime_type?: string;
    is_image: boolean;
  }[];
  status: string;
  ip_address?: string;
  created_at: string;
  created_at_human: string;
};

const SUMMARY_FIELD_ORDER = ["gold_items", "estimated_total", "items_count", "name", "email", "phone"];

function formatSubmissionFields(data: Record<string, string>) {
  const entries: [string, string][] = [];
  const handled = new Set<string>();

  for (const key of SUMMARY_FIELD_ORDER) {
    if (data[key]) {
      entries.push([key, data[key]]);
      handled.add(key);
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (handled.has(key) || key.startsWith("_") || key === "photos") continue;
    entries.push([key, value]);
  }

  return entries;
}

function SubmissionModal({ submission, onClose }: { submission: SubmissionRecord; onClose: () => void }) {
  const fields = formatSubmissionFields(submission.data || {});

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-black">{submission.form_name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{submission.created_at_human}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map(([key, value]) => (
            <div key={key}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                {key.replace(/_/g, " ")}
              </p>
              {key === "estimated_total" ? (
                <p className="text-lg font-bold text-amber-600 bg-amber-50 rounded-lg px-4 py-2.5 border border-amber-100">
                  {value}
                </p>
              ) : key === "gold_items" ? (
                <pre className="text-sm text-black bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100 whitespace-pre-wrap font-sans">
                  {value}
                </pre>
              ) : (
                <p className="text-sm text-black bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
                  {String(value || "—")}
                </p>
              )}
            </div>
          ))}

          {submission.files && submission.files.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Uploaded Photos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {submission.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-gray-200 overflow-hidden hover:border-amber-400 transition-colors"
                  >
                    {file.is_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.url} alt={file.original_name} className="w-full h-40 object-cover bg-gray-100" />
                    ) : (
                      <div className="h-40 flex items-center justify-center bg-gray-50 text-sm text-gray-600 px-4 text-center">
                        {file.original_name}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 px-3 py-2 truncate">{file.original_name}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {submission.ip_address && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">IP Address</p>
              <p className="text-sm text-gray-600">{submission.ip_address}</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full bg-gray-100 text-gray-700 font-medium rounded-lg py-2.5 hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmissionsContent() {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);
  const { toast, showToast, clearToast } = useToast();

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/submissions`, { headers: getAuthHeaders() });
      const data = await res.json();
      setSubmissions(data.data || []);
    } catch {
      showToast("Failed to load submissions", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {selectedSubmission && <SubmissionModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Form Submissions</h2>
          <p className="text-gray-500">View all form submissions and enquiries</p>
        </div>
        <button onClick={() => { setLoading(true); fetchSubmissions(); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No submissions yet</h3>
          <p className="text-gray-500 text-sm">Form submissions will appear here once customers submit enquiries.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Form</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Submitter</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const name = s.data?.name || s.data?.full_name || s.data?.first_name || "";
                  const email = s.data?.email || "";
                  return (
                    <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-500">{s.id}</td>
                      <td className="px-4 py-3 font-medium text-black">{s.form_name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {name && <span className="block">{name}</span>}
                        {email && <span className="block text-xs text-gray-400">{email}</span>}
                        {!name && !email && <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                      <td className="px-4 py-3 text-gray-600">{s.created_at_human}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedSubmission(s)}
                          className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BLOGS CONTENT ────────────────────────────────────────────────────────────

type BlogRecord = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  category: string;
  status: string;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  author: { id: number; name: string } | null;
  created_at: string;
  updated_at: string;
};

type BlogFormData = {
  title: string;
  content: string;
  excerpt: string;
  image: string;
  category: string;
  status: string;
  meta_title: string;
  meta_description: string;
};

const emptyBlogForm: BlogFormData = {
  title: "",
  content: "",
  excerpt: "",
  image: "",
  category: "General",
  status: "draft",
  meta_title: "",
  meta_description: "",
};

const blogCategories = ["General", "Selling Tips", "Education", "Market Insights", "News", "Guides"];

function BlogFormModal({
  blog,
  onClose,
  onSaved,
}: {
  blog: BlogRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<BlogFormData>(
    blog
      ? {
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          image: blog.image || "",
          category: blog.category,
          status: blog.status,
          meta_title: blog.meta_title || "",
          meta_description: blog.meta_description || "",
        }
      : { ...emptyBlogForm }
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof BlogFormData, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function handleImageUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("image", file);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/blogs/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      update("image", data.image_url);
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = blog ? `${API_URL}/admin/blogs/${blog.id}` : `${API_URL}/admin/blogs`;
      const method = blog ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Failed to save blog post");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-black">
            {blog ? "Edit Blog Post" : "New Blog Post"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <FormInput label="Title" value={form.title} onChange={(v) => update("title", v)} placeholder="Enter blog post title" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="Write your blog post content here... (HTML supported)"
              rows={12}
              className={inputClass + " resize-y font-mono text-sm"}
            />
          </div>

          <FormTextarea label="Excerpt" value={form.excerpt} onChange={(v) => update("excerpt", v)} placeholder="Brief summary (auto-generated from content if left empty)" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Category"
              value={form.category}
              onChange={(v) => update("category", v)}
              options={blogCategories.map((c) => ({ value: c, label: c }))}
            />
            <FormSelect
              label="Status"
              value={form.status}
              onChange={(v) => update("status", v)}
              options={[
                { value: "draft", label: "Draft" },
                { value: "published", label: "Published" },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Featured Image</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
            />
            {form.image ? (
              <div className="flex items-center gap-4">
                <div className="border border-gray-200 rounded-xl p-2 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image.startsWith("http") ? form.image : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}${form.image}`}
                    alt="Featured"
                    className="max-h-[100px] w-auto object-contain rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="bg-gray-100 text-gray-700 font-medium rounded-lg px-4 py-2 hover:bg-gray-200 text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => update("image", "")}
                    className="bg-red-50 text-red-600 font-medium rounded-lg px-4 py-2 hover:bg-red-100 text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#D97706] transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-1" />
                ) : (
                  <Image className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                )}
                <p className="text-sm font-medium text-gray-600">{uploading ? "Uploading…" : "Click to upload featured image"}</p>
                <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, GIF, or WebP (max 5MB)</p>
              </button>
            )}
          </div>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">SEO Settings</p>
            <div className="grid grid-cols-1 gap-4">
              <FormInput label="Meta Title" value={form.meta_title} onChange={(v) => update("meta_title", v)} placeholder="SEO title (defaults to post title)" />
              <FormTextarea label="Meta Description" value={form.meta_description} onChange={(v) => update("meta_description", v)} placeholder="SEO description (defaults to excerpt)" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#D97706] text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-[#B45309] disabled:opacity-50 flex items-center gap-2 transition-colors text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {blog ? "Update Post" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BlogsContent() {
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBlog, setEditBlog] = useState<BlogRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const { toast, showToast, clearToast } = useToast();

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/blogs`, { headers: getAuthHeaders() });
      const data = await res.json();
      setBlogs(data.data || []);
    } catch {
      showToast("Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  function handleNew() {
    setEditBlog(null);
    setShowForm(true);
  }

  function handleEdit(blog: BlogRecord) {
    setEditBlog(blog);
    setShowForm(true);
  }

  function handleSaved() {
    setShowForm(false);
    setEditBlog(null);
    showToast(editBlog ? "Blog post updated" : "Blog post created", "success");
    setLoading(true);
    fetchBlogs();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/admin/blogs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error();
      showToast("Blog post deleted", "success");
      setLoading(true);
      fetchBlogs();
    } catch {
      showToast("Failed to delete blog post", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleStatus(blog: BlogRecord) {
    setTogglingId(blog.id);
    const newStatus = blog.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`${API_URL}/admin/blogs/${blog.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      showToast(`Post ${newStatus === "published" ? "published" : "moved to draft"}`, "success");
      fetchBlogs();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setTogglingId(null);
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {showForm && (
        <BlogFormModal blog={editBlog} onClose={() => { setShowForm(false); setEditBlog(null); }} onSaved={handleSaved} />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Blog Posts</h2>
          <p className="text-gray-500">Create, edit, and manage blog content</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setLoading(true); fetchBlogs(); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={handleNew}
            className="bg-[#D97706] text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-[#B45309] flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> New Blog Post
          </button>
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No blog posts yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first blog post to engage with customers.</p>
          <button
            onClick={handleNew}
            className="bg-[#D97706] text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-[#B45309] inline-flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Create First Post
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {blog.image && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={blog.image.startsWith("http") ? blog.image : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}${blog.image}`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-black truncate max-w-[250px]">{blog.title}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[250px]">{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{blog.category}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(blog)}
                        disabled={togglingId === blog.id}
                        className="group"
                      >
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-colors ${
                            blog.status === "published"
                              ? "bg-green-50 text-green-700 border-green-200 group-hover:bg-green-100"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200 group-hover:bg-yellow-100"
                          } ${togglingId === blog.id ? "opacity-50" : ""}`}
                        >
                          {togglingId === blog.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : null}
                          {blog.status === "published" ? "Published" : "Draft"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(blog.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(blog)}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors flex items-center gap-1"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          disabled={deletingId === blog.id}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {deletingId === blog.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ABOUT CONTENT ────────────────────────────────────────────────────────────

type TeamMemberRecord = {
  id: number;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  sort_order: number;
  is_active: boolean;
};

type TeamMemberFormData = {
  name: string;
  role: string;
  bio: string;
  photo: string;
  is_active: boolean;
};

const emptyTeamForm: TeamMemberFormData = { name: "", role: "", bio: "", photo: "", is_active: true };

type ValueItem = { title: string; description: string };

function TeamMemberFormModal({
  member,
  onClose,
  onSaved,
}: {
  member: TeamMemberRecord | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TeamMemberFormData>(
    member
      ? { name: member.name, role: member.role, bio: member.bio || "", photo: member.photo || "", is_active: member.is_active }
      : { ...emptyTeamForm }
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof TeamMemberFormData, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  async function handlePhotoUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) { setError("Photo must be under 5MB"); return; }
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("photo", file);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`${API_URL}/admin/team/upload-photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      update("photo", data.photo_url);
    } catch {
      setError("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) { setError("Name and role are required"); return; }
    setSaving(true);
    setError("");
    try {
      const url = member ? `${API_URL}/admin/team/${member.id}` : `${API_URL}/admin/team`;
      const method = member ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.message || "Failed to save"); }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const photoSrc = form.photo
    ? form.photo.startsWith("http") ? form.photo : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}${form.photo}`
    : "";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-black">{member ? "Edit Team Member" : "Add Team Member"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo</label>
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} className="hidden" />
            {photoSrc ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoSrc} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="bg-gray-100 text-gray-700 font-medium rounded-lg px-4 py-2 hover:bg-gray-200 text-sm flex items-center gap-1.5 transition-colors disabled:opacity-50">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Change
                  </button>
                  <button type="button" onClick={() => update("photo", "")} className="bg-red-50 text-red-600 font-medium rounded-lg px-4 py-2 hover:bg-red-100 text-sm flex items-center gap-1.5 transition-colors">
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#D97706] transition-colors cursor-pointer disabled:opacity-50">
                {uploading ? <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-1" /> : <Image className="w-6 h-6 text-gray-400 mx-auto mb-1" />}
                <p className="text-sm font-medium text-gray-600">{uploading ? "Uploading…" : "Click to upload photo"}</p>
                <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, or WebP (max 5MB)</p>
              </button>
            )}
          </div>

          <FormInput label="Name" value={form.name} onChange={(v) => update("name", v)} placeholder="Full name" />
          <FormInput label="Role / Position" value={form.role} onChange={(v) => update("role", v)} placeholder="e.g. Senior Gemologist" />
          <FormTextarea label="Bio" value={form.bio} onChange={(v) => update("bio", v)} placeholder="Short biography..." />

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => update("is_active", !form.is_active)} className="flex items-center gap-2 text-sm">
              {form.is_active ? <ToggleRight className="w-8 h-5 text-green-600" /> : <ToggleLeft className="w-8 h-5 text-gray-400" />}
              <span className={form.is_active ? "text-green-700 font-medium" : "text-gray-500"}>
                {form.is_active ? "Active" : "Inactive"}
              </span>
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="bg-[#D97706] text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-[#B45309] disabled:opacity-50 flex items-center gap-2 transition-colors text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {member ? "Update Member" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AboutContent() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [values, setValues] = useState<ValueItem[]>([]);
  const [members, setMembers] = useState<TeamMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMember, setEditMember] = useState<TeamMemberRecord | null>(null);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast, showToast, clearToast } = useToast();

  const fetchAll = useCallback(async () => {
    try {
      const [settingsRes, teamRes] = await Promise.all([
        fetch(`${API_URL}/admin/settings`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/admin/team`, { headers: getAuthHeaders() }),
      ]);
      const settingsData = await settingsRes.json();
      const teamData = await teamRes.json();

      const flat: Record<string, string> = {};
      if (settingsData.data) Object.entries(settingsData.data).forEach(([k, v]) => (flat[k] = String(v ?? "")));
      setSettings(flat);

      try {
        const parsed = typeof flat.about_values === "string" ? JSON.parse(flat.about_values || "[]") : flat.about_values;
        setValues(Array.isArray(parsed) ? parsed : []);
      } catch {
        setValues([]);
      }

      setMembers(teamData.data || []);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateSetting = (key: string, value: string) => setSettings((s) => ({ ...s, [key]: value }));

  async function saveAboutContent() {
    setSaving(true);
    const payload: Record<string, string | ValueItem[]> = {
      about_title: settings.about_title ?? "",
      about_description: settings.about_description ?? "",
      about_mission: settings.about_mission ?? "",
      about_vision: settings.about_vision ?? "",
      about_values: values,
    };
    try {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ settings: payload }),
      });
      if (!res.ok) throw new Error();
      showToast("About content saved successfully", "success");
    } catch {
      showToast("Failed to save about content", "error");
    } finally {
      setSaving(false);
    }
  }

  function addValue() {
    setValues((v) => [...v, { title: "", description: "" }]);
  }

  function updateValue(index: number, field: keyof ValueItem, val: string) {
    setValues((v) => v.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  }

  function removeValue(index: number) {
    setValues((v) => v.filter((_, i) => i !== index));
  }

  function handleMemberSaved() {
    setShowMemberForm(false);
    setEditMember(null);
    showToast(editMember ? "Team member updated" : "Team member added", "success");
    setLoading(true);
    fetchAll();
  }

  async function handleDeleteMember(id: number) {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/admin/team/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      showToast("Team member deleted", "success");
      setMembers((m) => m.filter((x) => x.id !== id));
    } catch {
      showToast("Failed to delete team member", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(member: TeamMemberRecord) {
    try {
      const res = await fetch(`${API_URL}/admin/team/${member.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !member.is_active }),
      });
      if (!res.ok) throw new Error();
      setMembers((m) => m.map((x) => (x.id === member.id ? { ...x, is_active: !x.is_active } : x)));
    } catch {
      showToast("Failed to update status", "error");
    }
  }

  async function handleMoveOrder(member: TeamMemberRecord, direction: "up" | "down") {
    const idx = members.findIndex((m) => m.id === member.id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === members.length - 1)) return;

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newMembers = [...members];
    [newMembers[idx], newMembers[swapIdx]] = [newMembers[swapIdx], newMembers[idx]];
    setMembers(newMembers);

    const order = newMembers.map((m, i) => ({ id: m.id, sort_order: i }));
    try {
      await fetch(`${API_URL}/admin/team/reorder`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ order }),
      });
    } catch {
      showToast("Failed to reorder", "error");
      fetchAll();
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {showMemberForm && (
        <TeamMemberFormModal
          member={editMember}
          onClose={() => { setShowMemberForm(false); setEditMember(null); }}
          onSaved={handleMemberSaved}
        />
      )}

      <h2 className="text-2xl font-bold text-black mb-1">About Us</h2>
      <p className="text-gray-500 mb-8">Manage your About page content and team members</p>

      <div className="space-y-6">
        {/* ── About Content ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-black">Page Content</h3>
            <p className="text-sm text-gray-500 mt-0.5">Edit the About Us page heading, description, mission, and vision</p>
          </div>
          <div className="p-6 space-y-5">
            <FormInput label="Page Title" value={settings.about_title ?? ""} onChange={(v) => updateSetting("about_title", v)} placeholder="About Fine Jewellery Buyers" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={settings.about_description ?? ""}
                onChange={(e) => updateSetting("about_description", e.target.value)}
                placeholder="Main description paragraph(s) for the About page..."
                rows={6}
                className={inputClass + " resize-y"}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea label="Mission Statement" value={settings.about_mission ?? ""} onChange={(v) => updateSetting("about_mission", v)} placeholder="Our mission is..." />
              <FormTextarea label="Vision Statement" value={settings.about_vision ?? ""} onChange={(v) => updateSetting("about_vision", v)} placeholder="Our vision is..." />
            </div>

            {/* ── Values ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Values</label>
                <button type="button" onClick={addValue} className="text-sm text-[#D97706] hover:text-[#B45309] font-medium flex items-center gap-1 transition-colors">
                  <Plus className="w-4 h-4" /> Add Value
                </button>
              </div>
              {values.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-lg">No values added yet. Click &ldquo;Add Value&rdquo; to start.</p>
              ) : (
                <div className="space-y-3">
                  {values.map((v, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={v.title}
                            onChange={(e) => updateValue(i, "title", e.target.value)}
                            placeholder="Value title"
                            className={inputClass}
                          />
                          <textarea
                            value={v.description}
                            onChange={(e) => updateValue(i, "description", e.target.value)}
                            placeholder="Value description"
                            rows={2}
                            className={inputClass + " resize-none"}
                          />
                        </div>
                        <button type="button" onClick={() => removeValue(i)} className="text-red-400 hover:text-red-600 mt-1 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={saveAboutContent} disabled={saving} className="bg-[#D97706] text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-[#B45309] disabled:opacity-50 flex items-center gap-2 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Content
              </button>
            </div>
          </div>
        </div>

        {/* ── Team Members ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-black">Team Members</h3>
              <p className="text-sm text-gray-500 mt-0.5">Manage team members shown on the About page</p>
            </div>
            <button
              onClick={() => { setEditMember(null); setShowMemberForm(true); }}
              className="bg-[#D97706] text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-[#B45309] flex items-center gap-2 transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" /> Add Member
            </button>
          </div>

          {members.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No team members yet</h3>
              <p className="text-gray-500 text-sm mb-6">Add your first team member to display on the About page.</p>
              <button
                onClick={() => { setEditMember(null); setShowMemberForm(true); }}
                className="bg-[#D97706] text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-[#B45309] inline-flex items-center gap-2 transition-colors text-sm"
              >
                <UserPlus className="w-4 h-4" /> Add First Member
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((member, idx) => {
                const photoSrc = member.photo
                  ? member.photo.startsWith("http") ? member.photo : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8002"}${member.photo}`
                  : "";
                return (
                  <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMoveOrder(member, "up")}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveOrder(member, "down")}
                        disabled={idx === members.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 transition-colors"
                      >
                        <ChevronDownIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-gray-200">
                      {photoSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoSrc} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Users className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{member.name}</p>
                      <p className="text-xs text-gray-500 truncate">{member.role}</p>
                    </div>

                    <button
                      onClick={() => handleToggleActive(member)}
                      className="flex items-center gap-1.5 text-xs font-medium"
                      title={member.is_active ? "Click to deactivate" : "Click to activate"}
                    >
                      {member.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Inactive</span>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { setEditMember(member); setShowMemberForm(true); }}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors flex items-center gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        disabled={deletingId === member.id}
                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        {deletingId === member.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── REVIEWS CONTENT (Manual Reviews CRUD) ───────────────────────────────────

type ManualReviewRecord = {
  id: number;
  name: string;
  rating: number;
  text: string;
  review_date: string | null;
  photo_url: string | null;
  is_active: boolean;
  sort_order: number;
};

type ManualReviewFormData = {
  name: string;
  rating: number;
  text: string;
  review_date: string;
  photo_url: string;
  is_active: boolean;
};

const emptyReviewForm: ManualReviewFormData = { name: "", rating: 5, text: "", review_date: "", photo_url: "", is_active: true };

function ManualReviewFormModal({ review, onClose, onSaved }: { review: ManualReviewRecord | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<ManualReviewFormData>(
    review
      ? { name: review.name, rating: review.rating, text: review.text, review_date: review.review_date ?? "", photo_url: review.photo_url ?? "", is_active: review.is_active }
      : { ...emptyReviewForm }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = <K extends keyof ManualReviewFormData>(key: K, value: ManualReviewFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) { setError("Name and review text are required"); return; }
    setSaving(true);
    setError("");
    try {
      const url = review ? `${API_URL}/admin/reviews/manual/${review.id}` : `${API_URL}/admin/reviews/manual`;
      const method = review ? "PUT" : "POST";
      const payload: Record<string, unknown> = { ...form };
      if (!payload.review_date) delete payload.review_date;
      if (!payload.photo_url) delete payload.photo_url;
      const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.message || "Failed to save"); }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="text-lg font-semibold text-black">{review ? "Edit Review" : "Add Manual Review"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          <FormInput label="Reviewer Name" value={form.name} onChange={(v) => updateField("name", v)} placeholder="John Smith" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => updateField("rating", star)} className="focus:outline-none">
                  <Star className={`w-7 h-7 transition-colors ${star <= form.rating ? "text-amber-500 fill-amber-500" : "text-gray-200 fill-gray-200"}`} />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">{form.rating}/5</span>
            </div>
          </div>
          <FormTextarea label="Review Text" value={form.text} onChange={(v) => updateField("text", v)} placeholder="Write the review text..." />
          <FormInput label="Review Date" value={form.review_date} onChange={(v) => updateField("review_date", v)} type="date" />
          <FormInput label="Photo URL (optional)" value={form.photo_url} onChange={(v) => updateField("photo_url", v)} placeholder="https://..." />
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => updateField("is_active", !form.is_active)} className="flex items-center gap-2 text-sm">
              {form.is_active ? <ToggleRight className="w-8 h-5 text-green-600" /> : <ToggleLeft className="w-8 h-5 text-gray-400" />}
              <span className={form.is_active ? "text-green-700 font-medium" : "text-gray-500"}>
                {form.is_active ? "Active" : "Inactive"}
              </span>
            </button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="bg-[#D97706] text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-[#B45309] disabled:opacity-50 flex items-center gap-2 transition-colors text-sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {review ? "Update Review" : "Add Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReviewsContent() {
  const [reviews, setReviews] = useState<ManualReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editReview, setEditReview] = useState<ManualReviewRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const { toast, showToast, clearToast } = useToast();

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/admin/reviews/manual`, { headers: getAuthHeaders() });
      const data = await res.json();
      setReviews(data.data || []);
    } catch {
      showToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  function handleSaved() {
    setShowForm(false);
    setEditReview(null);
    showToast(editReview ? "Review updated" : "Review added", "success");
    setLoading(true);
    fetchReviews();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/admin/reviews/manual/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      showToast("Review deleted", "success");
      setReviews((r) => r.filter((x) => x.id !== id));
    } catch {
      showToast("Failed to delete review", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleActive(review: ManualReviewRecord) {
    setTogglingId(review.id);
    try {
      const res = await fetch(`${API_URL}/admin/reviews/manual/${review.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: !review.is_active }),
      });
      if (!res.ok) throw new Error();
      setReviews((r) => r.map((x) => (x.id === review.id ? { ...x, is_active: !x.is_active } : x)));
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setTogglingId(null);
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {showForm && (
        <ManualReviewFormModal review={editReview} onClose={() => { setShowForm(false); setEditReview(null); }} onSaved={handleSaved} />
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-black mb-1">Manual Reviews</h2>
          <p className="text-gray-500">Add custom testimonials to supplement Google reviews</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setLoading(true); fetchReviews(); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => { setEditReview(null); setShowForm(true); }}
            className="bg-[#D97706] text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-[#B45309] flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Add Review
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Manual reviews are shown alongside Google reviews on your website. Configure your Google Place ID and API Key in{" "}
          <strong>Settings &rarr; Google Reviews</strong> to automatically fetch real Google reviews.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No manual reviews yet</h3>
          <p className="text-gray-500 text-sm mb-6">Add your first review to display customer testimonials.</p>
          <button
            onClick={() => { setEditReview(null); setShowForm(true); }}
            className="bg-[#D97706] text-white font-semibold rounded-lg px-6 py-2.5 hover:bg-[#B45309] inline-flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Add First Review
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:border-gray-300 transition-colors">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-amber-500 font-bold text-sm flex-shrink-0">
                {review.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-black text-sm">{review.name}</p>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-200 fill-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{review.text}</p>
                {review.review_date && (
                  <p className="text-xs text-gray-400 mt-1">{new Date(review.review_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(review)}
                  disabled={togglingId === review.id}
                  className="text-xs font-medium"
                >
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border ${review.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {togglingId === review.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                    {review.is_active ? "Active" : "Inactive"}
                  </span>
                </button>
                <button
                  onClick={() => { setEditReview(review); setShowForm(true); }}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-colors flex items-center gap-1"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={deletingId === review.id}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {deletingId === review.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD CONTENT ────────────────────────────────────────────────────────

type DashboardData = {
  stats: {
    total_bookings: number;
    pending_bookings: number;
    total_submissions: number;
    new_submissions: number;
    active_rates: number;
    published_blogs: number;
  };
  recent_bookings: { id: number; name: string; service_type: string; booking_date: string; booking_time: string; status: string; created_at: string }[];
  recent_submissions: { id: number; form: string; status: string; data: Record<string, string>; created_at: string }[];
};

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/admin/dashboard`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-1">Dashboard</h2>
      <p className="text-gray-500 mb-8">Overview of your business metrics</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={CalendarDays} label="Total Bookings" value={stats?.total_bookings ?? 0} color="bg-[#D97706]" />
        <StatCard icon={Clock} label="Pending Bookings" value={stats?.pending_bookings ?? 0} color="bg-yellow-500" />
        <StatCard icon={FileText} label="Total Submissions" value={stats?.total_submissions ?? 0} color="bg-blue-500" />
        <StatCard icon={AlertCircle} label="New Submissions" value={stats?.new_submissions ?? 0} color="bg-green-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Recent Bookings</h3>
          {data?.recent_bookings && data.recent_bookings.length > 0 ? (
            <div className="space-y-1">
              {data.recent_bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-black truncate">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.service_type} — {b.booking_date}, {b.booking_time}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No bookings yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Recent Submissions</h3>
          {data?.recent_submissions && data.recent_submissions.length > 0 ? (
            <div className="space-y-1">
              {data.recent_submissions.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-black truncate">{s.form}</p>
                    <p className="text-xs text-gray-500">{s.created_at}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No submissions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast, showToast, clearToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    fetch(`${API_URL}/admin/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setChecking(false);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        router.replace("/admin/login");
      });
  }, [router]);

  async function handleLogout() {
    const token = localStorage.getItem("admin_token");
    try {
      await fetch(`${API_URL}/admin/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      router.replace("/admin/login");
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#D97706] rounded-full animate-spin" />
      </div>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "settings":
        return <SettingsContent />;
      case "reviews":
        return <ReviewsContent />;
      case "bookings":
        return <BookingsContent showToast={showToast} />;
      case "forms":
        return <FormsContent showToast={showToast} />;
      case "submissions":
        return <SubmissionsContent />;
      case "marketing":
        return <MarketingContent />;
      case "blogs":
        return <BlogsContent />;
      case "about":
        return <AboutContent />;
      case "users":
        return <UsersContent showToast={showToast} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-[#D97706] rounded-lg flex items-center justify-center flex-shrink-0">
            <Gem className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">FJB Admin</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button className="lg:hidden ml-auto text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#D97706] text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-600 hover:text-black" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-black font-sans">
              {navItems.find((i) => i.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.name?.charAt(0) || "A"}</span>
            </div>
          </div>
        </header>

        <main className="p-6">{renderContent()}</main>
      </div>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  MessageSquare,
  Briefcase,
  Gem,
  Info,
  Sparkles,
  ArrowDown,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/utils";
import { useSettings } from "@/lib/useSettings";
import { showBookingSuccess, showFormError, showFormWarning } from "@/lib/alerts";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface SlotResponse {
  date: string;
  day: string;
  slots: TimeSlot[];
  closed: boolean;
}

interface BookingConfirmation {
  id: number;
  name: string;
  email: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  status: string;
}

const SERVICE_TYPES = [
  "Sell Gold",
  "Sell Diamonds",
  "Sell Gemstones",
  "Sell Watches",
  "Sell Jewellery",
  "Sell Silver",
  "General Enquiry",
];

function getMinDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function isSunday(dateStr: string): boolean {
  const date = new Date(dateStr + "T00:00:00");
  return date.getDay() === 0;
}

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={null}>
      <BookAppointmentContent />
    </Suspense>
  );
}

function BookAppointmentContent() {
  const searchParams = useSearchParams();
  const fromGuide = searchParams.get("from") === "guide";
  const settings = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service_type: "",
    booking_date: "",
    booking_time: "",
    notes: "",
  });

  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(() => Date.now());
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsClosed, setSlotsClosed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    if (!fromGuide) return;
    const timer = setTimeout(() => {
      document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
    return () => clearTimeout(timer);
  }, [fromGuide]);

  function generateFallbackSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    for (let h = 10; h < 18; h++) {
      slots.push({ time: `${h.toString().padStart(2, "0")}:00`, available: true });
      slots.push({ time: `${h.toString().padStart(2, "0")}:30`, available: true });
    }
    return slots;
  }

  async function fetchSlots(date: string) {
    if (!date || isSunday(date)) {
      setSlots([]);
      setSlotsClosed(true);
      return;
    }

    setSlotsLoading(true);
    setSlots([]);
    setSlotsClosed(false);
    setFormData((prev) => ({ ...prev, booking_time: "" }));

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/bookings/available-slots?date=${date}`
      );
      if (res.ok) {
        const data: SlotResponse = await res.json();
        setSlots(data.slots);
        setSlotsClosed(data.closed);
      } else {
        setSlots(generateFallbackSlots());
        setSlotsClosed(false);
      }
    } catch {
      setSlots(generateFallbackSlots());
      setSlotsClosed(false);
    } finally {
      setSlotsLoading(false);
    }
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const date = e.target.value;
    setFormData((prev) => ({ ...prev, booking_date: date, booking_time: "" }));
    setError("");
    if (date) fetchSlots(date);
  }

  function handleSlotSelect(time: string) {
    setFormData((prev) => ({ ...prev, booking_time: time }));
    setError("");
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypot) return;
    if (Date.now() - formLoadedAt < 3000) {
      await showFormWarning("Please wait", "Please wait a moment before submitting.");
      return;
    }
    setError("");

    if (!formData.name || !formData.email || !formData.phone || !formData.service_type || !formData.booking_date || !formData.booking_time) {
      await showFormWarning("Missing Information", "Please fill in all required fields and select a time slot.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, _honeypot: honeypot, _loaded_at: formLoadedAt }),
      });

      const data = await res.json();

      if (res.ok) {
        await showBookingSuccess(data.booking);
        setConfirmation(data.booking);
      } else {
        const message = data.message || "Something went wrong. Please try again.";
        setError(message);
        await showFormError("Booking Failed", message);
      }
    } catch {
      const message = "Network error. Please check your connection and try again.";
      setError(message);
      await showFormError("Network Error", message);
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <>
        <section className="bg-black py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
              Book a Gold Valuation Appointment
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Schedule a visit with our expert valuers.
            </p>
          </div>
        </section>
        <section className="py-16 bg-surface">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12 text-center fade-in">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-black mb-4">
                Appointment Confirmed!
              </h2>
              <p className="text-muted-foreground mb-8">
                Your booking has been received. We&apos;ll send a confirmation to your email.
              </p>
              <div className="bg-surface rounded-2xl p-6 text-left space-y-3 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gold-dark" />
                  <span className="text-black font-medium">{confirmation.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gold-dark" />
                  <span className="text-black">{confirmation.service_type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gold-dark" />
                  <span className="text-black">{confirmation.booking_date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gold-dark" />
                  <span className="text-black">{confirmation.booking_time}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Ref: #{confirmation.id} &middot; Status: <span className="capitalize font-medium">{confirmation.status}</span>
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {fromGuide && (
        <div className="bg-gold/10 border-b border-gold/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-gold-dark" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-black text-sm sm:text-base">Great — let&apos;s get you booked in!</p>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Visit us at {settings.address}. Choose a date and time below — free valuation, no obligation.
              </p>
            </div>
            <ArrowDown className="w-5 h-5 text-gold-dark shrink-0 hidden sm:block animate-bounce" />
          </div>
        </div>
      )}
      <section className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
            Book a Gold Valuation Appointment
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Schedule a visit with our expert valuers for a free, no-obligation assessment.
          </p>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div id="booking-form" className="bg-white rounded-3xl shadow-xl border border-border p-8 md:p-12">
                <SectionHeading
                  title="Schedule Your Visit"
                  description="Choose a date and time that works for you. All appointments are free with no obligation."
                  align="left"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-gold-dark" />
                      Full Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold-dark transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gold-dark" />
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold-dark transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gold-dark" />
                      Phone Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="07XXX XXXXXX"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold-dark transition-all"
                    />
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                      <Gem className="w-4 h-4 text-gold-dark" />
                      Service Type <span className="text-destructive">*</span>
                    </label>
                    <select
                      name="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold-dark transition-all"
                    >
                      <option value="">Select a service...</option>
                      {SERVICE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold-dark" />
                      Preferred Date <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      name="booking_date"
                      value={formData.booking_date}
                      onChange={handleDateChange}
                      min={getMinDate()}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold-dark transition-all"
                    />
                    {formData.booking_date && isSunday(formData.booking_date) && (
                      <p className="text-sm text-destructive mt-2">
                        We are closed on Sundays. Please select another day.
                      </p>
                    )}
                  </div>

                  {/* Time Slots */}
                  {formData.booking_date && !isSunday(formData.booking_date) && (
                    <div>
                      <label className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gold-dark" />
                        Available Time Slots <span className="text-destructive">*</span>
                      </label>

                      {slotsLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                          <div className="w-4 h-4 border-2 border-gold-dark border-t-transparent rounded-full animate-spin" />
                          Loading available slots...
                        </div>
                      )}

                      {!slotsLoading && slotsClosed && (
                        <p className="text-sm text-destructive py-2">
                          No appointments available on this date. Please choose another day.
                        </p>
                      )}

                      {!slotsLoading && !slotsClosed && slots.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-3">
                          {slots.map((slot) => (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => slot.available && handleSlotSelect(slot.time)}
                              className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                formData.booking_time === slot.time
                                  ? "bg-black text-white border-black"
                                  : slot.available
                                  ? "bg-muted text-black border-border hover:bg-gold/10 hover:border-gold-dark"
                                  : "bg-muted/50 text-muted-foreground line-through cursor-not-allowed opacity-50 border-border"
                              }`}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-semibold text-black mb-3 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-gold-dark" />
                      Additional Notes <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any details about your items or special requests..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-black focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold-dark transition-all resize-none"
                    />
                  </div>

                  <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                    <label htmlFor="website_url">Website</label>
                    <input type="text" name="website_url" id="website_url" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  </div>

                  {error && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                      <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !formData.booking_time}
                    className="w-full bg-gold text-black font-bold py-4 rounded-full hover:bg-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {submitting ? "Booking..." : "Confirm Appointment"}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Side Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-gold-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-1">Call Us Directly</h3>
                    <a
                      href={`tel:${settings.phone.replace(/\s/g, "")}`}
                      className="text-xl font-bold text-primary hover:underline"
                    >
                      {settings.phone}
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Speak to our team instantly
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-gold-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-2">Opening Hours</h3>
                    <p className="text-sm text-muted-foreground">{settings.opening_hours}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center shrink-0">
                    <Info className="w-6 h-6 text-gold-dark" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black mb-2">What to Bring</h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>Your jewellery or precious items</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>Any certificates or receipts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>Photo ID (driving licence or passport)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        <span>Original boxes or packaging (if available)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-black rounded-2xl p-6">
                <h3 className="font-serif font-bold text-lg text-white mb-2">
                  Free & No Obligation
                </h3>
                <p className="text-white/70 text-sm">
                  All appointments are completely free. Get an expert valuation with no pressure to sell.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

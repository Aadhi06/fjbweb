import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const confirmButtonColor = "#000000";

export function showFormSuccess(title: string, message?: string) {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor,
    buttonsStyling: true,
  });
}

export function showFormError(title: string, message?: string) {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonText: "Try Again",
    confirmButtonColor,
  });
}

export function showFormWarning(title: string, message?: string) {
  return Swal.fire({
    icon: "warning",
    title,
    text: message,
    confirmButtonText: "OK",
    confirmButtonColor,
  });
}

export function showBookingSuccess(booking: {
  id: number;
  name: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
}) {
  return Swal.fire({
    icon: "success",
    title: "Booking Received!",
    html: `
      <p style="margin:0 0 14px;color:#666;font-size:15px;line-height:1.5">
        We have received your booking request. <strong>Our team will review it and send you a confirmation email shortly.</strong>
      </p>
      <div style="text-align:left;background:#fffbeb;border:1px solid #fcd34d;padding:12px 14px;border-radius:10px;font-size:13px;line-height:1.5;color:#92400e;margin:0 0 14px">
        This is not a confirmed appointment yet — please wait for our confirmation email.
      </div>
      <div style="text-align:left;background:#fafafa;padding:16px;border-radius:12px;font-size:14px;line-height:1.7;color:#111">
        <div><strong>${booking.name}</strong></div>
        <div>${booking.service_type}</div>
        <div>${booking.booking_date} at ${booking.booking_time}</div>
        <div style="color:#888;margin-top:8px;font-size:13px">Ref #${booking.id}</div>
      </div>
    `,
    confirmButtonText: "OK",
    confirmButtonColor,
  });
}

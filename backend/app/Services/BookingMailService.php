<?php

namespace App\Services;

use App\Mail\AdminBookingNotification;
use App\Mail\CustomerBookingCancelled;
use App\Mail\CustomerBookingConfirmed;
use App\Mail\CustomerBookingReceived;
use App\Mail\CustomerBookingRescheduled;
use App\Models\Booking;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class BookingMailService
{
    public function sendAdminNotification(Booking $booking): void
    {
        $this->send(function () use ($booking) {
            $adminEmail = Setting::get('admin_email', 'info@finejewellerybuyers.co.uk');
            Mail::to($adminEmail)->send(new AdminBookingNotification($booking));
        }, 'admin booking notification');
    }

    public function sendReceived(Booking $booking): void
    {
        $this->send(function () use ($booking) {
            Mail::to($booking->email)->send(new CustomerBookingReceived($booking));
        }, 'customer booking received');
    }

    public function sendConfirmed(Booking $booking): void
    {
        $this->send(function () use ($booking) {
            Mail::to($booking->email)->send(new CustomerBookingConfirmed($booking));
        }, 'customer booking confirmed');
    }

    public function sendCancelled(Booking $booking, ?string $reason = null): void
    {
        $this->send(function () use ($booking, $reason) {
            Mail::to($booking->email)->send(new CustomerBookingCancelled($booking, $reason));
        }, 'customer booking cancelled');
    }

    public function sendRescheduled(Booking $booking, string $previousDate, string $previousTime): void
    {
        $this->send(function () use ($booking, $previousDate, $previousTime) {
            Mail::to($booking->email)->send(new CustomerBookingRescheduled($booking, $previousDate, $previousTime));
        }, 'customer booking rescheduled');
    }

    public function getTemplatePreviews(): array
    {
        $sample = new Booking([
            'name' => 'Jane Smith',
            'email' => 'customer@example.com',
            'phone' => '07123 456789',
            'service_type' => 'Sell Gold',
            'booking_date' => now()->addDays(3),
            'booking_time' => '14:00',
            'notes' => 'I have a gold bracelet and ring to sell.',
            'status' => 'pending',
        ]);
        $sample->id = 123;

        return [
            [
                'id' => 'booking_received',
                'name' => 'Booking Received (customer)',
                'description' => 'Sent immediately when a customer submits a booking request.',
                'subject' => (new CustomerBookingReceived($sample))->envelope()->subject,
                'html' => (new CustomerBookingReceived($sample))->render(),
            ],
            [
                'id' => 'booking_confirmed',
                'name' => 'Booking Confirmed (customer)',
                'description' => 'Sent when admin confirms a pending booking.',
                'subject' => (new CustomerBookingConfirmed($sample))->envelope()->subject,
                'html' => (new CustomerBookingConfirmed($sample))->render(),
            ],
            [
                'id' => 'booking_cancelled',
                'name' => 'Booking Cancelled (customer)',
                'description' => 'Sent when admin cancels a booking.',
                'subject' => (new CustomerBookingCancelled($sample))->envelope()->subject,
                'html' => (new CustomerBookingCancelled($sample, 'Slot no longer available'))->render(),
            ],
            [
                'id' => 'booking_rescheduled',
                'name' => 'Booking Rescheduled (customer)',
                'description' => 'Sent when admin changes the date or time.',
                'subject' => (new CustomerBookingRescheduled($sample, 'Monday, 7 July 2026', '10:00'))->envelope()->subject,
                'html' => (new CustomerBookingRescheduled($sample, 'Monday, 7 July 2026', '10:00'))->render(),
            ],
            [
                'id' => 'booking_admin',
                'name' => 'New Booking (admin)',
                'description' => 'Sent to admin when a new booking is submitted.',
                'subject' => (new AdminBookingNotification($sample))->envelope()->subject,
                'html' => (new AdminBookingNotification($sample))->render(),
            ],
        ];
    }

    private function send(callable $callback, string $label): void
    {
        $mailConfig = app(MailConfigService::class);
        if (!$mailConfig->isConfigured()) {
            $mailConfig->logIfNotConfigured("booking:{$label}");
            return;
        }

        $mailConfig->applyFromSettings();

        try {
            $callback();
        } catch (\Exception $e) {
            Log::error("Failed to send {$label}: {$e->getMessage()}");
        }
    }
}

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RateController;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\MarketingContactController;
use App\Http\Controllers\Api\MarketingCampaignController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\CronController;
use App\Http\Controllers\Admin\DashboardController;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
*/

Route::get('/rates', [RateController::class, 'index']);
Route::post('/rates/calculate', [RateController::class, 'calculate']);

Route::get('/forms/{slug}', [FormController::class, 'show']);
Route::post('/forms/{slug}/submit', [FormController::class, 'submit'])->middleware(\App\Http\Middleware\AntiSpam::class);
Route::get('/submission-files/{formSubmissionFile}', [FormController::class, 'serveFile']);
Route::get('/enquiry/{token}', [FormController::class, 'conversationShow']);
Route::post('/enquiry/{token}/messages', [FormController::class, 'conversationReply'])
    ->middleware(\App\Http\Middleware\AntiSpam::class);

Route::get('/google-reviews', [ReviewController::class, 'index']);

Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);

Route::get('/settings', [SettingController::class, 'index']);

// cPanel cron (no SSH): curl -s "https://api.yourdomain.co.uk/api/cron?key=YOUR_CRON_SECRET"
Route::get('/cron', [CronController::class, 'run']);
Route::get('/cron/fetch-rates', [CronController::class, 'fetchRates']);

Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])
    ->middleware(\App\Http\Middleware\AntiSpam::class);

Route::get('/team', [TeamMemberController::class, 'index']);

Route::get('/bookings/available-slots', [BookingController::class, 'availableSlots']);
Route::post('/bookings', [BookingController::class, 'store'])->middleware(\App\Http\Middleware\AntiSpam::class);

/*
|--------------------------------------------------------------------------
| Admin Auth (public)
|--------------------------------------------------------------------------
*/

Route::post('/admin/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Admin API Routes (protected by Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/settings', [SettingController::class, 'all']);
    Route::put('/settings', [SettingController::class, 'update']);
    Route::post('/settings/test-email', [SettingController::class, 'testEmail']);

    Route::post('/upload-logo', [SettingController::class, 'uploadLogo']);

    Route::get('/metal-rates', [RateController::class, 'adminMetalRates']);
    Route::put('/metal-rates/buying-percentages', [RateController::class, 'updateBuyingPercentages']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::put('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    Route::put('/bookings/{booking}/reschedule', [BookingController::class, 'reschedule']);
    Route::get('/booking-email-templates', [BookingController::class, 'emailTemplates']);
    Route::get('/booking-settings', [BookingController::class, 'settings']);
    Route::put('/booking-settings', [BookingController::class, 'updateSettings']);

    Route::get('/forms', [FormController::class, 'adminForms']);
    Route::post('/forms/{form}/fields', [FormController::class, 'storeField']);
    Route::put('/forms/{form}/fields/reorder', [FormController::class, 'reorderFields']);
    Route::put('/forms/{form}/fields/{field}', [FormController::class, 'updateField']);
    Route::delete('/forms/{form}/fields/{field}', [FormController::class, 'deleteField']);

    Route::get('/submissions', [FormController::class, 'adminIndex']);
    Route::get('/submissions/{submission}', [FormController::class, 'adminShow']);
    Route::post('/submissions/{submission}/messages', [FormController::class, 'adminReply']);
    Route::post('/submissions/{submission}/mark-read', [FormController::class, 'markSubmissionRead']);

    Route::get('/messages/unread-count', [FormController::class, 'adminMessagesUnreadCount']);
    Route::get('/messages', [FormController::class, 'adminMessages']);

    Route::get('/contacts/stats', [MarketingContactController::class, 'stats']);
    Route::post('/contacts/sync', [MarketingContactController::class, 'sync']);
    Route::get('/contacts', [MarketingContactController::class, 'index']);
    Route::post('/contacts', [MarketingContactController::class, 'store']);
    Route::put('/contacts/{contact}', [MarketingContactController::class, 'update']);
    Route::delete('/contacts/{contact}', [MarketingContactController::class, 'destroy']);

    Route::get('/campaigns', [MarketingCampaignController::class, 'index']);
    Route::post('/campaigns', [MarketingCampaignController::class, 'store']);
    Route::get('/campaigns/{campaign}', [MarketingCampaignController::class, 'show']);
    Route::put('/campaigns/{campaign}', [MarketingCampaignController::class, 'update']);
    Route::delete('/campaigns/{campaign}', [MarketingCampaignController::class, 'destroy']);
    Route::post('/campaigns/{campaign}/send', [MarketingCampaignController::class, 'send']);

    Route::get('/blogs', [BlogController::class, 'adminIndex']);
    Route::post('/blogs', [BlogController::class, 'store']);
    Route::put('/blogs/{blog}', [BlogController::class, 'update']);
    Route::delete('/blogs/{blog}', [BlogController::class, 'destroy']);
    Route::post('/blogs/upload-image', [BlogController::class, 'uploadImage']);

    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::get('/team', [TeamMemberController::class, 'adminIndex']);
    Route::post('/team', [TeamMemberController::class, 'store']);
    Route::post('/team/upload-photo', [TeamMemberController::class, 'uploadPhoto']);
    Route::put('/team/reorder', [TeamMemberController::class, 'reorder']);
    Route::put('/team/{teamMember}', [TeamMemberController::class, 'update']);
    Route::delete('/team/{teamMember}', [TeamMemberController::class, 'destroy']);

    Route::get('/reviews/status', [ReviewController::class, 'adminStatus']);
    Route::post('/reviews/fetch', [ReviewController::class, 'fetchNow']);
    Route::get('/reviews/google', [ReviewController::class, 'adminGoogleIndex']);
    Route::put('/reviews/moderate', [ReviewController::class, 'moderate']);
    Route::get('/reviews/manual', [ReviewController::class, 'manualIndex']);
    Route::post('/reviews/manual', [ReviewController::class, 'manualStore']);
    Route::put('/reviews/manual/{manualReview}', [ReviewController::class, 'manualUpdate']);
    Route::delete('/reviews/manual/{manualReview}', [ReviewController::class, 'manualDestroy']);
});

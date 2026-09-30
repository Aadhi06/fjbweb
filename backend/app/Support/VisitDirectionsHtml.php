<?php

namespace App\Support;

class VisitDirectionsHtml
{
    public static function locationLine(): string
    {
        return 'Suite 39, 4th Floor, 88–90 Hatton Garden, London EC1N 8AA';
    }

    public static function block(): string
    {
        return <<<'HTML'
                <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:16px;margin:0 0 16px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#b45309;">How to find us</p>
                    <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111827;line-height:1.4;">Suite 39, 4th Floor, 88–90 Hatton Garden, London</p>
                    <ol style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.7;">
                        <li style="margin:0 0 8px;">Security is in the lobby. Tell them you need Fine Jewellery Buyers — they will call us and open the gate.</li>
                        <li style="margin:0 0 8px;">Take the lift to the 4th floor.</li>
                        <li style="margin:0;">Turn left. We are the last office, Suite 39. Press the bell.</li>
                    </ol>
                </div>
HTML;
    }
}

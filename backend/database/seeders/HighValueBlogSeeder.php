<?php

namespace Database\Seeders;

use App\Models\Blog;
use Illuminate\Database\Seeder;

class HighValueBlogSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->posts() as $post) {
            Blog::updateOrCreate(
                ['slug' => $post['slug']],
                $post
            );
        }
    }

    /** @return list<array<string, mixed>> */
    private function posts(): array
    {
        return [
            [
                'title' => 'Best Place to Sell Gold in London — Top Price Paid',
                'slug' => 'best-place-to-sell-gold-in-london-top-price-paid',
                'excerpt' => 'Hatton Garden is where London sells gold. Fine Jewellery Buyers pays live market-linked prices at 88–90 Hatton Garden. Check our Google reviews, then walk in or book.',
                'image' => '/images/hatton-garden-building.jpg',
                'category' => 'Sell Gold London',
                'is_published' => true,
                'published_at' => '2026-09-30 13:30:00',
                'meta_title' => 'Best Place to Sell Gold in London | Top Price Paid',
                'meta_description' => 'Best place to sell gold in London with top prices paid. Fine Jewellery Buyers, 88–90 Hatton Garden — live rates, same-day payment. Check our Google reviews first.',
                'content' => '<p>The <strong>best place to sell gold in London</strong> is Hatton Garden. Fine Jewellery Buyers pays a <strong>top price</strong> against live gold rates at 88–90 Hatton Garden. <a href="/sell-gold-london">Sell gold in London</a> or <a href="/free-valuation">get a free valuation</a>. Check our Google reviews on the article page.</p>',
            ],
            [
                'title' => 'How to Sell Gold Bars in the UK Without Losing the Bullion Premium',
                'slug' => 'sell-gold-bars-uk-keep-the-bullion-premium',
                'excerpt' => 'A kilo bar or a sealed PAMP pack is not scrap. Here is how high-value sellers keep the bullion premium when they sell gold bars in the UK.',
                'image' => '/images/gold-bars-coins.png',
                'category' => 'Gold Bars',
                'is_published' => true,
                'published_at' => '2026-09-26 09:00:00',
                'meta_title' => 'Sell Gold Bars UK | Keep the Bullion Premium',
                'meta_description' => 'How to sell gold bars in the UK without a scrap quote. PAMP, Perth Mint, Royal Mint and kilo bars — private Hatton Garden valuation and same-day payment.',
                'content' => '<p>If you are selling a <strong>gold bar</strong> in the United Kingdom, the worst outcome is a scrap-gold price. Investment bars from PAMP, Perth Mint, the Royal Mint, Valcambi and other LBMA refiners are bought as bullion.</p><p>Fine Jewellery Buyers purchases bars from 1g to kilo. Walk into 88–90 Hatton Garden or send insured photographs first if the holding is large. <a href="/sell-gold-bars">Sell gold bars</a> or start a <a href="/free-valuation">free valuation</a>.</p>',
            ],
            [
                'title' => 'Selling Inherited Gold in the UK: Why a Scrap Quote Costs Estates Thousands',
                'slug' => 'sell-inherited-gold-estate-jewellery-uk',
                'excerpt' => 'Inherited gold is rarely one melt price. Executors and families who sort jewellery, coins and bars separately keep more of the estate.',
                'image' => '/images/gold-collection.png',
                'category' => 'Inherited Gold',
                'is_published' => true,
                'published_at' => '2026-09-27 09:00:00',
                'meta_title' => 'Sell Inherited Gold UK | Estate Jewellery Buyers',
                'meta_description' => 'How to sell inherited gold and estate jewellery in the UK. Why scrap quotes cost estates money, and how a Hatton Garden valuation sorts the box line by line.',
                'content' => '<p>A drawer of inherited gold is usually a mix. A single scrap quote on the whole box leaves money in the melt pot. Fine Jewellery Buyers <a href="/sell-inherited-gold">sorts estate gold line by line</a>.</p><p>Use the £5,000+ or £15,000+ band on the <a href="/free-valuation">valuation form</a> so a senior valuer handles the file.</p>',
            ],
            [
                'title' => 'Sell Gold Sovereigns and Krugerrands: Melt Value vs Collector Premium',
                'slug' => 'sell-gold-sovereigns-and-krugerrands',
                'excerpt' => 'Full sovereigns, halves, Krugerrands and Britannias are priced on gold first — then we check whether any coin is worth more than melt.',
                'image' => '/images/gold-bars-coins.png',
                'category' => 'Gold Coins',
                'is_published' => true,
                'published_at' => '2026-09-28 09:00:00',
                'meta_title' => 'Sell Gold Sovereigns & Krugerrands UK | Coin Buyers',
                'meta_description' => 'Sell gold sovereigns, Krugerrands and Britannias in the UK. Hatton Garden coin buyers explain melt value versus collector premium and pay the same day.',
                'content' => '<p>Gold coins are priced on fine gold first. Rare dates and proof issues can sit above melt. <a href="/sell-gold-coins">Sell gold coins</a> in Hatton Garden or by insured post.</p>',
            ],
            [
                'title' => 'Private Gold Valuation in Hatton Garden for High-Value Lots',
                'slug' => 'private-gold-valuation-hatton-garden-high-value',
                'excerpt' => 'Lots over a few thousand pounds need a quiet room, a senior valuer and same-day settlement — not a high-street counter quote.',
                'image' => '/images/hatton-garden-building.jpg',
                'category' => 'Private Clients',
                'is_published' => true,
                'published_at' => '2026-09-29 09:00:00',
                'meta_title' => 'Private Gold Valuation Hatton Garden | High-Value Lots',
                'meta_description' => 'Book a private gold valuation in Hatton Garden for bars, estates and designer jewellery. Senior valuer, same-day payment, no obligation to sell.',
                'content' => '<p>High-value gold needs a private valuation in Hatton Garden. <a href="/book-appointment">Book a time</a> at 88–90 Hatton Garden and tell us the expected value so the right valuer is free.</p>',
            ],
            [
                'title' => 'Should You Melt Cartier and Tiffany Gold — or Sell It as Designer Jewellery?',
                'slug' => 'sell-designer-gold-jewellery-not-scrap',
                'excerpt' => 'Signed gold from Cartier, Tiffany and Boodles is often worth more than scrap. Authenticate first. Melt last.',
                'image' => '/images/jewellery-designer.png',
                'category' => 'Designer Jewellery',
                'is_published' => true,
                'published_at' => '2026-09-30 09:00:00',
                'meta_title' => 'Sell Designer Gold Jewellery UK | Not Scrap Value',
                'meta_description' => 'Sell Cartier, Tiffany and Boodles gold in Hatton Garden. Why designer jewellery should not be melted as scrap, and how a specialist buyer prices the brand.',
                'content' => '<p>Signed gold is often worth more than scrap. Fine Jewellery Buyers <a href="/sell-jewellery-hatton-garden">buys designer jewellery in Hatton Garden</a> above scrap when the piece authenticates.</p>',
            ],
        ];
    }
}

<?php

namespace Database\Seeders;

use App\Models\Form;
use App\Models\FormField;
use Illuminate\Database\Seeder;

class FormSeeder extends Seeder
{
    public function run(): void
    {
        $forms = [
            [
                'title' => 'Free Valuation',
                'slug' => 'free-valuation',
                'description' => 'Fill in the form below and our experts will provide a free valuation within 24 hours.',
                'success_message' => 'Thank you! We will contact you within 24 hours with a valuation.',
                'fields' => [
                    ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'placeholder' => 'John Smith', 'required' => true, 'order' => 1],
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'john@example.com', 'required' => true, 'order' => 2],
                    ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone', 'placeholder' => '07XXX XXXXXX', 'required' => true, 'order' => 3],
                    ['name' => 'item_type', 'label' => 'What are you selling?', 'type' => 'select', 'required' => true, 'options' => ['Gold Jewellery', 'Diamonds', 'Luxury Watch', 'Silver', 'Platinum', 'Branded Jewellery', 'Gemstones', 'Other'], 'order' => 4],
                    ['name' => 'description', 'label' => 'Item Description', 'type' => 'textarea', 'placeholder' => 'Describe your item(s) - carat, weight, brand, condition...', 'required' => true, 'order' => 5],
                    ['name' => 'photos', 'label' => 'Upload Photos', 'type' => 'file', 'required' => false, 'order' => 6],
                    ['name' => 'preferred_contact', 'label' => 'Preferred Contact Method', 'type' => 'radio', 'required' => true, 'options' => ['Phone', 'Email', 'WhatsApp'], 'order' => 7],
                    ['name' => 'consent', 'label' => 'I agree to the privacy policy', 'type' => 'checkbox', 'required' => true, 'order' => 8],
                ],
            ],
            [
                'title' => 'Contact Us',
                'slug' => 'contact',
                'description' => 'Get in touch with our team. We\'ll respond within 24 hours.',
                'success_message' => 'Thank you for contacting us. We\'ll be in touch shortly!',
                'fields' => [
                    ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'placeholder' => 'Your name', 'required' => true, 'order' => 1],
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'you@example.com', 'required' => true, 'order' => 2],
                    ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone', 'placeholder' => '07XXX XXXXXX', 'required' => false, 'order' => 3],
                    ['name' => 'subject', 'label' => 'Subject', 'type' => 'select', 'required' => true, 'options' => ['Selling Gold', 'Selling Diamonds', 'Selling Watches', 'General Enquiry', 'Complaint', 'Other'], 'order' => 4],
                    ['name' => 'message', 'label' => 'Your Message', 'type' => 'textarea', 'placeholder' => 'Tell us how we can help...', 'required' => true, 'order' => 5],
                ],
            ],
            [
                'title' => 'Sell Gold',
                'slug' => 'sell-gold',
                'description' => 'Tell us about your gold items for a quick valuation.',
                'success_message' => 'Thank you! We\'ll send you a gold valuation within 24 hours.',
                'fields' => [
                    ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'placeholder' => 'John Smith', 'required' => true, 'order' => 1],
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'john@example.com', 'required' => true, 'order' => 2],
                    ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone', 'placeholder' => '07XXX XXXXXX', 'required' => true, 'order' => 3],
                    ['name' => 'gold_type', 'label' => 'Gold Type', 'type' => 'select', 'required' => true, 'options' => ['Jewellery', 'Scrap Gold', 'Coins', 'Bars/Bullion', 'Dental Gold', 'Other'], 'order' => 4],
                    ['name' => 'carat', 'label' => 'Carat (if known)', 'type' => 'select', 'required' => false, 'options' => ['9ct', '14ct', '18ct', '22ct', '24ct', 'Unknown'], 'order' => 5],
                    ['name' => 'weight', 'label' => 'Approximate Weight (grams)', 'type' => 'text', 'placeholder' => 'e.g. 15g', 'required' => false, 'order' => 6],
                    ['name' => 'description', 'label' => 'Item Description', 'type' => 'textarea', 'placeholder' => 'Describe your gold items...', 'required' => true, 'order' => 7],
                    ['name' => 'photos', 'label' => 'Upload Photos', 'type' => 'file', 'required' => false, 'order' => 8],
                ],
            ],
            [
                'title' => 'Sell Diamonds',
                'slug' => 'sell-diamonds',
                'description' => 'Tell us about your diamonds for an expert valuation.',
                'success_message' => 'Thank you! Our gemologists will review your submission and respond within 24 hours.',
                'fields' => [
                    ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'placeholder' => 'John Smith', 'required' => true, 'order' => 1],
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'john@example.com', 'required' => true, 'order' => 2],
                    ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone', 'placeholder' => '07XXX XXXXXX', 'required' => true, 'order' => 3],
                    ['name' => 'diamond_type', 'label' => 'Diamond Type', 'type' => 'select', 'required' => true, 'options' => ['Loose Diamond', 'Diamond Ring', 'Diamond Earrings', 'Diamond Necklace', 'Diamond Bracelet', 'Other'], 'order' => 4],
                    ['name' => 'certification', 'label' => 'Certification', 'type' => 'select', 'required' => false, 'options' => ['GIA Certified', 'IGI Certified', 'HRD Certified', 'Other Certificate', 'Uncertified'], 'order' => 5],
                    ['name' => 'description', 'label' => 'Item Description', 'type' => 'textarea', 'placeholder' => 'Size, shape, clarity, colour if known...', 'required' => true, 'order' => 6],
                    ['name' => 'photos', 'label' => 'Upload Photos', 'type' => 'file', 'required' => false, 'order' => 7],
                ],
            ],
            [
                'title' => 'Sell Watches',
                'slug' => 'sell-watches',
                'description' => 'Tell us about your luxury watch for a valuation.',
                'success_message' => 'Thank you! Our watch specialists will respond within 24 hours.',
                'fields' => [
                    ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'placeholder' => 'John Smith', 'required' => true, 'order' => 1],
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'john@example.com', 'required' => true, 'order' => 2],
                    ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone', 'placeholder' => '07XXX XXXXXX', 'required' => true, 'order' => 3],
                    ['name' => 'brand', 'label' => 'Watch Brand', 'type' => 'select', 'required' => true, 'options' => ['Rolex', 'Omega', 'Cartier', 'Patek Philippe', 'Audemars Piguet', 'Breitling', 'IWC', 'TAG Heuer', 'Other'], 'order' => 4],
                    ['name' => 'model', 'label' => 'Model Name/Number', 'type' => 'text', 'placeholder' => 'e.g. Submariner, Speedmaster...', 'required' => false, 'order' => 5],
                    ['name' => 'condition', 'label' => 'Condition', 'type' => 'select', 'required' => true, 'options' => ['Excellent', 'Good', 'Fair', 'Poor', 'Not Working'], 'order' => 6],
                    ['name' => 'box_papers', 'label' => 'Box & Papers', 'type' => 'select', 'required' => false, 'options' => ['Full Set (Box + Papers)', 'Box Only', 'Papers Only', 'Neither'], 'order' => 7],
                    ['name' => 'description', 'label' => 'Additional Details', 'type' => 'textarea', 'placeholder' => 'Year, service history, any damage...', 'required' => false, 'order' => 8],
                    ['name' => 'photos', 'label' => 'Upload Photos', 'type' => 'file', 'required' => false, 'order' => 9],
                ],
            ],
            [
                'title' => 'Sell Jewellery',
                'slug' => 'sell-jewellery',
                'description' => 'Tell us about your fine jewellery for a valuation.',
                'success_message' => 'Thank you! We\'ll review your jewellery details and respond within 24 hours.',
                'fields' => [
                    ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'placeholder' => 'John Smith', 'required' => true, 'order' => 1],
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'john@example.com', 'required' => true, 'order' => 2],
                    ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone', 'placeholder' => '07XXX XXXXXX', 'required' => true, 'order' => 3],
                    ['name' => 'jewellery_type', 'label' => 'Jewellery Type', 'type' => 'select', 'required' => true, 'options' => ['Ring', 'Necklace', 'Bracelet', 'Earrings', 'Brooch', 'Set', 'Other'], 'order' => 4],
                    ['name' => 'brand', 'label' => 'Brand (if applicable)', 'type' => 'text', 'placeholder' => 'e.g. Cartier, Tiffany...', 'required' => false, 'order' => 5],
                    ['name' => 'description', 'label' => 'Item Description', 'type' => 'textarea', 'placeholder' => 'Materials, gemstones, condition...', 'required' => true, 'order' => 6],
                    ['name' => 'photos', 'label' => 'Upload Photos', 'type' => 'file', 'required' => false, 'order' => 7],
                ],
            ],
            [
                'title' => 'Sell Silver',
                'slug' => 'sell-silver',
                'description' => 'Tell us about your silver items for a valuation.',
                'success_message' => 'Thank you! We\'ll provide a silver valuation within 24 hours.',
                'fields' => [
                    ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'placeholder' => 'John Smith', 'required' => true, 'order' => 1],
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'john@example.com', 'required' => true, 'order' => 2],
                    ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone', 'placeholder' => '07XXX XXXXXX', 'required' => true, 'order' => 3],
                    ['name' => 'silver_type', 'label' => 'Silver Type', 'type' => 'select', 'required' => true, 'options' => ['Jewellery', 'Silverware/Cutlery', 'Coins', 'Bars', 'Antique Silver', 'Other'], 'order' => 4],
                    ['name' => 'weight', 'label' => 'Approximate Weight (grams)', 'type' => 'text', 'placeholder' => 'e.g. 500g', 'required' => false, 'order' => 5],
                    ['name' => 'description', 'label' => 'Item Description', 'type' => 'textarea', 'placeholder' => 'Describe your silver items...', 'required' => true, 'order' => 6],
                    ['name' => 'photos', 'label' => 'Upload Photos', 'type' => 'file', 'required' => false, 'order' => 7],
                ],
            ],
            [
                'title' => 'Sell Gemstones',
                'slug' => 'sell-gemstones',
                'description' => 'Tell us about your precious gemstones for an expert valuation.',
                'success_message' => 'Thank you! Our gemologists will assess your submission and respond within 24 hours.',
                'fields' => [
                    ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'placeholder' => 'John Smith', 'required' => true, 'order' => 1],
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'john@example.com', 'required' => true, 'order' => 2],
                    ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone', 'placeholder' => '07XXX XXXXXX', 'required' => true, 'order' => 3],
                    ['name' => 'gemstone_type', 'label' => 'Gemstone Type', 'type' => 'select', 'required' => true, 'options' => ['Ruby', 'Sapphire', 'Emerald', 'Tanzanite', 'Aquamarine', 'Tourmaline', 'Other'], 'order' => 4],
                    ['name' => 'setting', 'label' => 'Setting', 'type' => 'select', 'required' => true, 'options' => ['Loose Stone', 'Set in Ring', 'Set in Necklace', 'Set in Earrings', 'Other Setting'], 'order' => 5],
                    ['name' => 'description', 'label' => 'Item Description', 'type' => 'textarea', 'placeholder' => 'Size, colour, certification if any...', 'required' => true, 'order' => 6],
                    ['name' => 'photos', 'label' => 'Upload Photos', 'type' => 'file', 'required' => false, 'order' => 7],
                ],
            ],
            [
                'title' => 'Gold Calculator Valuation',
                'slug' => 'gold-valuation',
                'description' => 'Request an exact valuation based on your gold calculator estimate.',
                'success_message' => 'Thank you! We\'ll review your gold estimate and contact you within 24 hours with an exact valuation.',
                'fields' => [
                    ['name' => 'name', 'label' => 'Full Name', 'type' => 'text', 'placeholder' => 'John Smith', 'required' => true, 'order' => 1],
                    ['name' => 'email', 'label' => 'Email Address', 'type' => 'email', 'placeholder' => 'john@example.com', 'required' => true, 'order' => 2],
                    ['name' => 'phone', 'label' => 'Phone Number', 'type' => 'phone', 'placeholder' => '07XXX XXXXXX', 'required' => true, 'order' => 3],
                    ['name' => 'expected_price', 'label' => 'Expected Price', 'type' => 'text', 'placeholder' => 'e.g. £500 or best offer', 'required' => false, 'order' => 4],
                    ['name' => 'photos', 'label' => 'Upload Photos', 'type' => 'file', 'required' => true, 'order' => 5],
                ],
            ],
        ];

        foreach ($forms as $formData) {
            $fields = $formData['fields'];
            unset($formData['fields']);

            $form = Form::updateOrCreate(
                ['slug' => $formData['slug']],
                array_merge($formData, ['is_active' => true])
            );

            foreach ($fields as $fieldData) {
                FormField::updateOrCreate(
                    ['form_id' => $form->id, 'name' => $fieldData['name']],
                    array_merge($fieldData, ['is_active' => true])
                );
            }
        }
    }
}

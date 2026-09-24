<?php

use App\Models\Form;
use App\Models\FormField;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $form = Form::where('slug', 'free-valuation')->first();
        if (!$form) {
            return;
        }

        FormField::updateOrCreate(
            ['form_id' => $form->id, 'name' => 'item_type'],
            [
                'label' => 'What are you selling?',
                'type' => 'select',
                'required' => true,
                'options' => [
                    'Gold Jewellery',
                    'Gold bars / bullion',
                    'Gold coins / sovereigns',
                    'Inherited gold collection',
                    'Diamonds',
                    'Luxury Watch',
                    'Silver',
                    'Platinum',
                    'Branded Jewellery',
                    'Gemstones',
                    'Other',
                ],
                'is_active' => true,
            ]
        );

        FormField::updateOrCreate(
            ['form_id' => $form->id, 'name' => 'expected_price'],
            [
                'label' => 'Expected value',
                'type' => 'select',
                'placeholder' => 'Select a range',
                'required' => true,
                'options' => [
                    'Under £500',
                    '£500 – £2,000',
                    '£2,000 – £5,000',
                    '£5,000 – £15,000',
                    '£15,000+',
                ],
                'order' => 6,
                'is_active' => true,
            ]
        );
    }

    public function down(): void
    {
        $form = Form::where('slug', 'free-valuation')->first();
        if (!$form) {
            return;
        }

        FormField::where('form_id', $form->id)->where('name', 'item_type')->update([
            'options' => ['Gold Jewellery', 'Diamonds', 'Luxury Watch', 'Silver', 'Platinum', 'Branded Jewellery', 'Gemstones', 'Other'],
        ]);

        FormField::where('form_id', $form->id)->where('name', 'expected_price')->update([
            'label' => 'Expected Price',
            'type' => 'text',
            'placeholder' => 'e.g. £500 or best offer',
            'required' => false,
            'options' => null,
        ]);
    }
};

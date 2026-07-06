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
            ['form_id' => $form->id, 'name' => 'expected_price'],
            [
                'label' => 'Expected Price',
                'type' => 'text',
                'placeholder' => 'e.g. £500 or best offer',
                'required' => false,
                'options' => null,
                'order' => 6,
                'is_active' => true,
            ]
        );

        $reorder = [
            'photos' => 7,
            'preferred_contact' => 8,
            'consent' => 9,
        ];

        foreach ($reorder as $name => $order) {
            FormField::where('form_id', $form->id)->where('name', $name)->update(['order' => $order]);
        }
    }

    public function down(): void
    {
        $form = Form::where('slug', 'free-valuation')->first();
        if (!$form) {
            return;
        }

        FormField::where('form_id', $form->id)->where('name', 'expected_price')->delete();
    }
};

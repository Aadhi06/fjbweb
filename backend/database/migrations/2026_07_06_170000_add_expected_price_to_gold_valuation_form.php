<?php

use App\Models\Form;
use App\Models\FormField;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $form = Form::where('slug', 'gold-valuation')->first();
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
                'order' => 5,
                'is_active' => true,
            ]
        );

        FormField::where('form_id', $form->id)
            ->where('name', 'photos')
            ->update(['order' => 6]);
    }

    public function down(): void
    {
        $form = Form::where('slug', 'gold-valuation')->first();
        if (!$form) {
            return;
        }

        FormField::where('form_id', $form->id)->where('name', 'expected_price')->delete();
    }
};

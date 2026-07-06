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
            ['form_id' => $form->id, 'name' => 'photos'],
            [
                'label' => 'Upload Photos',
                'type' => 'file',
                'placeholder' => null,
                'required' => true,
                'options' => null,
                'order' => 4,
                'is_active' => true,
            ]
        );
    }

    public function down(): void
    {
        $form = Form::where('slug', 'gold-valuation')->first();
        if (!$form) {
            return;
        }

        FormField::where('form_id', $form->id)->where('name', 'photos')->delete();
    }
};

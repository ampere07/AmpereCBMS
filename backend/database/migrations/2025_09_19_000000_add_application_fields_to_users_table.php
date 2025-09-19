<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Personal Information
            $table->string('last_name')->nullable()->after('name');
            $table->string('middle_name')->nullable()->after('name');
            $table->renameColumn('name', 'first_name');
            $table->string('phone_number')->nullable();
            $table->date('birth_date')->nullable();
            $table->string('gender')->nullable();
            $table->string('civil_status')->nullable();
            
            // Address Information
            $table->string('address_line1')->nullable();
            $table->string('address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code')->nullable();
            
            // Application Information
            $table->string('application_status')->default('pending');
            $table->text('application_notes')->nullable();
            $table->date('application_date')->nullable();
            $table->boolean('is_applicant')->default(false);
            $table->boolean('is_admin')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Restore original name column
            $table->renameColumn('first_name', 'name');
            
            // Drop added columns
            $table->dropColumn([
                'last_name',
                'middle_name',
                'phone_number',
                'birth_date',
                'gender',
                'civil_status',
                'address_line1',
                'address_line2',
                'city',
                'province',
                'postal_code',
                'application_status',
                'application_notes',
                'application_date',
                'is_applicant',
                'is_admin'
            ]);
        });
    }
};

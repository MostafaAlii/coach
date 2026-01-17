<?php

namespace Database\Seeders;
use App\Models\Journey;
use Illuminate\Database\Seeder;

class JourneySeeder extends Seeder
{
    public function run(): void
    {
        /* ===============================
         | SERVICES
         =============================== */

        $servicesParent = Journey::create([
            'title'  => 'Services',
            'type'   => 'service',
            'status' => 'active',
        ]);

        $servicesChildren = [
            'Sessions one to one',
            'Courses',
            'Camps inside and outside Egypt for youth & Teens',
        ];

        foreach ($servicesChildren as $title) {
            Journey::create([
                'title'     => $title,
                'parent_id' => $servicesParent->id,
                'type'      => 'service',
                'status'    => 'active',
            ]);
        }

        // inactive children (factory)
        Journey::factory()
            ->count(3)
            ->service()
            ->inactive()
            ->child($servicesParent->id)
            ->create();

        /* ===============================
         | CERTIFICATES
         =============================== */

        $certificatesParent = Journey::create([
            'title'  => 'Certificates',
            'type'   => 'certificate',
            'status' => 'active',
        ]);

        $certificatesChildren = [
            'Certified Positive Discipline Parenting Educator',
            'Certified Life Coach (ICF)',
            'Certified Addiction Recovery Coach (ICF)',
            'Therapy Diploma (CBT)',
            'Cofounder of Survival Camp',
            'Cofounder Leaves Education',
        ];

        foreach ($certificatesChildren as $title) {
            Journey::create([
                'title'     => $title,
                'parent_id' => $certificatesParent->id,
                'type'      => 'certificate',
                'status'    => 'active',
            ]);
        }

        // inactive children (factory)
        Journey::factory()
            ->count(3)
            ->certificate()
            ->inactive()
            ->child($certificatesParent->id)
            ->create();
    }
}
<?php

namespace Database\Seeders;

use App\Models\Draw;
use App\Models\Prize;
use App\Models\Raffle;
use App\Models\Seller;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create active raffle (100 numbers, $50 each)
        $raffle = Raffle::create([
            'name' => 'Gran Rifa Navideña 2026',
            'description' => 'La gran rifa con 20 premios increibles. No te quedes sin tu boleto!',
            'ticket_price' => 50.00,
            'total_numbers' => 100,
            'status' => 'active',
        ]);

        // 2. Create 20 prizes
        $prizes = [
            ['name' => 'iPhone 16 Pro Max', 'sort_order' => 1],
            ['name' => 'PlayStation 5 Pro', 'sort_order' => 2],
            ['name' => 'Smart TV Samsung 65"', 'sort_order' => 3],
            ['name' => 'MacBook Air M4', 'sort_order' => 4],
            ['name' => 'iPad Pro 13"', 'sort_order' => 5],
            ['name' => 'AirPods Max', 'sort_order' => 6],
            ['name' => 'Nintendo Switch 2', 'sort_order' => 7],
            ['name' => 'Dyson Aspiradora V15', 'sort_order' => 8],
            ['name' => 'Bicicleta de Montaña', 'sort_order' => 9],
            ['name' => 'GoPro Hero 13', 'sort_order' => 10],
            ['name' => 'Alexa Echo Show 15', 'sort_order' => 11],
            ['name' => 'Cafetera Nespresso Vertuo', 'sort_order' => 12],
            ['name' => 'Robot Aspirador Roomba', 'sort_order' => 13],
            ['name' => 'Freidora de Aire Ninja', 'sort_order' => 14],
            ['name' => 'Set de Maletas Samsonite', 'sort_order' => 15],
            ['name' => 'Reloj Apple Watch Ultra', 'sort_order' => 16],
            ['name' => 'Audifonos Sony WH-1000XM5', 'sort_order' => 17],
            ['name' => 'Kindle Scribe', 'sort_order' => 18],
            ['name' => 'Drone DJI Mini 4 Pro', 'sort_order' => 19],
            ['name' => 'Tarjeta de Regalo $5,000', 'sort_order' => 20],
        ];

        foreach ($prizes as $prize) {
            Prize::create([
                'raffle_id' => $raffle->id,
                'name' => $prize['name'],
                'sort_order' => $prize['sort_order'],
            ]);
        }

        // 3. Create 5 sellers with their user accounts
        $sellersData = [
            ['name' => 'Malu',       'email' => 'malu@rifaapp.com',       'phone' => '5491100001111', 'commission' => 10],
            ['name' => 'Carolina',   'email' => 'carolina@rifaapp.com',   'phone' => '5491100002222', 'commission' => 12],
            ['name' => 'Lorena',     'email' => 'lorena@rifaapp.com',     'phone' => '5491100003333', 'commission' => 10],
            ['name' => 'Inma',       'email' => 'inma@rifaapp.com',       'phone' => '5491100004444', 'commission' => 15],
            ['name' => 'Esmeralda', 'email' => 'esmeralda@rifaapp.com', 'phone' => '5491100005555', 'commission' => 12],
        ];

        $sellers = [];
        foreach ($sellersData as $sd) {
            $user = User::create([
                'name' => $sd['name'],
                'email' => $sd['email'],
                'password' => Hash::make('password'),
                'role' => 'seller',
            ]);

            $sellers[] = Seller::create([
                'user_id' => $user->id,
                'name' => $sd['name'],
                'phone' => $sd['phone'],
                'commission_pct' => $sd['commission'],
                'is_active' => true,
            ]);
        }

        // 4. Generate ticket sales — at least 50% of 100 numbers sold
        $totalToSell = rand(55, 70); // between 55-70% sold
        $availableNumbers = range(0, $raffle->total_numbers - 1);
        shuffle($availableNumbers);
        $numbersToSell = array_slice($availableNumbers, 0, $totalToSell);
        sort($numbersToSell);

        // Split numbers into random-sized sales (1-5 tickets per sale)
        $buyerNames = [
            'Carlos Gutierrez', 'Maria Lopez', 'Pedro Sanchez', 'Ana Martinez',
            'Luis Hernandez', 'Sofia Garcia', 'Diego Torres', 'Valentina Ruiz',
            'Miguel Flores', 'Camila Diaz', 'Andres Morales', 'Isabella Castro',
            'Fernando Reyes', 'Lucia Vargas', 'Ricardo Mendez', 'Daniela Ortiz',
            'Pablo Jimenez', 'Natalia Romero', 'Jorge Navarro', 'Mariana Delgado',
            'Roberto Silva', 'Gabriela Pena', 'Eduardo Ramos', 'Paula Aguilar',
            'Alejandro Cruz', 'Carmen Vega', 'Oscar Molina', 'Teresa Guerrero',
        ];

        $index = 0;
        $saleCount = 0;

        while ($index < count($numbersToSell)) {
            // Random sale size: 1-5 tickets
            $saleSize = min(rand(1, 5), count($numbersToSell) - $index);
            $saleNumbers = array_slice($numbersToSell, $index, $saleSize);
            $index += $saleSize;

            // Pick random seller
            $seller = $sellers[array_rand($sellers)];
            $buyer = $buyerNames[array_rand($buyerNames)];
            $contactMethod = rand(0, 1) ? 'whatsapp' : 'email';
            $saleId = Str::uuid()->toString();

            // Random date in the last 30 days
            $daysAgo = rand(0, 30);
            $hoursAgo = rand(0, 23);
            $createdAt = now()->subDays($daysAgo)->subHours($hoursAgo);

            foreach ($saleNumbers as $number) {
                Ticket::create([
                    'sale_id' => $saleId,
                    'raffle_id' => $raffle->id,
                    'seller_id' => $seller->id,
                    'number' => $number,
                    'buyer_name' => $buyer,
                    'buyer_email' => $contactMethod === 'email' ? strtolower(str_replace(' ', '.', $buyer)) . '@gmail.com' : null,
                    'buyer_phone' => $contactMethod === 'whatsapp' ? '549' . rand(1100000000, 1199999999) : null,
                    'contact_method' => $contactMethod,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }

            $saleCount++;
        }

        $this->command->info("Rifa creada: {$raffle->name}");
        $this->command->info("20 premios creados");
        $this->command->info("5 vendedoras creadas (password: 'password')");
        $this->command->info("{$totalToSell} boletos vendidos en {$saleCount} ventas");
    }
}

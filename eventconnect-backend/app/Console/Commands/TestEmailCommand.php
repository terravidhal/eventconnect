<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmailCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'email:test {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Teste l\'envoi d\'email avec la configuration SMTP';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        
        try {
            Mail::raw('Test email EventConnect - ' . now(), function($message) use ($email) {
                $message->to($email)
                        ->subject('Test SMTP EventConnect')
                        ->from(config('mail.from.address'), config('mail.from.name'));
            });
            
            $this->info("✅ Email de test envoyé avec succès à {$email} !");
            $this->info("Vérifiez votre boîte de réception (et les spams).");
            
        } catch (\Exception $e) {
            $this->error("❌ Erreur lors de l'envoi de l'email :");
            $this->error($e->getMessage());
            $this->error("Vérifiez votre configuration SMTP dans .env");
        }
    }
} 
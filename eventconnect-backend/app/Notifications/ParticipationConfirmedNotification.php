<?php

namespace App\Notifications;

use App\Models\Event;
use App\Models\Participation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ParticipationConfirmedNotification extends Notification
{
    use Queueable;

    protected Event $event;
    protected Participation $participation;

    /**
     * Create a new notification instance.
     */
    public function __construct(Event $event, Participation $participation)
    {
        $this->event = $event;
        $this->participation = $participation;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Participation confirmée - ' . $this->event->title)
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Votre participation à l\'événement "' . $this->event->title . '" a été confirmée.')
            ->line('Détails de votre participation :')
            ->line('📅 Date de l\'événement : ' . $this->event->date->format('d/m/Y à H:i'))
            ->line('📍 Lieu : ' . $this->event->title)
            ->line('🔑 Code QR : ' . $this->participation->qr_code)
            ->line('📝 Statut : ' . $this->participation->status)
            ->action('Voir l\'événement', url('/events/' . $this->event->id))
            ->line('N\'oubliez pas votre code QR le jour de l\'événement !')
            ->line('Merci d\'utiliser EventConnect !')
            ->salutation('Cordialement, l\'équipe EventConnect');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}

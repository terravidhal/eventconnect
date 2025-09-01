<?php

namespace App\Notifications;

use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventCreatedNotification extends Notification
{
    use Queueable;

    protected Event $event;

    /**
     * Create a new notification instance.
     */
    public function __construct(Event $event)
    {
        $this->event = $event;
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
            ->subject('Événement créé avec succès - ' . $this->event->title)
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Votre événement "' . $this->event->title . '" a été créé avec succès.')
            ->line('Détails de l\'événement :')
            ->line('📅 Date : ' . $this->event->date->format('d/m/Y à H:i'))
            ->line('📍 Lieu : ' . $this->event->location)
            ->line('👥 Capacité : ' . $this->event->capacity . ' personnes')
            ->line('💰 Prix : ' . ($this->event->price ? $this->event->price . '€' : 'Gratuit'))
            ->action('Voir l\'événement', config('app.frontend_url') . '/events/' . $this->event->id)
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
            'event_id' => $this->event->id,
            'event_title' => $this->event->title,
            'event_date' => $this->event->date,
            'event_location' => $this->event->location,
            'message' => 'Événement "' . $this->event->title . '" créé avec succès'
        ];
    }
}

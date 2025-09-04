<?php

namespace App\Notifications;

use App\Models\Event;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventCancelledNotification extends Notification implements ShouldQueue 
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
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('❌ Événement annulé - ' . $this->event->title)
            ->greeting('Bonjour ' . $notifiable->name . ' !')
            ->line('Nous vous informons que l\'événement **"' . $this->event->title . '"** auquel vous étiez inscrit a été annulé.')
            ->line('**Détails de l\'événement annulé :**')
            ->line('��� **Date prévue :** ' . $this->event->date->format('d/m/Y à H:i'))
            ->line('��� **Lieu :** ' . $this->event->location)
            ->line('��� **Organisateur :** ' . $this->event->organizer->name)
            ->line('Nous nous excusons pour la gêne occasionnée.')
            ->line('Si vous avez des questions, n\'hésitez pas à contacter l\'organisateur.')
            ->action('Voir les autres événements', config('app.frontend_url') . '/events')
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
            'event_date' => $this->event->date->format('d/m/Y à H:i'),
            'event_location' => $this->event->location,
            'organizer_name' => $this->event->organizer->name,
            'type' => 'event_cancelled',
            'message' => 'L\'événement "' . $this->event->title . '" a été annulé.',
        ];
    }
}

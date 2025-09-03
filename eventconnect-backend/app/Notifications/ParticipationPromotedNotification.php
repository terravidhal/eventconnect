<?php

namespace App\Notifications;

use App\Models\Event;
use App\Models\Participation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ParticipationPromotedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $event;
    protected $participation;

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
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('��� Félicitations ! Vous êtes maintenant inscrit à ' . $this->event->title)
            ->greeting('Bonne nouvelle !')
            ->line('Une place s\'est libérée pour l\'événement **' . $this->event->title . '** et vous avez été automatiquement inscrit !')
            ->line('**Détails de l\'événement :**')
            ->line('��� **Date :** ' . $this->event->date->format('d/m/Y à H:i'))
            ->line('��� **Lieu :** ' . $this->event->location)
            ->line('��� **Votre code QR :** ' . $this->participation->qr_code)
            ->line('Vous pouvez maintenant participer à cet événement. N\'oubliez pas d\'apporter votre code QR le jour J !')
            ->action('Voir l\'événement', url('/events/' . $this->event->id))
            ->line('Merci d\'utiliser EventConnect !');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'participation_promoted',
            'event_id' => $this->event->id,
            'event_title' => $this->event->title,
            'event_date' => $this->event->date,
            'event_location' => $this->event->location,
            'participation_id' => $this->participation->id,
            'qr_code' => $this->participation->qr_code,
            'message' => 'Vous avez été promu de la liste d\'attente et êtes maintenant inscrit à l\'événement "' . $this->event->title . '"',
        ];
    }
}

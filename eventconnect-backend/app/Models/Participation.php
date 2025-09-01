<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Participation extends Model
{
    protected $fillable = [
        'user_id',
        'event_id',
        'status',
        'qr_code',
        'checked_in',
        'notes'
    ];

    protected $casts = [
        'checked_in' => 'boolean'
    ];

    /**
     * Relation avec l'utilisateur
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec l'événement
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Générer un QR code unique
     */
    public function generateQRCode()
    {
        $this->qr_code = 'EVENT_' . $this->event_id . '_USER_' . $this->user_id . '_' . uniqid();
        $this->save();
        return $this->qr_code;
    }

    /**
     * Marquer comme présent
     */
    public function markAsCheckedIn()
    {
        $this->checked_in = true;
        $this->save();
        return $this;
    }
}

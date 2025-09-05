<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Participation;
use App\Notifications\ParticipationConfirmedNotification;
use App\Notifications\ParticipationPromotedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * @OA\Tag(
 *     name="Participations",
 *     description="Endpoints pour la gestion des participations aux événements"
 * )
 */
class ParticipationController extends Controller
{
    /**
     * Inscription à un événement
     * 
     * @OA\Post(
     *     path="/events/{id}/participate",
     *     operationId="participateToEvent",
     *     tags={"Participations"},
     *     summary="S'inscrire à un événement",
     *     description="Inscrit l'utilisateur connecté à un événement spécifique",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de l'événement",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="notes", type="string", example="J'aimerais une place près de la scène", description="Notes optionnelles")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Inscription réussie",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Inscription réussie à l'événement"),
     *             @OA\Property(property="participation", type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="status", type="string"),
     *                 @OA\Property(property="qr_code", type="string"),
     *                 @OA\Property(property="created_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Événement complet ou déjà inscrit",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Événement complet ou vous êtes déjà inscrit")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Événement non trouvé"
     *     )
     * )
     */
    public function participate(Request $request, Event $event): JsonResponse
    {
        $user = Auth::user();

        // Restreindre l'inscription aux utilisateurs avec le rôle 'participant'
        if ($user && $user->role !== 'participant') {
            return response()->json([
                'message' => 'Seuls les participants peuvent s\'inscrire aux événements'
            ], 403);
        }

        // Vérifier que l'utilisateur n'est pas l'organisateur
        if ($event->organizer_id === $user->id) {
            return response()->json([
                'message' => 'Vous ne pouvez pas vous inscrire à votre propre événement'
            ], 400);
        }

        // Vérifier que l'événement est publié
        if ($event->status !== 'publié') {
            return response()->json([
                'message' => 'Cet événement n\'est pas ouvert aux inscriptions'
            ], 400);
        }

        // Vérifier que l'utilisateur n'est pas déjà inscrit
        $existingParticipation = $event->participations()
            ->where('user_id', $user->id)
            ->first();

        if ($existingParticipation) {
            return response()->json([
                'message' => 'Vous êtes déjà inscrit à cet événement'
            ], 400);
        }

        // Déterminer le statut selon la disponibilité
        $status = $event->isFull() ? 'en_attente' : 'inscrit';

        // Créer la participation
        $participation = Participation::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'status' => $status,
            'qr_code' => $this->generateUniqueQRCode(),
            'notes' => $request->input('notes'),
        ]);

        // Envoyer la notification de confirmation de participation
        try {
            $user->notify(new ParticipationConfirmedNotification($event, $participation));
        } catch (\Exception $e) {
            // Log l'erreur mais ne pas faire échouer l'inscription
            \Log::error('Erreur envoi notification participation: ' . $e->getMessage());
        }

        $message = $status === 'inscrit' 
            ? 'Inscription réussie à l\'événement'
            : 'Vous avez été ajouté à la liste d\'attente';

        return response()->json([
            'message' => $message,
            'participation' => [
                'id' => $participation->id,
                'status' => $participation->status,
                'qr_code' => $participation->qr_code,
                'created_at' => $participation->created_at,
            ]
        ], 201);
    }

    /**
     * Annulation de participation avec promotion automatique de la liste d'attente
     * 
     * @OA\Delete(
     *     path="/events/{id}/cancel-participation",
     *     operationId="cancelParticipation",
     *     tags={"Participations"},
     *     summary="Annuler sa participation",
     *     description="Annule la participation de l'utilisateur connecté à un événement et promeut automatiquement les personnes en liste d'attente",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de l'événement",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Participation annulée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Participation annulée avec succès"),
     *             @OA\Property(property="promoted_count", type="integer", example=2, description="Nombre de personnes promues de la liste d'attente")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Participation non trouvée ou événement déjà passé",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Participation non trouvée")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Événement non trouvé"
     *     )
     * )
     */
    public function cancel(Request $request, Event $event): JsonResponse
    {
        $user = Auth::user();

        // Trouver la participation de l'utilisateur
        $participation = $event->participations()
            ->where('user_id', $user->id)
            ->first();

        if (!$participation) {
            return response()->json([
                'message' => 'Participation non trouvée'
            ], 400);
        }

        // Vérifier que l'événement n'a pas encore eu lieu
        if ($event->date <= now()) {
            return response()->json([
                'message' => 'Impossible d\'annuler une participation à un événement qui a déjà eu lieu'
            ], 400);
        }

        // Utiliser une transaction pour s'assurer de la cohérence
        return DB::transaction(function () use ($participation, $event) {
            // Supprimer la participation
            $participation->delete();

            // Promouvoir les personnes de la liste d'attente si nécessaire
            $promotedCount = $this->promoteWaitingList($event);

            return response()->json([
                'message' => 'Participation annulée avec succès',
                'promoted_count' => $promotedCount
            ]);
        });
    }

    /**
     * Promouvoir les personnes de la liste d'attente vers les inscriptions confirmées
     */
    private function promoteWaitingList(Event $event): int
    {
        // Calculer le nombre de places disponibles
        $confirmedCount = $event->participations()
            ->where('status', 'inscrit')
            ->count();
        
        $availableSpots = $event->capacity - $confirmedCount;

        if ($availableSpots <= 0) {
            return 0; // Aucune place disponible
        }

        // Récupérer les personnes en liste d'attente, triées par date d'inscription (plus récentes en premier)
        $waitingParticipants = $event->participations()
            ->where('status', 'en_attente')
            ->with('user')
            ->orderBy('created_at', 'asc') // Plus anciennes en premier pour être promues
            ->limit($availableSpots)
            ->get();

        $promotedCount = 0;

        foreach ($waitingParticipants as $waitingParticipation) {
            // Promouvoir vers 'inscrit'
            $waitingParticipation->update(['status' => 'inscrit']);

            // Envoyer une notification de promotion
            try {
                $waitingParticipation->user->notify(
                    new ParticipationPromotedNotification($event, $waitingParticipation)
                );
            } catch (\Exception $e) {
                \Log::error('Erreur envoi notification promotion: ' . $e->getMessage());
            }

            $promotedCount++;
        }

        return $promotedCount;
    }

    /**
     * Validation d'entrée via QR code
     * 
     * @OA\Post(
     *     path="/events/{id}/checkin",
     *     operationId="checkInParticipant",
     *     tags={"Participations"},
     *     summary="Valider l'entrée d'un participant",
     *     description="Valide l'entrée d'un participant via son QR code (réservé aux organisateurs)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de l'événement",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"qr_code"},
     *             @OA\Property(property="qr_code", type="string", example="ABC123XYZ", description="Code QR du participant")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Entrée validée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Entrée validée avec succès"),
     *             @OA\Property(property="participant", type="object",
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="email", type="string"),
     *                 @OA\Property(property="checked_in_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="QR code invalide ou déjà utilisé",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="QR code invalide ou déjà utilisé")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Accès refusé - Seuls les organisateurs peuvent valider les entrées"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Événement non trouvé"
     *     )
     * )
     */
    public function checkIn(Request $request, Event $event): JsonResponse
    {
        $user = Auth::user();

        // Vérifier que l'utilisateur est l'organisateur de l'événement
        if ($event->organizer_id !== $user->id) {
            return response()->json([
                'message' => 'Seuls les organisateurs peuvent valider les entrées'
            ], 403);
        }

        $request->validate([
            'qr_code' => 'required|string'
        ]);

        $qrCode = $request->input('qr_code');

        // Trouver la participation par QR code
        $participation = Participation::where('qr_code', $qrCode)
            ->where('event_id', $event->id)
            ->first();

        if (!$participation) {
            return response()->json([
                'message' => 'QR code invalide pour cet événement'
            ], 400);
        }

        if ($participation->checked_in) {
            return response()->json([
                'message' => 'Ce participant a déjà été validé'
            ], 400);
        }

        // Marquer comme validé
        $participation->markAsCheckedIn();

        return response()->json([
            'message' => 'Entrée validée avec succès',
            'participant' => [
                'name' => $participation->user->name,
                'email' => $participation->user->email,
                'checked_in_at' => $participation->checked_in,
            ]
        ]);
    }

    /**
     * Liste des participants (organisateur)
     * 
     * @OA\Get(
     *     path="/events/{id}/participants",
     *     operationId="getEventParticipants",
     *     tags={"Participations"},
     *     summary="Liste des participants",
     *     description="Récupère la liste des participants à un événement (réservé aux organisateurs)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de l'événement",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Statut des participations",
     *         required=false,
     *         @OA\Schema(type="string", enum={"inscrit","en_attente","annulé"})
     *     ),
     *     @OA\Parameter(
     *         name="checked_in",
     *         in="query",
     *         description="Filtrer par statut de validation",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Liste des participants récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="participants", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="total", type="integer"),
     *             @OA\Property(property="checked_in_count", type="integer"),
     *             @OA\Property(property="waiting_count", type="integer")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Accès refusé - Seuls les organisateurs peuvent voir la liste des participants"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Événement non trouvé"
     *     )
     * )
     */
    public function participants(Request $request, Event $event): JsonResponse
    {
        $user = Auth::user();

        // Vérifier que l'utilisateur est l'organisateur de l'événement
        if ($event->organizer_id !== $user->id) {
            return response()->json([
                'message' => 'Seuls les organisateurs peuvent voir la liste des participants'
            ], 403);
        }

        $query = $event->participations()->with('user');

        // Filtre par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtre par validation
        if ($request->has('checked_in')) {
            $query->where('checked_in', $request->boolean('checked_in'));
        }

        $participants = $query->orderBy('created_at', 'asc')->get();

        $checkedInCount = $participants->where('checked_in', true)->count();
        $waitingCount = $participants->where('status', 'en_attente')->count();

        return response()->json([
            'participants' => $participants->map(function ($participation) {
                return [
                    'id' => $participation->id,
                    'user' => [
                        'id' => $participation->user->id,
                        'name' => $participation->user->name,
                        'email' => $participation->user->email,
                        'phone' => $participation->user->phone,
                        'avatar' => $participation->user->avatar,
                    ],
                    'status' => $participation->status,
                    'checked_in' => $participation->checked_in,
                    'qr_code' => $participation->qr_code,
                    'notes' => $participation->notes,
                    'created_at' => $participation->created_at,
                ];
            }),
            'total' => $participants->count(),
            'checked_in_count' => $checkedInCount,
            'waiting_count' => $waitingCount,
        ]);
    }

    /**
     * Participations de l'utilisateur connecté
     * 
     * @OA\Get(
     *     path="/my-participations",
     *     operationId="getMyParticipations",
     *     tags={"Participations"},
     *     summary="Mes participations",
     *     description="Récupère la liste des participations de l'utilisateur connecté",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des participations récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="participations", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     )
     * )
     */
    public function myParticipations(Request $request): JsonResponse
    {
        $user = Auth::user();

        $participations = $user->participations()
            ->with(['event.category', 'event.organizer'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'participations' => $participations->map(function ($participation) {
                return [
                    'id' => $participation->id,
                    'status' => $participation->status,
                    'checked_in' => $participation->checked_in,
                    'qr_code' => $participation->qr_code,
                    'notes' => $participation->notes,
                    'created_at' => $participation->created_at,
                    'event' => [
                        'id' => $participation->event->id,
                        'title' => $participation->event->title,
                        'description' => $participation->event->description,
                        'date' => $participation->event->date,
                        'location' => $participation->event->location,
                        'capacity' => $participation->event->capacity,
                        'price' => $participation->event->price,
                        'image' => $participation->event->image,
                        'status' => $participation->event->status,
                        'category' => [
                            'id' => $participation->event->category->id,
                            'name' => $participation->event->category->name,
                            'icon' => $participation->event->category->icon,
                        ],
                        'organizer' => [
                            'id' => $participation->event->organizer->id,
                            'name' => $participation->event->organizer->name,
                            'email' => $participation->event->organizer->email,
                        ],
                    ],
                ];
            }),
        ]);
    }

    /**
     * Génère un code QR unique
     */
    private function generateUniqueQRCode(): string
    {
        do {
            $qrCode = strtoupper(Str::random(8));
        } while (Participation::where('qr_code', $qrCode)->exists());

        return $qrCode;
    }
}

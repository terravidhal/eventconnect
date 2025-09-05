<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Http\Resources\EventDetailResource;
use App\Models\Event;
use App\Services\SearchService;
use App\Models\Category;
use App\Notifications\EventCreatedNotification;
use App\Notifications\EventCancelledNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * @OA\Tag(
 *     name="Événements",
 *     description="Endpoints pour la gestion des événements (CRUD)"
 * )
 */
class EventController extends Controller
{
    /**
     * Liste des événements avec pagination et filtres
     * 
     * @OA\Get(
     *     path="/events",
     *     operationId="getEvents",
     *     tags={"Événements"},
     *     summary="Liste des événements",
     *     description="Récupère la liste paginée des événements avec filtres optionnels",
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Numéro de page",
     *         required=false,
     *         @OA\Schema(type="integer", default=1)
     *     ),
     *     @OA\Parameter(
     *         name="category",
     *         in="query",
     *         description="ID de la catégorie",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Terme de recherche",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Statut de l'événement",
     *         required=false,
     *         @OA\Schema(type="string", enum={"draft","publié","cancelled"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Liste des événements récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Event")),
     *             @OA\Property(property="links", type="object"),
     *             @OA\Property(property="meta", type="object")
     *         )
     *     )
     * )
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Event::with(['category', 'organizer', 'participations.user'])
            ->whereIn("status", ["publié", "annulé"])
            ->where('date', '>', now()->subDays(7)); // Inclure les événements des 7 derniers jours

        // Filtre par catégorie
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Filtre par recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        // Filtre par statut
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = (int) ($request->get('per_page', 12));
        $events = $query->orderBy('date', 'asc')
                       ->paginate($perPage);

        return EventResource::collection($events);
    }

    /**
     * Détail d'un événement
     * 
     * @OA\Get(
     *     path="/events/{id}",
     *     operationId="getEvent",
     *     tags={"Événements"},
     *     summary="Détail d'un événement",
     *     description="Récupère les détails complets d'un événement",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de l'événement",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Événement récupéré avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/Event")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Événement non trouvé"
     *     )
     * )
     */
    public function show(Event $event): JsonResponse
    {
        $event->load(['category', 'organizer', 'participations.user']);
        
        return response()->json(new EventDetailResource($event));
    }

    /**
     * Création d'un événement
     * 
     * @OA\Post(
     *     path="/events",
     *     operationId="createEvent",
     *     tags={"Événements"},
     *     summary="Créer un événement",
     *     description="Crée un nouvel événement (réservé aux organisateurs)",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title","description","date","location","capacity","category_id"},
     *             @OA\Property(property="title", type="string", example="Concert de Jazz"),
     *             @OA\Property(property="description", type="string", example="Un magnifique concert de jazz en plein air"),
     *             @OA\Property(property="date", type="string", format="date-time", example="2024-12-25T20:00:00"),
     *             @OA\Property(property="location", type="string", example="Parc de la Villette, Paris"),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522),
     *             @OA\Property(property="capacity", type="integer", example=100),
     *             @OA\Property(property="price", type="number", format="float", example=25.00),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"jazz", "musique", "concert"}),
     *             @OA\Property(property="status", type="string", enum={"brouillon","publié"}, example="publié"),
     *             @OA\Property(property="image", type="string", format="url", example="https://example.com/image.jpg")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Événement créé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Événement créé avec succès"),
     *             @OA\Property(property="event", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Accès refusé - Seuls les organisateurs peuvent créer des événements"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation"
     *     )
     * )
     */
    public function store(StoreEventRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['organizer_id'] = Auth::id();
        
        $event = Event::create($validated);
        
        // Envoyer une notification à l'organisateur
        try {
            Auth::user()->notify(new EventCreatedNotification($event));
        } catch (\Exception $e) {
            // Log l'erreur mais ne pas faire échouer la création
            \Log::error('Erreur envoi notification création événement: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Événement créé avec succès',
            'event' => new EventResource($event->load(['category', 'organizer']))
        ], 201);
    }

    /**
     * Modification d'un événement
     * 
     * @OA\Put(
     *     path="/events/{id}",
     *     operationId="updateEvent",
     *     tags={"Événements"},
     *     summary="Modifier un événement",
     *     description="Modifie un événement existant (réservé à l'organisateur)",
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
     *             @OA\Property(property="title", type="string", example="Concert de Jazz - Édition Spéciale"),
     *             @OA\Property(property="description", type="string", example="Un magnifique concert de jazz en plein air avec invités spéciaux"),
     *             @OA\Property(property="date", type="string", format="date-time", example="2024-12-25T20:00:00"),
     *             @OA\Property(property="location", type="string", example="Parc de la Villette, Paris"),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522),
     *             @OA\Property(property="capacity", type="integer", example=150),
     *             @OA\Property(property="price", type="number", format="float", example=30.00),
     *             @OA\Property(property="category_id", type="integer", example=1),
     *             @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"jazz", "musique", "concert", "spécial"}),
     *             @OA\Property(property="status", type="string", enum={"brouillon","publié","annulé"}, example="publié"),
     *             @OA\Property(property="image", type="string", format="url", example="https://example.com/image.jpg")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Événement modifié avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Événement modifié avec succès"),
     *             @OA\Property(property="event", ref="#/components/schemas/Event")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Accès refusé - Seul l'organisateur peut modifier l'événement"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Événement non trouvé"
     *     )
     * )
     */
    public function update(UpdateEventRequest $request, Event $event): JsonResponse
    {
        $validated = $request->validated();
        
        // Vérifier si l'événement passe au statut "annulé"
        $wasCancelled = $event->status === 'annulé';
        $isBeingCancelled = isset($validated['status']) && $validated['status'] === 'annulé';
        
        $event->update($validated);
        
        // Si l'événement vient d'être annulé, notifier tous les participants
        if (!$wasCancelled && $isBeingCancelled) {
            $this->notifyParticipantsOfCancellation($event);
        }

        return response()->json([
            'message' => 'Événement modifié avec succès',
            'event' => new EventResource($event->load(['category', 'organizer']))
        ]);
    }

    /**
     * Notifier tous les participants d'un événement annulé
     */
    private function notifyParticipantsOfCancellation(Event $event): void
    {
        try {
            // Charger les participations avec les utilisateurs
            $event->load(['participations.user']);
            
            // Notifier tous les participants inscrits
            foreach ($event->participations as $participation) {
                if ($participation->user && in_array($participation->status, ['inscrit', 'en_attente'])) {
                    $participation->user->notify(new EventCancelledNotification($event));
                }
            }
            
            \Log::info("Notifications d'annulation envoyées pour l'événement {$event->id} à " . $event->participations->count() . " participants");
        } catch (\Exception $e) {
            \Log::error('Erreur envoi notifications annulation événement: ' . $e->getMessage());
        }
    }

    /**
     * Suppression d'un événement
     * 
     * @OA\Delete(
     *     path="/events/{id}",
     *     operationId="deleteEvent",
     *     tags={"Événements"},
     *     summary="Supprimer un événement",
     *     description="Supprime un événement (réservé à l'organisateur)",
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
     *         description="Événement supprimé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Événement supprimé avec succès")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Accès refusé - Seul l'organisateur peut supprimer l'événement"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Événement non trouvé"
     *     )
     * )
     */
    public function destroy(Event $event): JsonResponse
    {
        // Vérifier que l'utilisateur est l'organisateur de l'événement
        if (Auth::id() !== $event->organizer_id && !Auth::user()->isAdmin()) {
            return response()->json([
                'message' => 'Accès refusé - Seul l\'organisateur peut supprimer l\'événement'
            ], 403);
        }

        $event->delete();

        return response()->json([
            'message' => 'Événement supprimé avec succès'
        ]);
    }

    /**
     * Recherche d'événements
     * 
     * @OA\Get(
     *     path="/events/search",
     *     operationId="searchEvents",
     *     tags={"Événements"},
     *     summary="Rechercher des événements",
     *     description="Recherche des événements par titre, description ou lieu",
     *     @OA\Parameter(
     *         name="q",
     *         in="query",
     *         description="Terme de recherche",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="category",
     *         in="query",
     *         description="ID de la catégorie",
     *         required=false,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="date_from",
     *         in="query",
     *         description="Date de début (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="date_to",
     *         in="query",
     *         description="Date de fin (YYYY-MM-DD)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Résultats de recherche",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Event")),
     *             @OA\Property(property="total", type="integer", example=25),
     *             @OA\Property(property="query", type="string", example="jazz")
     *         )
     *     )
     * )
     */
    public function search(Request $request): JsonResponse
    {
        $searchService = new SearchService();
        $query = $searchService->searchEvents($request->all());
        
        // Exécuter la requête et récupérer les résultats
        $events = $query->get();
        
        // Transformer en ressources
        $eventResources = EventResource::collection($events);
        
        return response()->json([
            "data" => $eventResources,
            "total" => $events->count(),
            "query" => $request->get("q", "")
        ]);
    }

    /**
     * Événements populaires
     * 
     * @OA\Get(
     *     path="/events/popular",
     *     operationId="getPopularEvents",
     *     tags={"Événements"},
     *     summary="Événements populaires",
     *     description="Récupère les événements les plus populaires basés sur le taux de participation",
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Nombre d'événements à retourner",
     *         required=false,
     *         @OA\Schema(type="integer", default=6)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Liste des événements populaires",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Event"))
     *         )
     *     )
     * )
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 6);
        
        $events = Event::with(['category', 'organizer'])
            ->whereIn("status", ["publié", "annulé"])
            ->where('date', '>', now())
            ->get()
            ->map(function ($event) {
                $event->participation_rate = $event->participationRate();
                return $event;
            })
            ->sortByDesc('participation_rate')
            ->take($limit);

        return response()->json([
            'data' => EventResource::collection($events)
        ]);
    }

    /**
     * Mes événements (pour les organisateurs)
     * 
     * @OA\Get(
     *     path="/my-events",
     *     operationId="getMyEvents",
     *     tags={"Événements"},
     *     summary="Mes événements",
     *     description="Récupère les événements créés par l'utilisateur connecté",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filtrer par statut",
     *         required=false,
     *         @OA\Schema(type="string", enum={"brouillon","publié","annulé"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Liste des événements de l'organisateur",
     *         @OA\JsonContent(
     *             @OA\Property(property="events", type="array", @OA\Items(ref="#/components/schemas/Event"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     )
     * )
     */
    public function myEvents(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        $query = Event::with(['category', 'organizer'])
            ->where('organizer_id', $user->id);

        // Filtrer par statut si spécifié
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $events = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'events' => EventResource::collection($events)
        ]);
    }

    /**
     * Filtres disponibles pour les événements
     * 
     * @OA\Get(
     *     path="/events/available-filters",
     *     operationId="getAvailableFilters",
     *     tags={"Événements"},
     *     summary="Filtres disponibles",
     *     description="Récupère les catégories et autres filtres disponibles",
     *     @OA\Response(
     *         response=200,
     *         description="Filtres disponibles",
     *         @OA\JsonContent(
     *             @OA\Property(property="categories", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Musique"),
     *                 @OA\Property(property="icon", type="string", example="���")
     *             ))
     *         )
     *     )
     * )
     */
    public function availableFilters(): JsonResponse
    {
        $categories = Category::select('id', 'name', 'icon')->get();

        return response()->json([
            'categories' => $categories
        ]);
    }
}

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
            ->published()
            ->upcoming();

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
     *             @OA\Property(property="title", type="string", example="Concert Jazz", description="Titre de l'événement"),
     *             @OA\Property(property="description", type="string", example="Un super concert de jazz...", description="Description détaillée"),
     *             @OA\Property(property="date", type="string", format="date-time", example="2025-12-25T20:00:00", description="Date et heure de l'événement"),
     *             @OA\Property(property="location", type="string", example="Salle de Concert", description="Lieu de l'événement"),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566, description="Latitude GPS"),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522, description="Longitude GPS"),
     *             @OA\Property(property="capacity", type="integer", example=100, description="Nombre de places disponibles"),
     *             @OA\Property(property="price", type="number", format="float", example=25.50, description="Prix du billet"),
     *             @OA\Property(property="category_id", type="integer", example=1, description="ID de la catégorie"),
     *             @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"jazz","musique","live"}),
     *             @OA\Property(property="status", type="string", enum={"draft","publié"}, example="publié")
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
        $validated['status'] = $validated['status'] ?? 'publié';

        $event = Event::create($validated);

        // Envoyer la notification de création d'événement
        try {
            $user = Auth::user();
            $user->notify(new EventCreatedNotification($event));
        } catch (\Exception $e) {
            // Log l'erreur mais ne pas faire échouer la création
            \Log::error('Erreur envoi notification: ' . $e->getMessage());
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
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="title", type="string", example="Concert Jazz Modifié"),
     *             @OA\Property(property="description", type="string", example="Description modifiée..."),
     *             @OA\Property(property="date", type="string", format="date-time"),
     *             @OA\Property(property="location", type="string"),
     *             @OA\Property(property="capacity", type="integer"),
     *             @OA\Property(property="price", type="number"),
     *             @OA\Property(property="category_id", type="integer"),
     *             @OA\Property(property="tags", type="array", @OA\Items(type="string")),
     *             @OA\Property(property="status", type="string", enum={"draft","publié","cancelled"})
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
        $event->update($validated);

        return response()->json([
            'message' => 'Événement modifié avec succès',
            'event' => new EventResource($event->load(['category', 'organizer']))
        ]);
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
        if ($event->organizer_id !== Auth::id()) {
            return response()->json([
                'message' => 'Seul l\'organisateur peut supprimer cet événement'
            ], 403);
        }

        // Supprimer l'image si elle existe
        if ($event->image) {
            Storage::delete($event->image);
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
     *     description="Recherche avancée d'événements avec plusieurs critères",
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
     *         name="min_price",
     *         in="query",
     *         description="Prix minimum",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_price",
     *         in="query",
     *         description="Prix maximum",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="date_from",
     *         in="query",
     *         description="Date de début",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="date_to",
     *         in="query",
     *         description="Date de fin",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Résultats de recherche",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Event")),
     *             @OA\Property(property="total", type="integer"),
     *             @OA\Property(property="query", type="string")
     *         )
     *     )
     * )
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q');
        
        if (!$query) {
            return response()->json([
                'message' => 'Le terme de recherche est requis'
            ], 400);
        }

        $events = Event::with(['category', 'organizer', 'participations.user'])
            ->published()
            ->where(function($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('location', 'like', "%{$query}%")
                  ->orWhere('tags', 'like', "%{$query}%");
            });

        // Filtres additionnels
        if ($request->has('category')) {
            $events->byCategory($request->category);
        }

        if ($request->has('min_price')) {
            $events->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $events->where('price', '<=', $request->max_price);
        }

        if ($request->has('date_from')) {
            $events->where('date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $events->where('date', '<=', $request->date_to);
        }

        $results = $events->orderBy('date', 'asc')
                         ->paginate(15);

        return response()->json([
            'data' => EventResource::collection($results->items()),
            'total' => $results->total(),
            'query' => $query,
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
            ]
        ]);
    }

    /**
     * Événements de l'utilisateur connecté
     * 
     * @OA\Get(
     *     path="/my-events",
     *     operationId="getMyEvents",
     *     tags={"Événements"},
     *     summary="Mes événements",
     *     description="Récupère les événements créés par l'utilisateur connecté",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         description="Type d'événements",
     *         required=false,
     *         @OA\Schema(type="string", enum={"created","participating"}, default="created")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Événements récupérés avec succès",
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
        $type = $request->get('type', 'created');
        $user = Auth::user();

        if ($type === 'created' && $user->isOrganizer()) {
            $events = $user->events()->with(['category'])->orderBy('date', 'desc')->get();
        } elseif ($type === 'participating') {
            $events = $user->participations()->with(['event.category'])->get()->map->event;
        } else {
            $events = collect();
        }

        return response()->json([
            'events' => EventResource::collection($events),
            'type' => $type
        ]);
    }
    /**
     * Recherche avancée avec SearchService
     * 
     * @OA\Get(
     *     path="/events/advanced-search",
     *     operationId="advancedSearchEvents",
     *     tags={"Événements"},
     *     summary="Recherche avancée d'événements",
     *     description="Recherche avancée avec filtres multiples et tri personnalisé",
     *     @OA\Parameter(
     *         name="q",
     *         in="query",
     *         description="Terme de recherche",
     *         required=false,
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
     *         name="min_price",
     *         in="query",
     *         description="Prix minimum",
     *         required=false,
     *         @OA\Schema(type="number")
     *     ),
     *     @OA\Parameter(
     *         name="max_price",
     *         in="query",
     *         description="Prix maximum",
     *         required=false,
     *         @OA\Schema(type="number")
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
     *     @OA\Parameter(
     *         name="location",
     *         in="query",
     *         description="Lieu de l'événement",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="has_spots",
     *         in="query",
     *         description="Avec places disponibles",
     *         required=false,
     *         @OA\Schema(type="boolean")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Critère de tri",
     *         required=false,
     *         @OA\Schema(type="string", enum={"date","price","popularity","title"})
     *     ),
     *     @OA\Parameter(
     *         name="sort_order",
     *         in="query",
     *         description="Ordre de tri",
     *         required=false,
     *         @OA\Schema(type="string", enum={"asc","desc"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Résultats de recherche avancée",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Event")),
     *             @OA\Property(property="total", type="integer"),
     *             @OA\Property(property="filters_applied", type="object")
     *         )
     *     )
     * )
     */
    public function advancedSearch(Request $request, SearchService $searchService): JsonResponse
    {
        $query = $searchService->searchEvents($request);
        $events = $query->paginate(12);

        return response()->json([
            'data' => EventResource::collection($events),
            'total' => $events->total(),
            'filters_applied' => $request->only([
                'q', 'category', 'min_price', 'max_price', 
                'date_from', 'date_to', 'location', 'has_spots',
                'sort_by', 'sort_order'
            ])
        ]);
    }

    /**
     * Obtenir les suggestions de recherche
     * 
     * @OA\Get(
     *     path="/events/search-suggestions",
     *     operationId="getSearchSuggestions",
     *     tags={"Événements"},
     *     summary="Suggestions de recherche",
     *     description="Obtenir des suggestions basées sur un terme de recherche",
     *     @OA\Parameter(
     *         name="term",
     *         in="query",
     *         description="Terme de recherche",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Suggestions récupérées",
     *         @OA\JsonContent(
     *             @OA\Property(property="suggestions", type="array", @OA\Items(type="string"))
     *         )
     *     )
     * )
     */
    public function searchSuggestions(Request $request, SearchService $searchService): JsonResponse
    {
        $term = $request->get('term');
        
        if (!$term || strlen($term) < 2) {
            return response()->json([
                'suggestions' => []
            ]);
        }

        $suggestions = $searchService->getSearchSuggestions($term);

        return response()->json([
            'suggestions' => $suggestions
        ]);
    }

    /**
     * Obtenir les filtres disponibles
     * 
     * @OA\Get(
     *     path="/events/available-filters",
     *     operationId="getAvailableFilters",
     *     tags={"Événements"},
     *     summary="Filtres disponibles",
     *     description="Obtenir la liste des filtres disponibles pour la recherche",
     *     @OA\Response(
     *         response=200,
     *         description="Filtres récupérés",
     *         @OA\JsonContent(
     *             @OA\Property(property="categories", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="price_ranges", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="date_ranges", type="array", @OA\Items(type="object"))
     *         )
     *     )
     * )
     */
    public function availableFilters(SearchService $searchService): JsonResponse
    {
        $filters = $searchService->getAvailableFilters();

        return response()->json($filters);
    }

    /**
     * Événements populaires
     * 
     * @OA\Get(
     *     path="/events/popular",
     *     operationId="getPopularEvents",
     *     tags={"Événements"},
     *     summary="Événements populaires",
     *     description="Obtenir les événements les plus populaires",
     *     @OA\Parameter(
     *         name="limit",
     *         in="query",
     *         description="Nombre d'événements à retourner",
     *         required=false,
     *         @OA\Schema(type="integer", default=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Événements populaires",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/Event"))
     *         )
     *     )
     * )
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $events = Event::with(['category', 'organizer', 'participations.user'])
            ->published()
            ->upcoming()
            ->popular($limit)
            ->get();

        return response()->json([
            'data' => EventResource::collection($events)
        ]);
    }
}

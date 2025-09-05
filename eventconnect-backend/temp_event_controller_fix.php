    public function search(Request $request): JsonResponse
    {
        $searchService = new SearchService();
        $query = $searchService->searchEvents($request);
        
        // Exécuter la requête et récupérer les résultats
        $events = $query->get();
        
        // Transformer en ressources
        $eventResources = EventResource::collection($events);
        
        return response()->json([
            'data' => $eventResources,
            'total' => $events->count(),
            'query' => $request->get('q', '')
        ]);
    }

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * @OA\Info(
 *     title="EventConnect API",
 *     version="1.0.0",
 *     description="API complète pour la gestion d'événements avec système de réservation",
 *     @OA\Contact(
 *         email="support@eventconnect.com",
 *         name="EventConnect Team"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Serveur de développement local"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 * 
 * @OA\Tag(
 *     name="Authentification",
 *     description="Endpoints pour l'inscription, connexion et gestion des utilisateurs"
 * )
 * 
 * @OA\Tag(
 *     name="Événements",
 *     description="Endpoints pour la gestion des événements (CRUD)"
 * )
 * 
 * @OA\Tag(
 *     name="Participations",
 *     description="Endpoints pour la gestion des participations aux événements"
 * )
 * 
 * @OA\Tag(
 *     name="Fichiers",
 *     description="Endpoints pour l'upload et la gestion des fichiers"
 * )
 * 
 * @OA\Schema(
 *     schema="Event",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="title", type="string", example="Concert Jazz"),
 *     @OA\Property(property="description", type="string", example="Un super concert de jazz..."),
 *     @OA\Property(property="date", type="string", format="date-time", example="2025-12-25T20:00:00"),
 *     @OA\Property(property="location", type="string", example="Salle de Concert"),
 *     @OA\Property(property="latitude", type="number", format="float", example=48.8566),
 *     @OA\Property(property="longitude", type="number", format="float", example=2.3522),
 *     @OA\Property(property="capacity", type="integer", example=100),
 *     @OA\Property(property="price", type="number", format="float", example=25.50),
 *     @OA\Property(property="image", type="string", nullable=true, example="events/concert-jazz.jpg"),
 *     @OA\Property(property="tags", type="array", @OA\Items(type="string"), example={"jazz","musique","live"}),
 *     @OA\Property(property="status", type="string", enum={"draft","published","cancelled"}, example="published"),
 *     @OA\Property(property="category_id", type="integer", example=1),
 *     @OA\Property(property="organizer_id", type="integer", example=1),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="User",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Jean Dupont"),
 *     @OA\Property(property="email", type="string", format="email", example="jean.dupont@example.com"),
 *     @OA\Property(property="phone", type="string", nullable=true, example="0123456789"),
 *     @OA\Property(property="role", type="string", enum={"participant","organisateur","administrateur"}, example="participant"),
 *     @OA\Property(property="avatar", type="string", nullable=true, example="avatars/user1.jpg"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */
class SwaggerController extends Controller
{
    //
} 
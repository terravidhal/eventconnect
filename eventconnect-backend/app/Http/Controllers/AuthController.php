<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * @OA\Tag(
 *     name="Authentification",
 *     description="Endpoints pour l'inscription, connexion et gestion des utilisateurs"
 * )
 */

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur
     * 
     * @OA\Post(
     *     path="/register",
     *     operationId="registerUser",
     *     tags={"Authentification"},
     *     summary="Inscription d'un nouvel utilisateur",
     *     description="Crée un nouveau compte utilisateur et retourne un token d'authentification",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation","role"},
     *             @OA\Property(property="name", type="string", example="Jean Dupont", description="Nom complet de l'utilisateur"),
     *             @OA\Property(property="email", type="string", format="email", example="jean.dupont@example.com", description="Email unique de l'utilisateur"),
     *             @OA\Property(property="password", type="string", minLength=8, example="password123", description="Mot de passe (minimum 8 caractères)"),
     *             @OA\Property(property="password_confirmation", type="string", example="password123", description="Confirmation du mot de passe"),
     *             @OA\Property(property="phone", type="string", example="0123456789", description="Numéro de téléphone (optionnel)"),
     *             @OA\Property(property="role", type="string", enum={"participant","organisateur"}, example="participant", description="Rôle de l'utilisateur")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Inscription réussie",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Inscription réussie"),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Jean Dupont"),
     *                 @OA\Property(property="email", type="string", example="jean.dupont@example.com"),
     *                 @OA\Property(property="role", type="string", example="participant"),
     *                 @OA\Property(property="created_at", type="string", format="date-time")
     *             ),
     *             @OA\Property(property="token", type="string", example="1|abc123...", description="Token JWT pour l'authentification")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => $request->role,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Connexion d'un utilisateur
     * 
     * @OA\Post(
     *     path="/login",
     *     operationId="loginUser",
     *     tags={"Authentification"},
     *     summary="Connexion d'un utilisateur",
     *     description="Authentifie un utilisateur et retourne un token d'authentification",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="jean.dupont@example.com", description="Email de l'utilisateur"),
     *             @OA\Property(property="password", type="string", example="password123", description="Mot de passe de l'utilisateur")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Connexion réussie",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Connexion réussie"),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Jean Dupont"),
     *                 @OA\Property(property="email", type="string", example="jean.dupont@example.com"),
     *                 @OA\Property(property="role", type="string", example="participant")
     *             ),
     *             @OA\Property(property="token", type="string", example="1|abc123...", description="Token JWT pour l'authentification")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Déconnexion de l'utilisateur
     * 
     * @OA\Post(
     *     path="/logout",
     *     operationId="logoutUser",
     *     tags={"Authentification"},
     *     summary="Déconnexion de l'utilisateur",
     *     description="Déconnecte l'utilisateur et invalide le token d'authentification",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Déconnexion réussie",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Déconnexion réussie")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     )
     * )
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    /**
     * Récupérer les informations de l'utilisateur connecté
     * 
     * @OA\Get(
     *     path="/user",
     *     operationId="getUserProfile",
     *     tags={"Authentification"},
     *     summary="Récupérer le profil utilisateur",
     *     description="Récupère les informations de l'utilisateur actuellement connecté",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Profil utilisateur récupéré avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Jean Dupont"),
     *                 @OA\Property(property="email", type="string", example="jean.dupont@example.com"),
     *                 @OA\Property(property="phone", type="string", example="0123456789"),
     *                 @OA\Property(property="role", type="string", example="participant"),
     *                 @OA\Property(property="created_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     )
     * )
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * Mettre à jour le profil de l'utilisateur
     * 
     * @OA\Put(
     *     path="/user",
     *     operationId="updateUserProfile",
     *     tags={"Authentification"},
     *     summary="Mettre à jour le profil utilisateur",
     *     description="Met à jour les informations du profil de l'utilisateur connecté",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=false,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Jean Dupont Modifié", description="Nouveau nom"),
     *             @OA\Property(property="phone", type="string", example="0987654321", description="Nouveau téléphone"),
     *             @OA\Property(property="avatar", type="string", example="https://example.com/avatar.jpg", description="Nouvel avatar")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Profil mis à jour avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Profil mis à jour avec succès"),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Jean Dupont Modifié"),
     *                 @OA\Property(property="email", type="string", example="jean.dupont@example.com"),
     *                 @OA\Property(property="phone", type="string", example="0987654321"),
     *                 @OA\Property(property="role", type="string", example="participant"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        
        $user->update($request->validated());

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user,
        ]);
    }
}

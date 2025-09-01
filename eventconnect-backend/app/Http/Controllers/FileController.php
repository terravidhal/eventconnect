<?php

namespace App\Http\Controllers;

use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Fichiers",
 *     description="Endpoints pour l'upload et la gestion des fichiers"
 * )
 */
class FileController extends Controller
{
    /**
     * Upload d'une image
     * 
     * @OA\Post(
     *     path="/upload/image",
     *     operationId="uploadImage",
     *     tags={"Fichiers"},
     *     summary="Upload d'une image",
     *     description="Upload et redimensionne une image pour un événement ou un profil",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"image"},
     *                 @OA\Property(
     *                     property="image",
     *                     type="string",
     *                     format="binary",
     *                     description="Fichier image à uploader"
     *                 ),
     *                 @OA\Property(
     *                     property="type",
     *                     type="string",
     *                     enum={"event","profile","banner"},
     *                     default="event",
     *                     description="Type d'image"
     *                 ),
     *                 @OA\Property(
     *                     property="event_id",
     *                     type="integer",
     *                     description="ID de l'événement (si type=event)"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Image uploadée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Image uploadée avec succès"),
     *             @OA\Property(property="file", type="object",
     *                 @OA\Property(property="filename", type="string"),
     *                 @OA\Property(property="path", type="string"),
     *                 @OA\Property(property="url", type="string"),
     *                 @OA\Property(property="size", type="integer"),
     *                 @OA\Property(property="mime_type", type="string"),
     *                 @OA\Property(property="dimensions", type="object",
     *                     @OA\Property(property="width", type="integer"),
     *                     @OA\Property(property="height", type="integer")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Erreur de validation du fichier",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Le fichier n'est pas valide"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     ),
     *     @OA\Response(
     *         response=413,
     *         description="Fichier trop volumineux"
     *     )
     * )
     */
    public function uploadImage(Request $request): JsonResponse
    {
        // Validation du fichier
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'type' => 'nullable|in:event,profile,banner',
            'event_id' => 'nullable|integer|exists:events,id'
        ], [
            'image.required' => 'Aucune image n\'a été sélectionnée.',
            'image.image' => 'Le fichier doit être une image.',
            'image.mimes' => 'L\'image doit être au format JPEG, PNG, JPG, GIF ou WebP.',
            'image.max' => 'L\'image ne peut pas dépasser 5 Mo.',
            'type.in' => 'Le type d\'image doit être event, profile ou banner.',
            'event_id.exists' => 'L\'événement spécifié n\'existe pas.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Le fichier n\'est pas valide',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            $file = $request->file('image');
            $type = $request->input('type', 'event');
            $eventId = $request->input('event_id');

            // Utiliser le service d'upload
            $fileUploadService = new FileUploadService();
            $fileInfo = $fileUploadService->uploadImage($file, $type, $eventId);

            return response()->json([
                'message' => 'Image uploadée avec succès',
                'file' => $fileInfo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'upload de l\'image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suppression d'une image
     * 
     * @OA\Delete(
     *     path="/files/{filename}",
     *     operationId="deleteFile",
     *     tags={"Fichiers"},
     *     summary="Supprimer un fichier",
     *     description="Supprime un fichier du serveur",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="filename",
     *         in="path",
     *         description="Nom du fichier à supprimer",
     *         required=true,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         description="Type de fichier",
     *         required=false,
     *         @OA\Schema(type="string", enum={"event","profile","banner"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Fichier supprimé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Fichier supprimé avec succès")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Fichier non trouvé"
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié"
     *     )
     * )
     */
    public function deleteFile(Request $request, string $filename): JsonResponse
    {
        $type = $request->input('type', 'event');
        $storagePath = $this->getStoragePath($type);
        $fullPath = $storagePath . '/' . $filename;

        if (!Storage::exists($fullPath)) {
            return response()->json([
                'message' => 'Fichier non trouvé'
            ], 404);
        }

        try {
            // Supprimer le fichier principal
            Storage::delete($fullPath);

            // Supprimer le thumbnail s'il existe
            $thumbnailPath = $this->getThumbnailPath($fullPath);
            if (Storage::exists($thumbnailPath)) {
                Storage::delete($thumbnailPath);
            }

            return response()->json([
                'message' => 'Fichier supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression du fichier',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Liste des fichiers d'un événement
     * 
     * @OA\Get(
     *     path="/events/{id}/files",
     *     operationId="getEventFiles",
     *     tags={"Fichiers"},
     *     summary="Liste des fichiers d'un événement",
     *     description="Récupère la liste des fichiers associés à un événement",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="ID de l'événement",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Liste des fichiers récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="files", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Événement non trouvé"
     *     )
     * )
     */
    public function getEventFiles(int $eventId): JsonResponse
    {
        try {
            $fileUploadService = new FileUploadService();
            $files = $fileUploadService->getEventFiles($eventId);

            return response()->json([
                'files' => $files
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'files' => []
            ]);
        }
    }

    /**
     * Génère un nom de fichier unique
     */
    private function generateUniqueFilename($file, string $type): string
    {
        $extension = $file->getClientOriginalExtension();
        $baseName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $timestamp = now()->timestamp;
        $random = Str::random(8);
        
        return "{$type}_{$baseName}_{$timestamp}_{$random}.jpg";
    }

    /**
     * Détermine le chemin de stockage
     */
    private function getStoragePath(string $type, ?int $eventId = null): string
    {
        $basePath = 'public';
        
        switch ($type) {
            case 'event':
                return $eventId ? "{$basePath}/events/{$eventId}" : "{$basePath}/events";
            case 'profile':
                return "{$basePath}/profiles";
            case 'banner':
                return "{$basePath}/banners";
            default:
                return "{$basePath}/misc";
        }
    }

    /**
     * Détermine les dimensions de l'image selon le type
     */
    private function getImageDimensions(string $type): ?array
    {
        switch ($type) {
            case 'event':
                return ['width' => 1200, 'height' => 800];
            case 'profile':
                return ['width' => 400, 'height' => 400];
            case 'banner':
                return ['width' => 1920, 'height' => 600];
            default:
                return null;
        }
    }

    /**
     * Crée un thumbnail pour une image
     */
    private function createThumbnail($image, string $storagePath, string $filename): ?string
    {
        try {
            $thumbnail = clone $image;
            $thumbnail->resize(300, 200, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });

            $thumbnailName = 'thumb_' . $filename;
            $thumbnailPath = $storagePath . '/' . $thumbnailName;
            
            Storage::put($thumbnailPath, $thumbnail->encode('jpg', 80)->stream());
            
            return $thumbnailPath;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Obtient le chemin du thumbnail
     */
    private function getThumbnailPath(string $filePath): string
    {
        $dirname = dirname($filePath);
        $filename = basename($filePath);
        return $dirname . '/thumb_' . $filename;
    }
} 
<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    /**
     * Upload et optimise une image
     */
    public function uploadImage(UploadedFile $file, string $type, ?int $eventId = null): array
    {
        // Générer un nom de fichier unique
        $filename = $this->generateUniqueFilename($file, $type);
        
        // Déterminer le chemin de stockage
        $storagePath = $this->getStoragePath($type, $eventId);
        
        // Créer le dossier s'il n'existe pas
        $this->ensureDirectoryExists($storagePath);
        
        // Upload simple sans redimensionnement (extension GD non disponible)
        $dimensions = $this->getImageDimensions($type);

        // Sauvegarder l'image originale
        $fullPath = $storagePath . '/' . $filename;
        Storage::put($fullPath, file_get_contents($file->getRealPath()));

        // Créer un thumbnail si nécessaire (version simple)
        $thumbnailPath = null;
        if ($type === 'event') {
            $thumbnailPath = $this->createThumbnail($file, $storagePath, $filename);
        }

        // Récupérer les informations du fichier
        $fileInfo = [
            'filename' => $filename,
            'path' => $fullPath,
            'url' => Storage::url($fullPath),
            'size' => Storage::size($fullPath),
            'mime_type' => $file->getMimeType(),
            'dimensions' => [
                'width' => null, // TODO: Récupérer depuis l'image quand GD sera disponible
                'height' => null
            ]
        ];

        if ($thumbnailPath) {
            $fileInfo['thumbnail'] = [
                'path' => $thumbnailPath,
                'url' => Storage::url($thumbnailPath)
            ];
        }

        return $fileInfo;
    }

    /**
     * Supprime un fichier et ses thumbnails
     */
    public function deleteFile(string $filename, string $type, ?int $eventId = null): bool
    {
        $storagePath = $this->getStoragePath($type, $eventId);
        $fullPath = $storagePath . '/' . $filename;

        if (!Storage::exists($fullPath)) {
            return false;
        }

        try {
            // Supprimer le fichier principal
            Storage::delete($fullPath);

            // Supprimer le thumbnail s'il existe
            $thumbnailPath = $this->getThumbnailPath($fullPath);
            if (Storage::exists($thumbnailPath)) {
                Storage::delete($thumbnailPath);
            }

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Récupère la liste des fichiers d'un événement
     */
    public function getEventFiles(int $eventId): array
    {
        $storagePath = $this->getStoragePath('event', $eventId);
        
        if (!Storage::exists($storagePath)) {
            return [];
        }

        $files = Storage::files($storagePath);
        $fileList = [];

        foreach ($files as $file) {
            // Ignorer les thumbnails dans la liste principale
            if (str_contains(basename($file), 'thumb_')) {
                continue;
            }

            $filename = basename($file);
            $fileList[] = [
                'filename' => $filename,
                'path' => $file,
                'url' => Storage::url($file),
                'size' => Storage::size($file),
                'mime_type' => Storage::mimeType($file),
                'created_at' => Storage::lastModified($file),
                'thumbnail' => $this->getThumbnailInfo($file)
            ];
        }

        return $fileList;
    }

    /**
     * Valide un fichier image
     */
    public function validateImage(UploadedFile $file): array
    {
        $errors = [];

        // Vérifier le type MIME
        if (!$file->isValid()) {
            $errors[] = 'Le fichier est corrompu ou invalide.';
        }

        // Vérifier la taille
        if ($file->getSize() > 5 * 1024 * 1024) { // 5MB
            $errors[] = 'Le fichier est trop volumineux (maximum 5 Mo).';
        }

        // Vérifier le format
        $allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        if (!in_array($file->getMimeType(), $allowedMimes)) {
            $errors[] = 'Le format de fichier n\'est pas supporté.';
        }

        return $errors;
    }

    /**
     * Génère un nom de fichier unique
     */
    private function generateUniqueFilename(UploadedFile $file, string $type): string
    {
        $extension = $file->getClientOriginalExtension();
        $baseName = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $timestamp = now()->timestamp;
        $random = Str::random(8);
        
        return "{$type}_{$baseName}_{$timestamp}_{$random}.{$extension}";
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
     * S'assure que le répertoire existe
     */
    private function ensureDirectoryExists(string $path): void
    {
        if (!Storage::exists($path)) {
            Storage::makeDirectory($path);
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
     * Crée un thumbnail pour une image (version simple)
     */
    private function createThumbnail(UploadedFile $file, string $storagePath, string $filename): ?string
    {
        try {
            // Pour l'instant, on copie simplement l'image originale comme thumbnail
            // TODO: Implémenter le redimensionnement quand GD sera disponible
            $thumbnailName = 'thumb_' . $filename;
            $thumbnailPath = $storagePath . '/' . $thumbnailName;
            
            Storage::put($thumbnailPath, file_get_contents($file->getRealPath()));
            
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

    /**
     * Obtient les informations du thumbnail
     */
    private function getThumbnailInfo(string $filePath): ?array
    {
        $thumbnailPath = $this->getThumbnailPath($filePath);
        
        if (Storage::exists($thumbnailPath)) {
            return [
                'path' => $thumbnailPath,
                'url' => Storage::url($thumbnailPath)
            ];
        }

        return null;
    }
} 
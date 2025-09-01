<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ParticipationController;
use App\Http\Controllers\FileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Routes publiques (sans authentification)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes protégées (avec authentification)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'update']);
    
    // Routes des événements (CRUD complet)
    Route::apiResource('events', EventController::class)->except(['index', 'show']);
    Route::get('/my-events', [EventController::class, 'myEvents']);
    
    // Routes des participations
    Route::post('/events/{event}/participate', [ParticipationController::class, 'participate']);
    Route::delete('/events/{event}/cancel-participation', [ParticipationController::class, 'cancel']);
    Route::post('/events/{event}/checkin', [ParticipationController::class, 'checkIn']);
    Route::get('/events/{event}/participants', [ParticipationController::class, 'participants']);
    Route::get('/my-participations', [ParticipationController::class, 'myParticipations']);
    
    // Routes des fichiers
    Route::post('/upload/image', [FileController::class, 'uploadImage']);
    Route::delete('/files/{filename}', [FileController::class, 'deleteFile']);
    Route::get('/events/{event}/files', [FileController::class, 'getEventFiles']);
});

// Routes publiques des événements (lecture seule)
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/search', [EventController::class, 'search']);
Route::get('/events/advanced-search', [EventController::class, 'advancedSearch']);
Route::get('/events/search-suggestions', [EventController::class, 'searchSuggestions']);
Route::get('/events/available-filters', [EventController::class, 'availableFilters']);
Route::get('/events/popular', [EventController::class, 'popular']);
Route::get('/events/{event}', [EventController::class, 'show']); 
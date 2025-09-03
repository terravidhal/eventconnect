// Ouvrez la console du navigateur et collez ce code pour vérifier l'authentification
console.log('=== DEBUG AUTHENTIFICATION ===');
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
console.log('Token valide:', !!localStorage.getItem('token'));

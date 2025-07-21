// Script pour corriger le pseudo utilisateur dans le localStorage
window.addEventListener('DOMContentLoaded', function() {
    // Vider complètement le localStorage
    localStorage.clear();
    
    // Créer l'utilisateur avec le bon pseudo
    const correctUser = {
        id: '1',
        pseudo: 'jalil',
        email: 'jalilmails@gmail.com',
        password: 'password',
        dateInscription: new Date().toISOString()
    };
    
    // Sauvegarder l'utilisateur corrigé
    localStorage.setItem('users', JSON.stringify([correctUser]));
    localStorage.setItem('currentUser', JSON.stringify(correctUser));
    
    console.log('Utilisateur créé avec pseudo:', correctUser.pseudo);
    
    // Forcer le rechargement du contexte utilisateur
    if (window.location.pathname === '/home') {
        window.location.reload();
    }
});
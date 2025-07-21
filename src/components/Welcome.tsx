import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from "@/user/UserContext";

const Welcome: React.FC = () => {
  const { setUserConnecte } = useContext(UserContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      // Mode inscription
      if (!email.trim() || !password.trim() || !pseudo.trim()) {
        setError('Tous les champs sont requis');
        return;
      }

      // Vérifier si l'email ou le pseudo existe déjà
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      if (existingUsers.find((u: any) => u.email === email.trim())) {
        setError('Cette adresse email est déjà utilisée');
        return;
      }
      if (existingUsers.find((u: any) => u.pseudo === pseudo.trim())) {
        setError('Ce pseudo est déjà utilisé');
        return;
      }

      // Créer le nouvel utilisateur
      const newUser = {
        id: Date.now().toString(),
        pseudo: pseudo.trim(),
        email: email.trim(),
        password: password,
        dateInscription: new Date().toISOString()
      };

      // Sauvegarder dans la liste des utilisateurs
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));

      // Connecter l'utilisateur
      setUserConnecte(newUser);
      navigate('/home');
    } else {
      // Mode connexion
      if ((!pseudo.trim() && !email.trim()) || !password.trim()) {
        setError('Pseudo ou email + mot de passe requis');
        return;
      }

      // Vérifier les identifiants - d'abord par pseudo, puis par email
      let existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      let user = null;

      // Chercher par pseudo si fourni
      if (pseudo.trim()) {
        user = existingUsers.find((u: any) => u.pseudo === pseudo.trim() && u.password === password);
      }

      // Si pas trouvé par pseudo, chercher par email
      if (!user && email.trim()) {
        user = existingUsers.find((u: any) => u.email === email.trim() && u.password === password);
      }

      // Si toujours pas trouvé, créer un compte automatiquement (compatibilité)
      if (!user && email.trim()) {
        // Utiliser le pseudo fourni ou extraire de l'email en nettoyant
        let generatedPseudo = pseudo.trim() || email.split('@')[0];
        // Nettoyer le pseudo généré (retirer "mails", "mail", etc.)
        generatedPseudo = generatedPseudo.replace(/mails?$/i, '');
        
        const tempUser = {
          id: Date.now().toString(),
          pseudo: generatedPseudo,
          email: email.trim(),
          password: password,
          dateInscription: new Date().toISOString()
        };

        const updatedUsers = [...existingUsers, tempUser];
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        setUserConnecte(tempUser);
        navigate('/home');
        return;
      }

      if (!user) {
        setError('Identifiants incorrects');
        return;
      }

      setUserConnecte(user);
      navigate('/home');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌍</div>
        <h1 style={{ 
          color: '#333', 
          marginBottom: '1rem',
          fontSize: '2.5rem',
          fontWeight: '700'
        }}>
          Carnet de Voyage
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '2rem',
          fontSize: '1.1rem',
          lineHeight: '1.6'
        }}>
          Partagez vos aventures et découvrez les récits inspirants d'autres voyageurs
        </p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '1rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div style={{
              color: '#e74c3c',
              backgroundColor: '#fee',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Votre pseudo (optionnel en connexion)"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #eee',
              borderRadius: '10px',
              fontSize: '1.1rem',
              marginBottom: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            required={isSignUp}
          />

          <input
            type="email"
            placeholder="Votre email (optionnel en connexion)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #eee',
              borderRadius: '10px',
              fontSize: '1.1rem',
              marginBottom: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            required={isSignUp}
          />

          <input
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #eee',
              borderRadius: '10px',
              fontSize: '1.1rem',
              marginBottom: '1.5rem',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            required
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
          >
            {isSignUp ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Welcome;
import React, { useContext, Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, UserContext } from "@/user/UserContext";
import { initializeStorage } from "./utils/storage";
import Navigation from "./components/Navigation";

// Lazy loading for better performance
const Welcome = lazy(() => import("./components/Welcome"));
const Home = lazy(() => import("./Home"));
const AddBonPlanForm = lazy(() => import("./components/AddBonPlanForm"));
const StoryDetail = lazy(() => import("./components/StoryDetail"));
const UserProfile = lazy(() => import("./components/UserProfile"));
const ConversationsManager = lazy(() => import("./components/ConversationsManager"));
const ConversationsPage = lazy(() => import("./components/ConversationsPage"));


// Types for better TypeScript support
interface User {
  id: string;
  pseudo: string;
  email?: string;
}

interface UserContextType {
  userConnecte: User | null;
  setUserConnecte: (user: User | null) => void;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
            🌍 Oops! Une erreur s'est produite
          </h2>
          <p style={{ color: '#666', marginBottom: '30px', maxWidth: '500px' }}>
            Nous sommes désolés, mais l'application de récits de voyage a rencontré un problème inattendu.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#357edd',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Recharger l'application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  }}>
    <div style={{
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #357edd',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite',
      marginBottom: '20px'
    }}></div>
    <p style={{ color: '#666', fontSize: '16px' }}>
      Chargement de vos récits de voyage...
    </p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = "/welcome" 
}) => {
  const { userConnecte } = useContext(UserContext) as UserContextType;
  
  if (!userConnecte) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect to home if already logged in)
interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = "/home" 
}) => {
  const { userConnecte } = useContext(UserContext) as UserContextType;
  
  if (userConnecte) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <>{children}</>;
};

// Main App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes - redirect to home if user is logged in */}
        <Route 
          path="/welcome" 
          element={
            <PublicRoute>
              <Welcome />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes - require authentication */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/ajouter" 
          element={
            <ProtectedRoute>
              <AddBonPlanForm />
            </ProtectedRoute>
          } 
        />
        
        {/* Dynamic route for individual travel stories */}
        <Route 
          path="/recit/:id" 
          element={
            <ProtectedRoute>
              <StoryDetail />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile route for user settings */}
        <Route 
          path="/profil" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />
        
        {/* Default route - redirect based on authentication status */}
        <Route 
          path="/" 
          element={<Navigate to="/home" replace />} 
        />
       <Route 
          path="/conversations" 
         element={
        <ProtectedRoute>
        <ConversationsPage />
        </ProtectedRoute>
        } 
      />
        
        {/* 404 Not Found route */}
        <Route 
          path="*" 
          element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              padding: '20px',
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif'
            }}>
              <h1 style={{ fontSize: '72px', margin: '0', color: '#357edd' }}>404</h1>
              <h2 style={{ color: '#333', marginBottom: '20px' }}>
                🗺️ Page non trouvée
              </h2>
              <p style={{ color: '#666', marginBottom: '30px', maxWidth: '500px' }}>
                Désolé, la page que vous recherchez n'existe pas. 
                Peut-être avez-vous pris un mauvais tournant dans votre voyage ?
              </p>
              <button
                onClick={() => window.history.back()}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#357edd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  marginRight: '10px'
                }}
              >
                Retour
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Accueil
              </button>
            </div>
          } 
        />
      </Routes>
    </Suspense>
  );
};

// App Content with Navigation
const AppContent: React.FC = () => {
  const { isLoading } = useContext(UserContext);

  useEffect(() => {
    // Initialize storage with sample data on app start
    initializeStorage();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Navigation />
      <AppRoutes />
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <Router>
          <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8f9fa',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
          }}>
            <AppContent />
          </div>
        </Router>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;
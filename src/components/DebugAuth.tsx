import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { debugAuth } from '@/utils/debug';

const DebugAuth: React.FC = () => {
  const { user, isAuthenticated, isOwner, isAdmin, isTenant } = useAuth();

  useEffect(() => {
    debugAuth.checkStorage();
    debugAuth.checkURL();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      borderRadius: '5px'
    }}>
      <div> AUTH DEBUG</div>
      <div>User: {user ? `${user.email} (${user.role})` : 'null'}</div>
      <div>Authenticated: {isAuthenticated ? 'YES' : 'NO'}</div>
      <div>Owner: {isOwner ? 'YES' : 'NO'}</div>
      <div>Admin: {isAdmin ? 'YES' : 'NO'}</div>
      <div>Tenant: {isTenant ? 'YES' : 'NO'}</div>
      <button 
        onClick={() => debugAuth.checkStorage()}
        style={{ marginTop: '5px', padding: '2px 5px' }}
      >
        Check Storage
      </button>
    </div>
  );
};

export default DebugAuth;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase/config';
import { Video } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate('/'); 
    }
    setIsLoading(false);
  };

  return (
    <div className="page-container">
      <div className="auth-card">
        <div className="flex justify-center mb-6 text-blue-600">
          <Video className="w-12 h-12" />
        </div>
        
        <h2 className="heading-main">Welcome back</h2>
        
        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label-text">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
            />
          </div>
          
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="link-text">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
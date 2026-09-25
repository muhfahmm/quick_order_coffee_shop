import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Coffee, User, Lock, LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import logoImg from '../../assets/image.png';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await login(username, password);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src={logoImg} alt="myCoffee Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '12px' }} />
          <p className="auth-subtitle">Masuk ke Portal Admin Resto</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username Staf/Admin</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Kata Sandi</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '40px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#7A695C',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px'
                }}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary-auth" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Belum punya akun admin?{' '}
            <Link to="/auth/register" className="auth-link">
              Daftar Staf Baru <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Coffee, User, Lock, ShieldCheck, UserPlus, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok!');
      return;
    }

    setIsLoading(true);

    const res = await register(formData);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="brand-badge">
            <Coffee className="brand-icon" />
          </div>
          <h1 className="auth-title">Registrasi Akun Staf</h1>
          <p className="auth-subtitle">Daftar Akun Baru (Tersimpan Ke MySQL `tb_admin`)</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nama Lengkap Staf</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                name="name"
                placeholder="Budi Santoso"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Username</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  name="username"
                  placeholder="budi_admin"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Peran / Role</label>
              <div className="input-wrapper">
                <ShieldCheck className="input-icon" size={18} />
                <select name="role" value={formData.role} onChange={handleChange}>
                  <option value="admin">Administrator</option>
                  <option value="kasir">Kasir Utama</option>
                  <option value="dapur">Koki Dapur / Barista</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Kata Sandi</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="form-group">
              <label>Konfirmasi Sandi</label>
              <div className="input-wrapper" style={{ position: 'relative' }}>
                <Lock className="input-icon" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ paddingRight: '40px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary-auth" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>Daftarkan Ke Database</span>
                <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Sudah memiliki akun?{' '}
            <Link to="/auth/login" className="auth-link">
              <ArrowLeft size={14} /> Kembali Ke Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

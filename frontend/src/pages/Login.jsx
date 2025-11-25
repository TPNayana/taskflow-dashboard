import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Invalid Credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden bg-gray-900">
      {/* BACKGROUND ANIMATION */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-float"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-blue-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* GLASS CARD */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">TaskFlow</h1>
          <p className="text-gray-400">Welcome back! Please enter your details.</p>
        </div>
        
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
            <input 
              type="email" 
              name="email" 
              onChange={onChange} 
              required 
              className="w-full px-5 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/5 transition-all"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Password</label>
            <input 
              type="password" 
              name="password" 
              onChange={onChange} 
              required 
              className="w-full px-5 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/5 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-4 py-3.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold shadow-lg shadow-blue-500/30 transform hover:scale-[1.02] transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Don't have an account? <Link to="/register" className="font-semibold text-white hover:text-blue-400 hover:underline transition-all">Sign up for free</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
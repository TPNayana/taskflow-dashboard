import { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      alert('Registration Successful! Please Login.');
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.msg || 'Error registering');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden bg-gray-900">
      {/* BACKGROUND ANIMATION */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-float"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-screen filter blur-[128px] opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* GLASS CARD */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Join TaskFlow</h1>
          <p className="text-gray-400">Start organizing your life today.</p>
        </div>
        
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Full Name</label>
            <input 
              type="text" 
              name="name" 
              onChange={onChange} 
              required 
              className="w-full px-5 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/5 transition-all"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Email Address</label>
            <input 
              type="email" 
              name="email" 
              onChange={onChange} 
              required 
              className="w-full px-5 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/5 transition-all"
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
              className="w-full px-5 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white/5 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-4 py-3.5 text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-bold shadow-lg shadow-purple-500/30 transform hover:scale-[1.02] transition-all"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          Already have an account? <Link to="/login" className="font-semibold text-white hover:text-purple-400 hover:underline transition-all">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
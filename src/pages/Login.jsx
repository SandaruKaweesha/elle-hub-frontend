import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', formData);
      console.log("Login success:", response.data);
      const userData = response.data.user || response.data;
      localStorage.setItem('user', JSON.stringify(userData));

      // Role-based routing
      const userRole = (userData.role || '').toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin');
      } else if (userRole === 'referee') {
        navigate('/referee');
      } else if (userRole === 'organizer') {
        navigate('/organizer');
      } else if (userRole === 'team') {
        navigate('/team');
      } else if (userRole === 'sponsor') {
        navigate('/sponsor');
      } else {
        navigate('/'); // Fallback
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Invalid email or password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Poppins'] bg-[#f9faf9] relative">

      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#e5e7e5 1px, transparent 1px), linear-gradient(90deg, #e5e7e5 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Global Navbar */}
      <div className="relative z-20">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-[440px] p-10 px-12">

          <div className="text-center mb-8">
            <h1 className="text-[28px] font-bold text-[#111111] mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-[#888888] px-4 leading-relaxed">
              Log in to manage your high-performance athletic facility.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center border border-red-200">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[13px] font-bold text-[#333333] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-[18px] w-[18px] text-[#888888]" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#e0e0e0] rounded-[6px] text-sm text-[#111111] placeholder-[#a0a0a0] focus:outline-none focus:ring-1 focus:ring-[#00783f] focus:border-[#00783f] transition-colors"
                  placeholder="coach@theellehub.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[13px] font-bold text-[#333333] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-[18px] w-[18px] text-[#888888]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-[#e0e0e0] rounded-[6px] text-sm text-[#111111] placeholder-[#a0a0a0] focus:outline-none focus:ring-1 focus:ring-[#00783f] focus:border-[#00783f] transition-colors tracking-widest"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#888888] hover:text-[#555555] focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-[18px] w-[18px]" />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between pt-1 pb-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3.5 w-3.5 border-[#d0d0d0] rounded text-[#00783f] focus:ring-[#00783f] cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-[13px] font-medium text-[#666666] cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-[13px]">
                <a href="#" className="font-bold text-[#00783f] hover:text-[#005a2f]">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-[6px] text-[15px] font-bold text-white bg-[#C99C4E] hover:bg-[#b88c42] transition-colors active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6 border-t border-[#f0f0f0]"></div>

          {/* Create Account Link */}
          <div className="text-center">
            <p className="text-[13px] text-[#666666]">
              Don't have an account?{" "}
              <Link to="/register" className="font-bold text-[#111111] hover:underline">
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </main>

      {/* Global Footer */}
      <div className="relative z-10 mt-auto">
        <Footer />
      </div>

    </div>
  );
}

export default Login;

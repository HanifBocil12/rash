import React, { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const LiquidFlowLogin = () => {
  const canvasRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);

  // ➕ STATE LOGIN
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ➕ AUTO REDIRECT JIKA SUDAH LOGIN
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.ui_id) {
      navigate(`/${user.ui_id}/home`, { replace: true });
    }
  }, [navigate]);

  // 🔥 GENERATE UI_ID RANDOM PER DEVICE
  const generateUiId = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 16);
  };

  // ➕ HANDLE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("https://api-web.up.railway.app/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setErrorMsg(`Server tidak merespon JSON. Status: ${res.status}`);
        setLoading(false);
        return;
      }

      if (!res.ok || !data.id || !data.token) {
        setErrorMsg(data.error || "Email atau password salah!");
        setLoading(false);
        return;
      }

      const ui_id = generateUiId();

      const userData = {
        id: data.id,
        ui_id,
        name: data.name,
        email: data.email,
        token: data.token
      };

      localStorage.setItem("user", JSON.stringify(userData));
      navigate(`/${ui_id}/home`, { replace: true });

    } catch (err) {
      setErrorMsg("Tidak dapat terhubung ke server!");
    }

    setLoading(false);
  };

  // ==========================
  // ANIMASI CANVAS
  // ==========================
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const flows = [];
    const flowCount = 8;
    
    for (let i = 0; i < flowCount; i++) {
      flows.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        width: 15 + Math.random() * 30,
        height: 80 + Math.random() * 150,
        speed: 0.3 + Math.random() * 0.8,
        waveOffset: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.3
      });
    }
    
    let animationFrameId;
    const animate = () => {
      ctx.fillStyle = 'rgba(255, 245, 235, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      flows.forEach(flow => {
        flow.y += flow.speed;
        flow.waveOffset += 0.015;
        
        if (flow.y > canvas.height + flow.height) {
          flow.y = -flow.height;
          flow.x = Math.random() * canvas.width;
        }
        
        ctx.beginPath();
        
        const leftPoints = 15;
        const leftPath = [];
        for (let i = 0; i <= leftPoints; i++) {
          const progress = i / leftPoints;
          const y = flow.y + progress * flow.height;
          const wave = Math.sin(flow.waveOffset + progress * 3) * (flow.width * 0.25);
          const x = flow.x + wave;
          leftPath.push({ x, y });
        }
        
        const rightPath = [];
        for (let i = leftPoints; i >= 0; i--) {
          const progress = i / leftPoints;
          const y = flow.y + progress * flow.height;
          const wave = Math.sin(flow.waveOffset + progress * 3 + Math.PI) * (flow.width * 0.25);
          const x = flow.x + flow.width + wave;
          rightPath.push({ x, y });
        }
        
        if (leftPath.length > 0) {
          ctx.moveTo(leftPath[0].x, leftPath[0].y);
          for (let i = 1; i < leftPath.length; i++) ctx.lineTo(leftPath[i].x, leftPath[i].y);
          for (let i = 0; i < rightPath.length; i++) ctx.lineTo(rightPath[i].x, rightPath[i].y);
          ctx.closePath();
        }
        
        const gradient = ctx.createLinearGradient(
          flow.x, flow.y,
          flow.x + flow.width, flow.y + flow.height
        );
        gradient.addColorStop(0, `rgba(255, 165, 0, ${flow.opacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 0, ${flow.opacity})`);
        gradient.addColorStop(1, `rgba(255, 69, 0, ${flow.opacity * 0.6})`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        const highlightPoints = 8;
        for (let i = 0; i <= highlightPoints; i++) {
          const progress = i / highlightPoints;
          const y = flow.y + progress * flow.height;
          const wave = Math.sin(flow.waveOffset + progress * 3) * (flow.width * 0.1);
          const x = flow.x + flow.width*0.3 + wave;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255, 200, 150, ${flow.opacity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ==========================
  // UI LOGIN
  // ==========================
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-red-50">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>

      <div className="
              relative z-10
              flex flex-col items-center justify-center
              min-h-screen
              px-4 sm:px-6"
            >
        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between py-4 sm:py-6">
          <h1 className="text-lg sm:text-2xl font-bold text-orange-600">LiquidFlow</h1>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 sm:py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-base sm:text-sm">
            Get Started
          </button>
        </div>

        <div className="flex-1 w-full flex flex-col items-center justify-center">
          {/* UBAH MAX-W UNTUK MOBILE */}
          <div className="w-full max-w-full sm:max-w-md space-y-6 sm:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center leading-tight">
              <div>solusi hanif</div>
              <div className="text-orange-600">Revolution</div>
              <div className="text-2xl sm:text-3xl md:text-4xl">Ai</div>
            </h1>

            <div className="bg-white bg-opacity-80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-orange-100 w-full">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Sign In</h2>

              {errorMsg && (
                <p className="text-base sm:text-sm mb-2 sm:mb-3 text-center text-red-600">{errorMsg}</p>
              )}

              <form className="space-y-4 sm:space-y-4" onSubmit={handleLogin}>
                <div>
                  <label className="block text-base sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-5 sm:py-3 text-lg sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="relative">
                  <label className="block text-base sm:text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-5 sm:py-3 text-lg sm:text-base pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[calc(50%+1rem)] -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-base sm:text-sm">
                  <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-5 w-5 text-orange-600" />
                    <label htmlFor="remember-me" className="ml-2 text-gray-700">Remember me</label>
                  </div>
                  <a className="text-orange-600 hover:text-orange-700 text-base sm:text-sm">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5 sm:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-lg sm:text-base"
                >
                  {loading ? "Loading.." : "Sign In"}
                </button>
              </form>

              <div className="mt-4 sm:mt-6 text-center text-base sm:text-sm">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <a className="font-medium text-orange-600 hover:text-orange-700">Sign up now</a>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
              <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-5 sm:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-lg sm:text-base">
                Start Free Trial
              </button>
              <button className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-5 sm:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 text-lg sm:text-base">
                Watch Demo
              </button>
            </div>
          </div>

          <footer className="text-center text-sm sm:text-xs mt-2 text-gray-600">
            © 2025 Muhammad Hanif. Smkn 4 Tangerang.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LiquidFlowLogin;

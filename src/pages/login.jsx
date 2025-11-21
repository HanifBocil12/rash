import React, { useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import {state} from '../state';
import { useSnapshot } from 'valtio'

const LiquidFlowLogin = () => {
  const canvasRef = useRef(null);
  const snap = useSnapshot(state);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.ui_id) {
      navigate(`/${user.ui_id}/home`, { replace: true });
    }
  }, [navigate]);

  const generateUiId = () => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 16);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    state.errorMsg = "";
    state.loading = true;

    try {
      const res = await fetch("https://api-web.up.railway.app/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: snap.email, password: snap.password }),
      });

      let data;
      try { data = await res.json(); } 
      catch { state.errorMsg = `Server tidak merespon JSON. Status: ${res.status}`; state.loading = false; return; }

      if (!res.ok || !data.id || !data.token) {
        state.errorMsg = data.error || "Email atau password salah!";
        state.loading = false;
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
      state.errorMsg = "Tidak dapat terhubung ke server!";
    }

    state.loading = false;
  };

  // ==========================
  // ANIMASI CANVAS RESPONSIVE
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

    const isMobile = window.innerWidth < 640;
    const scale = isMobile ? 0.5 : 1;

    const flows = [];
    const flowCount = 8;

    for (let i = 0; i < flowCount; i++) {
      flows.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        width: (15 + Math.random() * 30) * scale,
        height: (80 + Math.random() * 150) * scale,
        speed: (0.3 + Math.random() * 0.8) * scale,
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
  // UI LOGIN (MOBILE-FRIENDLY, DESKTOP TIDAK DIUBAH)
  // ==========================
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-orange-100 to-red-50">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-black bg-opacity-10"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-3 sm:px-6">
        {/* TOP BAR */}
        <div className="w-full flex items-center justify-between py-2 sm:py-4">
          <h1 className="text-lg sm:text-2xl font-bold text-orange-600">LiquidFlow</h1>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 sm:py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-base sm:text-sm">
            Get Started
          </button>
        </div>

        <div className="flex-1 w-full flex flex-col items-center justify-center">
          <div className="w-full max-w-xs sm:max-w-md space-y-4 sm:space-y-8">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800 text-center leading-tight">
              <div>solusi hanif</div>
              <div className="text-orange-600">Revolution</div>
              <div className="text-xl sm:text-3xl md:text-4xl">Ai</div>
            </h1>

            <div className="bg-white bg-opacity-80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl shadow-xl border border-orange-100 w-full">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-6">Sign In</h2>

              {snap.errorMsg && (
                <p className="text-sm sm:text-base mb-2 text-center text-red-600">{snap.errorMsg}</p>
              )}

              <form className="space-y-3" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={snap.email}
                    onChange={(e) => state.email = e.target.value}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                    placeholder="your@email.com"
                    required
                  />
                </div>

               <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={snap.showPassword ? "text" : "password"}
                      value={snap.password}
                      onChange={(e) => state.password = e.target.value}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => state.showPassword = !snap.showPassword}
                      className="absolute inset-y-0 right-0 flex items-center px-3"
                      aria-label={snap.showPassword ? "Hide password" : "Show password"}
                    >
                      {snap.showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm sm:text-base">
                  <div className="flex items-center">
                    <input id="remember-me" type="checkbox" className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    <label htmlFor="remember-me" className="ml-2 text-gray-700 text-sm sm:text-base">Remember me</label>
                  </div>
                  <a className="text-orange-600 hover:text-orange-700 text-sm sm:text-base">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  disabled={snap.loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-300 shadow-md"
                >
                  {snap.loading ? "Loading.." : "Sign In"}
                </button>
              </form>

              <div className="mt-3 sm:mt-6 text-center text-sm sm:text-base">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <a className="font-medium text-orange-600 hover:text-orange-700">Sign up now</a>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
              <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-300 shadow-md">
                Start Free Trial
              </button>
              <button className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>

          <footer className="text-center text-xs sm:text-sm mt-2 text-gray-600">
            © 2025 Muhammad Hanif. Smkn 4 Tangerang.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LiquidFlowLogin;

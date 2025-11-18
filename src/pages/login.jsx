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

  // =====================================
  // 🔥 GENERATE UI_ID RANDOM PER DEVICE
  // =====================================
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

      // 🔥 CEK LOGIN BERHASIL
      if (!res.ok || !data.id || !data.token) {
        setErrorMsg(data.error || "Email atau password salah!");
        setLoading(false);
        return;
      }

      // 🔥 BUAT UI_ID RANDOM PER DEVICE
      const ui_id = generateUiId();

      // simpan user ke localstorage
      const userData = {
        id: data.id,
        ui_id,
        name: data.name,
        email: data.email,
        token: data.token
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect sesuai ui_id device
      navigate(`/${ui_id}/home`, { replace: true });

    } catch (err) {
      setErrorMsg("Tidak dapat terhubung ke server!");
    }

    setLoading(false);
  };

  // ==========================
  // ANIMASI CANVAS (TIDAK DIUBAH)
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
  // UI LOGIN (RESPONSIF CARD & POSISI)
  // ==========================
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #fff5eb, #fff0e0, #ffe5d0)" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.1)" }}></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen" style={{ paddingLeft: "2.5vw", paddingRight: "2.5vw" }}>
        <header style={{ position: "absolute", top: "0.44vh", left: "0.25vw" }}>
          <h1 style={{ fontSize: "1.25vw", fontWeight: "bold", color: "#f97316" }}>LiquidFlow</h1>
        </header>

        <button style={{
          position: "absolute",
          top: "0.44vh",
          right: "0.25vw",
          backgroundColor: "#f97316",
          color: "white",
          padding: "0.44vh 0.625vw",
          borderRadius: "1.25vw",
          fontWeight: 600,
          fontSize: "0.625vw",
          transition: "all 0.3s",
          transform: "scale(1)",
        }}>
          Get Started
        </button>

        <div style={{ width: "100%", maxWidth: "37.5vw", display: "flex", flexDirection: "column", gap: "1.25vw" }}>
          <h1 style={{ fontSize: "2vw", fontWeight: "bold", color: "#1f2937", textAlign: "center", lineHeight: 1.2 }}>
            <div>solusi hanif</div>
            <div style={{ color: "#f97316" }}>Revolution</div>
            <div style={{ fontSize: "1.5vw" }}>Ai</div>
          </h1>

          <div style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(0.3125vw)",
            padding: "1.25vw",
            borderRadius: "1.25vw",
            boxShadow: "0 0.125vw 0.3125vw rgba(0,0,0,0.1)",
            border: "0.0625vw solid #fed7aa"
          }}>
            <h2 style={{ fontSize: "1.25vw", fontWeight: "bold", color: "#1f2937", marginBottom: "0.625vw" }}>Sign In</h2>

            {errorMsg && (
              <p style={{ color: "red", fontSize: "0.75vw", marginBottom: "0.3125vw", textAlign: "center" }}>{errorMsg}</p>
            )}

            <form style={{ display: "flex", flexDirection: "column", gap: "0.625vw" }} onSubmit={handleLogin}>
              <div>
                <label style={{ display: "block", fontSize: "0.625vw", fontWeight: 500, color: "#374151", marginBottom: "0.125vw" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "0.625vw", borderRadius: "0.625vw", border: "0.0625vw solid #d1d5db", outline: "none" }}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div style={{ position: "relative" }}>
                <label style={{ display: "block", fontSize: "0.625vw", fontWeight: 500, color: "#374151", marginBottom: "0.125vw" }}>Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", padding: "0.625vw 2.5vw 0.625vw 0.625vw", borderRadius: "0.625vw", border: "0.0625vw solid #d1d5db", outline: "none" }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.1875vw", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}
                >
                  {showPassword ? <EyeOff style={{ width: "1.25vw", height: "1.25vw" }} /> : <Eye style={{ width: "1.25vw", height: "1.25vw" }} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  backgroundColor: "#f97316",
                  color: "white",
                  fontWeight: 600,
                  padding: "0.625vw",
                  borderRadius: "0.625vw",
                  fontSize: "0.75vw",
                  transition: "all 0.3s",
                  transform: "scale(1)",
                }}
              >
                {loading ? "Loading.." : "Sign In"}
              </button>
            </form>

            <div style={{ marginTop: "0.25vw", textAlign: "center" }}>
              <p style={{ fontSize: "0.625vw", color: "#4b5563" }}>
                Don't have an account?{' '}
                <a style={{ fontWeight: 500, color: "#f97316" }}>Sign up now</a>
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "row", gap: "0.1875vw", marginTop: "0.3125vw" }}>
            <button style={{
              flex: 1,
              backgroundColor: "#f97316",
              color: "white",
              fontWeight: 600,
              padding: "0.5vw",
              borderRadius: "0.625vw",
              fontSize: "0.75vw",
            }}>Start Free Trial</button>
            <button style={{
              flex: 1,
              border: "0.125vw solid #f97316",
              color: "#f97316",
              padding: "0.5vw",
              borderRadius: "0.625vw",
              fontSize: "0.75vw",
              backgroundColor: "#fff",
            }}>Watch Demo</button>
          </div>
        </div>

        <div style={{ marginTop: "0.375vw" }}>
          <footer style={{ textAlign: "center", fontSize: "0.5vw", color: "#6b7280" }}>
            © 2025 Muhammad Hanif. Smkn 4 Tangerang.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LiquidFlowLogin;

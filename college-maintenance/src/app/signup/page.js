"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Image from "next/image";

const MAINTENANCE_KEY = "gehuservice@04";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // 👈 toggle login/signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // default student
  const [key, setKey] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // captcha generator (sirf login ke liye)
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(text);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (captchaInput !== captcha) {
        alert("Captcha incorrect!");
        generateCaptcha();
        setIsLoading(false);
        return;
      }

      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const docSnap = await getDoc(doc(db, "users", userCred.user.uid));

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setRole(userData.role);

        if (userData.role === "maintenance") {
          if (key !== MAINTENANCE_KEY) {
            alert("Invalid Maintenance Key!");
            setIsLoading(false);
            return;
          }
          router.push("/maintenance-dashboard");
        } else {
          router.push("/student-dashboard");
        }
      } else {
        alert("No user data found!");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // ✅ signup me captcha aur key ka check hata diya
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // user ka data save karo
      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        role,
      });

      alert("Signup successful! Please login.");
      setIsLogin(true); // switch back to login
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background */}
      <div
        className="absolute z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://www.gehu.ac.in/assets/GEHU-Dehradun-1abd6f9c.jpg')",
          width: "100%",
          height: "900px",
        }}
      ></div>

      {/* Card */}
      <div className="relative z-10 flex items-center justify-end min-h-screen px-6">
        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
          className="flex flex-col gap-5 bg-white/50 p-8 rounded-lg shadow-2xl w-full max-w-sm border border-gray-200"
        >
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <Image
              src="https://www.italcoholic.in/wp-content/uploads/2017/01/geu.png"
              alt="University Logo"
              width={450}
              height={80}
              priority
            />
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Role Selection (signup ke liye) */}
          {!isLogin && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="maintenance">Maintenance</option>
            </select>
          )}

          {/* Maintenance Key (sirf login ke time aur agar role maintenance hai) */}
          {isLogin && role === "maintenance" && (
            <input
              type="password"
              placeholder="Enter Maintenance Key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* Captcha (sirf login ke time) */}
          {isLogin && (
            <>
              <div className="flex items-center gap-3">
                <div className="bg-gray-200 text-lg font-bold tracking-widest px-4 py-2 rounded">
                  {captcha}
                </div>
                <button type="button" onClick={generateCaptcha} className="text-sm text-blue-600">
                  Refresh
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter Captcha"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
                className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
              isLoading ? "bg-blue-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Processing..." : isLogin ? "LOGIN" : "SIGN UP"}
          </button>

          {/* Switch between login/signup */}
          <div className="flex justify-between text-sm text-gray-600">
            {isLogin ? (
              <>
                <a href="#" className="hover:underline">
                  Forgot password?
                </a>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 hover:underline"
                >
                  Don’t have an account? Sign up
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline w-full text-center"
              >
                Already have an account? Login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

// 🔑 Apna secret key
const MAINTENANCE_KEY = "gehuservice@04";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [key, setKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Firebase Auth login
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // Firestore se user role lana
      const docSnap = await getDoc(doc(db, "users", userCred.user.uid));

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setRole(userData.role);

        // Agar role maintenance hai to key check karo
        if (userData.role === "maintenance") {
          if (key !== MAINTENANCE_KEY) {
            alert("Invalid Maintenance Key!");
            setIsLoading(false);
            return;
          }
          router.push("/maintenance-dashboard");
        } else {
          // Agar student hai to student dashboard
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

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 h-full">
        <Image
          src="/images/college-bg.jpeg"
          alt="College Background"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-90"
          priority
        />
      </div>

      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-6 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/20"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-1">Login</h2>
            <p className="text-gray-600">Welcome back! Please log in</p>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-3 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="p-3 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Maintenance Key - show only if role = maintenance */}
            {role === "maintenance" && (
              <div className="flex flex-col gap-2">
                <label htmlFor="key" className="text-gray-700 font-medium">
                  Maintenance Key
                </label>
                <input
                  id="key"
                  type="password"
                  placeholder="Enter maintenance key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="p-3 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`p-3 rounded-lg text-white font-medium transition-colors ${
              isLoading
                ? "bg-blue-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-600">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

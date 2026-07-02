import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

// Validation schema
const loginSchema = zod.object({
  email: zod.string().email("Invalid email address").min(1, "Email is required"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const from = location.state?.from?.pathname || "/dashboard";

  // Google Sign-In script loader
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("VITE_GOOGLE_CLIENT_ID is not configured in env variables.");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      try {
        window.google?.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            setLoading(true);
            setFormError("");
            try {
              await googleLogin(response.credential);
              navigate(from, { replace: true });
            } catch (err) {
              setFormError(err.response?.data?.message || err.message || "Google Authentication failed");
            } finally {
              setLoading(false);
            }
          },
        });

        const container = document.getElementById("google-signin-btn");
        if (container) {
          window.google?.accounts.id.renderButton(container, {
            theme: "filled_black",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: container.offsetWidth || 340,
          });
        }
      } catch (err) {
        console.error("Error setting up Google Sign-in:", err);
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [googleLogin, navigate, from]);

  const onSubmit = async (data) => {
    setLoading(true);
    setFormError("");
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(
        err.response?.data?.message || err.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm text-left">
      <div className="flex flex-col gap-1.5 text-left">
        <h2 className="text-2xl font-semibold text-zinc-100 font-display tracking-tight">
          Sign in to platform
        </h2>
        <p className="text-xs text-zinc-400">
          Enter your details below to resume planning
        </p>
      </div>

      {formError && (
        <div className="bg-red-950/30 border border-red-900/40 text-red-400 px-4 py-2.5 rounded-lg text-xs leading-relaxed">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          id="email"
          type="email"
          placeholder="name@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" className="w-full mt-2" loading={loading}>
          Sign In
        </Button>
      </form>

      {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
        <div className="flex flex-col gap-4 mt-1">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800/80" />
            </div>
            <span className="relative bg-zinc-950 px-3 text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Mount node for Google sign-in */}
          <div id="google-signin-btn" className="w-full flex justify-center" />
        </div>
      )}

      <p className="text-center text-xs text-zinc-500 mt-2">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-zinc-300 hover:text-zinc-100 font-medium underline transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;

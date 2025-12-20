"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@mui/material";

type IProp = {
  nextStep: (step: number) => void;
};

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  server?: string;
};

const RegisterForm = ({ nextStep }: IProp) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  /* Validation */
  const validate = () => {
    const newErrors: Errors = {};

    if (!name.trim()) newErrors.name = "Name is required";

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* Register user */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    try {
      setLoading(true);
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      router.push("/login");
      setLoading(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || "Something went wrong";
      setErrors({ server: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <button
        onClick={() => nextStep(1)}
        className="absolute top-6 left-6 flex items-center gap-1 text-[#C62828] font-semibold text-sm hover:opacity-90 cursor-pointer"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Create your account
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Join <span className="text-[#C62828] font-medium">SPS Mega Mart</span>
        </p>

        {/* Server error */}
        {errors.server && (
          <p className="mt-4 text-sm text-red-500">{errors.server}</p>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          <div>
            <div className="relative">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((p) => ({ ...p, name: undefined }));
                }}
                className={`w-full h-12 pl-12 pr-4 rounded-xl text-sm outline-none transition
                  border ${
                    errors.name
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-300 focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                  }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((p) => ({ ...p, email: undefined }));
                }}
                className={`w-full h-12 pl-12 pr-4 rounded-xl text-sm outline-none transition
                  border ${
                    errors.email
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-300 focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                  }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`w-full h-12 pl-12 pr-12 rounded-xl text-sm outline-none transition
                  border ${
                    errors.password
                      ? "border-red-400 focus:border-red-500"
                      : "border-gray-300 focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C62828]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-12 mt-4 rounded-xl bg-[#C62828] text-white
                       text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          className="w-full h-12 rounded-xl border border-gray-300 flex items-center justify-center gap-3 text-sm cursor-pointer"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            width={18}
            height={18}
          />
          Continue with Google
        </button>

        <Button
          variant="text"
          disableRipple
          sx={{
            mt: 2,
            p: 0,
            minWidth: "auto",
            textTransform: "none",
            fontSize: "0.875rem",
            color: "#6b7280", // text-gray-500
            "&:hover": {
              backgroundColor: "transparent",
            },
          }}
          onClick={() => router.push("/login")}
        >
          Already have an account?{" "}
          <span
            style={{
              color: "#C62828",
              fontWeight: 500,
              textDecoration: "underline",
              marginLeft: 4,
            }}
          >
            Sign in
          </span>
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm;

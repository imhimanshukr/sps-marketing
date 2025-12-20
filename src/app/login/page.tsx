"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

type Errors = {
  email?: string;
  password?: string;
  server?: string;
};

const LoginForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const { data,  status } = useSession();
  console.log("session: ", data);

  /* Validation */
  const validate = () => {
    const newErrors: Errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* Login user */
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});

  if (!validate()) return;

  try {
    setLoading(true);

await signIn("credentials", {
  email,
  password,
  redirect: false,
});

  } catch (err) {
    setErrors({ server: "Something went wrong"+ err });
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (status === "authenticated") {
    router.replace("/");
  }
}, [status, router]);


  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 text-sm mt-1">
          Login to{" "}
          <span className="text-[#C62828] font-medium">SPS Mega Mart</span>
        </p>

        {/* Server error */}
        {errors.server && (
          <p className="mt-4 text-sm text-red-500">{errors.server}</p>
        )}

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleLogin}>
          {/* Email */}
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

          {/* Password */}
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

          {/* CTA */}
          <button
            type="submit"
            className="w-full h-12 mt-4 rounded-xl bg-[#C62828] text-white
                       text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Login...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* OR */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Google */}
        <button
          type="button"
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

        {/* Footer */}
        <p
          className="mt-6 inline-block text-sm text-gray-500 cursor-pointer"
          onClick={() => router.push("/register")}
        >
          {"Don't have an account?"}{" "}
          <span className="text-[#C62828] font-medium hover:underline cursor-pointer">
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Store, ArrowRight, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type IProp = {
  nextStep: (step: number) => void;
};

const WelcomePage = ({ nextStep }: IProp) => {
  const { status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      {/* Content */}
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -6, 0], // halka sa float
          }}
          transition={{
            opacity: { duration: 0.4 },
            scale: { duration: 0.4 },
            y: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="flex justify-center"
        >
          <Image
            src="/logo.png"
            alt="SPS Mega Mart Logo"
            width={140}
            height={140}
            priority
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-3xl font-semibold text-gray-900"
        >
          Welcome to
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-4xl font-extrabold text-[#C62828] tracking-tight"
        >
          SPS Mega Mart
        </motion.h2>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 mt-4 text-sm"
        >
          आपके ज़रूरतों का भरोसेमंद साथी
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex justify-center gap-10 mt-10 text-gray-600"
        >
          <div className="flex flex-col items-center text-xs gap-1">
            <ShoppingCart className="text-[#C62828]" />
            <span>Groceries</span>
          </div>

          <div className="flex flex-col items-center text-xs gap-1">
            <Sparkles className="text-[#C62828]" />
            <span>Quality</span>
          </div>

          <div className="flex flex-col items-center text-xs gap-1">
            <Store className="text-[#C62828]" />
            <span>Daily Needs</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={isLoading}
          className="mt-12 w-full h-12 rounded-xl
                     bg-[#C62828] text-white
                     text-sm font-semibold
                     flex items-center justify-center gap-2
                    transition cursor-pointer"
          onClick={() => {
            if (status === "authenticated") {
              router.replace("/");
            } else {
              nextStep(2);
            }
          }}
        >
          Get Started
          <ArrowRight size={18} />
        </motion.button>
      </div>
    </div>
  );
};

export default WelcomePage;

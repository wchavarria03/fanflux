"use client";
import Link from "next/link";

import { motion } from "framer-motion";
import { ConnectedAddress } from "~~/components/ConnectedAddress";

export const HeroSection = () => (
  <header className="container mx-auto px-4 py-20 md:py-28 text-center relative overflow-hidden">
    {/* Efecto de partículas de fondo */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-purple-500/10 -top-32 -left-32 rounded-full blur-3xl" />
      <div className="absolute w-[400px] h-[400px] bg-pink-500/10 -bottom-40 -right-32 rounded-full blur-3xl" />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-5xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-400 to-purple-500 bg-clip-text text-transparent leading-tight">
        Revoluciona la
        <br className="hidden md:block" /> Conexión con tus Fans
        <div className="mt-4 text-4xl md:text-5xl bg-gradient-to-r from-pink-400 to-yellow-300 bg-clip-text text-transparent">
          En la Web3
        </div>
      </h1>
    </motion.div>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed"
    >
      Donde creadores y fans construyen juntos una{" "}
      <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
        economía digital sostenible
      </span>{" "}
      a través de tokens interactivos y contenido exclusivo.
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="flex flex-col md:flex-row justify-center items-center gap-6 mb-20"
    >
      {/* @ts-ignore */}
      <ConnectedAddress className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/20" />

      <Link
        href="/communities"
        className="relative group bg-gradient-to-br from-purple-600 to-pink-600 px-8 py-4 rounded-2xl font-semibold transition-all 
                   hover:from-purple-500 hover:to-pink-500 hover:shadow-2xl hover:shadow-pink-500/30"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span className="text-white">Explorar Comunidades</span>
          <span className="animate-pulse">🚀</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </Link>
    </motion.div>

    {/* Elementos decorativos */}
    <div className="absolute top-20 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-float" />
    <div className="absolute bottom-40 right-16 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-float-delayed" />
  </header>
);

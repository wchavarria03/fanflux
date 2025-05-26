// components/CTASection.tsx
import Link from "next/link";
import { motion } from "framer-motion";

interface CTASectionProps {
  isConnected: boolean;
}

export const CTASection = ({ isConnected }: CTASectionProps) => {
  return (
    <div className="relative overflow-hidden py-24">
      {/* Efectos de fondo dinámicos */}
      <div className="absolute inset-0">
        <div className="absolute w-[40%] aspect-square bg-purple-500/10 rounded-full -top-20 -left-20 blur-3xl animate-float" />
        <div className="absolute w-[30%] aspect-square bg-pink-500/10 rounded-full -bottom-40 -right-32 blur-3xl animate-float-delayed" />
      </div>

      {isConnected ? (
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <div className="bg-gradient-to-br from-purple-600/90 to-pink-700/90 rounded-[2.5rem] p-12 border border-white/10 backdrop-blur-xl shadow-2xl">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="mb-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                Tu Comunidad te Espera
              </h2>
              <p className="text-xl text-purple-50/90 max-w-2xl mx-auto leading-relaxed">
                Transforma tu pasión en una economía digital y conecta con tus
                fans de forma revolucionaria
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col md:flex-row justify-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/creator"
                className="group relative flex-1 max-w-md bg-gradient-to-br from-white/95 to-purple-50 px-8 py-6 rounded-2xl font-bold 
                         transition-all hover:shadow-2xl hover:shadow-pink-500/30 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent text-lg">
                  Empezar como Creador
                </span>
                <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity w-3/4 mx-auto" />
              </Link>

              <Link
                href="/follower"
                className="group relative flex-1 max-w-md bg-gradient-to-br from-gray-900/95 to-purple-900/90 px-8 py-6 rounded-2xl font-bold 
                         transition-all hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="bg-gradient-to-r from-purple-300 to-pink-200 bg-clip-text text-transparent text-lg">
                  Empezar como Seguidor
                </span>
                <div className="mt-2 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity w-3/4 mx-auto" />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto px-4 text-center relative z-10"
        >
          <div className="bg-gray-900/50 rounded-3xl p-12 border border-white/10 backdrop-blur-xl shadow-xl">
            <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Acceso Exclusivo
            </h3>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">
              Conecta tu wallet para descubrir contenido único, beneficios
              especiales y una nueva forma de interactuar
            </p>
            <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 p-1 rounded-full inline-block">
              <div className="bg-gray-900 px-8 py-3 rounded-full font-medium text-purple-300 animate-pulse">
                Wallet no conectada
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
};

"use client";
import Link from "next/link";
import Image from "next/image";
import { ConnectedAddress } from "~~/components/ConnectedAddress";
import { CreatorCard } from "~~/components/CreatorCard";
import { useAccount } from "@starknet-react/core";

const Home = () => {
  const { isConnected } = useAccount();
  const features = [
    {
      title: "Tokens de Creador",
      description: "Cada creador tiene su propia economía tokenizada",
      icon: "🪙"
    },
    {
      title: "Recompensas Interactivas",
      description: "Gana NFTs y beneficios exclusivos apoyando a tus creadores",
      icon: "🎁"
    },
    {
      title: "Mercado Digital",
      description: "Compra, vende y comercia contenido único en nuestro mercado Web3",
      icon: "🛍️"
    }
  ];

  const creators = [
    {
      name: "DigitalArtistX",
      category: "Arte Digital",
      tokens: "DART",
      fans: "12.4K",
      image: "/creators/1.png"
    },
    {
      name: "GamerPro",
      category: "Gaming",
      tokens: "GXP",
      fans: "8.7K",
      image: "/creators/2.png"
    },
    {
      name: "CryptoMusician",
      category: "Música",
      tokens: "BEAT",
      fans: "15.2K",
      image: "/creators/3.png"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Revoluciona la Conexión con tus Fans
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          La primera plataforma Web3 donde creadores y fans construyen juntos una economía digital sostenible a través de
          tokens interactivos y contenido exclusivo.
        </p>
        
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-16">
          <ConnectedAddress />
          <Link
            href="/creators"
            className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-4 rounded-lg font-semibold transition-all"
          >
            Explorar Creadores
          </Link>
        </div>

        <div className="relative h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl overflow-hidden">
          <Image
            src="/hero-preview.png"
            alt="Fanflux Preview"
            fill
            className="object-cover object-center"
          />
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 p-8 rounded-xl hover:bg-gray-800/70 transition-all hover:-translate-y-2"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Creators */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Creadores Destacados</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {creators.map((creator, index) => (
            <CreatorCard key={index} creator={creator} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-purple-900/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Cómo Funciona</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="text-3xl mb-4">1️⃣</div>
              <h3 className="text-xl font-bold mb-2">Conecta tu Wallet</h3>
              <p className="text-gray-400">Usa tu billetera Web3 favorita para comenzar</p>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl mb-4">2️⃣</div>
              <h3 className="text-xl font-bold mb-2">Elige tu Creador</h3>
              <p className="text-gray-400">Descubre y apoya a creadores en tu área de interés</p>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl mb-4">3️⃣</div>
              <h3 className="text-xl font-bold mb-2">Gana Tokens</h3>
              <p className="text-gray-400">Participa y gana tokens del creador con cada interacción</p>
            </div>
            <div className="text-center p-6">
              <div className="text-3xl mb-4">4️⃣</div>
              <h3 className="text-xl font-bold mb-2">Redime Beneficios</h3>
              <p className="text-gray-400">Usa tus tokens para acceder a contenido y experiencias exclusivas</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {isConnected && (
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12">
          <h2 className="text-4xl font-bold mb-6">Comienza tu Viaje Web3</h2>
          <p className="text-xl text-gray-200 mb-8">Conecta con tu audiencia como nunca antes</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/creator"
              className="bg-white text-purple-900 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all"
            >
              Regístrate como Creador
            </Link>
            <Link
              href="/follower"
              className="bg-black/30 hover:bg-black/40 text-white px-8 py-4 rounded-lg font-bold transition-all"
            >
              Explorar como Fan
            </Link>
          </div>
        </div>
      </section>
      )}
      {!isConnected && (
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="text-center mt-8">
            <p className="text-gray-400">Conecta tu wallet para ver más</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
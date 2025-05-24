import Image from "next/image";
import Link from "next/link";

export const CreatorCard = ({ creator }: any) => {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300">
      <div className="relative h-48">
        <Image
          src={creator.image}
          alt={creator.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{creator.name}</h3>
        <div className="flex justify-between text-sm text-gray-400 mb-4">
          <span>{creator.category}</span>
          <span>🎮 {creator.fans} fans</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="bg-purple-600 text-sm px-3 py-1 rounded-full">Token: {creator.tokens}</span>
          <Link href={`/creators/${creator.name}`} className="text-pink-400 hover:text-pink-300">
            Ver Perfil
          </Link>
        </div>
      </div>
    </div>
  );
};
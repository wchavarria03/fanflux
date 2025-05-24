import { CreatorCard } from "~~/components/CreatorCard";

export const FeaturedCreators = () => {
  const creators = [
    {
      name: "DigitalArtistX",
      category: "Arte Digital",
      tokens: "DART",
      fans: "12.4K",
      image: "/creators/1.png",
    },
    {
      name: "GamerPro",
      category: "Gaming",
      tokens: "GXP",
      fans: "8.7K",
      image: "/creators/2.png",
    },
    {
      name: "CryptoMusician",
      category: "Música",
      tokens: "BEAT",
      fans: "15.2K",
      image: "/creators/3.png",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-4xl font-bold text-center mb-12">
        Creadores Destacados
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {creators.map((creator, index) => (
          <CreatorCard key={index} creator={creator} />
        ))}
      </div>
    </section>
  );
};

export const FeaturesSection = () => {
  const features = [
    {
      title: "Tokens de Creador",
      description: "Cada creador tiene su propia economía tokenizada",
      icon: "🪙",
    },
    {
      title: "Recompensas Interactivas",
      description: "Gana NFTs y beneficios exclusivos apoyando a tus creadores",
      icon: "🎁",
    },
    {
      title: "Mercado Digital",
      description:
        "Compra, vende y comercia contenido único en nuestro mercado Web3",
      icon: "🛍️",
    },
  ];

  return (
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
  );
};

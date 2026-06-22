
function TechnologyCard({ name, description, logoSrc, logoAlt = "logo" }) { 
  return (
    <div className="bg-slate-700 p-6 rounded-lg shadow-xl hover:shadow-sky-500/30 transition-shadow duration-300 flex flex-col items-center text-center">
      <div className="mb-4 h-16 w-16 flex items-center justify-center"> 
        {typeof logoSrc === 'string' ? (
          <img src={logoSrc} alt={logoAlt || name} className="max-h-full max-w-full object-contain" />
        ) : (
          logoSrc
        )}
      </div>
      <h3 className="text-xl font-semibold text-sky-400 mb-2">{name}</h3>
      <p className="text-slate-300 text-sm">{description}</p>
    </div>
  );
}

export default TechnologyCard;
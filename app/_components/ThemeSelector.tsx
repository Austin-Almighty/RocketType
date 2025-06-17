export default function ThemeSelector({setTheme}: {setTheme: (theme: string) => void}) {
  const themes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "aqua",
    "forest",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "dim",
    "nord",
    "sunset",
    "caramellatte",
    "abyss",
    "silk"
  ];

  return (
    <>
      <div className="join join-vertical w-full">
        {themes.map(theme => (
          <input
            key={theme}
            type="radio"
            name="theme-buttons"
            className="btn theme-controller join-item"
            aria-label={theme.charAt(0).toUpperCase() + theme.slice(1)}
            value={theme}
            onClick={e => setTheme(e.currentTarget.value)}
          />
        ))}
      </div>
    </>
  );
}





export default function ThemeSelector({ setTheme, theme: selectedTheme }: { setTheme: (theme: string) => void; theme: string }) {
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

  const featured = ["light", "dark", "night", "nord", "sunset"];
  function choices(items: string[]) {
    return <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{items.map((theme) => (
      <button
        type="button"
        key={theme}
        aria-pressed={theme === selectedTheme}
        data-theme={theme}

        className="rounded-xl border border-base-content/30 bg-base-100 text-base-content p-3 text-left"

        onClick={() => setTheme(theme)}
      >
        <span className="block capitalize">{theme}{theme === selectedTheme ? " ✓" : ""}</span>
        <span
          aria-hidden
          className="flex gap-1 mt-2"
        >
          <span className="bg-primary rounded-full w-4 h-4" />
          <span className="bg-secondary rounded-full w-4 h-4" />
          <span className="bg-accent rounded-full w-4 h-4" />
        </span>
      </button>
    ))}</div>;
  }
  return (
    <section aria-label="Color themes">
      <h2 className="text-xl mb-4">Choose a theme</h2>
      {choices(featured)}
      <details className="mt-4">
        <summary className="cursor-pointer py-2">More themes</summary>{choices(themes.filter((theme) => !featured.includes(theme)))}
      </details>
    </section>
  );
}

export default function ThemeSelector() {
  return (
    <>
      <div className="join join-vertical w-full">
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Default"
          value="default"
        />
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Retro"
          value="retro"
        />
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Cyberpunk"
          value="cyberpunk"
        />
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Valentine"
          value="valentine"
        />
        <input
          type="radio"
          name="theme-buttons"
          className="btn theme-controller join-item"
          aria-label="Aqua"
          value="aqua"
        />
      </div>
    </>
  );
}

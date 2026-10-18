// Global shortcuts must leave native controls and open dialogs alone.
export function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(
    'button, a, input, textarea, select, [contenteditable="true"], [role="button"], dialog[open]'
  ));
}

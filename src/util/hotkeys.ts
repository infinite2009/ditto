export function calculateHotkey(hotkeyOpt: {
  key: string;
  modifiers: {
    meta: boolean;
    alt: boolean;
    ctrl: boolean;
    shift: boolean;
  };
}) {
  const arr = [];
  const { meta, ctrl, alt, shift } = hotkeyOpt.modifiers || {};
  if (alt) {
    arr.push('alt');
  }
  if (ctrl) {
    arr.push('ctrl');
  }
  if (meta) {
    arr.push('meta');
  }
  if (shift) {
    arr.push('shift');
  }
  arr.push(hotkeyOpt.key.toLowerCase());
  return arr.join('+');
}

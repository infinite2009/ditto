import HotkeysManager, { HotkeyAction } from '@/service/hotkeys-manager';
import { useEffect, useRef, useState } from 'react';
import { isDifferent } from '@/util';

export default function useHotkeysDict(hotkeyActions: HotkeyAction[]) {
  const [hotkeyDict, setHotkeyDict] = useState<Record<string, HotkeyAction>>(null);
  const hotkeyActionsRef = useRef<HotkeyAction[]>([]);

  async function generateHotkeyDict() {
    await HotkeysManager.init();
    setHotkeyDict(
      Object.fromEntries(
        hotkeyActions.map(action => {
          const hotkey = HotkeysManager.fetchHotkey(action);
          return [HotkeysManager.generateHotkeysForListener(hotkey), action];
        })
      )
    );
  }

  useEffect(() => {
    if (hotkeyActions && isDifferent(hotkeyActions, hotkeyActionsRef.current)) {
      hotkeyActionsRef.current = hotkeyActions;
      generateHotkeyDict().then();
    }
  }, [hotkeyActions]);

  return hotkeyDict;
}
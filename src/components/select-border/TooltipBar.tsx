import { FavoriteLine, Order } from '@/components/icon';
import { MouseEvent, useCallback, useContext } from 'react';
import { DSLStoreContext, IframeCommunicationContext } from '@/hooks/context';
import { IframeCommunicationServiceType } from '@/service/iframe-communication';

import styles from './TooltipBar.module.less';

export interface TooltipBarProps {
  position: 'top' | 'bottom';
}

export const TooltipBar = ({ position }: TooltipBarProps) => {
  const iframeCommunication = useContext(IframeCommunicationContext);
  const dslStore = useContext(DSLStoreContext);

  const handlerOpenReplaceModal = useCallback((ev: React.PointerEvent) => {
    ev.stopPropagation();
    ev.preventDefault();
    iframeCommunication.sendMessageToParent({
      type: IframeCommunicationServiceType.EXECUTE_EDITOR_STORE_METHOD,
      payload: {
        method: 'showReplaceModal',
        params: [dslStore.selectedComponent?.id],
      }
    });
  }, []);

  const selectedParentId = dslStore.dsl.componentIndexes[dslStore.selectedComponent?.id]?.parentId;

  function handleSavingFavorite(e: MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    iframeCommunication.sendMessageToParent({
      type: IframeCommunicationServiceType.SAVE_FAVORITE,
      payload: {
        componentId: dslStore?.selectedComponent?.id,
        type: 'component',
      }
    });
  }

  return (
    <div
      className={styles.container}
      style={{ top: position === 'top' ? 'calc(100% + 6px)' : 'calc(var(--height) * -1 - 6px)' }}
    >
      <FavoriteLine onPointerDown={handleSavingFavorite}/>
      <Order
        style={{ transform: 'rotate(90deg)', opacity: selectedParentId ? 1 : 0.3 }}
        onPointerDown={selectedParentId && handlerOpenReplaceModal}
      />
    </div>
  );
};

TooltipBar.displayName = 'TooltipBar';

import { DesignMode } from '@/service/editor-store';
import { useContext } from 'react';
import { EditorStoreContext } from '@/hooks/context';

/**
 * 当处于回滚模式时，渲染 renderWithRollbackMode, 否则渲染 children
 */
export function RenderWithoutRollbackMode({
  children,
  renderWithRollbackMode = null
}: {
  children?: React.ReactNode;
  renderWithRollbackMode?: React.ReactNode;
}) {
  const editorStore = useContext(EditorStoreContext);
  if (editorStore.mode === DesignMode.rollback) {
    return renderWithRollbackMode;
  }
  return children;
}

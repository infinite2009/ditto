import React, { CSSProperties, MouseEvent, useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import classnames from 'classnames';
import { nanoid } from 'nanoid';
import { observer } from 'mobx-react';
import ComponentFeature from '@/types/component-feature';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import { camelToHyphen } from '@/util';

import { DesignMode } from '@/service/editor-store';
import styles from './index.module.less';
import { TooltipBar } from '../select-border/TooltipBar';

export interface VoltronAttributes {
  voltronComponent: string;
  voltronDirection: string;
  voltronDroppable: boolean;
  voltronFeature: string;
  voltronId: string;
  voltronIsLayer: boolean;
}

function VoltronAttributeContainer({ voltronAttributes, componentProps, children }: any) {
  const dslStore = useContext(DSLStoreContext);
  const editorStore = useContext(EditorStoreContext);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const tooltipBarPosition = useTooltipBarPosition(wrapperRef, voltronAttributes.voltronId);

  const voltronDataset = useMemo(() => {
    return Object.entries(voltronAttributes).reduce((prev, cur) => {
      prev[`data-${camelToHyphen(cur[0])}`] = cur[1];
      return prev;
    }, {}) as VoltronAttributes;
  }, [voltronAttributes]);

  useLayoutEffect(() => {
    if (wrapperRef.current) {
      const node = wrapperRef.current.firstChild as HTMLElement;
      // 给每一个组件内部的顶层节点都加上 voltron attributes，无论用户选中哪一个，都能选中组件
      // 对于不在组件树内渲染的组件，例如 Modal、Drawer、固钉等，以下逻辑无效
      if (node) {
        Object.entries(voltronAttributes).forEach(([key, value]) => {
          node.dataset[key] = value as string;
        });
      }
    }
  }, []);

  const propsWithoutStyle = useMemo(() => {
    const result = { ...componentProps };
    delete result.style;
    return result;
  }, [componentProps]);

  const wrapperStyle = useMemo(() => {
    const result = { ...(componentProps?.style || {}) };
    delete result.padding;
    delete result.paddingTop;
    delete result.paddingRight;
    delete result.paddingBottom;
    delete result.paddingLeft;
    if (voltronAttributes.voltronFeature === ComponentFeature.root) {
      result.flexGrow = 1;
    }
    return result;
  }, [componentProps?.style]);

  const componentStyle = useMemo(() => {
    const result: CSSProperties = {
      ...(componentProps?.style || {}),
      minWidth: '100%',
      minHeight: '100%',
      boxSizing: 'border-box'
    };
    return result;
  }, [componentProps?.style]);

  useCallback(() => {
    return {
      items: [
        {
          label: '选择父组件',
          key: '1',
          children: [
            {
              label: '节点1',
              key: nanoid()
            },
            {
              label: '节点2',
              key: nanoid()
            }
          ]
        },
        {
          type: 'divider' as 'group'
        },
        {
          label: '复制',
          key: '2'
        },
        {
          label: '删除',
          key: '3'
        },
        {
          label: '隐藏',
          key: '4'
        },
        {
          type: 'divider' as 'group'
        },
        {
          label: '替换为业务组件',
          key: '5'
        }
      ]
    };
  }, []);

  function handleSelectingComponent(e: MouseEvent) {
    e.stopPropagation();
    if (e.button !== 0) {
      return;
    }
    dslStore.selectComponent(voltronAttributes.voltronId);
  }

  if (editorStore.mode === DesignMode.preview) {
    return React.cloneElement(children, componentProps);
  }

  if (voltronAttributes.voltronFeature === ComponentFeature.transparent) {
    return React.cloneElement(children, componentProps);
  }

  return (
    <div
      ref={wrapperRef}
      className={classnames({
        [styles.voltronAttributeWrapper]: true,
        [styles.selected]: dslStore?.selectedComponent?.id === voltronAttributes.voltronId
      })}
      style={wrapperStyle}
      onClick={handleSelectingComponent}
    >
      {/* Danger: 该子元素必须放在最前面！ */}
      {React.cloneElement(children, { ...propsWithoutStyle, style: componentStyle, ...voltronDataset })}
      <div
        className={styles.mask}
        {...voltronDataset}
        style={{ pointerEvents: voltronAttributes?.voltronFeature === ComponentFeature.solid ? 'initial' : 'none' }}
      />
      {dslStore?.selectedComponent?.id === voltronAttributes.voltronId ? (
        <TooltipBar position={tooltipBarPosition} />
      ) : null}
    </div>
  );
}

function useTooltipBarPosition(ref: React.MutableRefObject<HTMLDivElement>, voltronId: string) {
  const dslStore = useContext(DSLStoreContext);
  const selected = dslStore?.selectedComponent?.id === voltronId;
  return useMemo(() => {
    if (ref.current && selected) {
      const rect = ref.current.getBoundingClientRect();
      return (rect.height / 2 + rect.y) / window.innerHeight > 0.5 ? 'bottom' : 'top';
    }
    return null;
  }, [ref.current, selected]);
}

VoltronAttributeContainer.displayName = 'VoltronAttributeContainer';

export default observer(VoltronAttributeContainer);

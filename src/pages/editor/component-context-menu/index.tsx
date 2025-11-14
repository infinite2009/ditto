import { Dropdown } from 'antd';
import React, { CSSProperties, ReactNode } from 'react';
import { observer } from 'mobx-react';
import styles from './index.module.less';

export interface IComponentContextMenuProps {
  children: React.ReactNode;
  data?: any;
  items: {
    key: string;
    title: string;
    shortKey?: string[];
    style?: CSSProperties;
  }[][];
  onClick: (key: string, data: any, keyPath: string[]) => void;
  onOpenChange?: (open: boolean, data: any) => void;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
  [key: string]: any;
}

export default observer(function ComponentContextMenu({
  data,
  items,
  onClick,
  children,
  onOpenChange,
  trigger,
  ...otherProps
}: IComponentContextMenuProps) {
  const generateDropDownMenu = () => {
    let flattedItems: any[] = [];
    items?.forEach((item, index) => {
      flattedItems = flattedItems.concat(...item);
      if (index !== items.length - 1) {
        flattedItems.push({
          type: 'divider' as 'group'
        });
      }
    });

    return {
      items: flattedItems.map(({ key, title, style, children, shortKey, type }) => {
        if (type === 'divider') {
          return {
            type: 'divider' as 'group'
          };
        }
        const item: { key: string; label: ReactNode; children?: any[] } = {
          key,
          label: (
            <div className={styles.dropDownItem}>
              <span style={style}>{title}</span>
              {/*<span className={styles.shortcut}>{shortKey?.join(' ')}</span>*/}
            </div>
          )
        };
        if (children?.length) {
          item.label = <span className={styles.dropDownItemTitle}>{title}</span>;
          item.children = children.map((child: { key: any; title: string; shortKey: string[]; style?: CSSProperties }) => {
            return {
              key: child.key,
              label: (
                <div className={styles.dropDownChildrenItem}>
                  <span style={child.style}>{child.title}</span>
                  {/*<span className={styles.shortcut}>{child.shortKey?.join(' ')}</span>*/}
                </div>
              )
            };
          });
        }
        return item;
      }),
      onClick: ({ key, domEvent, keyPath }: { key: string; domEvent: any; keyPath: string[] }) => {
        domEvent.stopPropagation();
        if (onClick) {
          onClick(key, data, keyPath);
        }
      }
    };
  };

  return (
    <Dropdown
      menu={generateDropDownMenu()}
      overlayClassName={styles.dropdownContainer}
      destroyOnHidden
      onOpenChange={(open: boolean) => onOpenChange && onOpenChange(open, data)}
      trigger={trigger || ['contextMenu']}
      {...otherProps}
    >
      {children}
    </Dropdown>
  );
});

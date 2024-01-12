import { Dropdown } from 'antd';
import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import styles from './index.module.less';

export interface IComponentContextMenuProps {
  data?: any;
  items: {
    key: string;
    title: string;
    shortKey?: string[];
  }[][];
  onClick: (key: string, data: any) => void;
  children: React.ReactNode;
  onOpenChange?: (open: boolean, data: any) => void;
  trigger?: ('click' | 'hover' | 'contextMenu')[];
}

export default observer(function ComponentContextMenu({
  data,
  items,
  onClick,
  children,
  onOpenChange,
  trigger
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
      items: flattedItems.map(({ key, title, children, shortKey, type }) => {
        if (type === 'divider') {
          return {
            type: 'divider' as 'group'
          };
        }
        const item: { key: string; label: ReactNode; children?: any[] } = {
          key,
          label: (
            <div className={styles.dropDownItem}>
              <span>{title}</span>
              <span className={styles.shortKey}>{shortKey?.join(' ')}</span>
            </div>
          )
        };
        if (children?.length) {
          item.label = <span className={styles.dropDownItemTitle}>{title}</span>;
          item.children = children.map((child: { key: any; title: string; shortKey: string[] }) => {
            return {
              key: child.key,
              label: (
                <div className={styles.dropDownChildrenItem}>
                  <span>{child.title}</span>
                  <span className={styles.shortKey}>{child.shortKey?.join(' ')}</span>
                </div>
              )
            };
          });
        }
        return item;
      }),
      onClick: ({ key, domEvent }: { key: string; domEvent: any }) => {
        domEvent.stopPropagation();
        if (onClick) {
          onClick(key, data);
        }
      }
    };
  };

  return (
    <Dropdown
      menu={generateDropDownMenu()}
      overlayClassName={styles.dropdownContainer}
      destroyPopupOnHide
      onOpenChange={(open: boolean) => onOpenChange && onOpenChange(open, data)}
      trigger={trigger || ['contextMenu']}
    >
      {children}
    </Dropdown>
  );
});

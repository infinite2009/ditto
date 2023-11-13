import { observer } from 'mobx-react';
import { Dropdown } from 'antd';
import styles from './index.module.less';
import React from 'react';

export interface IComponentContextMenuProps {
  data: any;
  items: {
    key: string;
    title: string;
    shortKey: string[];
  }[][];
  onClick: (key: string, data: any) => void;
  children: React.ReactNode;
}

export default observer(function ComponentContextMenu({ data, items, onClick, children }: IComponentContextMenuProps) {
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
      items: flattedItems.map(({ key, title, shortKey, type }) => {
        if (type === 'divider') {
          return {
            type: 'divider' as 'group'
          };
        }
        return {
          key,
          label: (
            <div className={styles.dropDownItem}>
              <span>{title}</span>
              <span className={styles.shortKey}>{shortKey?.join(' ')}</span>
            </div>
          )
        };
      }),
      onClick: ({ key }: { key: string }) => onClick && onClick(key, data)
    };
  };

  return (
    <Dropdown
      menu={generateDropDownMenu()}
      overlayClassName={styles.dropdownContainer}
      destroyPopupOnHide
      trigger={['contextMenu']}
    >
      {children}
    </Dropdown>
  );
});

import styles from './index.module.less';
import ComponentContextMenu from '@/pages/editor/component-context-menu';
import React, { useContext, useState } from 'react';
import { Scene } from '@/service/app-store';
import { AppStoreContext, EditorStoreContext } from '@/hooks/context';
import PageAction from '@/types/page-action';
import ROUTE_NAMES from '@/enum';
import { useNavigate } from 'react-router-dom';
import { Expand } from '@/components/icon';
import classnames from 'classnames';
import { Tooltip } from 'antd';

export interface HomeMenuProps {
  onDo?: (data: { type: PageAction }) => void;
}

export default function HomeMenu({ onDo }: HomeMenuProps) {
  const appStore = useContext(AppStoreContext);
  const editorStore = useContext(EditorStoreContext);
  
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  function handleGoingHome() {
    navigate(ROUTE_NAMES.PROJECT_MANAGEMENT);
  }

  function handleSave() {
    if (onDo) {
      onDo({
        type: PageAction.saveFile
      });
    }
  }

  function handleCopyComponentSource() {
    if (onDo) {
      onDo({
        type: PageAction.copyComponentSource
      });
    }
  }

  function handleCopyFullSource() {
    if (onDo) {
      onDo({
        type: PageAction.copyFullSource
      });
    }
  }

  function handleCopyCustomSource() {
    if (onDo) {
      onDo({
        type: PageAction.copyCustomSource
      });
    }
  }

  function handleEditDSL() {
    if (onDo) {
      onDo({
        type: PageAction.editDSL
      });
    }
  }

  function handleRollbackDSL() {
    if (onDo) {
      onDo({
        type: PageAction.rollbackDSL
      });
    }
  }

  function openVariableConfigModal() {
    editorStore.openVariableConfig();
  }

  function openActionConfig() {
    editorStore.openActionConfig();
  }

  function handleClickingMenu(key: string) {
    switch (key) {
      case 'save':
        handleSave();
        break;
      case 'copyComponentSource':
        handleCopyComponentSource();
        break;
      case 'copyFullSource':
        handleCopyFullSource();
        break;
      case 'copyCustomSource':
        handleCopyCustomSource();
        break;
      case 'editDSL':
        handleEditDSL();
        break;
      case 'rollbackDSL':
        handleRollbackDSL();
        break;
      case 'variableConfig':
        openVariableConfigModal();
        break;
      case 'actionConfig':
        openActionConfig();
      default:
        break;
    }
  }

  function generateContextMenus() {
    const { save, editDSL, rollbackDSL, variableConfig, actionConfig, copySource, copyFullSource, copyComponentSource, copyCustomSource } =
      appStore.shortKeyDict[Scene.editor];
    return [
      [
        {
          key: 'save',
          title: save.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'save')]
        },
        // {
        //   type: 'divider',
        // },
        {
          key: 'copySource',
          title: copySource.functionName,
          children: [
            {
              key: 'copyFullSource',
              title: copyFullSource.functionName,
              shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'copyFullSource')]
            },
            {
              key: 'copyComponentSource',
              title: copyComponentSource.functionName,
              shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'copyComponentSource')]
            },
            {
              key: 'copyCustomSource',
              title: copyCustomSource.functionName,
              shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'copyCustomSource')]
            }
          ]
        },
        {
          key: 'editDSL',
          title: editDSL.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'editDSL')]
        },
        {
          key: 'rollbackDSL',
          title: rollbackDSL.functionName,
          shortKey: [appStore.generateShortKeyDisplayName(Scene.editor, 'rollbackDSL')]
        },
        {
          key: 'variableConfig',
          title: variableConfig.functionName,
          shortKey: []
        },
        {
          key: 'actionConfig',
          title: actionConfig.functionName,
          shortKey: []
        }
      ]
    ];
  }

  function handleOpenChange(open: boolean) {
    console.log('open: ', open);
    setMenuOpen(open);
  }

  return (
    <div className={styles.homeMenu}>
      <Tooltip title="返回项目管理" placement="bottom">
        <div className={styles.logo} onClick={handleGoingHome} />
      </Tooltip>
      <ComponentContextMenu
        trigger={['click']}
        onClick={handleClickingMenu}
        items={generateContextMenus()}
        onOpenChange={handleOpenChange}
      >
        <Expand className={classnames({ [styles.icon]: true, [styles.expanded]: menuOpen })} />
      </ComponentContextMenu>
    </div>
  );
}

HomeMenu.display = 'HomeMenu';

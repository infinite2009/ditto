import { observer } from 'mobx-react';
import {
  Emoji,
  EmojiCircleFilled,
  FavoriteFilled,
  FavoriteLine,
  Image,
  ImageFilled,
  Link,
  PlayList,
  PlayListFilled,
  TemplateFilled,
  TemplateLine
} from '@/components/icon';

import styles from './index.module.less';
import { message, Tooltip } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import ComponentPanel from '@/pages/editor/component-panel';
import FavoritePanel from '@/pages/editor/favorite-panel';
import NewFileManager from '@/service/new-file-manager';
import IPageSchema from '@/types/page.schema';
import TemplateListModal from '@/pages/designer/components/template-list-modal';

enum SectionType {
  component = 'component',
  favorite = 'favorite',
  template = 'template',
  icon = 'icon',
  image = 'image',
  replacement = 'replacement'
}

function VerticalToolbar() {
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);

  const [selectedSectionType, setSelectedSectionType] = useState<SectionType>(null);

  useEffect(() => {
    if ([SectionType.icon, SectionType.image, SectionType.replacement].includes(selectedSectionType)) {
      message.warning('敬请期待').then();
    }
  }, [selectedSectionType]);

  const handleClickIcon = (sectionType: SectionType) => {
    if (sectionType === selectedSectionType) {
      setSelectedSectionType(null);
    } else {
      setSelectedSectionType(sectionType);
    }
  };

  const verticalToolbar = useMemo(() => {
    const data = [
      { title: '组件', type: SectionType.component, iconComponent: PlayList, activeComponent: PlayListFilled},
      { title: '收藏', type: SectionType.favorite, iconComponent: FavoriteLine, activeComponent: FavoriteFilled },
      { title: '模板', type: SectionType.template, iconComponent: TemplateLine, activeComponent: TemplateFilled },
      { title: '图标', type: SectionType.icon, iconComponent: Emoji, activeComponent: EmojiCircleFilled },
      { title: '图片', type: SectionType.image, iconComponent: Image, activeComponent: ImageFilled },
      {
        title: '替换组件',
        type: SectionType.replacement,
        tpl: (
          <div className={styles.linkWrapper}>
            <Link className={styles.icon} onClick={() => handleClickIcon(SectionType.replacement)} />
          </div>
        )
      }
    ];
    const tpl = data.map(item => {
      const IconComponent = item.iconComponent;
      const ActiveComponent = item.activeComponent;
      let innerTpl = null;
      if (item.type === selectedSectionType && ActiveComponent) {
        innerTpl = <ActiveComponent className={styles.icon} onClick={() => handleClickIcon(item.type)} />;
      } else if (IconComponent) {
        innerTpl = <IconComponent className={styles.icon} onClick={() => handleClickIcon(item.type)} />;
      } else {
        innerTpl = item.tpl;
      }

      return (
        <Tooltip key={item.type} mouseEnterDelay={0.5} title={item.title}>
          {innerTpl}
        </Tooltip>
      );
    });
    return <>{tpl}</>;
  }, [selectedSectionType]);

  const sectionContent = useMemo(() => {
    return (
      <>
        <div
          className={styles.contentContainer}
          style={SectionType.component === selectedSectionType && !editorStore?.componentDraggingInfo?.isMoving ? undefined : {width: 0}}
        >
          <ComponentPanel/>
        </div>
        <div
          className={styles.contentContainer}
          style={SectionType.favorite === selectedSectionType && !editorStore?.componentDraggingInfo?.isMoving ? undefined : {width: 0}}
        >
          <FavoritePanel/>
        </div>
        <TemplateListModal open={selectedSectionType === SectionType.template} onApplyTemplate={handleApplyTemplate} onClose={handleCloseTemplateListModal} />
        {/*{ SectionType.image === selectedSectionType ? <Modal open={replacementModalOpen}></Modal> : null }*/}
        {/*<ReplacementConfigModal open={selectedSectionType === SectionType.replacement} onClose={handleCloseReplacementConfig} />*/}
      </>
    );
  }, [selectedSectionType, editorStore?.componentDraggingInfo?.isMoving]);
  
  // function handleCloseReplacementConfig() {
  //   setSelectedSectionType(null);
  // }

  async function handleApplyTemplate(templateUrl: string) {
    const dsl = await NewFileManager.fetchDSL(templateUrl);
    dslStore.initDSLFromTemplate(dsl as unknown as IPageSchema);
  }

  function handleCloseTemplateListModal() {
    setSelectedSectionType(null);
  }

  return (
    <div className={styles.verticalToolbar}>
      <div className={styles.verticalToolbarContainer}>{verticalToolbar}</div>
      {sectionContent}
    </div>
  );
}

VerticalToolbar.displayName = 'VerticalToolbar';

export default observer(VerticalToolbar);

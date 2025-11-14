import { Input } from '@bilibili/voltron-design';
import { useRef } from 'react';
import { fetchMaterialData } from '../services/fetchMaterialData';
import { useAdminPageStore } from '../store/store';

export function MaterialSearchInput() {
  const isCompositionRef = useRef(false);
  const handler = (ev: React.ChangeEvent<HTMLInputElement> | React.CompositionEvent<HTMLInputElement>) => {
    if (ev.type === 'compositionstart') {
      isCompositionRef.current = true;
    }

    if (ev.type === 'compositionend') {
      isCompositionRef.current = false;
    }

    if ((ev.type === 'change' || ev.type === 'compositionend') && !isCompositionRef.current) {
      const keyword = (ev.target as HTMLInputElement).value.trim();
      useAdminPageStore.getState().setSearchKeyword(keyword);
      useAdminPageStore.getState().setMaterialTableCurrentPage(1);
      fetchMaterialData();
    }
  };

  return (
    <div className="max-w-[220px]">
      <Input
        placeholder="搜索组件名/调用名"
        onChange={handler}
        onCompositionStart={handler}
        onCompositionEnd={handler}
      />
    </div>
  );
}

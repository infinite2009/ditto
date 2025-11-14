import React from 'react';
import { ExpandThin, Clear } from '../icon';

export const FoldPanel = React.forwardRef(function FoldPanelInner(
  props: React.PropsWithChildren<{
    title: string;
    desc: string;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    onRemove: () => void;
  }>,
  ref: React.Ref<HTMLDivElement>
) {
  const { title, desc, children, visible, setVisible, onRemove } = props;
  return (
    <div className="bg-bg-bright rounded-md flex-1" ref={ref}>
      <FoldPanelHeader title={title} desc={desc} visible={visible} setVisible={setVisible} onRemove={onRemove} />
      {visible && children}
    </div>
  );
});

function FoldPanelHeader({
  title,
  desc,
  visible,
  setVisible,
  onRemove
}: {
  title: string;
  desc: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center p-12 min-h-20 user-select-none justify-between">
      <div className="select-none" onClick={() => setVisible(!visible)}>
        <ExpandThin
          style={{
            transform: visible ? 'rotate(180deg)' : 'rotate(-90deg)',
            marginLeft: -1
          }}
          size={16}
        />
        <span className="font-medium text-13 leading-20 letter-spacing-0 text-right text-symbol-black">{title}</span>
        <span className="font-normal text-12 leading-16 text-symbol-medium pl-4">{desc}</span>
      </div>
      <Clear className="text-[24px] text-red-600 cursor-pointer" onClick={onRemove} />
    </div>
  );
}

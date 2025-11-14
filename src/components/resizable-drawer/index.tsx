import { Drawer } from 'antd';
import { DrawerProps } from 'antd/lib';
import { CSSProperties, PropsWithChildren, useState } from 'react';
import { Resizable, ResizableProps } from 'react-resizable';
import './index.less';

export type ResizableDrawerProps = PropsWithChildren & DrawerProps & { resize?: ResizableProps; minWidth?: number };

const height = window.innerHeight;

const renderResizeHandle: ResizableProps['handle'] = ((resizeHandle, ref) => {
  const styles: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "3px",
    height: "100%",
    cursor: "col-resize",
    boxSizing: "border-box",
    zIndex: 100001,
    userSelect: "none",
    background: "#1A4BFF",
  };
  return (
    <div
      ref={ref}
      style={styles}
      className={`resizable-handle handle-${resizeHandle}`}
    ></div>
  );
});


const ResizableDrawer: React.FC<ResizableDrawerProps> = props => {
  const { children, resize, minWidth = 300, ...rest } = props;

  const [width, setWidth] = useState(minWidth);
  const [drawerRootClassName, setDrawerRootClassName] = useState<string>();

  const onResize: ResizableProps['onResize'] = (e, data) => {
    const { size } = data;
    setWidth(size.width);
  };

  const afterOpenChange: DrawerProps['afterOpenChange'] = (isOpen) => {
    if (isOpen) {
      setDrawerRootClassName('resizable-drawer');
    } else {
      setDrawerRootClassName(undefined);
    }
  };

  return (
    <Resizable
      className='hover-handles'
      onResize={onResize}
      width={width}
      height={height}
      handle={renderResizeHandle}
      axis="x"
      resizeHandles={['e', 'w']}
      minConstraints={[minWidth, height]}
      {...resize}
    >
      <Drawer rootClassName={drawerRootClassName} width={width} {...rest} afterOpenChange={afterOpenChange}>
        {children}
      </Drawer>
    </Resizable>
  );
};

export default ResizableDrawer;

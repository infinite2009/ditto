import ReactDOM from 'react-dom';
import { Modal, ModalProps } from '@bilibili/voltron-design';

export function VoltronModalWithPortal(props: React.PropsWithChildren<ModalProps>) {
  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center top-0 left-0 h-screen w-screen bg-black/20">
      <Modal {...props}>{props.children}</Modal>
    </div>,
    document.body
  );
}

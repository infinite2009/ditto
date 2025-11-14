import { isString } from 'lodash';
import { cloneElement, PropsWithChildren, useRef, useState } from 'react';

interface EditableWrapperProps {
  onOK?: (newVal: string) => void;
}
const EditableWrapper: React.FC<PropsWithChildren<EditableWrapperProps>> = ({ children, onOK }) => {
  const [isEditing, setIsEditing] = useState(false);
  const onDoubleClick = e => {
    setIsEditing(true);
  };

  const onBlur = e => {
    onOK?.(e.target.innerText);
    setIsEditing(false);
  };

  return children;
  // return cloneElement(<span>{children}</span>, { onDoubleClick, onBlur, contentEditable: isEditing });
};
export default EditableWrapper;

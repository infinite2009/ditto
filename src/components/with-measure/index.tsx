import React, { forwardRef } from 'react';

export default function withRootRef(WrappedComponent) {
  const coreComponent = (props: any, ref) => {
    const { children, ...rest } = props;

    // 确保只有一个子元素
    const child = React.Children.only(children);

    // 合并原有ref和我们传入的ref
    const mergedRef = node => {
      // 调用原有ref（如果有）
      if (typeof child.ref === 'function') {
        child.ref(node);
      } else if (child.ref) {
        child.ref.current = node;
      }

      // 调用我们传入的ref
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return <WrappedComponent {...rest}>{React.cloneElement(child, { ref: mergedRef })}</WrappedComponent>;
  };

  coreComponent.displayName = `withRootRef<${WrappedComponent.displayName}>`;

  return forwardRef(coreComponent);
}

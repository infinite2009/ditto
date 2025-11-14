import { MinusOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { Input, InputProps, InputRef, Tooltip } from 'antd';
import { BasicDataNode, DataNode } from 'antd/es/tree';
import { nanoid } from 'nanoid';
import { useEffect, useRef, useState } from 'react';
import { Key } from '.';
import FormInput, { IFormInputProps } from '@/pages/editor/form-panel/basic-form/form-input';

type TitleProps<TreeDataType extends BasicDataNode = DataNode> = {
  nodeData: TreeDataType;
  fieldKey: string;
  fieldTitle: string;
  autoFocus?: boolean;
  styles?: {
    input?: React.CSSProperties;
  };
  renderExtra?: (
    data: TreeDataType,
    actions: { updateNode: (data: Record<string, unknown>) => void }
  ) => React.ReactNode;
  renderExtraAction?: (data: TreeDataType) => React.ReactNode;
  addChild: (data?: Record<string, unknown>) => void;
  updateNode: (data: Record<string, unknown>) => void;
  removeNode: () => void;
};

const Title = <TreeDataType extends BasicDataNode = BasicDataNode>({
  nodeData,
  fieldTitle,
  fieldKey,
  autoFocus = false,
  styles = {},
  renderExtra,
  renderExtraAction,
  addChild,
  updateNode,
  removeNode
}: TitleProps<TreeDataType>) => {
  const [label, setLabel] = useState(nodeData[fieldTitle]);

  // const inputRef = useRef<InputRef>();

  const onChange: IFormInputProps['onChange'] = value => {
    setLabel(value);
    updateNode({ [fieldTitle]: value });
  };

  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <FormInput
        style={{
          minWidth: 120,
          ...styles?.input
        }}
        value={label}
        onChange={onChange}
        autoFocus={autoFocus}
        placeholder="title"
        suffix={
          <>
            <Tooltip title="创建子节点">
              <PlusOutlined onClick={() => addChild({[fieldTitle]: ''})} />
            </Tooltip>
            <Tooltip title="删除节点">
              <MinusOutlined onClick={() => removeNode()}></MinusOutlined>
            </Tooltip>
            {renderExtraAction?.(nodeData)}
          </>
        }
      ></FormInput>
      {renderExtra?.(nodeData, { updateNode })}
    </div>
  );
};

export default Title;

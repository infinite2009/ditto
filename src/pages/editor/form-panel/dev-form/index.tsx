import { Button, Input, Space, Drawer } from 'antd';
import { DeleteOutlined, PlusOutlined, ExpandOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import './DevForm.css';
import { KeyCode } from 'monaco-editor';

interface PropsItem {
  id: string;
  key: string;
  value: string;
}

interface DevFormProps {
  value: PropsItem[];
  onChange: (value: PropsItem[]) => void;
  onAdd: (value: string) => void;
  onDelete: (id: string) => void;
}

function PropsItemEditor({
  item,
  onChange,
  onDelete,
  showDrawer
}: {
  item: PropsItem;
  onChange: (item: PropsItem) => void;
  onDelete: (id: string) => void;
  showDrawer: (id: string) => void;
}) {
  const [validationMessage, setValidationMessage] = useState('');
  const handleEnter = (newValue: string, target: HTMLInputElement) => {
    try {
      onChange({ ...item, value: JSON.parse(newValue) });
      setValidationMessage('');
      target.blur();
    } catch (error) {
      setValidationMessage('请输入正确的 JSON 字面量');
    }
  };

  const [inputValue, setInputValue] = useState(JSON.stringify(item.value));

  useEffect(() => {
    setInputValue(JSON.stringify(item.value));
  }, [item.value]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Input
          className="hover-input"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onPressEnter={e => handleEnter(inputValue, e.target as HTMLInputElement)}
          addonBefore={`${item.key}:`}
          suffix={
            <ExpandOutlined
              onClick={ev => {
                ev.stopPropagation();
                showDrawer(item.id);
              }}
              className="expand-icon"
            />
          }
        />
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(item.id)}
          style={{ flexShrink: 0 }}
        />
      </div>
      {validationMessage ? (
        <div
          style={{
            color: validationMessage === 'Valid JSON' ? 'green' : 'red'
          }}
        >
          {validationMessage}
        </div>
      ) : null}
    </div>
  );
}

export function DevForm({ value, onChange, onAdd, onDelete }: DevFormProps) {
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [tempValue, setTempValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const prevValueLength = useRef(value.length);

  const showDrawer = (id: string) => {
    setCurrentId(id);
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
  };

  const handleOk = (newValue: string) => {
    try {
      onChange(value.map(j => (j.id === currentId ? { ...j, value: JSON.parse(newValue) } : j)));
    } catch (error) {
      alert('请输入正确的 JSON 字面量');
    }
  };

  const handleOkAndClose = (newValue: string) => {
    try {
      onChange(value.map(j => (j.id === currentId ? { ...j, value: JSON.parse(newValue) } : j)));
      setIsDrawerVisible(false);
    } catch (error) {
      alert('请输入正确的 JSON 字面量');
    }
  };

  const handleAdd = () => {
    if (tempValue.trim()) {
      onAdd(tempValue);
      setTempValue('');
      setIsAdding(false);
    }
  };

  useEffect(() => {
    if (value.length > prevValueLength.current) {
      const inputs = document.querySelectorAll('.hover-input input');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      lastInput?.focus();
    }
    prevValueLength.current = value.length;
  }, [value]);

  const initialValue = JSON.stringify(value.find(j => j.id === currentId)?.value, null, 2);

  const [code, setCode] = useState(initialValue);

  useEffect(() => {
    setCode(initialValue);
  }, [initialValue]);

  return (
    <Space direction="vertical" style={{ width: '100%', padding: '16px' }}>
      {value.map(i => (
        <PropsItemEditor
          key={i.id}
          item={i}
          onChange={item => onChange(value.map(j => (j.id === i.id ? item : j)))}
          onDelete={() => onDelete(i.id)}
          showDrawer={showDrawer}
        />
      ))}
      {isAdding ? (
        <Input
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          onPressEnter={handleAdd}
          onBlur={() => setIsAdding(false)}
          placeholder="输入新值并按回车"
          autoFocus
        />
      ) : (
        <Button type="dashed" block icon={<PlusOutlined />} onClick={() => setIsAdding(true)}>
          新增一行
        </Button>
      )}
      <Drawer
        title="编辑属性值 (键入 ⌘+Enter 以提交)"
        placement="right"
        onClose={handleDrawerClose}
        open={isDrawerVisible}
        width={600}
        extra={
          <Space>
            <Button type="primary" onClick={() => handleOk(code)}>
              提交
            </Button>
            <Button type="primary" onClick={() => handleOkAndClose(code)}>
              提交并关闭
            </Button>
          </Space>
        }
      >
        <Editor width={600} language="json" value={code} onChange={value => setCode(value)} />
      </Drawer>
    </Space>
  );
}

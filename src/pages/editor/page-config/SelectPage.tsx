import { EditorStoreContext } from '@/hooks/context';
import NewFileManager from '@/service/new-file-manager';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Input, InputRef, Select, SelectProps, Space } from 'antd';
import { observer } from 'mobx-react';
import { useContext, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type SelectPageProps = {
  value?: string;
  onChange?: (value: string) => void;
} & Omit<SelectProps, 'onChange'>;

export default observer(function SelectPage(props: SelectPageProps) {
  const { ...rest } = props;
  const [pageName, setPageName] = useState<string>();
  const inputRef = useRef<InputRef>(null);
  const [searchParams] = useSearchParams();

  const editorStore = useContext(EditorStoreContext);

  const pageOptions = useMemo(() => {
    return editorStore.pageList.map(i => ({
      ...i,
      label: i.name,
      value: i.id
    }));
  }, [editorStore.pageList]);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageName(e.target.value);
  };

  const addItem = async (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.stopPropagation();
    await NewFileManager.createPage(searchParams.get('projectId'), undefined, pageName);
    editorStore.fetchPageList();
    setPageName('');
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };
  return (
    <Select
      {...rest}
      options={pageOptions}
      popupMatchSelectWidth={false}
      popupRender={menu => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ padding: '0 8px 4px' }} direction="vertical">
            <Input
              placeholder="输入页面名"
              value={pageName}
              ref={inputRef}
              onChange={onNameChange}
              onKeyDown={e => {
                e.stopPropagation();
              }}
            ></Input>
            <Button size="small" type="text" icon={<PlusOutlined />} onClick={addItem}>
              添加页面
            </Button>
          </Space>
        </>
      )}
    ></Select>
  );
});


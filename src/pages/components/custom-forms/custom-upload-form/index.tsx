import { ICustomFormProps } from '@/types';
import { useForm, useWatch } from 'antd/es/form/Form';
import { Form, Select, Switch } from 'antd';
import styles from './index.module.less';
import { fileTypes } from './fileType';
import { useContext } from 'react';
import { DSLStoreContext } from '@/hooks/context';

export default function CustomUploadForm({ onChange }: ICustomFormProps) {
  const [form] = useForm();
  const isAllAccept = useWatch('checked', form);
  const dslStore = useContext(DSLStoreContext);

  const component = dslStore.selectedComponent;
  const { fileList, accept, editable } = dslStore.dsl.props[component?.id] || [];

  /**
   * 文件类型
   */
  function renderAcceptSelect() {
    return (
      <div className={styles.operationItem}>
        <div className={styles.operationItemContent}>
          <Form.Item name="checked">
            <Switch checkedChildren="全部类型" unCheckedChildren="自定义类型" defaultChecked />
          </Form.Item>
          {!isAllAccept && (
            <Form.Item name="accept" label="数据类型">
              <Select
                value={accept?.value?.split(',')}
                mode="tags"
                options={[
                  { label: '.txt', value: fileTypes['.txt'] },
                  { label: '.doc', value: fileTypes['.doc'] },
                  { label: '.docx', value: fileTypes['.docx'] },
                  { label: '.pdf', value: fileTypes['.pdf'] },
                  { label: '.svg', value: fileTypes['.svg'] },
                  { label: '.png', value: fileTypes['.png'] },
                  { label: '.imag', value: fileTypes['.imag'] },
                  { label: '.xls', value: fileTypes['.xls'] },
                  { label: '.xlsx', value: fileTypes['.xlsx'] },
                  { label: '.mp3', value: fileTypes['.mp3'] },
                  { label: '.mp4', value: fileTypes['.mp4'] },
                  { label: '.mov', value: fileTypes['.mov'] }
                ]}
              />
            </Form.Item>
          )}
        </div>
      </div>
    );
  }

  function handleChangingValues(changedValues) {
    
    if (changedValues.fileList) {
      onChange({
        fileList: changedValues.fileList
      });
    }
    if (changedValues.checked) {
      onChange({
        accept: '*'
      });
    } else {
      onChange({
        accept: changedValues?.accept?.join?.(',') || ''
      });
    }

    dslStore.updateComponentProps(changedValues);
  }

  return (
    <div className={styles.customUploadForm}>
      <Form
        className={styles.form}
        form={form}
        initialValues={{ fileList: fileList?.value, accept: accept?.value }}
        onValuesChange={handleChangingValues}
      >
        {/* 文件类型 */}
        <section>
          <div className={styles.titleWrapper}>
            <span className={styles.title}>文件类型</span>
          </div>
          <div>{renderAcceptSelect()}</div>
        </section>
      </Form>
    </div>
  );
}

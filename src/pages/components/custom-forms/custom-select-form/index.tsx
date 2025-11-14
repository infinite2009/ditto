import { useContext, useEffect } from 'react';
import { Form, Input } from 'antd';
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import { DSLStoreContext } from '@/hooks/context';
import { PlusOutlined } from '@ant-design/icons';
import Section from '../../Section';
import styles from './index.module.less';

export default observer(function CustomSelectForm(props) {
  const dslStore = useContext(DSLStoreContext);

  const [form] = Form.useForm();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    const defaultOptions = toJS(props.value?.options);

    form.setFieldValue('options', defaultOptions);
  }, []);

  const syncToDSL = (updateProps: Record<string, unknown>) => {
    const SelectComponent = dslStore.dsl.componentIndexes[dslStore.selectedComponent.id];
    dslStore.updateComponentProps(updateProps, SelectComponent);
  };

  const handleAddOption = () => {
    const currentOptions = form.getFieldValue('options');
    const nextOptionNum = currentOptions.length + 1;
    const options = [...currentOptions, { label: `label_${nextOptionNum}`, value: `value_${nextOptionNum}` }];
    form.setFieldValue('options', options);
    syncToDSL({ options });
  };

  const handleDragEnd = event => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const items = form.getFieldValue('options') ?? [];
      form.setFieldValue('options', arrayMove(items, active.id, over.id));
    }
  };

  return (
    <div className={styles['custom-select-form']}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Form
          form={form}
          className={styles['form-wrapper']}
          labelAlign="left"
          colon={false}
          onValuesChange={(_, values) => {
            // 暂时只同步 options，后续如果有其他值，可以直接把整个 values 传入
            syncToDSL({ options: values.options });
          }}
        >
          <Section title="可选项" extra={<PlusOutlined onClick={handleAddOption} />}>
            <Form.List name="options">
              {(fields, { remove }, { errors }) => {
                // 这里生成 id 属性的原因是：SortableContext 的 items 需要该属性
                // 将 key 转为 string 类型的原因是： key 是从 0 开始的 number，会导致 dnd-kit/sortable 出现 bug（第 1 个元素无法拖拽）
                const formattedFields = fields.map(field => ({ ...field, id: String(field.key) }));
                console.log(fields);
                
                return (
                  <div>
                    <SortableContext items={formattedFields} strategy={verticalListSortingStrategy}>
                      {formattedFields.map(({ key, name, ...restField }) => (
                        <Section.Card
                          title={`选项 ${key + 1}`}
                          key={key}
                          sortableId={String(key)}
                          onRemove={() => remove(name)}
                        >
                          <Form.Item label="标签名" {...restField} name={[name, 'label']}>
                            <Input size="small" variant="borderless" placeholder="请输入" />
                          </Form.Item>
                          <Form.Item label="标签值" {...restField} name={[name, 'value']}>
                            <Input size="small" variant="borderless" placeholder="请输入" />
                          </Form.Item>
                        </Section.Card>
                      ))}
                    </SortableContext>
                    {errors ? <p>{errors}</p> : null}
                  </div>
                );
              }}
            </Form.List>
          </Section>
        </Form>
      </DndContext>
    </div>
  );
});

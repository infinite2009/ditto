import { ColorPicker, Form, Input, InputNumber, Select, Switch } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { CSSProperties, FC, useEffect, useMemo } from 'react';

export interface IStyleFormProps {
  config?: string[];
  value?: CSSProperties;
  onChange: (style: CSSProperties) => void;
}

export default function StyleForm({ onChange, value, config }: IStyleFormProps) {
  const [form] = useForm();

  const styleNames = [
    'width',
    'height',
    'padding',
    'margin',
    'backgroundColor',
    'backgroundImage',
    'color',
    'fontSize',
    'fontWeight',
    'textAlign',
    'flexGrow',
    'flexShrink',
    'alignItems',
    'alignSelf',
    'justifyContent',
    'flexDirection',
    'flexWrap',
    'flexBasis'
  ];

  const defaultStyleConfig: Record<
    string,
    {
      name: string;
      label: string;
      component: FC<any>;
    }
  > = {
    width: { name: 'width', label: '宽度', component: InputNumber },
    height: { name: 'height', label: '高度', component: InputNumber },
    padding: { name: 'padding', label: '内边距', component: InputNumber },
    margin: { name: 'margin', label: '外边距', component: InputNumber },
    backgroundColor: { name: 'backgroundColor', label: '背景色', component: ColorPicker },
    backgroundImage: { name: 'backgroundImage', label: '背景图片', component: Input },
    color: { name: 'color', label: '字体颜色', component: InputNumber },
    fontSize: { name: 'fontSize', label: '字号', component: InputNumber },
    fontWeight: { name: 'fontWeight', label: '字重', component: InputNumber },
    textAlign: { name: 'textAlign', label: '文字对齐', component: Select },
    flexGrow: { name: 'flexGrow', label: '伸展', component: Switch },
    flexShrink: { name: 'flexShrink', label: '收缩', component: Switch },
    alignItems: { name: 'alignItems', label: '子元素主轴对齐', component: Select },
    alignSelf: { name: 'alignSelf', label: '主轴对齐', component: Select },
    justifyContent: { name: 'justifyContent', label: '交叉轴对齐', component: Select },
    flexDirection: { name: 'flexDirection', label: '方向', component: Select },
    flexWrap: { name: 'flexWrap', label: '换行', component: Switch },
    flexBasis: { name: 'flexBasis', label: '基准宽度', component: InputNumber }
  };

  useEffect(() => {
    form.setFieldsValue(value);
  }, [value]);

  const styleConfig = useMemo(() => {
    if (config && config.length > 0) {
      return config;
    }
    return styleNames;
  }, [config]);

  function handleChangingStyle() {
    if (onChange) {
      onChange(form.getFieldsValue());
    }
  }

  function renderFormItems() {
    return styleConfig.map(item => {
      const Component = defaultStyleConfig[item].component;
      return (
        <Form.Item key={item} label={defaultStyleConfig[item].label} name={defaultStyleConfig[item].name}>
          <Component />
        </Form.Item>
      );
    });
  }

  return (
    <Form form={form} onChange={handleChangingStyle}>
      {renderFormItems()}
    </Form>
  );
}

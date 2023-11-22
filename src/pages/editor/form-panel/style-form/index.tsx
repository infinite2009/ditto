import { ColorPicker, Form, Input, InputNumber, Select, Switch } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { CSSProperties, FC, useEffect, useMemo } from 'react';
import { typeOf } from '@/util';
import { FormItemSchema } from '@/types/form-config';
import { RoundedCorner } from '@/components/icon';

export interface IStyleFormProps {
  config?: {
    [key: string]: FormItemSchema | boolean;
  };
  onChange: (style: CSSProperties) => void;
  value?: CSSProperties;
}

export default function StyleForm({ onChange, value, config }: IStyleFormProps) {
  const [form] = useForm();

  const styleNames = [
    'width',
    'height',
    'padding',
    // 'margin',
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
    // margin: { name: 'margin', label: '外边距', component: InputNumber },
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

  const componentRegDict: Record<string, FC> = {
    Select: Select,
    Switch: Switch,
    Input: Input,
    ColorPicker: ColorPicker
  };

  useEffect(() => {
    form.setFieldsValue(value);
  }, [value]);

  const styleConfig = useMemo(() => {
    if (config && Object.keys(config).length > 0) {
      return Object.entries(config);
    }
    return [];
  }, [config]);

  function handleChangingStyle() {
    if (onChange) {
      const originalValueObj = form.getFieldsValue();
      Object.entries(originalValueObj).forEach(([key, val]) => {
        if (val === undefined) {
          delete originalValueObj[key];
          return;
        }
        const config = styleConfig.find(item => item[0] === key);
        if (config) {
          if (typeOf(config[1]) === 'object') {
            if ((config[1] as FormItemSchema).type === 'number') {
              originalValueObj[key] = {
                value: +(val as string)
              };
            } else {
              originalValueObj[key] = {
                value: val
              };
            }
            // 如果该配置项是某个props的一个属性，则把这个 props 的名字写进去
            if ((config[1] as FormItemSchema).propsToCompose) {
              originalValueObj[key].propsToCompose = (config[1] as FormItemSchema).propsToCompose;
            }
          } else {
            // 如果配置项是 boolean 值，则默认为 style 的一个属性
            originalValueObj[key] = {
              value: val,
              propsToCompose: 'style'
            };
          }
        }
      });
      onChange(originalValueObj);
    }
  }

  function renderFormItems() {
    return styleConfig.map(([key, val]) => {
      let Component: FC<any>;
      let label;
      let componentProps = {};
      // 如果不是对象
      if (typeOf(val).toLowerCase() === 'boolean' && styleNames.includes(key)) {
        Component = defaultStyleConfig[key].component;
        label = defaultStyleConfig[key].label;
      } else {
        Component = componentRegDict[(val as FormItemSchema).component] || Input;
        label = (val as FormItemSchema).title;
        componentProps = (val as FormItemSchema).componentProps || {};
      }
      return (
        <Form.Item key={key} label={label} name={key}>
          <Component {...componentProps} />
        </Form.Item>
      );
    });
  }

  return (
    <div>
      123
      <RoundedCorner />
      <Form form={form} onValuesChange={handleChangingStyle}>
        {renderFormItems()}
      </Form>
    </div>
  );
}

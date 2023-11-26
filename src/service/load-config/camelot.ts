import { createCamelotComponent } from "@/components/camelot";
import IComponentConfig from "@/types/component-config";
import IFormConfig, { FormItemSchema } from "@/types/form-config";
import { CodeSandboxOutlined } from "@ant-design/icons";

interface PropsConfig {
  description: string;
  type: FormItemSchema['type'];
  defaultValue:string;
}
interface ICamelotComponent {
  title: string;
  name: string;
  tag: string;
  docLink: string;
  umd: string;
  esm:string;
  props: PropsConfig;
}

export const camelotComponentConfig: { [key: string]: IComponentConfig } = {};
export let camelotComponents: ICamelotComponent[]= [];


export async function fetchCamelotComponent() {
  if (camelotComponents.length > 0) {
    return camelotComponents;
  }
  const result = await fetch('//shylf-inner-boss.bilibili.co/neo-pages/mlive-dev/camelot-doc/config/components.json?aaa=1');
  const data = await result.json();

  if (Array.isArray(data)) {
    camelotComponents = data;
  }
  return camelotComponents;
}
/** 组件基本配置 */
export async function fetchCamelotComponentConfig() {
  const components = await fetchCamelotComponent();

  components.forEach((item) => {
    const propsConfig: IComponentConfig['propsConfig'] = {};
    Object.keys(item.props).forEach(key => {
      const propValue = item.props[key];
      propsConfig[key] = {
        id: key,
        schemaType: 'props',
        name: key,
        valueSource: 'editorInput',
        valueType: propValue.type,
        category: 'basic',
        value: propValue.defaultValue !== '-' ? propValue.defaultValue : '',
        title: propValue.description
      };
    });
    Object.assign(camelotComponentConfig, {
      [item.tag]:  {
        configName: item.tag,
        dependency: 'camelot',
        component: createCamelotComponent(
          item.tag,
          item.esm
        ),
        category: '用户技术中心专用',
        title: item.title,
        icon: CodeSandboxOutlined,
        propsConfig: propsConfig
      },
    });
  });
}
fetchCamelotComponentConfig();

/** 组件属性表单配置 */
export async function getCamelotComponentPropsFrom() {
  const camelotComponents = await fetchCamelotComponent();
  const formConfig: Record<string, IFormConfig> = {};
  const BASE_TYPE_REG = /(string|number|boolean|function|array)/i;
  const getComponentType = (type) => {
    switch(type.toLowerCase()) {
      case 'number':
        return 'InputNumber';
      case 'boolean':
        return 'Switch';
      case 'string':
      case 'object':
      case 'array':
        return 'Input';
      default:
        return 'Input';
    }
  };
  camelotComponents.forEach((item) => {
    if (formConfig[item.tag] === undefined) {
      formConfig[item.tag] = {
        configName: item.tag,
        schema: {
          style: {},
          basic: {},
          event: {},
          data: {},
        },
      };
    }
    Object.keys(item.props).forEach(key => {
      const propConfig = item.props[key] as PropsConfig;
      if (propConfig.type.toLowerCase().includes('function')) {
        // TODO 功能暂时未实现
        formConfig[item.tag].schema.event = {};
      } else {
        const component = getComponentType(propConfig.type);
        
        formConfig[item.tag].schema.basic[key] = {
          title: key,
          required: false,
          type: propConfig.type.includes('|') ? 'string' : propConfig.type,
          component: component
        };
        // enum 类型
        if (propConfig.type.includes('|') && !BASE_TYPE_REG.test(propConfig.type)) {
          Object.assign(formConfig[item.tag].schema.basic[key], {
            component: 'Select',
            componentProps: {
              options: propConfig.type.split('|').map(value => {
                return {
                  value: value,
                  label:value
                };
              })
            }
          });
        }
      }
    });
  });
  console.log(formConfig);
  return formConfig;
}
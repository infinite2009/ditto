import { MaterialDTO } from '@/pages/admin/types';
import IComponentConfig, { IPropsConfigItem } from '@/types/component-config';
import { Icon } from '@/components/icon';
import ComponentFeature from '@/types/component-feature';
import { path, pipe } from 'ramda';
import * as ANTD from 'antd';
import { HTMLComponents } from './HTMLComponents';

export const transformMaterialDTOToComponentConfig = pipe(renameFields, attachProps, attachIcon, attachComponent);

type PipeContext = IComponentConfig &
  Omit<MaterialDTO, 'isHidden' | 'isLayer'/* | 'isBlackBox'*/ | 'categories' | 'keywords'>;

/** 字段重命名 */
function renameFields(input: MaterialDTO): Omit<PipeContext, 'icon' | 'propsConfig' | 'component'> {
  return {
    ...input,
    dependency: input.package,
    title: input.displayName,
    isHidden: input.isHidden === 1,
    feature: input.feature as ComponentFeature,
    isLayer: input.isLayer === 1,
    // isBlackBox: input.isBlackBox === 1,
    categories: input.categories.split(','),
    keywords: input.keywords.split(',')
  };
}

/** 附加 props 属性 */
function attachProps(
  input: Omit<PipeContext, 'icon' | 'propsConfig' | 'component'>
): Omit<PipeContext, 'icon' | 'component'> {
  return {
    ...input,
    propsConfig: input.props.reduce((acc, prop) => {
      const newProp: IPropsConfigItem = {
        schemaType: 'props',
        ...prop,
        defaultValue: safeParseJSON(prop.defaultValue),
        value: safeParseJSON(prop.propValue),
        name: prop.propName,
        title: prop.displayName,
        id: prop.propName,
        category: prop.category as IPropsConfigItem['category'],
        isVisible: prop.isVisible === 1,
        templateKeyPathsReg: safeParseJSON(prop.templateKeyPathsReg) || [],
        valueSource: prop.valueSource as IPropsConfigItem['valueSource'],
        valueType: prop.valueType as IPropsConfigItem['valueType']
      };
      acc[prop.propName] = newProp;
      return acc;
    }, {})
  };
}

function safeParseJSON(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed;
  } catch (error) {
    return value;
  }
}

function attachIcon(input: Omit<PipeContext, 'icon' | 'component'>): Omit<PipeContext, 'component'> {
  return {
    ...input,
    icon: () => <Icon type={input.coverUrl?.replace('icon:', '')} />
  };
}

function attachComponent(input: Omit<PipeContext, 'component'>): PipeContext {
  return {
    ...input,
    component: createComponent(input) || createDefaultComponent(input)
  };
}

function createComponent(input: PipeContext): React.FC | undefined {
  if (input.dependency === 'antd') {
    return getComponentFC(ANTD, input.configName);
  }

  if (input.dependency === 'html') {
    return getComponentFC(HTMLComponents, input.configName);
  }
}

function createDefaultComponent(config: IComponentConfig) {
  function DefaultComponent() {
    return (
      <div>
        <span>
          依赖 &quot;{config.dependency}&quot; 中的组件 &quot;{config.configName}&quot; 不存在,详细配置信息:
        </span>
        <pre>{JSON.stringify(config, null, 2)}</pre>
      </div>
    );
  }
  DefaultComponent.displayName = `DefaultComponent-${config.dependency}-${config.configName}`;
  return DefaultComponent;
}

const getComponentFC = (library, configName: string): React.FC | undefined => path(configName.split('.'), library);

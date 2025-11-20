import IComponentConfig from '@/types/component-config';
import { MaterialDTO } from '@/pages/admin/types';
import { getVoltronMaterialPackage } from '@/api';
import {
  antdComponentConfig,
  Mode,
  nativeComponentConfig
} from './ComponentManager';
import { transformMaterialDTOToComponentConfig } from './transforms';

export class ComponentManager {
  private static componentConfig: Record<string, Record<string, IComponentConfig>> = null;

  private static mode: Mode;
  static get componentConfigDict() {
    return ComponentManager.componentConfig;
  }

  static fetchComponentConfig(configName: string, dependency: string) {
    if (!ComponentManager.componentConfig) {
      return null;
    }

    if (!ComponentManager.componentConfig[dependency]?.[configName]) {
      throw new Error(`组件配置不存在，${dependency} 中不存在 ${configName} 组件`);
    }

    return ComponentManager.componentConfig[dependency]?.[configName];
  }

  static fetchDefaultValueOf(configName: string, dependency: string) {
    const config = this.fetchComponentConfig(configName, dependency);

    if (!config) {
      return null;
    }
    const result = {};
    Object.entries(config.propsConfig).forEach(([key, props]) => {
      result[key] = props.value;
    });
    return result;
    // if (!ComponentManager.defaultComponentValueConfig) {
    //   return null;
    // }
    // return ComponentManager.defaultComponentValueConfig[dependency]?.[configName] || null;
  }

  static async init(mode: Mode = 'edit') {
    // ComponentManager.initDefaultComponentValueConfig();
    await ComponentManager.loadComponentConfigList(mode);
  }

  static async refreshComponentConfig() {
    ComponentManager.componentConfig = null;
    return await ComponentManager.loadComponentConfigList();
  }

  /**
   * 从远程获取组件配置
   * @param packages 组件包名
   * @returns 组件配置
   */
  private static async fetchComponentConfigsFromRemote(
    packages: string[]
  ): Promise<Record<string, Record<string, IComponentConfig>>> {
    try {
      const result = await Promise.all(packages.map(packageName => getVoltronMaterialPackage({ packageName })));

      const componentConfigDict: Record<string, Record<string, IComponentConfig>> = {};

      for (const [index, packageResult] of result.entries()) {
        if (packageResult.code !== 0) {
          throw new Error(`获取组件配置失败，${packageResult.message}`);
        }
        const list: MaterialDTO[] = packageResult.data as any;

        const componentConfig = list.reduce((acc, materialDTO) => {
          acc[materialDTO.configName] = transformMaterialDTOToComponentConfig(materialDTO);
          return acc;
        }, {});
        componentConfigDict[packages[index]] = componentConfig;
      }
      console.info('fetch_component_configs_from_remote_success:', componentConfigDict);
      return componentConfigDict;
    } catch (error) {
      console.error('error_in_fetchComponentConfigsFromRemote', error);
      console.warn('远程获取组件配置失败，使用应用内兜底');
      return Promise.resolve({
        html: nativeComponentConfig,
        antd: antdComponentConfig,
      });
    }
  }

  private static async loadComponentConfigList(mode: Mode = 'preview') {
    if (!ComponentManager.componentConfig || mode !== this.mode) {
      ComponentManager.componentConfig = await ComponentManager.fetchComponentConfigsFromRemote([
        'html',
        'antd',
      ]);
      this.mode = mode;
      return ComponentManager.componentConfig;
    }
    console.log('window: ', window.top);
    return ComponentManager.componentConfig;
  }
}

import { useContext } from "react";
import { OPERATE_COMPONENT_CONFIG_NAME } from "../const";
import { RenderType, RenderTypeEnum } from "../types";
import { DSLStoreContext } from "@/hooks/context";

export const useComponent = ({ dependency }: { dependency: string }) => {
  const dslStore = useContext(DSLStoreContext);
  /**
   * 创建组件，并返回组件配置
   * @param renderType 组件类型
   * @param value 字段值
   * @returns componentIndex配置
   */
  const generateComponent = (renderType: Exclude<RenderType, RenderTypeEnum.Default | ''>, value: unknown) => {
    let configName: string = renderType;
    let props: Record<string, unknown>;
    if (renderType === RenderTypeEnum.Operate) {
      // 操作列，创建行间距为8px的水平弹性容器
      configName = OPERATE_COMPONENT_CONFIG_NAME;
      props = {
        style: {
          columnGap: 8
        }
      };
    }
    const newComponent = dslStore.createComponent(configName, dependency, {}, props);
    const id = newComponent.id;
    switch (renderType) {
      case RenderTypeEnum.Text:
        dslStore.updateComponentProps(
          {
            children: value
          },
          {
            id
          }
        );
        break;
      case RenderTypeEnum.Amount:
        dslStore.updateComponentProps(
          {
            children: value
          },
          {
            id
          }
        );
        break;
      case RenderTypeEnum.Tag:
        dslStore.updateComponentProps(
          {
            children: value
          },
          {
            id
          }
        );
        break;
      case RenderTypeEnum.Switch:
        break;
      case RenderTypeEnum.Operate:
        dslStore.dangerousInsertComponent(id, 'Button', dependency);
        dslStore.fetchComponentInDSL(id).children.forEach(b => {
          dslStore.updateComponentProps({
            children: '按钮',
            type: 'link'
          }, {
            id: b.current
          });
        });
        break;
      default:
        break;
    }
    return {
      configName: newComponent.configName,
      current: newComponent.id,
      isText: false
    };
  };

  return {
    generateComponent
  };
};
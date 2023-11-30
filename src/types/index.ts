import { TemplateKeyPathsReg } from '@/types/props.schema';

export type ComponentId = string;

export type PropsId = string;

export type ActionId = string;

export type HandlerId = string;

export type EventId = string;

export type ImportType = 'default' | 'object' | '*';

export type TemplateInfo = {
  data: any;
  keyPathRegs: TemplateKeyPathsReg[];
  parent: any;
  key: string;
  currentKeyPath: string;
  nodeId: string;
};

export type StyleFormConfig = {
  layout: {
    width: boolean;
    height: boolean;
    widthGrow: boolean;
    heightGrow: boolean;
    wrap: boolean;
    direction: boolean;
    alignItems: boolean;
    justifyContent: boolean;
    padding: boolean;
    gap: boolean;
  };
  backgroundColor: boolean;
  border: {
    borderWidth: boolean;
    borderColor: boolean;
    borderStyle: boolean;
  };
  shadow: boolean;
  text: {
    // 字号和行高
    size: boolean;
    color: boolean;
    decoration: boolean;
  };
};

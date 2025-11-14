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
  componentProps?: Record<string, unknown>;
};

export interface ICustomFormProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}

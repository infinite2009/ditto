import ISchema from '@/types/schema';
import IParam from '@/types/param';
import IComponentSchema from '@/types/component.schema';

export default interface IRenderSchema extends ISchema {
  params: IParam;
  return: IComponentSchema;
}
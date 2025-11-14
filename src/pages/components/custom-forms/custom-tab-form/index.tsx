import { ICustomFormProps } from '@/types';
import CustomItemsForm from '@/pages/components/custom-forms/custom-items-form';

export default function CustomTabForm(props: ICustomFormProps) {
  return <CustomItemsForm {...props} />;
}

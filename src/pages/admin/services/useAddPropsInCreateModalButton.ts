import { nanoid } from 'nanoid';
import { createFormModel } from '../formutils';
import { notifyCreateMaterialFormUpdate, getCreateMaterialFormModel } from '../store/createMaterialFormData';
import { MaterialPropsDTO } from '../types';
import { useScrollIntoView } from './useScrollIntoView';

export function useAddPropsInCreateModalButton() {
  const [ref, scrollIntoView] = useScrollIntoView();
  const handleClick = () => {
    const [propModel] = createFormModel<MaterialPropsDTO>(notifyCreateMaterialFormUpdate, {
      id: nanoid(),
      propName: '',
      valueType: '',
      valueSource: '',
      category: '',
      displayName: '',
      defaultValue: '',
      templateKeyPathsReg: ''
    });
    getCreateMaterialFormModel().props.push(propModel);
    notifyCreateMaterialFormUpdate();

    window.requestAnimationFrame(scrollIntoView);
  };

  return [ref, handleClick] as const;
}

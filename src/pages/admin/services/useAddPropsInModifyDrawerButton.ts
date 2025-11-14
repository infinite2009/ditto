import { nanoid } from 'nanoid';
import { createFormModel } from '../formutils';
import {
  notifyModifyMaterialPropsFormUpdate,
  getModifyMaterialPropsFormModel
} from '../store/modifyMaterialPropsFormData';
import { MaterialPropsDTO } from '../types';
import { useScrollIntoView } from './useScrollIntoView';

export function useAddPropsInModifyDrawerButton() {
  const [ref, scrollIntoView] = useScrollIntoView();
  const handleClick = () => {
    const [propModel] = createFormModel<MaterialPropsDTO>(notifyModifyMaterialPropsFormUpdate, {
      id: nanoid(),
      propName: '',
      valueType: '',
      valueSource: '',
      category: '',
      displayName: '',
      defaultValue: '',
      templateKeyPathsReg: ''
    });
    getModifyMaterialPropsFormModel().props.push(propModel);
    notifyModifyMaterialPropsFormUpdate();
    window.requestAnimationFrame(scrollIntoView);
  };

  return [ref, handleClick] as const;
}

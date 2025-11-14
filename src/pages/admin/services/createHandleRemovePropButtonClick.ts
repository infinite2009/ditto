import {
  getModifyMaterialPropsFormModel,
  notifyModifyMaterialPropsFormUpdate
} from '../store/modifyMaterialPropsFormData';

export function createHandleRemovePropButtonClick(id: string) {
  return () => {
    getModifyMaterialPropsFormModel().props = getModifyMaterialPropsFormModel().props.filter(
      prop => prop.id.get() !== id
    );
    notifyModifyMaterialPropsFormUpdate();
  };
}

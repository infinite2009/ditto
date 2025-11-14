import { createFormModelWithZustand } from '../formutils';
import { MaterialDTO } from '../types';

export const [
  useModifyMaterialPropsFormData,
  getModifyMaterialPropsFormModel,
  getModifyMaterialPropsFormValues,
  notifyModifyMaterialPropsFormUpdate
] = createFormModelWithZustand<MaterialDTO>(null!);

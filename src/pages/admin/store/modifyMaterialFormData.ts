import { createFormModelWithZustand } from '../formutils';
import { MaterialDTO } from '../types';

export const [
  useModifyMaterialFormData,
  getModifyMaterialFormModel,
  getModifyMaterialFormValues,
  notifyModifyMaterialFormUpdate
] = createFormModelWithZustand<MaterialDTO>(null!);

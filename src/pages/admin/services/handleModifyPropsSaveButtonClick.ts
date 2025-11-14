import { getModifyMaterialPropsFormModel } from '../store/modifyMaterialPropsFormData';
import { createUpdateMaterialPropsData } from './updateMaterialPropsData';

export const handleModifyPropsSaveButtonClick = createUpdateMaterialPropsData(getModifyMaterialPropsFormModel);

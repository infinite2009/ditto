import { nanoid } from 'nanoid';
import { createFormModelWithZustand } from '../formutils';
import { CreateMaterialFormData } from '../types';

export const [
  useCreateMaterialFormData,
  getCreateMaterialFormModel,
  getCreateMaterialFormValues,
  notifyCreateMaterialFormUpdate
] = createFormModelWithZustand<CreateMaterialFormData>({
  package: '',
  displayName: '',
  importName: '',
  configName: '',
  callingName: '',
  categories: '',
  keywords: '',
  coverUrl: '',
  feature: '',
  isLayer: 0,
  needImport: 0,
  isHidden: 0,
  // isBlackBox: 0,
  props: [
    {
      id: nanoid(),
      propName: '',
      valueType: '',
      valueSource: '',
      category: '',
      displayName: '',
      defaultValue: '',
      templateKeyPathsReg: ''
    }
  ]
});

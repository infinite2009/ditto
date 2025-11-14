import { createStoreBooleanSetter } from '../utils';

export const handleCreateMaterialButtonClick = createStoreBooleanSetter(store => store.setShowCreateModal).setTrue;

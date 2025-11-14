import { createFieldCheckboxGroupPanel } from './createFieldCheckboxGroupPanel';

export const PropsCheckboxGroupPanel = createFieldCheckboxGroupPanel({
  title: '需保留属性',
  description: '保留属性的描述',
  getSelectedValueFromStore: state => state.values.props,
  getSelectedOnChangeFromStore: useComponentReplaceModalStore => useComponentReplaceModalStore.setProps,
  getOptionsFromDslStore: (dsl, getCurrentComponentId) => {
    if (!getCurrentComponentId()) {
      return [];
    }
    const props = dsl.props[getCurrentComponentId()];
    if (!props) {
      return [];
    }
    return Object.keys(props)
      .sort()
      .map(key => {
        return {
          label: `${props[key].title} (${key})`,
          value: key
        };
      });
  }
});

export const ChildrenCheckboxGroupPanel = createFieldCheckboxGroupPanel({
  title: '需保留子组件',
  description: '保留子组件的描述',
  getSelectedValueFromStore: store => store.values.children,
  getSelectedOnChangeFromStore: store => store.setChildren,
  getOptionsFromDslStore: (dsl, getCurrentComponentId) => {
    if (!getCurrentComponentId()) {
      return [];
    }
    const component = dsl.componentIndexes[getCurrentComponentId()];
    if (!component) {
      return [];
    }
    const children = component.children ?? [];

    return children
      .filter(child => !child.isText)
      .map(child => ({
        label: `${dsl.componentIndexes[child.current].displayName} (${child.current})`,
        value: child.current
      }));
  }
});

PropsCheckboxGroupPanel.displayName = 'PropsCheckboxGroupPanel';
ChildrenCheckboxGroupPanel.displayName = 'ChildrenCheckboxGroupPanel';

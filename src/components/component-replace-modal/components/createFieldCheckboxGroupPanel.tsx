import { CheckboxGroupPanel, CheckboxGroupPanelProps } from '@bilibili/voltron-design';
import { useFieldCheckboxGroup } from './useFieldCheckboxGroup';

type CreateCheckboxGroupPanelParams = Parameters<typeof useFieldCheckboxGroup>[0] &
  Pick<CheckboxGroupPanelProps, 'title' | 'description'>;

export function createFieldCheckboxGroupPanel(params: CreateCheckboxGroupPanelParams): React.FC {
  return function Panel() {
    const [options, value, onChange] = useFieldCheckboxGroup(params);

    if (!options.length) {
      return null;
    }

    return (
      <CheckboxGroupPanel
        title={params.title}
        description={params.description}
        options={options}
        value={value}
        onChange={onChange}
      />
    );
  };
}

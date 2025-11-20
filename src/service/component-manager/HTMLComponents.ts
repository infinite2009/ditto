import { default as Button } from '../components/button';
import { default as PageRoot } from '../components/page-root';
import { default as HorizontalFlex } from '../components/horizontal-flex';
import { default as VerticalFlex } from '../components/vertical-flex';
import { default as Text } from '../components/text';
import { default as Table } from '../components/table';
import { default as DatePicker } from '../components/date-picker';

export const HTMLComponents = {
  [Button.configName]: Button.component,
  [PageRoot.configName]: PageRoot.component,
  [HorizontalFlex.configName]: HorizontalFlex.component,
  [VerticalFlex.configName]: VerticalFlex.component,
  [Text.configName]: Text.component,
  [Table.configName]: Table.component,
  [DatePicker.configName]: DatePicker.component,
};

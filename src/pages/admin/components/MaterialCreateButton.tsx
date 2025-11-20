import { Button } from 'antd';
import { handleCreateMaterialButtonClick } from '../services';

/** “添加组件” 按钮 */
export function MaterialCreateButton() {
  return (
    <Button type="primary" onClick={handleCreateMaterialButtonClick}>
      添加组件
    </Button>
  );
}

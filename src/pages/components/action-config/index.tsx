import { observer } from 'mobx-react';
import { Button, Drawer, Space } from 'antd';
import { DSLStoreContext, EditorStoreContext } from '@/hooks/context';
import React, { useContext, useEffect, useState } from 'react';
import IActionSchema, { StateTransitionOption } from '@/types/action.schema';
import ActionForm from '@/pages/editor/form-panel/action-form';
import { useForm } from 'antd/es/form/Form';
import { reaction, toJS } from 'mobx';
import { isDifferent } from '@/util';
import ActionType from '@/types/action-type';

function ActionConfig() {
  const editorStore = useContext(EditorStoreContext);
  const dslStore = useContext(DSLStoreContext);
  const [actionList, setActionList] = useState<IActionSchema[]>([]);

  useEffect(() => {
    reaction(
      () => toJS(dslStore.dsl?.actions),
      (data, oldData) => {
        if (!isDifferent(data, oldData)) {
          return;
        }
        // 找到所有的图层组件
        const layerComponents = Object.values(dslStore.dsl.componentIndexes).filter(component => {
          return component.isLayer;
        });
        const actionList = Object.values(dslStore.dsl.actions).map(action => {
          if (action.type === ActionType.STATE_TRANSITION) {
            // 找到变量名和 open 属性引用相等的组件
            const component = layerComponents.find(component => {
              return dslStore.fetchPropsValue(component.id, 'open') === (action.options as StateTransitionOption).name;
            });
            if (component) {
              if ((action.options as StateTransitionOption).value) {
                return {
                  ...action,
                  type: ActionType.OPEN_LAYER,
                  options: {
                    target: component.id
                  }
                };
              }
              return {
                ...action,
                type: ActionType.CLOSE_LAYER,
                options: {
                  target: component.id
                }
              };
            }
            return { ...action };
          }
          return { ...action };
        });
        setActionList(actionList);
      },
      {
        fireImmediately: true
      }
    );
  }, []);

  const [form] = useForm();

  function handleSavingActionConfig() {
    form.submit();
  }

  function fetchAppIds() {
    // TODO: 需要改为配置下发
    return ['informatization.purchase.pur-center', 'ops.fin-api.payproxy'];
  }

  function handleOnChangingActions(actions: IActionSchema[]) {
    dslStore.setAllActions(
      actions.map(action => {
        if (action.type === ActionType.OPEN_LAYER || action.type === ActionType.CLOSE_LAYER) {
          // 找到指定组件的open属性
          const result = { ...action };
          const targetComponentId = (
            action.options as unknown as {
              target: string;
            }
          ).target;
          let variableName = dslStore.fetchPropsValue(targetComponentId, 'open');
          // 如果这个变量不存在，自动创建一个
          if (!variableName) {
            variableName = `openStateOf${targetComponentId}`;
            dslStore.createVariable({
              key: variableName,
              initialValue: false,
              name: 'open属性变量',
              desc: '',
              type: 'boolean'
            });
            dslStore.updateComponentProps({ open: variableName }, { id: targetComponentId });
          }
          result.type = ActionType.STATE_TRANSITION;
          result.options = {
            name: variableName,
            value: action.type === ActionType.OPEN_LAYER
          };
          return result;
        }
        return { ...action };
      })
    );
  }

  function renderActionForm() {
    return (
      <ActionForm
        form={form}
        actionList={actionList}
        componentList={dslStore.fetchComponentList()}
        appIds={fetchAppIds()}
        onChange={handleOnChangingActions}
      />
    );
  }

  function closeActionConfigDrawer() {
    editorStore.closeActionConfig();
  }

  return (
    <>
      <Drawer
        open={editorStore.actionConfigVisible}
        title="动作配置"
        placement="left"
        onClose={closeActionConfigDrawer}
        extra={
          <Space>
            <Button onClick={editorStore.closeActionConfig}>取消</Button>
            <Button type="primary" onClick={handleSavingActionConfig}>
              保存
            </Button>
          </Space>
        }
      >
        {renderActionForm()}
      </Drawer>
    </>
  );
}

ActionConfig.display = 'ActionConfig';

export default observer(ActionConfig);

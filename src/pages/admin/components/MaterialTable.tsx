import { Table, Button, ButtonProps } from 'antd';
import { useAdminPageStore } from '../store/store';
import { fetchMaterialData } from '../services/fetchMaterialData';
import { MaterialDTO } from '../types';
import { Icon } from '@/components/icon';
import { createRemoveMaterial } from '../services/removeMaterial';
import { useModifyMaterialFormData } from '../store/modifyMaterialFormData';
import { useModifyMaterialPropsFormData } from '../store/modifyMaterialPropsFormData';

export function MaterialTable() {
  const material = useAdminPageStore(state => state.material);
  const loading = useAdminPageStore(state => state.loading);
  const materialTablePageSize = useAdminPageStore(state => state.materialTablePageSize);
  const materialTableCurrentPage = useAdminPageStore(state => state.materialTableCurrentPage);
  const total = useAdminPageStore(state => state.materialTableTotal);

  return (
    <Table
      size="small"
      className="min-w-[1200px]"
      loading={loading}
      dataSource={material}
      rowKey={record => record.id}
      scroll={{ y: 552 }}
      columns={[
        {
          title: '组件名称',
          dataIndex: 'displayName',
          key: 'displayName',
          width: 180
        },
        {
          title: '组件封面',
          dataIndex: 'coverUrl',
          key: 'coverUrl',
          width: 120,
          render: (url: string) => <CoverCell url={url} />
        },
        {
          title: '组件调用名',
          dataIndex: 'importName',
          key: 'importName',
          width: 180
        },
        {
          title: '组件库',
          dataIndex: 'package',
          key: 'package',
          width: 180
        },
        {
          title: '操作',
          key: 'action',
          width: 200,
          render: (_, record: MaterialDTO) => <OperationCell record={record} />
        }
      ]}
      pagination={{
        pageSize: materialTablePageSize,
        current: materialTableCurrentPage,
        total,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        onChange: (page, pageSize) => {
          useAdminPageStore.getState().setMaterialTableCurrentPage(page);
          useAdminPageStore.getState().setMaterialTablePageSize(pageSize);
          fetchMaterialData();
        }
      }}
    />
  );
}

function OperationCell(props: { record: MaterialDTO }) {
  const { record } = props;
  return (
    <div className="flex gap-28">
      <ModifyButton recordId={record.id} />
      <ModifyPropsButton recordId={record.id} />
      <RemoveButton recordId={record.id} />
    </div>
  );
}

const ModifyButton = createOperationButton({
  text: '编辑',
  useHandClick: (recordId: string) => () => {
    const material = useAdminPageStore.getState().material.find(item => item.id === recordId);
    if (!material) {
      return;
    }
    useModifyMaterialFormData.setState(material);
  }
});

const ModifyPropsButton = createOperationButton({
  text: '属性配置',
  useHandClick: (recordId: string) => () => {
    const material = useAdminPageStore.getState().material.find(item => item.id === recordId);
    if (!material) {
      return;
    }
    useModifyMaterialPropsFormData.setState(material);
  }
});

const RemoveButton = createOperationButton({
  text: '删除',
  danger: true,
  useHandClick: createRemoveMaterial
});

type OperationButtonProps = ButtonProps & { text: string; useHandClick: (recordId: string) => () => void };

function createOperationButton(params: OperationButtonProps) {
  const { useHandClick, ...restParams } = params;
  return function OperationButton(props: { recordId: string }) {
    const { recordId } = props;
    const handlerClick = useHandClick(recordId);
    return (
      <Button {...restParams} type="link" onClick={handlerClick}>
        {params.text}
      </Button>
    );
  };
}

function CoverCell(props: { url: string }) {
  const { url } = props;
  let CoverNode: React.ReactNode = null;
  if (url && url.startsWith('icon:')) {
    CoverNode = <Icon type={url.replace('icon:', '')} style={{ fontSize: 32 }} />;
  }
  return CoverNode;
}

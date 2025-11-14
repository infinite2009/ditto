import { useAdminPageStore } from '../store/store';
import { getVoltronMaterial } from '@/api';
import { PaginationMaterialDTO } from '../types';
import { ResultData } from '@bilibili/bee-request';

let controller = new AbortController();

export async function fetchMaterialData() {
  const { materialTablePageSize, materialTableCurrentPage, searchKeyword, setLoading, setMaterialData, loading } =
    useAdminPageStore.getState();

  if (loading) {
    controller.abort('abort');
    controller = new AbortController();
  }

  setLoading(true);

  try {
    const result: ResultData<PaginationMaterialDTO> = await getVoltronMaterial(
      {
        pageNum: materialTableCurrentPage,
        pageSize: materialTablePageSize,
        displayName: searchKeyword
      },
      {
        signal: controller.signal
      }
    );

    if (result.code !== 0) {
      throw new Error(result.message);
    }
    const { list, total } = result.data;
    setLoading(false);
    setMaterialData(list, total);
  } catch (error) {
    if (error.message !== 'canceled') {
      console.error('error_in_fetch_material_data', error);
    }
  } finally {
    setLoading(false);
  }
}

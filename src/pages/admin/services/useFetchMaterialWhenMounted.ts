import { useEffect } from 'react';
import { fetchMaterialData } from './fetchMaterialData';

export function useFetchMaterialWhenMounted() {
  // 初始化页面数据
  useEffect(() => {
    fetchMaterialData();
  }, []);
}

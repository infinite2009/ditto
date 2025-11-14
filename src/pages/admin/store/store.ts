import { create } from 'zustand';
import { AdminPageStore, MaterialDTO } from '../types';

export const useAdminPageStore = create<AdminPageStore>((set) => {
  return {
    loading: false,
    searchResultCount: 0,
    searchKeyword: '',
    materialTablePageSize: 10,
    materialTableCurrentPage: 1,
    materialTableTotal: 0,
    showCreateModal: false,
    currentModifyMaterialId: null,
    currentModifyMaterialPropsId: null,
    material: [],
    setLoading: (loading: boolean) => set({ loading }),
    setSearchResultCount: (count: number) => set({ searchResultCount: count }),
    setSearchKeyword: (keyword: string) => set({ searchKeyword: keyword }),
    setMaterialTablePageSize: (pageSize: number) => set({ materialTablePageSize: pageSize }),
    setMaterialTableCurrentPage: (currentPage: number) => set({ materialTableCurrentPage: currentPage }),
    setShowCreateModal: (show: boolean) => set({ showCreateModal: show }),
    setCurrentModifyMaterialId: (id: string | null) => set({ currentModifyMaterialId: id }),
    setCurrentModifyMaterialPropsId: (id: string | null) => set({ currentModifyMaterialPropsId: id }),
    setMaterialData: (material: MaterialDTO[], total: number) => set({ material, materialTableTotal: total }),
    notify: () => set({})
  };
});

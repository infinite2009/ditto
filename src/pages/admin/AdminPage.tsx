import { PageLayout } from '@/components/PageLayout';
import {
  MaterialTable,
  MaterialCreateButton,
  MaterialCreateModal,
  MaterialSearchInput,
  SearchResultCountTips,
  MaterialModifyDrawer,
  MaterialModifyPropsDrawer
} from './components';
import { useFetchMaterialWhenMounted } from './services';

export function AdminPage() {
  return (
    <PageLayout>
      <WithFetchMaterialWhenMounted>
        <div className="flex justify-center mt-20">
          <div className="max-w-[1200px]">
            <SearchRow />
            <MaterialTable />
            <SearchResultCountTips />
          </div>
        </div>
        <MaterialModifyDrawer />
        <MaterialModifyPropsDrawer />
        <MaterialCreateModal />
      </WithFetchMaterialWhenMounted>
    </PageLayout>
  );
}

function WithFetchMaterialWhenMounted({ children }: { children: React.ReactNode }) {
  useFetchMaterialWhenMounted();
  return children;
}

function SearchRow() {
  return (
    <div className="flex justify-between mb-16">
      <MaterialCreateButton />
      <MaterialSearchInput />
    </div>
  );
}

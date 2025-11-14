import { getVoltronModuleListAll, GetVoltronModuleListAll, PostVoltronModuleCreate, postVoltronModuleCreate, postVoltronModuleDelete, PostVoltronModuleUpdate, postVoltronModuleUpdate } from "@/api";
import { create } from "zustand";

type DSLFragment = GetVoltronModuleListAll.ListItem;

type Store = {
  dslFragmentList: DSLFragment[];
  getList: () => Promise<GetVoltronModuleListAll.ListItem[]>;
  // setDslFragmentList: (dsl: DSLFragment[]) => void;
  addItem: (data: PostVoltronModuleCreate.Req) => void;
  updateItem: (data: PostVoltronModuleUpdate.Req) => void;
  deleteItem: (id: number) => void;
};

const useDSLFragmentStore = create<Store>((set, get) => ({
  dslFragmentList: [],
  getList: async () => {
    const { data } = await getVoltronModuleListAll({});
    set({
      dslFragmentList: data.list
    });
    return data.list;
  },
  addItem: async (data) => {
    const { getList } = get();
    await postVoltronModuleCreate(data);
    getList();
  },
  updateItem: async (data) => {
    const { getList } = get();
    await postVoltronModuleUpdate(data);
    getList();
  },
  deleteItem: async (id) => {
    const { dslFragmentList } = get();

    set({
      dslFragmentList: dslFragmentList.filter(i => i.id !== id)
    });

    await postVoltronModuleDelete({
      id
    });

  },
}));

export default useDSLFragmentStore;
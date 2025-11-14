import { create } from 'zustand';

type IndexStore = {
  drawerOpen: boolean;
  modalOpen: boolean;
  openStateOfModal5: boolean;
  setDrawerOpen: (drawerOpen: boolean) => void;
  setModalOpen: (modalOpen: boolean) => void;
  setOpenStateOfModal5: (openStateOfModal5: boolean) => void;
};
const innerStore = create<IndexStore>(set => ({
  drawerOpen: false,
  modalOpen: false,
  openStateOfModal5: false,
  setDrawerOpen: (drawerOpen: boolean) => set(() => ({ drawerOpen })),
  setModalOpen: (modalOpen: boolean) => set(() => ({ modalOpen })),
  setOpenStateOfModal5: (openStateOfModal5: boolean) => set(() => ({ openStateOfModal5 }))
}));

function useIndexStore() {
  const { drawerOpen, modalOpen, openStateOfModal5, setDrawerOpen, setModalOpen, setOpenStateOfModal5 } = innerStore();

  function handleClosingOfDrawer0() {
    setDrawerOpen(false);
  }

  function handleClickingOfButton1() {
    setModalOpen(true);
  }

  function handleCancelingOfModal0() {
    setModalOpen(false);
  }

  function handleOkOfModal0() {
    setModalOpen(false);
  }

  function handleClickingOfButton2() {
    setDrawerOpen(true);
  }

  function handleClickingOfButton0() {
    setDrawerOpen(false);
  }

  return {
    drawerOpen,
    modalOpen,
    openStateOfModal5,
    handleClosingOfDrawer0,
    handleClickingOfButton1,
    handleCancelingOfModal0,
    handleOkOfModal0,
    handleClickingOfButton2,
    handleClickingOfButton0
  };
}

export default useIndexStore;

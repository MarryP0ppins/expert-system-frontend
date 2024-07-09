import { create } from 'zustand';

import { TUser } from '@/types/user';

type TUserStates = {
  isLogin?: boolean;
  user?: TUser;
  likes: Map<number, number>;
};

type TUserActions = {
  reset: () => void;
  setStates: (params: Partial<TUserStates>) => void;
  updateLikes: ({ add, like_id, system_id }: { add: boolean; like_id?: number; system_id: number }) => void;
};

const initialState: TUserStates = {
  isLogin: undefined,
  user: undefined,
  likes: new Map(),
};

export type TUserStore = TUserStates & TUserActions;

const useUserStore = create<TUserStore>((set, get) => ({
  ...initialState,
  setStates: (params) => set(params),
  reset: () => set({ ...initialState, isLogin: false }),
  updateLikes: ({ add, like_id, system_id }) => {
    const newMap = new Map(get().likes);
    if (add) {
      newMap.set(system_id, like_id ?? -1);
      set({ likes: newMap });
    } else {
      newMap.delete(system_id);
      set({ likes: newMap });
    }
  },
}));

export default useUserStore;

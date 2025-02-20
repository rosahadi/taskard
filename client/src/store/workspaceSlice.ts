import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WorkspaceState {
  activeWorkspaceId: number | null;
}

const initialState: WorkspaceState = {
  activeWorkspaceId: null,
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setActiveWorkspace: (state, action: PayloadAction<number>) => {
      state.activeWorkspaceId = action.payload;
    },
    clearActiveWorkspace: (state) => {
      state.activeWorkspaceId = null;
    },
  },
});

export const { setActiveWorkspace, clearActiveWorkspace } =
  workspaceSlice.actions;
export default workspaceSlice.reducer;

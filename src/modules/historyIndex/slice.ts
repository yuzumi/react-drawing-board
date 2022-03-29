import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { UndoLimit } from 'types';
import { endStroke } from 'modules/sharedActions';

export type UndoActionPayload = UndoLimit;

export const historyIndex = createSlice({
  name: 'historyIndex',
  initialState: 0,
  reducers: {
    undo: (state, action: PayloadAction<UndoActionPayload>) => {
      return Math.min(state + 1, action.payload);
    },
    redo: (state) => {
      return Math.max(state - 1, 0);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(endStroke, () => 0);
  },
});

export default historyIndex.reducer;

export const { redo, undo } = historyIndex.actions;

import {createSlice} from "@reduxjs/toolkit";
import chroma from "chroma-js";

export enum AppTheme {
    DARK = 'dark',
    LIGHT = 'light',
    // SYSTEM = 'system'
}

export type SettingsState = {
    theme: AppTheme;
    focus_color: string;
    break_color: string;
    is_premium: boolean;
}

const initial_state: SettingsState = {
    theme: AppTheme.LIGHT,
    focus_color: '#db9cff',
    break_color: '#ffe169',
    is_premium: false
}


const settingsSlice = createSlice({
    name: 'settings',
    initialState: initial_state,
    reducers: {
        setTheme: (state, {payload}: { type: string, payload: AppTheme }) => {
            state.theme = payload;
        },
        setFocusColor: (state, {payload}: { type: string, payload: string }) => {
            // check if focus color is a valid color
            if (!chroma.valid(payload)) {
                return;
            }
            state.focus_color = payload;
        },

        setBreakColor: (state, {payload}: { type: string, payload: string }) => {
            // check if break color is a valid color
            if (!chroma.valid(payload)) {
                return;
            }
            state.break_color = payload;
        },

        // reset all settings to default
        resetSettingsToDefault: () => {
            return initial_state;
        },

        // upgrade the app to premium for a user
        upgradeToPremium: (state) => {
            state.is_premium = true;
        },

        // ! for use in testing and development only
        downgradeToFree: (state) => {
            state.is_premium = false;
        }
    }
})


export const {
    setTheme,
    setFocusColor,
    setBreakColor,
    resetSettingsToDefault,
    upgradeToPremium,
    downgradeToFree
} = settingsSlice.actions;

export default settingsSlice.reducer;
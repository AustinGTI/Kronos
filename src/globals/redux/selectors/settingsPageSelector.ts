import {createSelector} from "@reduxjs/toolkit";
import selectSettingsState from "./base_selectors/settingsSelector";

const selectSettingsPageState = createSelector(selectSettingsState, (settings) => {
    return settings;
})

export default selectSettingsPageState;

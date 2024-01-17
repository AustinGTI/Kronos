import React from 'react'
import {createSelector} from "@reduxjs/toolkit";
import selectSettingsState from "../selectors/base_selectors/settingsSelector";
import {useSelector} from "react-redux";


// a selector specifically for app settings
const selectAppSettings = createSelector(selectSettingsState, (settings) => settings)


export default function useAppSettings() {
    return useSelector(selectAppSettings)
}

import {AppState} from "../../reducers";

export default function selectSettingsState(state: AppState) {
    return state.settings;
}

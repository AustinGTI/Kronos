import {AppState} from "../../reducers";

export default function selectActivityState(state: AppState) {
    return state.activities;
}

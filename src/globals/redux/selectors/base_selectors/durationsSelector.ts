import {AppState} from "../../reducers";

export default function selectDurationState(state: AppState) {
    return state.durations;
}

import {AppState} from "../../reducers";

export default function selectSessionsState(state: AppState) {
    return state.sessions;
}

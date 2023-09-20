import {AppState} from "../../reducers";

export default function selectSessionState(state: AppState) {
    return state.sessions;
}

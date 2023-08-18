import {Duration, SEGMENT_TYPES, SegmentType} from "../../types/main";
import {DurationsState} from "../reducers/durationsReducer";

const DEFAULT_DURATION_STATE: DurationsState = {
    1: {
        id: 1,
        name: '2 Hour Pomodoro Classic',
        segments: [
            {key: 1, duration: 25, type: SEGMENT_TYPES.FOCUS},
            {key: 2, duration: 5, type: SEGMENT_TYPES.BREAK},
            {key: 3, duration: 25, type: SEGMENT_TYPES.FOCUS},
            {key: 4, duration: 5, type: SEGMENT_TYPES.BREAK},
            {key: 5, duration: 25, type: SEGMENT_TYPES.FOCUS},
            {key: 6, duration: 5, type: SEGMENT_TYPES.BREAK},
            {key: 7, duration: 25, type: SEGMENT_TYPES.FOCUS},
        ]
    },
    2: {
        id: 2,
        name: '90 Minute Split',
        segments: [
            {key: 1, duration: 40, type: SEGMENT_TYPES.FOCUS},
            {key: 2, duration: 10, type: SEGMENT_TYPES.BREAK},
            {key: 3, duration: 40, type: SEGMENT_TYPES.FOCUS},
        ]
    },
    3: {
        id: 3,
        name: 'Half Hour Sprint',
        segments: [
            {key: 1, duration: 30, type: SEGMENT_TYPES.FOCUS},
        ]
    }
}

export default DEFAULT_DURATION_STATE
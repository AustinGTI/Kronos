import {Duration, SEGMENT_TYPES, SegmentType} from "../../types/main";
import {DurationsState} from "../reducers/durationsReducer";

const DEFAULT_DURATION_STATE: DurationsState = {
    1: {
        id: 1,
        name: '2 Hour Pomodoro Classic',
        segments: [
            {duration: 25, type: SEGMENT_TYPES.FOCUS},
            {duration: 5, type: SEGMENT_TYPES.BREAK},
            {duration: 25, type: SEGMENT_TYPES.FOCUS},
            {duration: 5, type: SEGMENT_TYPES.BREAK},
            {duration: 25, type: SEGMENT_TYPES.FOCUS},
            {duration: 5, type: SEGMENT_TYPES.BREAK},
            {duration: 25, type: SEGMENT_TYPES.FOCUS},
        ]
    },
    2: {
        id: 2,
        name: '90 Minute Split',
        segments: [
            {duration: 40, type: SEGMENT_TYPES.FOCUS},
            {duration: 10, type: SEGMENT_TYPES.BREAK},
            {duration: 40, type: SEGMENT_TYPES.FOCUS},
        ]
    },
    3: {
        id: 3,
        name: 'Half Hour Sprint',
        segments: [
            {duration: 30, type: SEGMENT_TYPES.FOCUS},
        ]
    }
}

export default DEFAULT_DURATION_STATE
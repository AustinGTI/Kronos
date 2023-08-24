import {Duration, SegmentTypes, SegmentType} from "../../types/main";
import {DurationsState} from "../reducers/durationsReducer";

const DEFAULT_DURATION_STATE: DurationsState = {
    1: {
        id: 1,
        name: '2 Hour Pomodoro Classic',
        segments: [
            {key: 1, duration: 25, type: SegmentTypes.FOCUS},
            {key: 2, duration: 5, type: SegmentTypes.BREAK},
            {key: 3, duration: 25, type: SegmentTypes.FOCUS},
            {key: 4, duration: 5, type: SegmentTypes.BREAK},
            {key: 5, duration: 25, type: SegmentTypes.FOCUS},
            {key: 6, duration: 5, type: SegmentTypes.BREAK},
            {key: 7, duration: 25, type: SegmentTypes.FOCUS},
        ]
    },
    2: {
        id: 2,
        name: '90 Minute Split',
        segments: [
            {key: 1, duration: 40, type: SegmentTypes.FOCUS},
            {key: 2, duration: 10, type: SegmentTypes.BREAK},
            {key: 3, duration: 40, type: SegmentTypes.FOCUS},
        ]
    },
    3: {
        id: 3,
        name: 'Half Hour Sprint',
        segments: [
            {key: 1, duration: 30, type: SegmentTypes.FOCUS},
        ]
    }
}

export default DEFAULT_DURATION_STATE
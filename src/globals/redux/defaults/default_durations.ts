import {Duration, SegmentType} from "../../types/main";
import {DurationsState} from "../reducers/durationsReducer";

const DEFAULT_DURATION_STATE: DurationsState = new Map<number, Duration>([
    [1, {
        id: 1,
        name: '2 Hour Pomodoro Classic',
        segments: [
            {duration: 25, type: SegmentType.FOCUS},
            {duration: 5, type: SegmentType.BREAK},
            {duration: 25, type: SegmentType.FOCUS},
            {duration: 5, type: SegmentType.BREAK},
            {duration: 25, type: SegmentType.FOCUS},
            {duration: 5, type: SegmentType.BREAK},
            {duration: 25, type: SegmentType.FOCUS},
        ]
    }],
    [2, {
        id: 2,
        name: '90 Minute Split',
        segments: [
            {duration: 40, type: SegmentType.FOCUS},
            {duration: 10, type: SegmentType.BREAK},
            {duration: 40, type: SegmentType.FOCUS},
        ]
    }],
    [3, {
        id: 3,
        name: 'Half Hour Sprint',
        segments: [
            {duration: 30, type: SegmentType.FOCUS},
        ]
    }]
])

export default DEFAULT_DURATION_STATE
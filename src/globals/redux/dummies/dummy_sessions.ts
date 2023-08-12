import {Activity, Day, Duration, Segment, SEGMENT_TYPES, SegmentType, Session} from "../../types/main";
import DEFAULT_ACTIVITIES_STATE from "../defaults/default_activities";
import DEFAULT_DURATION_STATE from "../defaults/default_durations";

const RANDOM_SESSION_CONFIG = {
    probabilities: {
        activity_is_defined: 0.91,
        duration_is_defined: 0.8,
        duration_is_default: 0.7,
    }
}


/**
 * Returns a random activity from default activities or undefined based on the probability
 * @returns {Activity | undefined}
 */
function getRandomActivity(): Activity | undefined {
    if (Math.random() < RANDOM_SESSION_CONFIG.probabilities.activity_is_defined) {
        return DEFAULT_ACTIVITIES_STATE[Math.floor(Math.random() * Object.keys(DEFAULT_ACTIVITIES_STATE).length) + 1];
    } else {
        return undefined;
    }
}

/**
 * Returns either the default duration of the given activity or a random duration or undefined based on the probability
 * @param {Activity} activity - The activity to potentially get the duration for
 * @returns {Duration | undefined}
 */
function getRandomDuration(activity: Activity): Duration | undefined {
    if (Math.random() < RANDOM_SESSION_CONFIG.probabilities.duration_is_defined) {
        if (Math.random() < RANDOM_SESSION_CONFIG.probabilities.duration_is_default) {
            return DEFAULT_DURATION_STATE[activity.default_duration_id];
        } else {
            return DEFAULT_DURATION_STATE[Math.floor(Math.random() * Object.keys(DEFAULT_DURATION_STATE).length) + 1];
        }
    } else {
        return undefined;
    }
}

/**
 * Generates a custom duration with random segments to simulate a user creating a custom duration for a single session
 * @returns {Duration}
 */
function generateCustomDuration(): Duration {
    const custom_duration: Duration = {
        id: 0,
        name: 'Custom Duration',
        segments: []
    }
    // pick a random number of focus segments
    const num_focus_segments = Math.floor(Math.random() * 5) + 1
    // pick a focus length between 10 and 60 minutes
    const focus_length = Math.floor(Math.random() * 50) + 10
    // pick a break length between 5 and 15 minutes
    const break_length = Math.floor(Math.random() * 10) + 5
    // generate the segments
    for (let i = 0; i < num_focus_segments; i++) {
        custom_duration.segments.push({duration: focus_length, type: SEGMENT_TYPES.FOCUS})
        if (i < num_focus_segments - 1) {
            custom_duration.segments.push({duration: break_length, type: SEGMENT_TYPES.BREAK})
        }
    }
    return custom_duration
}

/**
 * It is likely that a user with not follow the focus and break pattern of a duration exactly, so this function takes a duration
 * and returns a list of segments that are slightly and randomly skewed from those of the original duration
 * to simulate the user extending or shortening a segment
 * @param {Duration} duration - The duration to skew
 * @returns {Segment}
 */
function skewDurationSegments(duration: Duration): Segment[] {
    const segments: Segment[] = []
    // for each segment in the duration, skew positively 50% of the time and negatively 25% of the time and not at all 25% of the time
    // by a positive random normal distribution with a mean of 0 and a standard deviation of 10% of the segment duration

    for (const segment of duration.segments) {
        let skew = 0
        if (Math.random() < 0.5) {
            skew = Math.abs(generateRandomNormal(0, segment.duration * 0.1))
        } else if (Math.random() < 0.25) {
            skew = -Math.abs(generateRandomNormal(0, segment.duration * 0.1))
        }
        // if the skew is negative and the segment duration is less than the absolute value of the skew, set the skew to 0
        // this protects against the segment duration becoming negative though should be unlikely because of the standard deviation
        if (skew < 0 && segment.duration < Math.abs(skew)) {
            skew = 0
        }
        segments.push({duration: segment.duration + skew, type: segment.type})
    }
    return segments
}

/**
 * this function takes a start date, list of session_segments and existing sessions and checks if there is an overlap with the existing sessions
 * if there is an overlap, it returns true, else false
 * @param {Date} start_date - The start date of the new session
 * @param {Segment[]} session_segments - The segments of the new session
 * @param {Session[]} existing_sessions - The existing sessions to check for overlap
 * @returns {boolean}
 */
function checkForSessionOverlap(start_date: Date, session_segments: Segment[], existing_sessions: Session[]): boolean {
    // get the end date of the new session
    const end_date = new Date(start_date)
    for (const segment of session_segments) {
        end_date.setMinutes(end_date.getMinutes() + segment.duration)
    }
    // check if the new session overlaps with any existing sessions
    for (const existing_session of existing_sessions) {
        // get the end date of the existing session
        const existing_end_date = new Date(existing_session.start_time)
        for (const segment of existing_session.segments) {
            existing_end_date.setMinutes(existing_end_date.getMinutes() + segment.duration)
        }
        // check if the new session overlaps with the existing session
        if (start_date < existing_end_date && end_date > existing_session.start_time) {
            return true
        }
    }
    return false
}


/**
 * Generates dummy sessions for the given date
 * @param {Date} date - The date to generate sessions for
 */
export default function generateDummyDay(date: Date): Day {
    // generate a random number of sessions for the day and loop through them
    const sessions: Session[] = []
    for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
        // get an activity or undefined based on the probability
        const activity: Activity | undefined = getRandomActivity();

        // if the activity is defined, get the duration based on the probability, duration is the default activity if the probability is met else a random duration
        const duration: Duration | undefined = activity ? getRandomDuration(activity) : undefined;

        const session_segments: Segment[] = skewDurationSegments(duration ?? generateCustomDuration())

        let session_start_time = date
        // pick a random start time between 5am and 11pm in a loop until there is no overlap with existing sessions
        while (checkForSessionOverlap(session_start_time, session_segments, sessions)) {
            session_start_time = date
            session_start_time.setHours(Math.floor(Math.random() * 18) + 5)
            session_start_time.setMinutes(Math.floor(Math.random() * 60))
        }

        const session_end_time = new Date(session_start_time)
        for (const segment of session_segments) {
            session_end_time.setMinutes(session_end_time.getMinutes() + segment.duration)
        }

        const session: Session = {
            id: i + 1,
            activity_id: activity?.id,
            duration_id: duration?.id,
            start_time: session_start_time,
            is_ongoing: false,
            end_time: session_end_time,
            segments: session_segments
        }
        sessions.push(session)
    }

    return {
        date: date,
        sessions: sessions.reduce((obj, session) => {
            obj[session.id] = session
            return obj
        }, {} as { [id: number]: Session })
    }
}
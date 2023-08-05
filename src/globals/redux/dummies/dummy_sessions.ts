import {SessionsState} from "../reducers/sessionsReducer";
import {Activity, Duration, Session} from "../../types/main";
import DEFAULT_ACTIVITIES_STATE from "../defaults/default_activities";
import DEFAULT_DURATION_STATE from "../defaults/default_durations";

const RANDOM_SESSION_CONFIG = {
    probabilities: {
        activity_is_defined: 0.91,
        duration_is_defined: 0.8,
        duration_is_default: 0.7,
    }
}


function getRandomActivity(): Activity | undefined {
    if (Math.random() < RANDOM_SESSION_CONFIG.probabilities.activity_is_defined) {
        return DEFAULT_ACTIVITIES_STATE.get(Math.floor(Math.random() * DEFAULT_ACTIVITIES_STATE.size));
    } else {
        return undefined;
    }
}

function getRandomDuration(activity: Activity): Duration | undefined {
    if (Math.random() < RANDOM_SESSION_CONFIG.probabilities.duration_is_defined) {
        if (Math.random() < RANDOM_SESSION_CONFIG.probabilities.duration_is_default) {
            return DEFAULT_DURATION_STATE.get(activity.default_duration_id);
        } else {
            return DEFAULT_DURATION_STATE.get(Math.floor(Math.random() * DEFAULT_DURATION_STATE.size));
        }
    } else {
        return undefined;
    }
}

/**
 * Generates dummy sessions for the given date range
 * @param {Date} start_date - The start date of the range
 * @param {Date} end_date - The end date of the range
 */
export default function generateDummySessions(start_date: Date, end_date: Date): SessionsState {
    const session_state = new Map<string, SessionsState>()
    // iterate through every day in the range
    for (let date = new Date(start_date); date <= end_date; date.setDate(date.getDate() + 1)) {
        // generate a random number of sessions for the day and loop through them
        const sessions: Session[] = []
        for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
            // get an activity or undefined based on the probability
            const activity: Activity | undefined = getRandomActivity();

            // if the activity is defined, get the duration based on the probability, duration is the default activity if the probability is met else a random duration
            const duration: Duration | undefined = activity ? getRandomDuration(activity) : undefined;


        }

    }

}

import * as yup from 'yup'
import {Duration, Segment, SegmentTypes, SegmentType} from "../../../../../globals/types/main";

const DurationFormValidation = yup.object().shape({
    name: yup.string().min(3).max(24)
        // the text must have at leat 3 non-whitespace characters too
        .matches(/\S{3,}/, 'Name must have at least 3 non-whitespace characters')
        // is required
        .required('Name is required'),

    segments: yup.array()
        .of(yup.object().shape({
            key: yup.number().required('Key is required'),
            duration: yup.number()
                .min(1, 'Segment must be at least 1 minute')
                .max(180, 'Segment cannot be more than 3 hours')
                .required('Duration is required'),
            type: yup.object().shape({
                name: yup.string().oneOf([SegmentTypes.FOCUS.name, SegmentTypes.BREAK.name]).required('Type is required'),
                color: yup.string().required('Color is required')
            })
        }))
        .test('atLeastOneSegment',
            'There must be at least one segment',
            (values) => {
                if (values === undefined) {
                    return false
                }
                return atLeastOneSegmentValidator(values as Segment[]);
            })
        .test('startAndEndWithFocusSegment',
            'First and last segments must be focus segments',
            (values) => {
                if (values === undefined) {
                    return false
                }
                return startAndEndWithFocusSegmentValidator(values as Segment[]);
            })
        // .test('notMoreThanSevenSegments',
        //     'There cannot be more than 7 segments',
        //     (values) => {
        //         if (values === undefined) {
        //             return false
        //         }
        //         return notMoreThanSevenSegmentsValidator(values as Segment[]);
        //     })
        .test('noTwoAdjacentSegmentsOfSameType',
            'There cannot be 2 adjacent segments of the same type',
            (values) => {
                if (values === undefined) {
                    return false
                }
                return noTwoAdjacentSegmentsOfSameTypeValidator(values as Segment[]);
            })
})

function atLeastOneSegmentValidator(segments: Segment[]) {
    return segments.length > 0
}

function notMoreThanSevenSegmentsValidator(segments: Segment[]) {
    return segments.length <= 7
}

function noTwoAdjacentSegmentsOfSameTypeValidator(segments: Segment[]) {
    for (let i = 0; i < segments.length - 1; i++) {
        if (segments[i].type.name === segments[i + 1].type.name) {
            return false
        }
    }
    return true
}

function startAndEndWithFocusSegmentValidator(segments: Segment[]) {
    if (segments.length === 0) {
        return false
    }
    return segments[0].type.name === SegmentTypes.FOCUS.name && segments[segments.length - 1].type.name === SegmentTypes.FOCUS.name
}


export default DurationFormValidation
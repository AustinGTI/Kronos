import * as yup from 'yup'
import {Duration, Segment, SegmentTypes, SegmentType} from "../../../../../globals/types/main";

const DurationFormValidation  = yup.object().shape({
    name: yup.string().min(3).max(50).required('Name is required'),
    segments: yup.array().of(yup.object().shape({
        duration: yup.number().min(1).max(180).required('Duration is required'),
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
})

function atLeastOneSegmentValidator(segments: Segment[]) {
    return segments.length > 0
}

function startAndEndWithFocusSegmentValidator(segments: Segment[]) {
    if (segments.length === 0) {
        return false
    }
    return segments[0].type.name === SegmentTypes.FOCUS.name && segments[segments.length - 1].type.name === SegmentTypes.FOCUS.name
}

export default DurationFormValidation
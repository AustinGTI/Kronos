import * as yup from 'yup';


const ActivityFormValidation = yup.object().shape({
    name: yup.string().min(3).max(24)
        // the text must have at leat 3 non-whitespace characters too
        .matches(/\S{3,}/, 'Name must have at least 3 non-whitespace characters')
        // is required
        .required('Name is required'),
    color: yup.string().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color is invalid').required('Color is required'),
    // default_duration_id: yup.number().required('Default duration is required'),
    default_duration_id: yup.number().nullable(),
})

export default ActivityFormValidation
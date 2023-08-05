import * as yup from 'yup';


const ActivityFormValidation = yup.object().shape({
    name: yup.string().min(3).max(50).required('Name is required'),
    color: yup.string().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color is invalid').required('Color is required'),
    default_duration_id: yup.number().required('Default duration is required'),
})

export default ActivityFormValidation
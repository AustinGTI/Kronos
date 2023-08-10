import * as yup from 'yup'

const DurationFormValidation = yup.object().shape({
    name: yup.string().min(3).max(50).required('Name is required'),
})

export default DurationFormValidation
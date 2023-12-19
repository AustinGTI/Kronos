import React from "react";
import {CalendarTabContext} from "./context";
import {Paragraph, StackProps, View, XStack, YStack} from "tamagui";
import {Day} from "../../../../globals/types/main";
import KronosContainer from "../../../../globals/components/wrappers/KronosContainer";
import CalendarPicker from "react-native-calendar-picker";
import {dateToDDMMYYYY} from "../../../../globals/helpers/datetime_functions";
import {KronosPageContext, ModalType} from "../../../../globals/components/wrappers/KronosPage";
import KronosButton from "../../../../globals/components/wrappers/KronosButton";
import {string} from "yup";
import {heightPercentageToDP, widthPercentageToDP} from "react-native-responsive-screen";

interface SideBarProps extends StackProps {
    day: Day
    setTargetDateAsDDMMYYYY: (date_as_dmy: string) => void
}

interface CalendarPickerAlertModalProps {
    active_date_as_obj: Date,
    setTargetDateAsDDMMYYYY: (date_as_dmy: string) => void,
    closeModal: () => void
}

function CalendarPickerAlertModal({
                                      active_date_as_obj,
                                      setTargetDateAsDDMMYYYY,
                                      closeModal
                                  }: CalendarPickerAlertModalProps) {
    const [selected_date_as_dmy, setSelectedDateAsDmy] = React.useState<string | null>(null)

    return (
        <YStack alignItems={'center'}>
            <Paragraph fontSize={22} marginTop={3} marginBottom={10} textTransform={'uppercase'}>
                {'Select Date'}
            </Paragraph>
            <View h={heightPercentageToDP('35%')}>
                <CalendarPicker
                    initialDate={active_date_as_obj}
                    width={widthPercentageToDP('80%')}
                    textStyle={{fontFamily: 'Rubik'}}
                    disabledDates={(date) => {
                        // any date_as_iso after today is disabled
                        return date.isAfter(new Date())
                    }}
                    onDateChange={(date) => {
                        // convert from moment to Date and set to active date_as_iso then close the date_as_iso picker
                        setSelectedDateAsDmy(dateToDDMMYYYY(date.toDate()))
                        // closeModal()
                    }}/>
            </View>
            <XStack w={'90%'} justifyContent={'space-between'}>
                <KronosButton
                    margin={0} padding={0}
                    onPress={() => closeModal()}
                    label={'Cancel'}/>
                <KronosButton
                    margin={0} padding={0}
                    disabled={selected_date_as_dmy === null}
                    onPress={() => {
                        if (selected_date_as_dmy) {
                            setTargetDateAsDDMMYYYY(selected_date_as_dmy)
                            closeModal()
                        }
                    }}
                    label={'Set'}/>
            </XStack>
        </YStack>
    )
}

export default function CalendarSideBar({day, setTargetDateAsDDMMYYYY, ...stack_props}: SideBarProps) {
    // const {
    //     date_picker_data: {setDatePickerVisibility}
    // } = React.useContext(CalendarTabContext)

    const {modal_props: {openModal}} = React.useContext(KronosPageContext)

    const [day_of_week, day_date, month, year] = React.useMemo(() => {
        const date = new Date(day.date_as_iso)
        return [
            date.toLocaleString('default', {weekday: 'short'}).split(',')[0],
            date.getDate(),
            date.toLocaleString('default', {month: 'short'}),
            date.getFullYear()
        ]
    }, [day.date_as_iso])

    const [no_of_sessions, total_session_duration_in_hours] = React.useMemo(() => {
        const day_sessions = Object.values(day.sessions)
        const no_of_sessions = day_sessions.length
        const total_session_duration_in_hours = day_sessions.reduce((total, session) => {
            let duration = 0
            for (const segment of session.segments) {
                duration += segment.duration
            }
            return total + duration
        }, 0)
        return [no_of_sessions, Math.round(total_session_duration_in_hours / 60)]
    }, [day.sessions])

    const openCalendarPicker = React.useCallback(() => {
        openModal({
            type: ModalType.ALERT,
            component: CalendarPickerAlertModal,
            component_props: {
                active_date_as_obj: new Date(day.date_as_iso),
                setTargetDateAsDDMMYYYY,
            }
        })
    }, [openModal, day.date_as_iso, setTargetDateAsDDMMYYYY]);

    return (
        <YStack justifyContent={'space-between'} {...stack_props}>
            <KronosContainer w={'100%'} h={'25%'}>
                <YStack
                    onPress={openCalendarPicker}
                    w={'100%'} h={'100%'} alignItems={'center'} justifyContent={'center'}>
                    <Paragraph fontSize={22} marginVertical={2} textTransform={'uppercase'}>{day_of_week}</Paragraph>
                    <Paragraph fontSize={36} lineHeight={40} marginVertical={2}
                               textTransform={'uppercase'}>{day_date.toString().padStart(2, '0')}</Paragraph>
                    <Paragraph fontSize={22} marginVertical={2} textTransform={'uppercase'}>{month}</Paragraph>
                    <Paragraph fontSize={19} marginVertical={2} textTransform={'uppercase'}>{year}</Paragraph>
                </YStack>
            </KronosContainer>
            <KronosContainer w={'100%'} h={'25%'}>
                <YStack w={'100%'} h={'100%'} alignItems={'center'} justifyContent={'flex-end'}>
                    <YStack alignItems={'center'} justifyContent={'center'} paddingVertical={5}>
                        <Paragraph color={'#555'} textTransform={'uppercase'} fontSize={12}>Sessions</Paragraph>
                        <Paragraph fontSize={36}
                                   lineHeight={40}>{no_of_sessions.toString().padStart(2, '0')}</Paragraph>
                    </YStack>
                    <YStack alignItems={'center'} justifyContent={'center'} paddingVertical={5}>
                        <Paragraph color={'#555'} textTransform={'uppercase'} fontSize={12}>Hours</Paragraph>
                        <Paragraph fontSize={36}
                                   lineHeight={40}>{total_session_duration_in_hours.toString().padStart(2, '0')}</Paragraph>
                    </YStack>
                </YStack>
            </KronosContainer>
        </YStack>
    )
}

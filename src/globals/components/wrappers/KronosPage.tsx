import React from 'react'
import {AlertDialog, Sheet, View, YStack} from "tamagui";
import SessionViewModal from "../../../pages/home/tabs/calendar-tab/modals/SessionViewModal";
import CalendarPicker from "react-native-calendar-picker";
import {dateToDDMMYYYY} from "../../helpers/datetime_functions";

interface KronosPageProps {
    children: React.ReactNode
}



export default function KronosPage({children}: KronosPageProps) {
    // const [modal_visible, setModalVisibility] = React.useState<boolean>(false)
    return (
        <View w={'100%'} h={'100%'} backgroundColor={'$background'} padding={15}>
            {children}
            {/*<Sheet modal={true}*/}
            {/*       defaultOpen*/}
            {/*       open={modal_visible}*/}
            {/*       snapPoints={[50]}*/}
            {/*       animationConfig={{*/}
            {/*           type: "spring",*/}
            {/*           damping: 50,*/}
            {/*           stiffness: 500*/}
            {/*       }}*/}
            {/*       onOpenChange={(open: boolean) => {*/}
            {/*           if (!open) {*/}
            {/*               // wait for the sheet to close before clearing the modal element*/}
            {/*               setTimeout(() => {*/}
            {/*                   setSessionInModal(null);*/}
            {/*               }, 500);*/}
            {/*           }*/}
            {/*           setModalVisibility(open);*/}
            {/*       }}*/}
            {/*       dismissOnSnapToBottom*/}
            {/*       disableDrag>*/}
            {/*    <Sheet.Overlay/>*/}
            {/*    <Sheet.Handle/>*/}
            {/*    {*/}
            {/*        // ! There is a bug that causes the sheet frame to glitch upwards when the window frame is open for a few milliseconds*/}
            {/*        // ! This is a fix that sets the background color of the frame to transparent so the glitch can't be seen*/}
            {/*        // ! then creates a View in the sheet with max dimensions and bg white*/}
            {/*    }*/}
            {/*    <Sheet.Frame height={400} backgroundColor={"transparent"} borderTopWidth={2}*/}
            {/*                 borderColor={'$border'}>*/}
            {/*        <Sheet.Frame w={"100%"} h={"100%"} backgroundColor={"$background"}>*/}
            {/*            <SessionViewModal session={session_in_modal}/>*/}
            {/*        </Sheet.Frame>*/}
            {/*    </Sheet.Frame>*/}
            {/*</Sheet>*/}
            {/*<AlertDialog*/}
            {/*    open={date_picker_visible}*/}
            {/*    onOpenChange={setDatePickerVisibility}>*/}
            {/*    <AlertDialog.Portal>*/}
            {/*        <AlertDialog.Overlay*/}
            {/*            key="overlay"*/}
            {/*            animation="quick"*/}
            {/*            opacity={0.5}*/}
            {/*            enterStyle={{opacity: 0}}*/}
            {/*            exitStyle={{opacity: 0}}*/}
            {/*        />*/}
            {/*        <AlertDialog.Content*/}
            {/*            bordered*/}
            {/*            elevate*/}
            {/*            key="content"*/}
            {/*            animation={[*/}
            {/*                'quick',*/}
            {/*                {*/}
            {/*                    opacity: {*/}
            {/*                        overshootClamping: true,*/}
            {/*                    },*/}
            {/*                },*/}
            {/*            ]}*/}
            {/*            enterStyle={{x: 0, y: -20, opacity: 0, scale: 0.9}}*/}
            {/*            exitStyle={{x: 0, y: 10, opacity: 0, scale: 0.95}}*/}
            {/*            x={0}*/}
            {/*            scale={1}*/}
            {/*            opacity={1}*/}
            {/*            y={0}*/}
            {/*            maxWidth={'90%'}>*/}
            {/*            <YStack w={'100%'}>*/}
            {/*                <CalendarPicker*/}
            {/*                    initialDate={active_date_as_obj}*/}
            {/*                    width={300}*/}
            {/*                    disabledDates={(date) => {*/}
            {/*                        // any date_as_iso after today is disabled*/}
            {/*                        return date.isAfter(new Date())*/}
            {/*                    }}*/}
            {/*                    onDateChange={(date) => {*/}
            {/*                        // convert from moment to Date and set to active date_as_iso then close the date_as_iso picker*/}
            {/*                        setTargetDateAsDmy(dateToDDMMYYYY(date.toDate()))*/}
            {/*                        setDatePickerVisibility(false)*/}
            {/*                    }}/>*/}
            {/*            </YStack>*/}
            {/*        </AlertDialog.Content>*/}
            {/*    </AlertDialog.Portal>*/}
            {/*</AlertDialog>*/}
        </View>
    )
}

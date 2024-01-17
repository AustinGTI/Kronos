import React from 'react'
import {Paragraph, ScrollView, XStack, YStack} from "tamagui";
import ThemeSetting from "./panes/ThemeSetting";
import {useDispatch, useSelector} from "react-redux";
import DataSetting from "./panes/DataSetting";
import selectSettingsPageState from "../../../../globals/redux/selectors/settingsPageSelector";
import Accordion from "../../../../globals/components/wrappers/Accordion";
import KronosPage from "../../../../globals/components/wrappers/KronosPage";
import AppBanner from "./banner";
import BackupSetting from "./panes/backup/BackupSetting";

interface PaneWrapperProps {
    label: string
    children: React.ReactNode
}

function PaneWrapper({label, children}: PaneWrapperProps) {
    return (
        <YStack w={'100%'} paddingHorizontal={20} paddingVertical={5}>
            <XStack w={'100%'} paddingVertical={10} borderBottomWidth={1} borderBottomColor={'#aaa'}>
                <Paragraph fontSize={15} fontWeight={'600'} color={'$color'}
                           textTransform={'uppercase'}>{label}</Paragraph>
            </XStack>
            {children}
        </YStack>
    )
}

export default function SettingsTab() {
    const {theme, focus_color, break_color} = useSelector(selectSettingsPageState)
    const dispatch = useDispatch()

    return (
        <KronosPage>
            <ScrollView w={'100%'} f={1} showsVerticalScrollIndicator={false}>
                <YStack w={'100%'} backgroundColor={'$background'} alignItems={'center'}>
                    <AppBanner/>
                    <DataSetting/>
                    <BackupSetting/>
                </YStack>
            </ScrollView>
        </KronosPage>
    )
}

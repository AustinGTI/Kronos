import React, {useCallback, useMemo} from 'react'
import {Circle, Paragraph, Separator, XStack, YStack} from "tamagui";
import {Duration} from "../../../../../globals/types/main";
import {ChevronDown, ChevronUp, Delete, Edit, Play} from "@tamagui/lucide-icons";
import {ActivityStat} from "./ActivitiesTab";
import {useSelector} from "react-redux";
import {AppState} from "../../../../../globals/redux/reducers";
import {FlatList} from "react-native";

interface DurationPaneProps {
    duration: Duration
    open_duration: Duration | null
    setOpenDuration: React.Dispatch<React.SetStateAction<Duration | null>>
}

function DurationPane({duration, open_duration, setOpenDuration}: DurationPaneProps) {
    const handleOnClickPane = useCallback(() => {
        if (open_duration === duration) {
            setOpenDuration(null)
        } else {
            setOpenDuration(duration)
        }
    }, [open_duration, duration, setOpenDuration]);

    const is_open = useMemo(() => {
        return open_duration?.id === duration.id
    }, [open_duration?.id, duration.id]);


    return (
        <YStack width={'95%'} borderRadius={10} margin={'2.5%'} backgroundColor={'white'}>
            <XStack justifyContent={'space-between'} alignItems={'center'} width={'100%'} onPress={handleOnClickPane}
                    padding={20}>
                <YStack alignItems={'center'}>
                    <Paragraph fontSize={24} color={'black'} lineHeight={28}>
                        {duration.segments.reduce((total, v, i) => {
                            return total + v.duration
                        }, 0)}
                    </Paragraph>
                    <Paragraph fontSize={8} color={'#aaa'} lineHeight={10}>MINS</Paragraph>
                </YStack>
                <Paragraph>{duration.name}</Paragraph>
                {is_open ? <ChevronUp size={'2$'} color={'#777'}/> : <ChevronDown size={'2$'} color={'#777'}/>}
            </XStack>
            {
                is_open && (
                    <React.Fragment>
                        <Separator width={'90%'} marginHorizontal={'5%'}/>
                        <YStack width={'100%'} backgroundColor={'transparent'} padding={10}>
                            <XStack justifyContent={'space-around'} width={'100%'} paddingVertical={10}>
                                <Edit size={20} color={'#777'}/>
                                <Play size={20} color={'#777'}/>
                                <Delete size={20} color={'#777'}/>
                            </XStack>
                        </YStack>
                    </React.Fragment>
                )
            }
        </YStack>
    );
}

export default function DurationsTab() {
    const durations = useSelector((state: AppState) => state.durations)

    // only one duration can be open at a time to simulate an accordion
    const [open_duration, setOpenDuration] = React.useState<Duration | null>(null)

    return (
        <FlatList
            style={{width: '100%', marginVertical: 10}}
            data={Object.values(durations)}
            renderItem={({item}) => (
                <DurationPane duration={item} open_duration={open_duration} setOpenDuration={setOpenDuration}/>
            )}/>
    )
}

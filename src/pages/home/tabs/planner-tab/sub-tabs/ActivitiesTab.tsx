import React from 'react'
import {Paragraph, YStack} from "tamagui";
import {useSelector} from "react-redux";
import {AppState} from "../../../../../globals/redux/reducers";
import {Activity} from "../../../../../globals/types/main";

export default function ActivitiesTab() {
    const activities = useSelector((state: AppState) => state.activities)
    return (
        <React.Fragment>
            {
                Object.values(activities).map((activity: Activity) => {
                    return (
                        <Paragraph key={activity.id}>{activity.name}</Paragraph>
                    )
                })
            }
        </React.Fragment>
    )
}
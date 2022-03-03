import React from 'react';
import Calendar from 'components/Calendar/Calendar'


export default function therapecuticCalendar({events}) {

    return (
        <div style={{ display: "flex", width: "600px", height: "575px" }}>
            <Calendar events={events} />
        </div>
    )
}
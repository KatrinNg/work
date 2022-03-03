import React, {useImperativeHandle} from "react";
import Alarm3_1 from 'resource/audio/Alarm3_1.mp3';
import Alarm5 from 'resource/audio/Alarm5.mp3';
import Error01 from 'resource/audio/error01.mp3';
import Magical from 'resource/audio/magical.mp3';

export default function VoiceAlert ({childRef}) {
    // style={{display: 'none'}}
    const videoList = [
        {key: voiceType.Alarm3_1, src: Alarm3_1 },
        {key: voiceType.Alarm5, src: Alarm5, },
        {key: voiceType.Error01, src: Error01 },
        {key: voiceType.Magical, src: Magical },
    ]
    const playVideo = (id) => {
        const formatId = `customVoiceAlertVideo_${id}`
        const label = document.getElementById(formatId);
        label && label.play();
    }
    const pauseVideo = (id) => {
        const formatId = `customVoiceAlertVideo_${id}`
        const label = document.getElementById(formatId);
        label && label.pause();
    }
    
    useImperativeHandle(childRef,() => ({
        playVideo,
        pauseVideo,
    }))
  
    return <>
                {
                    videoList.map(i => {
                        return (
                            <video key={i.key} id={`customVoiceAlertVideo_${i.key}`} style={{display: 'none'}}>
                                <source src={i.src} type="video/mp4"></source>
                            </video>
                        )
                    })
                }
            </>
}

export const voiceType = {
    Alarm3_1: 'Alarm3_1',
    Alarm5: 'Alarm5',
    Error01: 'Error01',
    Magical: 'Magical',
}
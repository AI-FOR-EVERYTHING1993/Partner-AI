"use client"

import React, { useState } from "react";
import Image from "next/image";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    ENDED = "ENDED"
}


interface AgentProps {
    userName?: string;
}

const Agent = ({ userName = "User" }: AgentProps) => {
    const isSpeaking = true;
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);

    const messages = [
        "Hello, welcome to your interview preparation session.",
        "What is your name?",
        "My name is Thion Jey, nice to meet you.",
    ];

    const lastMessage = messages[messages.length - 1];

    
    return (
        <>
            <div className="call-view"> 
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image 
                            src="/ai-avatar.png" 
                            alt="Vapi Interviewer Avatar"
                            width={66}
                            height={54}
                            className="object-cover"/>
                        {isSpeaking && <span className="animate-speak"></span>}
                    </div>
                    <h3>Partner AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image 
                            src="/user-avatar.png" 
                            alt="user avatar"
                            width={540}
                            height={540}
                            className="rounded-full object-cover size-[120px]"/>
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>

            {messages.length > 0 && (
                <div className="transcript-border flex justify-center">
                    <div className="transcript-content text-center">
                        <p key={lastMessage} className="">{lastMessage}</p>
                    </div>
                </div>
            )}
            
            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="btn-call">
                        {callStatus === CallStatus.INACTIVE || callStatus === CallStatus.ENDED ? "Start Call" : "Connecting..."}
                    </button>
                ) : (
                    <button className="btn-stop-call">
                        End Call
                    </button>
                )}
            </div>
        </>
    );
};

export default Agent;
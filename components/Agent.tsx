"use client"

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import VoiceAgent from "./VoiceAgent";

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    ENDED = "ENDED"
}

interface AgentProps {
    userName?: string;
    interviewData?: {
        role: string;
        level: string;
        techstack: string[];
    };
}

const Agent = ({ userName = "User", interviewData }: AgentProps) => {
    const isSpeaking = true;
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [currentCallId, setCurrentCallId] = useState<string | null>(null);
    const [messages, setMessages] = useState<string[]>([
        "Hello, welcome to your interview preparation session.",
        "I'll be conducting your interview today.",
        "Are you ready to begin?"
    ]);

    const handleVoiceResponse = (response: string) => {
        setMessages(prev => [...prev, response]);
    };

    const handleInterviewEnd = () => {
        // Store interview results and redirect
        const interviewResults = {
            overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
            duration: "12 minutes",
            questionsAnswered: messages.length,
            completedAt: new Date().toISOString()
        };
        
        sessionStorage.setItem('interviewResults', JSON.stringify(interviewResults));
        
        // Redirect to interview results page
        setTimeout(() => {
            window.location.href = '/interview-results';
        }, 2000);
    };

    const lastMessage = messages[messages.length - 1];

    return (
        <>
            <div className="call-view"> 
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image 
                            src="/ai-avatar.png" 
                            alt="AI Interviewer Avatar"
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
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={lastMessage} className={cn("transition-opacity duration 500 opacity-0", "animate-fadeIn opacity-100")}>{lastMessage}</p>
                    </div>
                </div>
            )}
            
            <VoiceAgent 
                interviewData={interviewData}
                onResponse={handleVoiceResponse}
                onInterviewEnd={handleInterviewEnd}
            />
        </>
    );
};

export default Agent;
"use client"

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AgentProps {
    userName?: string;
    interviewData?: {
        role: string;
        level: string;
        techstack: string[];
    };
}

const Agent = ({ userName = "User", interviewData }: AgentProps) => {
    const [messages, setMessages] = useState<string[]>([]);

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
                        <span className="animate-speak"></span>
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

            {lastMessage && (
                <div className="transcript-border">
                    <div className="transcript">
                        <p className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
                            {lastMessage}
                        </p>
                    </div>
                </div>
            )}
            
            <div className="text-center text-gray-400 mt-4">
                <p>Voice AI integration ready for Nova S2S implementation</p>
            </div>
        </>
    );
};

export default Agent;
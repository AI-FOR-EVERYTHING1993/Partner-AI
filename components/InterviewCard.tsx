import React from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DisplayTechIcons from "./DisplayTechIcons";



interface InterviewCardProps {
  interview: {
    id: string;
    role: string;
    type: string;
    level: string;
    techstack: string[];
    createdAt: string;
  };
}

const InterviewCard = ({ interview }: InterviewCardProps) => {
  const feedback = null as Feedback | null;
  const normalizedtype = /mix/gi.test(interview.type) ? "Mixed" : interview.type;
  const formattedDate = dayjs(feedback ? feedback.createdAt || interview.createdAt || Date.now() : interview.createdAt).format("MMM D, YYYY");



  return (
    <div className="relative card-border w-full max-w-[360px] min-h-[420px] p-4 flex flex-col gap-2">
      <div className="card-interview relative">
        <div className="relative">
          <div className="absolute top-0 right-0 z-10 w-fit px-4 py-2 rounded-bl-lg bg-green-600">
            <p className="badge-text">{normalizedtype}</p>
          </div>
          <Image
            src={getRandomInterviewCover()}
            alt="Interview Cover Image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />

          <h3 className="mt-5 capitalize">
            {interview.role} Interview
            </h3>
        </div>
      </div>
      <div className="flex flex-row gap-5 mt-3">
        <div className="flex flex-row gap-2">
          <Image src="/calendar.svg" alt="calendar" width={24} height={24} />
        </div>
        <div>
          <p>{formattedDate}</p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <Image src="/star.svg" alt="Star" width={24} height={24} />
          <p>{feedback?.totalScore || "---"}/100</p>
        </div>
      </div>
      <p className="line-clamp-2 mt-4 flex-grow">
        {feedback ? feedback.finalAssessment : "No feedback available yet. Complete the interview to receive detailed feedback and improve your interview taking skills!"}
      </p>
      <div className="flex flex-row items-center justify-between gap-4 mt-auto pt-4 pb-2">
        {interview.type === "Technical" ? (
          <DisplayTechIcons techStack={interview.techstack} />
        ) : (
          <div className="flex flex-wrap gap-1">
            {interview.techstack.slice(0, 3).map((skill, index) => (
              <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {skill}
              </span>
            ))}
            {interview.techstack.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{interview.techstack.length - 3}
              </span>
            )}
          </div>
        )}

        <Button className="btn-primary">
          <Link href={feedback ? `/interview/${interview.id}` : `/interview/${interview.id}`}>
            {feedback ? "Check Feedback" : "View Interview"}
          </Link>
        </Button>
      </div>
    </div>    
  );
};

export default InterviewCard;

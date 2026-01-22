"use client"

import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
import Link from "next/link"
import { Inter } from "next/font/google";
import { dummyInterviews } from "@/constants";
import InterviewCard from "@/components/InterviewCard";

const Page = () => {
  return (
    <>
    
    <section className= "card-cta">
      <div className="flex flex-col gap-6 max-w-lg">
        <h2>Practice for any job interview with AI-powered preparation</h2>
        <p className="text-lg">Master technical and non-technical interviews across all industries. Get personalized feedback and build confidence for your dream role.</p>
      
      
      <Button asChild className="btn-primary max-sm:w-full">
        <Link href="/select-interview">Start your Interview </Link>
      </Button>

      </div>

      <Image src="/robot.png" alt="Robot guy" width={400} height={400} className="max-sm:hidden" />

    </section>

    <section className="flex flex-col gap-6 mt-24">
      <h2 className="text-2xl font-bold">Your Interviews</h2>
      <div className="interviews-section">
        {dummyInterviews.map((interview) => (
          <InterviewCard key={interview.id} interview={interview} />
        ))}
      </div>
    </section>

    <section className="flex flex-col gap-6 mt-24 mb-24">
      <h2 className="text-2xl font-bold">Take your Interview</h2>
      <div className="interviews-section">
        {dummyInterviews.map((interview) => (
          <InterviewCard key={interview.id} interview={interview} />
        ))}
      </div>
    </section>
    </>
    
  );
};

export default Page;
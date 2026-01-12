"use client"

import { Button } from "@/components/ui/button";
import React from "react";
import Image from "next/image";
import Link from "next/link"

const Page = () => {
  return (
    <>
    
    <section className= "card-cta">
      <div className="flex flex-col gap-6 max-w-lg">
        <h2>Practice for the job of your dreams and fix your CV with voice AI</h2>
        <p className="text-lg">Get recommedations for your resume and practice for the job with instant feedback.</p>
      
      
      <Button asChild className="btn-primary max-sm:w-full">
        <Link href="/interview">Start your Interview </Link>
      </Button>

      </div>

      <Image src="/robot.png" alt="Robot guy" width={400} height={400} className="max-sm:hidden" />

    </section>

    <section className="flex flex-col gap-6 mt-8">
      <h2>Your Interviews</h2>
      <div className="interviews-section">
        <p>Take your first interview, now. <br /> Upload your resume and receive instant, AI-driven feedback to enhance your CV and increase your chances of acing your interview.</p>
      </div>
    </section>

    <section className="flex flex-col gap-6 mt-8">
      <h2>Take your Interview</h2>

      <div className="interviews-section">
        <p>There are currently no interviews available.</p>
      </div>
    </section>
    </>
    
  );
};

export default Page;
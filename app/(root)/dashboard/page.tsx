"use client"

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UserStats {
  totalInterviews: number;
  averageScore: number;
  recentSessions: Array<{
    sessionId: string;
    category: string;
    timestamp: string;
    scores?: {
      overall: number;
      technical: number;
      communication: number;
    };
  }>;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

interface ResumeAnalysis {
  analysisId: string;
  timestamp: string;
  analysis: {
    overallScore: number;
    detectedRole: string;
    experienceLevel: string;
    recommendedInterviews: Array<{
      category: string;
      name: string;
      match: number;
    }>;
  };
}

const Dashboard = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<ResumeAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user stats
      const statsResponse = await fetch('/api/user/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent resume analyses
      const analysesResponse = await fetch('/api/user/resume-analyses');
      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json();
        setRecentAnalyses(analysesData.analyses || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Prep Dashboard</h1>
          <p className="text-gray-600">Track your progress and improve your interview skills</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-3xl font-bold text-emerald-600">{stats?.totalInterviews || 0}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-xl">📝</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.averageScore ? Math.round(stats.averageScore) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resume Analyses</p>
                <p className="text-3xl font-bold text-purple-600">{recentAnalyses.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">📄</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-lg font-bold text-orange-600">
                  {stats?.topCategories?.[0]?.category || 'None'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 text-xl">🏆</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Interview Sessions */}
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Interview Sessions</h2>
              <Link href="/interview-results">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            {stats?.recentSessions && stats.recentSessions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentSessions.map((session, index) => (
                  <div key={session.sessionId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{session.category.replace('-', ' ')}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {session.scores ? (
                        <div>
                          <p className="text-lg font-bold text-emerald-600">{session.scores.overall}%</p>
                          <p className="text-xs text-gray-500">Overall Score</p>
                        </div>
                      ) : (
                        <span className="text-sm text-yellow-600">In Progress</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No interview sessions yet</p>
                <Link href="/select-interview">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Start Your First Interview</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Recent Resume Analyses */}
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Resume Analyses</h2>
              <Link href="/pdf-analysis">
                <Button variant="outline" size="sm">Analyze New</Button>
              </Link>
            </div>
            
            {recentAnalyses.length > 0 ? (
              <div className="space-y-4">
                {recentAnalyses.slice(0, 3).map((analysis, index) => (
                  <div key={analysis.analysisId} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{analysis.analysis.detectedRole}</p>
                      <span className="text-lg font-bold text-blue-600">{analysis.analysis.overallScore}/100</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Level: {analysis.analysis.experienceLevel} • {new Date(analysis.timestamp).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.analysis.recommendedInterviews.slice(0, 2).map((interview, idx) => (
                        <span key={idx} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          {interview.name} ({interview.match}%)
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No resume analyses yet</p>
                <Link href="/pdf-analysis">
                  <Button className="bg-purple-600 hover:bg-purple-700">Upload Your Resume</Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 p-6 bg-white shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/pdf-analysis">
              <Button className="w-full h-20 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">📄</span>
                <span>Analyze Resume</span>
              </Button>
            </Link>
            
            <Link href="/select-interview">
              <Button className="w-full h-20 bg-emerald-600 hover:bg-emerald-700 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">🎤</span>
                <span>Start Interview</span>
              </Button>
            </Link>
            
            <Link href="/resources">
              <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">📚</span>
                <span>Study Resources</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
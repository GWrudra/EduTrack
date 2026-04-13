'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore, DailyQuote } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  BarChart3, BookOpen, Award, TrendingUp, RefreshCw 
} from 'lucide-react';
import { getInitial } from '@/lib/utils';

// ============ POINTS PAGE (Student) ============

export function PointsPage() {
  const { user, dataUpdateCounter } = useAppStore();
  const [dynamicPoints, setDynamicPoints] = useState({ totalPoints: 0, academicPoints: 0, socialPoints: 0 });
  const [stats, setStats] = useState({ cgpa: 0, avgScore: 0, topScore: 0, subjectCount: 0 });

  useEffect(() => {
    const fetchAcademicData = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/academic?studentId=${user.id}`);
        const data = await res.json();
        if (data.success) {
          const marks = data.data.subjectMarks || [];
          const totalMarks = marks.reduce((sum: number, m: any) => sum + (m.totalMarks || 0), 0);
          const avgScore = marks.length > 0 ? (totalMarks / marks.length).toFixed(1) : 0;
          const topScore = marks.length > 0 ? Math.max(...marks.map((m: any) => m.totalMarks || 0)) : 0;

          setStats({
            cgpa: data.data.stats?.currentCGPA || 0,
            avgScore: Number(avgScore),
            topScore: topScore,
            subjectCount: marks.length
          });

          if (data.data.points) {
            setDynamicPoints({
              totalPoints: data.data.points.totalPoints,
              academicPoints: data.data.points.academicPoints,
              socialPoints: data.data.points.socialPoints
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch academic data:', error);
      }
    };
    fetchAcademicData();
  }, [user?.id, dataUpdateCounter]);

  const level = Math.floor(dynamicPoints.totalPoints / 50) + 1;
  const pointsToNextLevel = (level * 50) - dynamicPoints.totalPoints;
  const progress = ((dynamicPoints.totalPoints % 50) / 50) * 100;

  const scorecardData = [
    { label: 'CGPA', value: stats.cgpa ? stats.cgpa.toFixed(2) : '0.00', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Avg Score', value: `${stats.avgScore}%`, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Highest', value: `${stats.topScore}`, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Subjects', value: stats.subjectCount.toString(), color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Points Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track your achievements and progress</p>
        </div>
        <Badge className="rounded-xl px-4 py-1.5 text-sm bg-gradient-to-r from-slate-500 to-slate-600">
          Level {level}
        </Badge>
      </div>

      <Card className="border-0 shadow-md rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-90">Current Level</p>
              <p className="text-3xl font-bold">{level}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total Points</p>
              <p className="text-3xl font-bold">{dynamicPoints.totalPoints}</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-white/30" />
          <p className="text-xs mt-2 opacity-90">{pointsToNextLevel} points to next level</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Academic Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {scorecardData.map((item) => (
              <div key={item.label} className={`p-4 rounded-xl ${item.bg} text-center`}>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Points Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900/30 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Academic Points</p>
                <p className="font-bold">{dynamicPoints.academicPoints}</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-slate-500" />
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bonus Points</p>
                <p className="font-bold">{Math.max(0, dynamicPoints.totalPoints - dynamicPoints.academicPoints)}</p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============ DAILY QUOTE COMPONENT ============

export function DailyQuoteCard() {
  const { dailyQuote, setDailyQuote } = useAppStore();

  const refreshQuote = () => {
    const quotes: DailyQuote[] = [
      { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
      { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
      { quote: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
      { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    ];
    setDailyQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  return (
    <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-900/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 bg-slate-500">
            <AvatarFallback className="bg-slate-500 text-white font-bold">
              {getInitial(dailyQuote.author) || 'Q'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground/80 italic leading-relaxed">{dailyQuote.quote}</p>
            {dailyQuote.author && (
              <p className="text-xs text-muted-foreground mt-2 font-medium">— {dailyQuote.author}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={refreshQuote} className="shrink-0 rounded-full h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

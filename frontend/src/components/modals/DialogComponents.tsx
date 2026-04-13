'use client';

import React, { useState } from 'react';
import { useAppStore, StudentRiskInfo, Message } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, AlertCircle, Bell, Phone } from 'lucide-react';

// ============ UTILITIES ============
const getInitial = (name: string | undefined | null): string => {
  if (!name) return 'U';
  const cleaned = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').trim();
  return (cleaned.charAt(0) || name.charAt(0)).toUpperCase();
};

// ============ STUDENT DETAILS DIALOG (Faculty) ============

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentRiskInfo | null;
  onSendWarning?: () => void;
  onAlertParent?: () => void;
}

export function StudentDetailsDialog({ open, onOpenChange, student, onSendWarning, onAlertParent }: StudentDetailsDialogProps) {
  const [showWarningForm, setShowWarningForm] = useState(false);
  const [showParentForm, setShowParentForm] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [parentMessage, setParentMessage] = useState('');
  const { addMessage, user } = useAppStore();

  if (!student) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
  };

  const handleSendWarning = async () => {
    if (!warningMessage.trim()) {
      toast.error('Please enter a warning message');
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id || 'faculty',
          receiverId: student.id,
          targetType: 'student',
          title: `Warning for ${student.name}`,
          content: warningMessage,
          messageType: 'warning',
        }),
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message);
        toast.success('Warning sent to student');
        setWarningMessage('');
        setShowWarningForm(false);
        onSendWarning?.();
      } else {
        toast.error(data.message || 'Failed to send warning');
      }
    } catch {
      toast.error('Failed to send warning');
    }
  };

  const handleAlertParent = async () => {
    if (!parentMessage.trim()) {
      toast.error('Please enter a message for parent');
      return;
    }

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user?.id || 'faculty',
          receiverId: student.id,
          targetType: 'parent',
          title: `Alert regarding ${student.name}`,
          content: parentMessage,
          messageType: 'alert',
        }),
      });
      const data = await res.json();
      if (data.success) {
        addMessage(data.message);
        toast.success('Parent alerted successfully');
        setParentMessage('');
        setShowParentForm(false);
        onAlertParent?.();
      } else {
        toast.error(data.message || 'Failed to send parent alert');
      }
    } catch {
      toast.error('Failed to send parent alert');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                {getInitial(student.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{student.name}</p>
              <p className="text-xs text-muted-foreground font-normal">{student.collegeId}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-muted-foreground">Branch</p>
              <p className="font-medium text-sm">{student.branch}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-muted-foreground">Section</p>
              <p className="font-medium text-sm">{student.section}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-muted-foreground">Year</p>
              <p className="font-medium text-sm">{student.year}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-muted-foreground">Risk Level</p>
              <Badge className={`${getRiskColor(student.riskLevel)} text-xs mt-0.5`}>
                {student.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
              <p className="text-xs text-muted-foreground">Attendance</p>
              <p className="text-lg font-bold text-blue-600">{student.attendance}%</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-center">
              <p className="text-xs text-muted-foreground">CGPA</p>
              <p className="text-lg font-bold text-purple-600">{(student.cgpa || 0).toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/20 text-center">
              <p className="text-xs text-muted-foreground">Total Pts</p>
              <p className="text-lg font-bold text-slate-600">{(student as any).totalPoints || 0}<span className="text-xs font-normal text-muted-foreground">/130</span></p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Score Breakdown</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Attendance Points</span>
                <span className="font-semibold text-blue-600">{(student as any).attPoints || 0}<span className="text-muted-foreground font-normal">/50</span></span>
              </div>
              <Progress value={((student as any).attPoints || 0) / 50 * 100} className="h-1.5 bg-blue-100" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">CGPA Points</span>
                <span className="font-semibold text-purple-600">{(student as any).cgpaPoints || 0}<span className="text-muted-foreground font-normal">/50</span></span>
              </div>
              <Progress value={((student as any).cgpaPoints || 0) / 50 * 100} className="h-1.5 bg-purple-100" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Consistency Points</span>
                <span className="font-semibold text-green-600">{(student as any).consistencyPoints || 0}<span className="text-muted-foreground font-normal">/30</span></span>
              </div>
              <Progress value={((student as any).consistencyPoints || 0) / 30 * 100} className="h-1.5 bg-green-100" />
            </div>
            <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium">Overall Risk Score</p>
                <p className="font-bold text-sm">{student.riskScore.toFixed(0)}%</p>
              </div>
              <Progress value={student.riskScore} className={`h-2 ${student.riskLevel === 'high' ? 'bg-red-100' : student.riskLevel === 'medium' ? 'bg-orange-100' : 'bg-green-100'}`} />
            </div>
          </div>

          <Separator />

          {!showWarningForm && !showParentForm ? (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 rounded-xl" onClick={() => setShowWarningForm(true)}>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="text-xs">Send Warning</span>
              </Button>
              <Button variant="outline" className="h-auto py-3 flex-col gap-1 rounded-xl" onClick={() => setShowParentForm(true)}>
                <Phone className="w-5 h-5 text-red-500" />
                <span className="text-xs">Alert Parent</span>
              </Button>
            </div>
          ) : showWarningForm ? (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Warning Message</Label>
              <Textarea placeholder="Enter warning message..." value={warningMessage} onChange={(e) => setWarningMessage(e.target.value)} className="rounded-xl" rows={3} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowWarningForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button onClick={handleSendWarning} className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600">Send Warning</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Message to Parent</Label>
              <Textarea placeholder="Enter message to parent..." value={parentMessage} onChange={(e) => setParentMessage(e.target.value)} className="rounded-xl" rows={3} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowParentForm(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button onClick={handleAlertParent} className="flex-1 rounded-xl bg-red-500 hover:bg-red-600">Alert Parent</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============ NOTIFICATIONS DIALOG ============

export function NotificationsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { messages, user } = useAppStore();
  const userMessages = user?.role === 'student'
    ? messages.filter(m => m.senderId === user.id || m.receiverId === user.id || m.targetType === 'student' || m.targetType === 'all')
    : messages;

  const unreadCount = userMessages.filter(m => !m.isRead).length;

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const getMessageBg = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-100 dark:bg-orange-900/30';
      case 'alert': return 'bg-red-100 dark:bg-red-900/30';
      default: return 'bg-blue-100 dark:bg-blue-900/30';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && <Badge className="bg-red-500 text-white text-xs rounded-full ml-2">{unreadCount} new</Badge>}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6">
          <div className="px-6 pb-4 space-y-2">
            {userMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No notifications yet</div>
            ) : (
              userMessages.map((message) => (
                <div key={message.id} className={`p-3 rounded-xl border ${!message.isRead ? 'bg-slate-50 border-slate-200' : 'bg-gray-50 border-transparent'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${getMessageBg(message.messageType)}`}>
                      {getMessageIcon(message.messageType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{message.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{message.content}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-muted-foreground">{new Date(message.sentAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

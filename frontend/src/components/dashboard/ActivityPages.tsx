'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  UserCheck 
} from 'lucide-react';
import { useAppStore, Course, Assignment } from '@/lib/store';
import { toast } from 'sonner';

// ============ COURSES COMPONENT ============

export function CoursesPage() {
  const { courses, deleteCourse } = useAppStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'schedule'>('schedule');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Courses</h2>
          <p className="text-sm text-muted-foreground">Manage your course schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-xl p-1 bg-gray-50 dark:bg-gray-800">
            <Button variant={viewMode === 'schedule' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('schedule')} className="rounded-lg text-xs">
              Calendar
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-lg text-xs">
              List
            </Button>
          </div>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {viewMode === 'schedule' ? (
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-800">
                  <th className="p-3 text-left text-xs font-medium text-muted-foreground w-16">Time</th>
                  {days.slice(1, 6).map((day) => (
                    <th key={day} className="p-3 text-left text-xs font-medium text-muted-foreground">{day.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-b last:border-0">
                    <td className="p-2 text-xs text-muted-foreground border-r bg-gray-50/50 dark:bg-gray-800/50">{time}</td>
                    {days.slice(1, 6).map((_, dayIndex) => {
                      const course = courses.find(c => c.dayOfWeek === dayIndex + 1 && c.startTime === time);
                      return (
                        <td key={dayIndex} className="p-1">
                          {course && (
                            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/30 text-xs">
                              <p className="font-medium truncate">{course.name}</p>
                              <p className="text-[10px] text-muted-foreground">{course.location}</p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {courses.map((course) => (
            <Card key={course.id} className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-sm">{course.name}</h3>
                    <p className="text-xs text-muted-foreground">{course.code}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] rounded-lg">{course.credits} Cr</Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{course.instructor}</span>
                  </div>
                  {course.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{course.location}</span>
                    </div>
                  )}
                  {course.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{course.startTime} - {course.endTime}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="ghost" size="sm" onClick={() => setEditingCourse(course)} className="h-8 text-xs rounded-lg">
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 rounded-lg" onClick={() => deleteCourse(course.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CourseDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <CourseDialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)} course={editingCourse} />
    </div>
  );
}

// ============ COURSE DIALOG ============

export function CourseDialog({ open, onOpenChange, course }: { open: boolean; onOpenChange: (open: boolean) => void; course?: Course | null }) {
  const { addCourse, updateCourse } = useAppStore();

  const getInitialFormData = useCallback(() => course ? {
    name: course.name,
    code: course.code,
    credits: course.credits,
    instructor: course.instructor,
    dayOfWeek: course.dayOfWeek || 1,
    startTime: course.startTime || '09:00',
    endTime: course.endTime || '10:00',
    location: course.location || '',
  } : {
    name: '',
    code: '',
    credits: 3,
    instructor: '',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
    location: '',
  }, [course]);

  const [formData, setFormData] = useState(getInitialFormData);

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData());
    }
  }, [open, getInitialFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (course) {
      updateCourse(course.id, formData);
      toast.success('Course updated');
    } else {
      addCourse({ id: Date.now().toString(), ...formData });
      toast.success('Course added');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Add New Course'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label className="text-xs">Course Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Code</Label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Credits</Label>
              <Input type="number" value={formData.credits} onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })} className="rounded-xl h-10" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-xs">Instructor</Label>
              <Input value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Day</Label>
              <Select value={formData.dayOfWeek.toString()} onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) })}>
                <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, i) => (
                    <SelectItem key={day} value={(i + 1).toString()}>{day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Location</Label>
              <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Start Time</Label>
              <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">End Time</Label>
              <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="rounded-xl h-10" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl">{course ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============ ASSIGNMENTS COMPONENT ============

export function AssignmentsPage() {
  const { assignments, updateAssignment, deleteAssignment } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'completed' | 'overdue'>('all');

  const filteredAssignments = assignments.filter(a => filter === 'all' || a.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold">Assignments</h2>
          <p className="text-sm text-muted-foreground">Track your assignments and deadlines</p>
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-32 rounded-xl h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredAssignments.length === 0 ? (
          <Card className="border-0 shadow-md rounded-2xl">
            <CardContent className="py-8 text-center">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No assignments found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${assignment.status === 'completed' ? 'bg-slate-500 border-slate-500' : 'border-gray-300'
                      }`}
                    onClick={() => updateAssignment(assignment.id, {
                      status: assignment.status === 'completed' ? 'todo' : 'completed'
                    })}
                  >
                    {assignment.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium ${assignment.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {assignment.title}
                    </h4>
                    <p className="text-xs text-muted-foreground truncate">{assignment.courseName}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={`text-[10px] rounded-lg ${getStatusColor(assignment.status)}`}>
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => deleteAssignment(assignment.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

import type { Task, Project } from './types';
import { format, addDays, startOfToday } from 'date-fns';

const formatDateToYyyyMmDd = (date: Date): string => format(date, 'yyyy-MM-dd');

const today = startOfToday();
const tomorrow = addDays(today, 1);
const dayAfterTomorrow = addDays(today, 2);
const nextWeek = addDays(today, 7);
const inTwoWeeks = addDays(today, 14);

export const initialProjects: Project[] = [
  { id: 'proj-1', name: 'Website Redesign', color: '#FF6B6B' }, // Coral
  { id: 'proj-2', name: 'Marketing Campaign', color: '#4ECDC4' }, // Turquoise
  { id: 'proj-3', name: 'Personal Goals', color: '#45B7D1' }, // Cerulean
  { id: 'proj-uncategorized', name: 'General', color: '#ADB5BD' }, // Gray for tasks without a project
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Draft homepage content',
    description: 'Write compelling content for the new homepage design. Focus on benefits and user engagement.',
    dueDate: formatDateToYyyyMmDd(tomorrow),
    priority: 'high',
    status: 'inprogress',
    projectId: 'proj-1',
    createdAt: new Date().toISOString(),
    category: 'Work',
  },
  {
    id: 'task-2',
    title: 'Design newsletter template',
    dueDate: formatDateToYyyyMmDd(nextWeek),
    priority: 'medium',
    status: 'todo',
    projectId: 'proj-2',
    createdAt: new Date().toISOString(),
    category: 'Work',
  },
  {
    id: 'task-3',
    title: 'Read "The Minimalist Entrepreneur"',
    description: 'Finish reading the book by Sahil Lavingia.',
    priority: 'low',
    status: 'todo',
    projectId: 'proj-3',
    createdAt: new Date().toISOString(),
    category: 'Personal',
  },
  {
    id: 'task-4',
    title: 'Schedule team sync meeting',
    description: 'Coordinate with team members for a suitable time next week.',
    dueDate: formatDateToYyyyMmDd(today),
    priority: 'high',
    status: 'todo',
    projectId: 'proj-1',
    createdAt: new Date().toISOString(),
    category: 'Work',
  },
  {
    id: 'task-5',
    title: 'Pay internet bill',
    dueDate: formatDateToYyyyMmDd(dayAfterTomorrow),
    priority: 'medium',
    status: 'todo',
    category: 'Errands',
    projectId: 'proj-uncategorized',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'Finalize Q3 report slides',
    description: 'Incorporate feedback and polish slides for presentation.',
    dueDate: formatDateToYyyyMmDd(addDays(today, 4)), // This week
    priority: 'high',
    status: 'todo',
    projectId: 'proj-2',
    createdAt: new Date().toISOString(),
    category: 'Work',
  },
  {
    id: 'task-7',
    title: 'Plan weekend hike',
    description: 'Research trails and check weather forecast.',
    dueDate: formatDateToYyyyMmDd(addDays(today, 5)), // This week
    priority: 'medium',
    status: 'todo',
    projectId: 'proj-3',
    createdAt: new Date().toISOString(),
    category: 'Personal',
  },
  {
    id: 'task-8',
    title: 'Grocery Shopping',
    description: 'Buy groceries for the week.',
    dueDate: formatDateToYyyyMmDd(today),
    priority: 'medium',
    status: 'todo',
    category: 'Errands',
    projectId: 'proj-uncategorized',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-9',
    title: 'Submit conference proposal',
    description: 'Deadline for submission is approaching.',
    dueDate: formatDateToYyyyMmDd(inTwoWeeks), // Upcoming
    priority: 'high',
    status: 'todo',
    projectId: 'proj-1',
    createdAt: new Date().toISOString(),
    category: 'Work',
  },
];
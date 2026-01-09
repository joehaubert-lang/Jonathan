
export interface Student {
  id: string;
  name: string;
  email: string;
  photo: string;
  status: 'active' | 'inactive' | 'pending';
  lastActivity: string;
  goal: string;
  plan: 'Mensal' | 'Trimestral' | 'Anual';
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  rest: string;
  videoUrl?: string;
  weight?: string;
}

export interface Workout {
  id: string;
  name: string;
  studentId: string;
  dateCreated: string;
  exercises: Exercise[];
}

export interface Evaluation {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  height: number;
  bodyFat?: number;
  measurements: {
    chest?: number;
    waist?: number;
    hip?: number;
    thigh?: number;
    arm?: number;
  };
}

export interface Notification {
  id: string;
  type: 'payment' | 'workout' | 'evaluation' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  studentId?: string;
}


// Consolidated interfaces
export interface Student {
  id: string;
  name: string;
  email: string;
  photo: string;
  status: 'active' | 'inactive' | 'pending';
  lastActivity: string;
  goal: string;
  plan: 'Mensal' | 'Trimestral' | 'Anual';
  phone: string;
  birth_date?: string;
  gender?: 'masculino' | 'feminino';
}

export interface Exercise {
  id: string;
  workout_id?: string;
  name: string;
  muscleGroup?: string;
  sets?: number;
  reps?: string;
  load?: string;
  rest?: string;
  observation?: string;
  order_index?: number;
  videoUrl?: string;
  weight?: string;
}

export interface Workout {
  id: string;
  student_id: string; // Keeping snake_case context from first def
  studentId?: string; // Adding camelCase for compatibility
  name: string;
  goal?: string;
  frequency?: string;
  start_date?: string;
  end_date?: string;
  active: boolean;
  exercises?: Exercise[];
  created_at?: string;
  dateCreated?: string;
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

import { 
  Calculator, 
  BookOpen, 
  Users, 
  TrendingUp, 
  Sparkles, 
  FastForward, 
  Receipt, 
  Calendar 
} from 'lucide-react';

export const serviceIconMap: Record<string, any> = {
  'Tax': Calculator,
  'Bookkeeping': BookOpen,
  'Payroll': Users,
  'Advisory': TrendingUp,
  'Cleanup': Sparkles,
  'Catch up': FastForward,
  'Sales tax filing': Receipt,
  'Year end tax': Calendar,
};

export function getServiceIcon(serviceName: string) {
  const Icon = serviceIconMap[serviceName];
  return Icon || Calculator;
}

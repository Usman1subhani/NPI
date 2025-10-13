// import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { redirect } from 'next/navigation';

export default function Page(): never {

  redirect('/dashboard');
}

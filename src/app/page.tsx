import { redirect } from 'next/navigation';
import { getUser, isVtiEmail } from '@/lib/auth';

export default async function HomePage() {
  const user = await getUser();

  if (user && isVtiEmail(user.email)) {
    redirect('/game');
  } else {
    redirect('/login');
  }
}

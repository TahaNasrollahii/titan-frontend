import { permanentRedirect } from 'next/navigation';

export default function TournamentRedirectPage() {
  permanentRedirect('/tournaments');
}


import { Redirect } from 'expo-router';

// Meetings list lives in the bottom tab — keep this stack entry as a
// redirect so legacy router.push('/meetings') calls still work.
export default function MeetingsIndexRedirect() {
  return <Redirect href="/(tabs)/meetings" />;
}

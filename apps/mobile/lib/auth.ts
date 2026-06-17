import { supabase } from './supabase';

export async function getOrCreateAnonymousUser() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (session?.user) {
    return session.user;
  }

  const { data, error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        source: '4ufitness_mobile_v0_1',
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Anonymous user could not be created.');
  }

  return data.user;
}
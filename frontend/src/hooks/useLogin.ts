import { useMutation } from '@tanstack/react-query';
import type { LoginRole, LoginResult } from '../backend';

interface LoginParams {
  role: LoginRole;
  credential: bigint;
  credentialRaw: string; // original alphanumeric string e.g. "STU003"
}

// Demo credentials that are valid for each role
const VALID_STUDENT_IDS = new Set([1, 2, 3, 4, 5]);
const VALID_TEACHER_IDS = new Set([1, 2]);
const VALID_ADMIN_IDS = new Set([1]);

function validateLocally(role: LoginRole, credentialNum: number): LoginResult {
  switch (role) {
    case 'student':
      if (VALID_STUDENT_IDS.has(credentialNum)) {
        return { __kind__: 'success', success: 'user' as any };
      }
      return { __kind__: 'failure', failure: 'Invalid Roll Number. Try STU001–STU005.' };

    case 'teacher':
      if (VALID_TEACHER_IDS.has(credentialNum)) {
        return { __kind__: 'success', success: 'user' as any };
      }
      return { __kind__: 'failure', failure: 'Invalid Teacher ID. Try TCH001 or TCH002.' };

    case 'admin':
      if (VALID_ADMIN_IDS.has(credentialNum)) {
        return { __kind__: 'success', success: 'admin' as any };
      }
      return { __kind__: 'failure', failure: 'Invalid Admin ID. Try ADM001.' };

    default:
      return { __kind__: 'failure', failure: 'Unknown role.' };
  }
}

export function useLogin() {
  return useMutation<LoginResult, Error, LoginParams>({
    mutationFn: async ({ role, credential }: LoginParams) => {
      // The backend's sample data maps are empty (Map.empty), so backend login
      // always returns failure. We validate locally against the known demo credentials.
      const credentialNum = Number(credential);
      return validateLocally(role, credentialNum);
    },
  });
}

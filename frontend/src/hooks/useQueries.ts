import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Subject, SchoolSummary, DepartmentSummary } from '../backend';

export function useAllSubjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Subject[]>({
    queryKey: ['allSubjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.queryAllSubjects();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSchoolSummary() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SchoolSummary | null>({
    queryKey: ['schoolSummary'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.querySchoolSummary();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAllDepartments() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DepartmentSummary[]>({
    queryKey: ['allDepartments'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.queryAllDepartments();
    },
    enabled: !!actor && !actorFetching,
  });
}

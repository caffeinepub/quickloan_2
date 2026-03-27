import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoanApplicationPublic, NewApplication } from "../backend.d";
import { useActor } from "./useActor";

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<LoanApplicationPublic[]>({
    queryKey: ["myApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<LoanApplicationPublic[]>({
    queryKey: ["allApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApplyForLoan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<bigint, Error, NewApplication>({
    mutationFn: async (newApp) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.applyForLoan(newApp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myApplications"] });
    },
  });
}

export function useApproveApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.approveApplication(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

export function useRejectApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.rejectApplication(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CommunityStats = {
  total_contributed: number;
  contribution_count: number;
  members: number;
  requests_submitted: number;
  people_lifted: number;
  total_disbursed: number;
};

export function useCommunityStats() {
  return useQuery({
    queryKey: ["community-stats"],
    queryFn: async (): Promise<CommunityStats> => {
      const { data, error } = await supabase.rpc("community_stats");
      if (error) throw error;
      return data as unknown as CommunityStats;
    },
  });
}

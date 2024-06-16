import { useQuery } from '@tanstack/react-query';
import queryKeys from '@/connstant/queryKeys';
import { IMyProfileClient, getMyProfile } from '@/api/client/profile';

export default function useProfileClient(enabled = false): { profile: IMyProfileClient; refetchProfile: any } {
  const { data, refetch: refetchProfile } = useQuery<any>([queryKeys.profileClient], getMyProfile, {
    enabled,
  });

  const profile = data?.data;

  return { profile, refetchProfile };
}

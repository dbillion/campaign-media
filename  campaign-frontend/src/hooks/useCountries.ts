import { useQuery } from '@tanstack/react-query';
import { Country } from '@/types';
import axios from 'axios';

export const useCountries = () => {
  return useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      const { data } = await axios.get('/api/campaigns/countries');
      return data;
    },
  });
};
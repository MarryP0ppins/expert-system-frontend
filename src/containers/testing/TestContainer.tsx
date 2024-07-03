'use client';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import { TQueryKey } from '@/api';
import { getSystemOne } from '@/api/services/systems';

const TestContainer: React.FC = () => {
  const { system_id } = useParams();

  const validateParams = useMemo(() => Number(system_id), [system_id]);

  const { data, isLoading } = useQuery({
    queryKey: ['testing', { system: validateParams }],
    queryFn: (params: TQueryKey<{ system: number }>) => getSystemOne(params.queryKey[1].system),
  });

  return (
    <div>
      {JSON.stringify(data)}
      {isLoading && <div>loading...</div>}
    </div>
  );
};

export default TestContainer;

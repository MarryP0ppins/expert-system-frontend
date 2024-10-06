'use client';
import React, { useCallback, useState } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';

import { TQueryKey } from '@/api';
import { createLike, deleteLike } from '@/api/services/likes';
import { deleteSystem, getSystems } from '@/api/services/systems';
import Button from '@/components/Button';
import { Card } from '@/components/Card';
import { CardSkeleton } from '@/components/CardSkeleton';
import Loader from '@/components/Loader';
import Text, { TEXT_VIEW } from '@/components/Text';
import { SYSTEMS } from '@/constants';
import AddIcon from '@/icons/AddIcon';
import FileCheck from '@/icons/FileCheck';
import useSystemStore from '@/store/systemStore';
import useUserStore from '@/store/userStore';
import { TSystemsWithPage } from '@/types/systems';
import { classname } from '@/utils/classname';
import { getQueryClient } from '@/utils/get-query-client';

import classes from './page.module.scss';

const cnUserProfile = classname(classes, 'user-systems');

const Page: React.FC = () => {
  const router = useRouter();
  const { user, likeMap, updateLikes } = useUserStore(
    useShallow((store) => ({ user: store.user, likeMap: store.likes, updateLikes: store.updateLikes })),
  );
  const { downloadSystemBackup, importSystem } = useSystemStore((store) => store);
  const queryClient = getQueryClient();

  const [systemFile, setSystemFile] = useState<File>();

  const { data, isSuccess, isLoading } = useSuspenseQuery({
    queryKey: [SYSTEMS.GET_USER, { user: user?.id, all_types: true }],
    queryFn: (params: TQueryKey<{ user?: number; all_types: boolean }>) => getSystems(params.queryKey[1]),
  });

  const { mutate: addMutate, isPending: addMutateIsPending } = useMutation({
    mutationFn: importSystem,
    onSuccess: (newSystem) => {
      queryClient.setQueryData<TSystemsWithPage>(
        [SYSTEMS.GET_USER, { user: user?.id, all_types: true }],
        (old?: TSystemsWithPage) => ({
          pages: old?.pages ?? 1,
          systems: [newSystem].concat(data.systems),
        }),
      );
    },
    onSettled: () => setSystemFile(undefined),
  });

  const { mutate } = useMutation({
    mutationFn: deleteSystem,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: [SYSTEMS.GET_USER, { user: user?.id, all_types: true }] });
      const previousTodos = queryClient.getQueryData<TSystemsWithPage>([
        SYSTEMS.GET_USER,
        { user: user?.id, all_types: true },
      ]);
      queryClient.setQueryData<TSystemsWithPage>(
        [SYSTEMS.GET_USER, { user: user?.id, all_types: true }],
        (old?: TSystemsWithPage) => ({
          pages: old?.pages ?? 1,
          systems: old?.systems.filter((system) => system.id !== data.system_id) ?? [],
        }),
      );
      return { previousTodos };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData<TSystemsWithPage>(
        [SYSTEMS.GET_USER, { user: user?.id, all_types: true }],
        context?.previousTodos,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [SYSTEMS.GET_USER, { user: user?.id, all_types: true }] });
    },
  });

  const { mutate: starAddMutation } = useMutation({
    mutationFn: createLike,
    onSuccess: (newLike) => {
      updateLikes({ add: true, system_id: newLike.system_id, like_id: newLike.id });
    },
  });

  const { mutate: starRemoveMutation } = useMutation({
    mutationFn: deleteLike,
    onSuccess: (deletedLike) => {
      updateLikes({ add: false, system_id: deletedLike });
    },
  });

  const handleClick = useCallback((id: number) => () => router.push(`/system/${id}/test`), [router]);
  const handleDelete = useCallback((id: number, password: string) => mutate({ system_id: id, password }), [mutate]);
  const handleDownload = useCallback(
    (systemId: number, systemName: string) => () => downloadSystemBackup(systemId, systemName),
    [downloadSystemBackup],
  );
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSystemFile(event.currentTarget.files?.item(0) ?? undefined);
  }, []);

  const handleSaveButtonCLick = useCallback(() => {
    if (systemFile) {
      addMutate(systemFile);
    }
  }, [addMutate, systemFile]);

  const handleLikeUpdate = useCallback(
    ({ add, system_id }: { add: boolean; system_id: number }) => {
      if (user) {
        if (add) {
          starAddMutation({ system_id: system_id, user_id: user.id });
        } else {
          starRemoveMutation(likeMap.get(system_id) ?? -1);
        }
      }
    },
    [likeMap, starAddMutation, starRemoveMutation, user],
  );

  return (
    <div className={cnUserProfile()}>
      <label className={cnUserProfile('importSystem', { isUpload: !!systemFile })}>
        <input type="file" accept=".ipopes" className={cnUserProfile('input')} onChange={handleFileUpload} />
        {!systemFile && !addMutateIsPending ? (
          <>
            <AddIcon width={30} height={30} />
            <Text>Загрузить систему</Text>
          </>
        ) : (
          <>
            <FileCheck width={30} height={30} />
            <Text>{systemFile?.name}</Text>
            <Button onClick={handleSaveButtonCLick} loading={addMutateIsPending}>
              Сохранить
            </Button>
          </>
        )}
      </label>
      <div className={cnUserProfile('cardList')}>
        {!!data.systems.length &&
          isSuccess &&
          data.systems.map((system) => (
            <Card
              key={system.id}
              id={system.id}
              image={system.image_uri}
              title={system.name}
              subtitle={system.about}
              stars={system.stars}
              canLike={!!user}
              likeMap={likeMap}
              userPageOption
              onDeleteClick={handleDelete}
              onClick={handleClick(system.id)}
              onDownloadClick={handleDownload(system.id, system.name)}
              onLikeMap={handleLikeUpdate}
            />
          ))}
        {!isLoading && !data.systems.length && <Text view={TEXT_VIEW.p20}>Нет созданных систем</Text>}
        {isLoading && [...Array(6).keys()].map((index) => <CardSkeleton key={index} />)}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false, loading: () => <Loader sizepx={116} /> });

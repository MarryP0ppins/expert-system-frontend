'use client';
import React, { use, useCallback, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';

import { TQueryKey } from '@/api';
import { getImage } from '@/api/services/image';
import { getSystemOne, updateSystem } from '@/api/services/systems';
import Button from '@/components/Button';
import CheckBox from '@/components/CheckBox';
import ErrorPopup from '@/components/ErrorPopup';
import FileUpload from '@/components/FileUpload';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import Text, { TEXT_VIEW } from '@/components/Text';
import TextArea from '@/components/TextArea';
import { SYSTEMS } from '@/constants';
import useUserStore from '@/store/userStore';
import { TErrorResponse } from '@/types/error';
import { TSystem, TSystemsWithPage, TSystemUpdate, TSystemUpdateBefore } from '@/types/systems';
import { classname } from '@/utils/classname';
import { getQueryClient } from '@/utils/get-query-client';
import { systemIdValidation } from '@/validation/searchParams';
import { systemUpdateValidation } from '@/validation/system';

import classes from './page.module.scss';

const cnSystem = classname(classes, 'editor-system');

type PageProps = {
  params: Promise<{ system_id: string }>;
};

const Page: React.FC<PageProps> = ({ params }) => {
  const systemIdParam = use(params).system_id;
  const system_id = systemIdValidation.safeParse(systemIdParam).data;

  if (!system_id) {
    notFound();
  }

  const queryClient = getQueryClient();
  const user = useUserStore((store) => store.user);
  //const [formWatch, setformWatch] = useState<Partial<TSystemUpdateBefore>>();

  const { data } = useSuspenseQuery({
    queryKey: [SYSTEMS.RETRIEVE, { system: system_id }],
    queryFn: (params: TQueryKey<{ system: number }>) => getSystemOne(params.queryKey[1].system),
    initialData: () =>
      queryClient
        .getQueryData<TSystemsWithPage>([SYSTEMS.GET_USER, { user: user?.id, all_types: true }])
        ?.systems.find((system) => system.id === system_id),
  });

  const { data: image } = useQuery({
    queryKey: ['image', data.image_uri],
    queryFn: async (params: TQueryKey<string>) => {
      if (data.image_uri) {
        const img = await getImage(params.queryKey[1]);
        const dt = new DataTransfer();
        dt.items.add(img);
        return dt.files;
      }
    },
    gcTime: 0,
    staleTime: 0,
    enabled: !!data.image_uri,
  });

  const { mutate, isPending, error } = useMutation<TSystem, TErrorResponse, TSystemUpdate & { system_id: number }>({
    mutationFn: updateSystem,
    onSuccess: (data) => {
      queryClient.setQueryData([SYSTEMS.RETRIEVE, { user_id: user?.id, system_id: system_id }], data);
      const currentUserSystems = queryClient.getQueryData<TSystemsWithPage>([
        SYSTEMS.GET_USER,
        { user_id: user?.id, all_types: true },
      ]);
      if (currentUserSystems) {
        queryClient.setQueryData<TSystemsWithPage>(
          [SYSTEMS.GET_USER, { user_id: user?.id, all_types: true }],
          (old?: TSystemsWithPage) => ({
            pages: old?.pages ?? 1,
            systems: [data].concat(currentUserSystems.systems),
          }),
        );
      }
      reset({ ...data, image });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { dirtyFields, errors, isValid },
    clearErrors,
    reset,
    setValue,
    control,
  } = useForm<TSystemUpdateBefore>({
    defaultValues: { ...data, image },
    resolver: zodResolver(systemUpdateValidation),
    mode: 'all',
  });

  const handleFormSubmit = useCallback(
    (formData: TSystemUpdateBefore) => {
      const formDataWithFile = formData as TSystemUpdate;
      type formType = keyof Omit<TSystemUpdate, 'is_image_removed'>;
      const changedFields = Object.keys(dirtyFields).reduce((fields, field) => {
        const formField = field as formType;
        switch (formField) {
          case 'name':
            fields.name = formDataWithFile.name;
            return fields;
          case 'private':
            fields.private = formDataWithFile.private;
            return fields;
          case 'image':
            fields.image = formDataWithFile.image;
            return fields;
          default:
            fields[formField] = formDataWithFile[formField];
            return fields;
        }
      }, {} as TSystemUpdate);

      if (formDataWithFile.image === undefined) {
        changedFields.is_image_removed = true;
      }
      mutate({ ...changedFields, system_id: system_id });
    },
    [dirtyFields, mutate, system_id],
  );
  const onDeleteUploadFileClick = useCallback(() => setValue('image', undefined, { shouldDirty: true }), [setValue]);

  // временное решение. Не обнавляется стейт формы.
  // useEffect(() => {
  //   const subscription = watch((value, { name }) => {
  //     setformWatch(value);
  //     trigger(name);
  //   });
  //   return () => {
  //     subscription.unsubscribe();
  //     clearErrors();
  //   };
  // }, [clearErrors, trigger, watch]);

  const formWatch = useWatch({ control });

  useEffect(() => () => clearErrors(), [clearErrors]);

  return (
    <main className={cnSystem('wrapper')}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className={cnSystem()}>
        <Input
          {...register('name')}
          placeholder="Название системы"
          label={formWatch?.name?.length ? 'Название ситемы' : undefined}
          error={!!errors.name}
          afterSlot={<ErrorPopup error={errors.name?.message} />}
          className={cnSystem('input')}
          disabled={isPending}
        />
        <div className={cnSystem('raw')}>
          <div className={cnSystem('column')}>
            <FileUpload
              {...register('image')}
              accept="image/*"
              disabled={isPending}
              initialImageUrl={data.image_uri}
              onDeleteClick={onDeleteUploadFileClick}
            />
            <div className={cnSystem('checkbox')}>
              <CheckBox {...register('private')} disabled={isPending} />
              <Text view={TEXT_VIEW.p18} className={cnSystem('checkbox-label')}>
                Приватная
              </Text>
            </div>
          </div>
          <TextArea
            {...register('about')}
            className={cnSystem('about')}
            placeholder="Описание системы"
            label={!!formWatch?.about?.length && 'Описание системы'}
            error={!!errors.about}
            afterSlot={<ErrorPopup error={errors.about?.message} />}
            disabled={isPending}
          />
        </div>
        {!!error && (
          <Text view={TEXT_VIEW.p14} className={cnSystem('err')}>
            {error.extra ?? error.error}
          </Text>
        )}
        <Button
          className={cnSystem('button')}
          disabled={isPending || !Object.keys(dirtyFields).length || !isValid}
          loading={isPending}
        >
          Сохранить изменения
        </Button>
      </form>
    </main>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false, loading: () => <Loader sizepx={116} /> });

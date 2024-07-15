import React, { RefObject, useRef } from 'react';

export const useDialogController = (): {
  dialogRef: RefObject<HTMLDialogElement>;
  openDialog: (event?: React.MouseEvent<Element>) => void;
  closeDialog: (event?: React.MouseEvent<Element>) => void;
} => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = (event?: React.MouseEvent<Element>) => {
    event?.stopPropagation();
    dialogRef.current?.showModal();
  };
  const closeDialog = (event?: React.MouseEvent<Element>) => {
    event?.stopPropagation();
    dialogRef.current?.close();
  };

  return { dialogRef, openDialog, closeDialog };
};

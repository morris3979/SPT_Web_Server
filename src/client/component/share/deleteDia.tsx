import React, { FC } from "react";

const Dialog = React.lazy(() => import("./dialog"));

const DeleteDia: FC<{
  onConfirm: Function;
  onCancel: Function;
}> = (props: { value?: string; onConfirm: Function; onCancel: Function }) => {
  return (
    <Dialog
      onConfirm={() => {
        props.onConfirm();
      }}
      onCancel={() => {
        props.onCancel();
      }}
    >
      <div>確定要刪除嗎？</div>
    </Dialog>
  );
};

export default DeleteDia;

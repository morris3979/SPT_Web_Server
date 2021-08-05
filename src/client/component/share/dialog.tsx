import React, { FC, ReactNode } from "react";
import "../../scss/components/share/dialog.scss";

const Dialog: FC<{
  children: ReactNode | undefined;
  onConfirm: Function;
  onCancel: Function;
  className?: string;
  confirmDisable?: boolean;
}> = (props: {
  children: ReactNode | undefined;
  onConfirm: Function;
  onCancel: Function;
  className?: string;
  confirmDisable?: boolean;
}) => {
  return (
    <div className={"dialog " + props.className}>
      <div className="dialog-card">
        <div className="header" />
        <div className="content">{props.children}</div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              props.onConfirm();
            }}
            disabled={props.confirmDisable}
          >
            確認
          </button>
          <button
            className="btn btn-orange"
            onClick={() => {
              props.onCancel();
            }}
          >
            取消
          </button>
        </div>
      </div>
      <div
        className="shadow"
        onClick={() => {
          props.onCancel();
        }}
      ></div>
    </div>
  );
};

export default Dialog;

import React, { MouseEvent, FC, ReactNode } from "react";
import "../../scss/components/share/iconButton";

const IconButton: FC<{
  className?: string;
  children: ReactNode;
  disabled?: boolean;

  onClick?: (event: MouseEvent) => void;
}> = (props: {
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: (event: MouseEvent) => void;
}) => {
  return (
    <div className={"toggle " + props.className}>
      <button
        disabled={props.disabled}
        onClick={(e: MouseEvent) => {
          if (!props.onClick) {
            return;
          }

          props.onClick(e);
        }}
      >
        <div className="icon-warp">{props.children}</div>
      </button>
    </div>
  );
};

export default IconButton;

import React, { FC } from "react";
import "../../scss/components/share/spinnerCircle.scss";

const SpinnerCircle: FC<{}> = () => {
  return (
    <div className="spinner-circle-warp">
      <div className="spinner-circle">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default SpinnerCircle;

import React, { FC, useState } from "react";

const Dialog = React.lazy(() => import("../share/dialog"));

const SiteDia: FC<{
  value?: string;
  onConfirm: Function;
  onCancel: Function;
}> = (props: { value?: string; onConfirm: Function; onCancel: Function }) => {
  const [inputValue, setInputValue] = useState(props.value ? props.value : "");

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputValue(e.currentTarget.value);
  };

  return (
    <Dialog
      onConfirm={() => {
        props.onConfirm(inputValue);
      }}
      onCancel={() => {
        props.onCancel();
      }}
    >
      <div>群組名稱：</div>
      <input autoFocus type="text" value={inputValue} onChange={handleChange} />
    </Dialog>
  );
};

export default SiteDia;

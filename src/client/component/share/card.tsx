import IconButton from "./iconButton";
import React, { FC, useState, MouseEvent, useRef, useEffect } from "react";
import "../../scss/components/share/card.scss";

const Card: FC<ICardProps> = (props: ICardProps) => {
  const [active, setActive] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(50);

  useEffect(() => () => {
    if (!contentRef.current?.offsetHeight) {
      return;
    }
    setHeight(contentRef.current?.offsetHeight + 50);
  });

  return (
    <div
      className={`card ${active ? "active" : ""}`}
      style={active ? { height: height } : undefined}
    >
      <div
        className="card-header"
        onClick={(e: MouseEvent) => {
          setActive(!active);
        }}
      >
        <div className="name">{props.title}</div>
        {props.onChange ? (
          <IconButton onClick={props.onChange}>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"
              />
            </svg>
          </IconButton>
        ) : undefined}
        {props.onDelete ? (
          <IconButton onClick={props.onDelete}>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
              />
            </svg>
          </IconButton>
        ) : undefined}

        <div className="collapse">
          <svg viewBox="0 0 24 24">
            {active ? (
              <path
                fill="currentColor"
                d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
              ></path>
            ) : (
              <path
                fill="currentColor"
                d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
              ></path>
            )}
          </svg>
        </div>
      </div>
      <div ref={contentRef}>
        <div className="card-content">
          <div className="header">
            {props.headers.map((header, i) => (
              <div key={props.title + "-header-" + i} className="cell">
                <div>{header}</div>
              </div>
            ))}
            <div className="cell">
              <div>操作</div>
            </div>
          </div>
          {props.values.map((value, i) => (
            <div key={props.title + "-" + i + "-card-item"} className="content">
              {value.map((v, i) => (
                <div key={props.title + "-value-" + i} className="cell">
                  <div>{v}</div>
                </div>
              ))}
              <div className="cell">
                <div className="buttons-warp">
                  <IconButton
                    onClick={(e: MouseEvent) => {
                      e.preventDefault();
                      props.onItemChange(value);
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z"
                      />
                    </svg>
                  </IconButton>
                  <IconButton
                    onClick={(e: MouseEvent) => {
                      e.preventDefault();
                      props.onItemDelete(value);
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
                      />
                    </svg>
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="add-btn">
          <IconButton onClick={props.onAdd}>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
              />
            </svg>
          </IconButton>
        </div>
      </div>
    </div>
  );
};

interface ICardProps {
  title: string;
  onChange?: (e: MouseEvent) => void;
  onDelete?: (e: MouseEvent) => void;
  onAdd: (e: MouseEvent) => void;
  headers: string[];
  values: any[][];
  onItemChange: (item: any[]) => void;
  onItemDelete: (item: any[]) => void;
}

export default Card;

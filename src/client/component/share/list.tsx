import React, { FC } from "react";
import "../../scss/components/share/list.scss";

const List: FC<IListProps> = (props: IListProps) => {
  return (
    <div className="listWarp">
      <div className="list-header"> {props.header}</div>
      <div className="list">
        <div className="flexWarp">
          {props.items.map((item, i) => {
            if (props.selectedItemsIndex) {
              if (props.selectedItemsIndex.includes(i)) {
                return (
                  <div
                    key={"list-item-" + item + i}
                    className="item item-select"
                    onClick={() =>
                      props.onItemClick ? props.onItemClick(i) : undefined
                    }
                  >
                    <span className="item-text">{item}</span>
                  </div>
                );
              }
            }
            if (props.hidItemsIndex) {
              if (props.hidItemsIndex.includes(i)) {
                return;
              }
            }
            return (
              <div
                key={"list-item-" + item + i}
                className="item"
                onClick={() =>
                  props.onItemClick ? props.onItemClick(i) : undefined
                }
              >
                <span className="item-text">{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface IListProps {
  header: string;
  items: string[];
  selectedItemsIndex?: number[];
  onItemClick?: (i: number) => void;
  hidItemsIndex?: number[];
}

export default List;

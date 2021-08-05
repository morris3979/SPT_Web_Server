import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import "../../scss/components/share/dataTable.scss";

const DataTable: FC<IDataTableProps> = (props: IDataTableProps) => {
  const rowRef = useCallback((node) => {
    if (node !== null) {
      setRowHeight(node.getBoundingClientRect().height);
    }
  }, []);
  const bodyRef = useCallback((node) => {
    if (node !== null) {
      setBodyHeight(node.getBoundingClientRect().height);
    }
  }, []);

  const [rowHeight, setRowHeight] = useState(1);
  const [bodyHeight, setBodyHeight] = useState(0);
  const [currentData, setCurrentData] = useState<any[]>([]);
  const currentDataRef = useRef<{
    currentData: any[];
    setCurrentData: React.Dispatch<React.SetStateAction<any[]>>;
  } | null>(null);
  let autoPagingInterval = useRef<number | undefined>(undefined);

  currentDataRef.current = { currentData, setCurrentData };

  if (props.autoScroll) {
    useEffect(() => {
      if (props.data.length > 0) {
        setCurrentData(props.data.slice(0, 1));
      }
    }, [props.data]);

    useEffect(() => {
      if (rowHeight > 1) {
        const rowNumberOfPage = Math.floor(bodyHeight / rowHeight);
        console.log(rowNumberOfPage);
        setCurrentData(props.data.slice(0, rowNumberOfPage));

        if (autoPagingInterval) {
          clearInterval(autoPagingInterval.current);
        }
        const intervalID = window.setInterval(() => {
          if (currentDataRef.current) {
            const start =
              props.data.indexOf(
                currentDataRef.current.currentData[rowNumberOfPage - 1]
              ) + 1;
            console.log(start);

            if (start === props.data.length) {
              setCurrentData(props.data.slice(0, rowNumberOfPage));
              return;
            }
            setCurrentData(props.data.slice(start, start + rowNumberOfPage));
          }
        }, 10000);
        autoPagingInterval.current = intervalID;
      }
    }, [props.data, rowHeight]);

    useEffect(
      () => () => {
        clearInterval(autoPagingInterval.current);
      },
      []
    );
  }

  return (
    <div
      className={
        "dataTable-col-" +
        props.head.length +
        (props.className ? " " + props.className : "")
      }
    >
      <table>
        <thead>
          <tr>
            {props.head.map((v) => {
              return <th key={"dataTable-head-" + v}>{v}</th>;
            })}
          </tr>
        </thead>
        <tbody ref={bodyRef}>
          {(props.autoScroll ? currentData : props.data).map((v, i) => {
            const trKey = "dataTable-row-" + i + v;
            if (props.selectable) {
              return (
                <tr
                  className={
                    props.selectedIndex?.includes(i)
                      ? "selected selectable"
                      : "selectable"
                  }
                  key={trKey}
                  onClick={() =>
                    props.onRowClick ? props.onRowClick(i) : undefined
                  }
                  ref={i === 0 ? rowRef : null}
                >
                  {props.sort?.map((k) => {
                    return <td key={trKey + "-" + k}>{v[k]}</td>;
                  })}
                </tr>
              );
            }
            if (props.sort) {
              return (
                <tr key={trKey} ref={i === 0 ? rowRef : null}>
                  {props.sort.map((k) => {
                    const keys = k.split(".");

                    let value: { [k: string]: any } | React.ReactNode = "";
                    keys.forEach((k, i) => {
                      if (i == 0) {
                        value = v[k];
                        return;
                      }
                      if (
                        typeof value !== "string" &&
                        value &&
                        typeof value !== "function"
                      ) {
                        value = (value as { [k: string]: any })[k];
                      }
                    });

                    return <td key={trKey + "-" + k}>{value}</td>;
                  })}
                </tr>
              );
            } else {
              return (
                <tr key={trKey} ref={i === 0 ? rowRef : null}>
                  <td key={trKey + "-value"}>{v}</td>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </div>
  );
};

class IDataTableProps {
  head: string[];
  data: any[]; // object
  sort?: string[];
  selectable?: boolean = false;
  selectedIndex?: number[] = [];
  onRowClick?: (i: number) => void;
  className?: string;
  autoScroll?: boolean = false;
}

export default DataTable;

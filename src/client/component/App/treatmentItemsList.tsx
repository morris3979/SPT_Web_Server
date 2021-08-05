import React, {FC, useEffect, useState} from "react";
import {Collapse, List, ListItem, ListItemText} from "@material-ui/core";
import {ExpandLess, ExpandMore} from "@material-ui/icons";
import {TreatmentSite} from "../../types";
import {Link, useLocation} from "react-router-dom";
import {getDistinctiveTreatmentItemsInTreatmentSeats} from "../../utiles";

const TreatmentItemsList: FC<{ site: TreatmentSite }> = (props: {
  site: TreatmentSite;
}) => {
  const [treatmentItemList, setTreatmentItemList] = useState<boolean>(false);
  const {pathname} = useLocation();

  useEffect(() => {
    if (String(props.site.id) === pathname.split("/")[2]) {
      setTreatmentItemList(true);
    }
  }, []);

  const handleClick = (): void => {
    setTreatmentItemList(!treatmentItemList);
  };

  return (
    <div>
      <ListItem button onClick={handleClick}>
        <ListItemText className="nest-list-1">{props.site.name}</ListItemText>
        {treatmentItemList ? <ExpandLess/> : <ExpandMore/>}
      </ListItem>
      <Collapse in={treatmentItemList} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {getDistinctiveTreatmentItemsInTreatmentSeats(props.site.treatmentSeats!).map((idsAndCodes) => {
            return (
              <ListItem
                key={`nav-${props.site.id}-${idsAndCodes.ids}`}
                button
                component={Link}
                to={`/treatmentSites/${props.site.id}/${idsAndCodes.ids}`}
                selected={
                  idsAndCodes.ids === pathname.replace(`/treatmentSites/${props.site.id}/`, "")
                }
              >
                <ListItemText className="nest-list-2">
                  {idsAndCodes.displayNames}
                </ListItemText>
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </div>
  );
};

export default TreatmentItemsList;

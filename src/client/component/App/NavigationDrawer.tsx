import React, {FC, useState} from "react";
import {TreatmentSite} from "../../types";

import {Collapse, Drawer, List, ListItem, ListItemText,} from "@material-ui/core";
import {Link, useLocation} from "react-router-dom";
import {ExpandLess, ExpandMore} from "@material-ui/icons";

const TreatmentItemsList = React.lazy(() => import("./treatmentItemsList"));

const NavigationDrawer: FC<{
  treatmentSites: TreatmentSite[];
}> = (props: { treatmentSites: TreatmentSite[] }) => {
  const [treatmentSitesList, setTreatmentSitesList] = useState<boolean>(true);
  const {pathname} = useLocation();
  const handleClick = (): void => {
    setTreatmentSitesList(!treatmentSitesList);
  };

  return (
    <Drawer
      variant="permanent"
      classes={{paper: "drawer paper"}}
      className="drawer"
    >
      <List component="nav">
        <ListItem component={Link} to="/" selected={pathname == "/"} button>
          <ListItemText>中控端</ListItemText>
        </ListItem>
        <ListItem
          component={Link}
          to="/sorted"
          selected={pathname == "/sorted"}
          button
        >
          <ListItemText>中控排程</ListItemText>
        </ListItem>
        <ListItem
          component={Link}
          to="/broadcast"
          selected={pathname == "/broadcast"}
          button
        >
          <ListItemText>廣播端</ListItemText>
        </ListItem>
        <ListItem button onClick={handleClick}>
          <ListItemText>站別端</ListItemText>
          {treatmentSitesList ? <ExpandLess/> : <ExpandMore/>}
        </ListItem>
        <Collapse in={treatmentSitesList} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <React.Suspense fallback={<div>Loading...</div>}>
              {props.treatmentSites.map((site) => {
                return (
                  <TreatmentItemsList key={"nav " + site.name} site={site}/>
                );
              })}
            </React.Suspense>
          </List>
        </Collapse>
        <ListItem
          component={Link}
          to="/maintain"
          selected={pathname == "/maintain"}
          button
        >
          <ListItemText>維護</ListItemText>
        </ListItem>

        <ListItem
          component={Link}
          to="/treatmentitem"
          selected={pathname == "/treatmentitem"}
          button
        >
          <ListItemText>治療項目表</ListItemText>
        </ListItem>

        <ListItem
          component={Link}
          to="/WaitingnumberList"
          selected={pathname == "/WaitingnumberList"}
          button
        >
          <ListItemText>站別機台人數表</ListItemText>
        </ListItem>

      </List>
    </Drawer>
  );
};

export default NavigationDrawer;

import {
  Box,
  Link,
  Button,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";
const useStyles = makeStyles((theme) => ({
  flex: {
    display: "flex",
    margin: "auto",
    justifyContent: "center",
  },
  button: {
    margin: "0.5rem",
  },
}));
// Hard coded options for decisions
const options = ["Choose", "Accept", "Reject"];

export default function DecisionButtons(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(1);

  // Event handler for opening decision box
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Event handler for selecting menu item
  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setAnchorEl(null);
  };

  // Event handler for closing selection menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Event handler for confirming selection
  const handleConfirm = () => {
    props.ref2(selectedIndex);
  };

  return (
    <Box className={classes.flex}>
      <Button
        className={classes.button}
        variant="outlined"
        onClick={props.ref1}
      >
        {props.label1}
      </Button>

      <List component="nav" aria-label="Choice">
        <ListItem
          button
          aria-haspopup="true"
          aria-controls="lock-menu"
          aria-label="Decision"
          onClick={handleClick}
        >
          <ListItemText primary="Decision" secondary={options[selectedIndex]} />
        </ListItem>
      </List>

      <Menu
        id="lock-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option, index) => (
          <MenuItem
            key={option}
            disabled={index === 0}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>

      <Button
        className={classes.button}
        variant="outlined"
        color="primary"
        onClick={handleConfirm}
      >
        Confirm
      </Button>
    </Box>
  );
}

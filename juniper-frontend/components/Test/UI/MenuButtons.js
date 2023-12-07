import { Box, Link, Button, Menu, MenuItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

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

export default function MenuButtons(props) {
  const classes = useStyles();

  return (
    <Box className={classes.flex}>
      <Button
        className={classes.button}
        variant="outlined"
        onClick={props.ref1}
      >
        {props.label1}
      </Button>

      <Button
        className={classes.button}
        variant="outlined"
        onClick={props.ref2}
        disabled={props.disabled}
      >
        {props.label2}
      </Button>
    </Box>
  );
}

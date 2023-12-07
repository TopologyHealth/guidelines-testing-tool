import { Typography, Button, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  label: {
    display: "inline-block",
  },
  button: {
    borderLeft: "solid 1px",
    borderRadius: 0,
    padding: 0,
    paddingLeft: "1rem",
    marginLeft: "1rem",
    textDecoration: "underline",
  },
}));

export default function InputLine(props) {
  const classes = useStyles();

  // Default for error handling
  let input = <p>Error: Wrong input type</p>;

  // If title not provided, set default
  const guidelineTitle = props.guidelineTitle ? props.guidelineTitle : "title";

  // Handling for different types of InputLines: button or dropdown
  if (props.inputType == "button") {
    input = (
      <Button className={classes.button}>
        {guidelineTitle.substring(0, guidelineTitle.indexOf("."))}
      </Button>
    );
  } else if (props.inputType == "dropdown") {
    input = (
      <Button className={classes.button} onClick={props.onOpen}>
        {props.patient["default"] ? "Select Patient" : "Change Patient"}
      </Button>
    );
  }

  return (
    <div
      style={{
        margin: "auto",
        width: "50%",
        marginTop: "1rem",
        marginBottom: "1rem",
        textAlign: "center",
      }}
    >
      <Typography className={classes.label}>{props.title}</Typography>
      {input}
    </div>
  );
}

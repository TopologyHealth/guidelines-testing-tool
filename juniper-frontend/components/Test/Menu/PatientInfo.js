import { Grid, Typography, Box, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  detail_box: {
    border: "solid 1px",
    borderRadius: 6,
    width: "50%",
    margin: "auto",
    marginTop: "1rem",
    marginBottom: "1rem",
    padding: "0.5rem",
  },
  grid: {
    margin: "0.5rem",
  },
}));

export default function PatientInfo(props) {
  const classes = useStyles();

  // Loading handling
  if (!props.patient) {
    return <h3>Loading ...</h3>;
  }

  return (
    <Box className={classes.detail_box}>
      {!props.patient["default"] ? (
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid className={classes.grid} item>
            <Typography>Age: {props.patient["resource"]["birthDate"]}</Typography>
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid className={classes.grid} item>
            <Typography>Gender: {props.patient["resource"]["gender"]}</Typography>
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid className={classes.grid} item>
            <Typography>
              Name:{" "}
              {props.patient["resource"]["name"][0]["given"]
                      ? props.patient["resource"]["name"][0]["prefix"] +
                        " " +
                        props.patient["resource"]["name"][0]["given"][0] +
                        " " +
                        props.patient["resource"]["name"][0]["family"]
                      : props.patient["resource"]["name"][0]["family"]}
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Grid className={classes.grid} item>
            <Typography>No Patient Selected</Typography>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

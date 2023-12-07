import { Button, Typography, Grid, Box, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  button: {
    height: "36px",
    backgroundColor: "#4D6D9A",
   
  },
})

const PatientListItem = (props) => {
  const this_patient = props.this_patient;
  const classes = useStyles();

  return (
    <Grid item xs={12} key={this_patient.id}>
      <Paper variant="outlined">
        <Grid
          container
          justifyContent=""
          style={{
            marginTop: "20px",
            marginLeft: "10px",
            paddingLeft: "10px",
            paddingRight: "50px",
          }}
        >
          <Grid item xs={"12"} sm={"6"}>
            <Typography variant="body1" style={{ fontWeight: "bold" }}>
              {this_patient["resource"]["name"][0]["given"]
                ? this_patient["resource"]["name"][0]["prefix"] +
                  " " +
                  this_patient["resource"]["name"][0]["given"][0] +
                  " " +
                  this_patient["resource"]["name"][0]["family"]
                : this_patient["resource"]["name"][0]["family"]}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {this_patient["resource"]["gender"]}
            </Typography>
          </Grid>
          {!props.details && (
            <Grid item xs={12} sm={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => props.handleDetails(this_patient)}
                className={classes.button}
              >
                Details
              </Button>
            </Grid>
          )}

          <Grid item xs={12} sm={1}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => props.handleChange(this_patient)}
              disabled={
                !props.currentPatient["default"]
                  ? this_patient["resource"]["id"] ===
                    props.currentPatient["resource"]["id"]
                    ? true
                    : false
                  : false
              }
              className={classes.button}
            >
              Select
            </Button>
          </Grid>
        </Grid>
        <Grid container style={{ marginBottom: "20px", marginLeft: "10px" }}>
          <Grid item xs={12} sm={1}>
            <Typography variant="body2">
              {this_patient["resource"]["birthDate"]}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Typography variant="body2">
              {this_patient["resource"]["telecom"]
                ? this_patient["resource"]["telecom"][0]["value"]
                : "Phone"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2">
              {this_patient["resource"]["communication"]
                ? this_patient["resource"]["communication"][0]["language"][
                    "coding"
                  ][0]["display"]
                : "Language"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2">
              {this_patient["resource"]["managingOrganization"]
                ? this_patient["resource"]["managingOrganization"]["display"]
                  ? this_patient["resource"]["managingOrganization"]["display"]
                  : this_patient["resource"]["managingOrganization"][
                      "reference"
                    ]
                : "Org"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default PatientListItem;

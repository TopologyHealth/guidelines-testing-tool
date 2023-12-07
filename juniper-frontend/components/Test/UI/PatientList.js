import { useState, useEffect } from "react";
import { Button, Typography, Grid, Box, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
//import PatientsJson from "../../../public/patients/Patient-example.json";
import Pagination from "./Pagination";
import { paginate } from "./Pagination";
import ResourceList from "./ResourceList";
import PatientListItem from "./PatientListItem";
import { getPatients } from "@/api/fastapiApi";

const useStyles = makeStyles((theme) => ({
  button: {
    display: "block",
    margin: "auto",
  },
  cancel: {
    marginTop: "10px",
    height: "40px",
    height: "36px",
    backgroundColor: "#4D6D9A",
  },
}));

const PatientList = (props) => {
  const [patients, setPatients] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPatient, setCurrentPatient] = useState(props.patient);
  const [showDetails, setShowDetails] = useState(null);
  const pageSize = 5;

  const classes = useStyles();

  // Fetch patients and set to state variables
  useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await getPatients(props.condition);
        setPatients(data);
        setFilteredItems(data);
      } catch (error) {
        console.error("Error fetching patients", error);
      }
    }
    fetchPatients();
  }, [props.condition]);

  // Event handler for showing patient details
  const handleDetails = (detail_patient) => {
    setShowDetails(detail_patient);
  };

  // Event handler for going back from details view
  const handleBack = () => {
    setShowDetails(null);
  };

  // Event handler for changing page
  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  // Event handler for changing selected patient
  const handleChange = async (this_patient) => {
    setCurrentPatient(this_patient);
    props.handleChange(this_patient);
  };

  // Change patients list by search query by name
  useEffect(() => {
    if (props.searchQuery === "") {
      setFilteredItems(patients);
      return;
    }
    const filtered = patients.filter((patient) => {
      let last_name = "";
      let given_name = "";
      let full_name = "";
      if (patient["resource"]["name"][0]["family"]) {
        last_name = patient["resource"]["name"][0]["family"].toLowerCase();
        given_name = patient["resource"]["name"][0]["given"][0].toLowerCase();
        full_name = last_name + given_name;
      } else return false;
      const query = props.searchQuery.toLowerCase();
      return full_name.includes(query);
    });
    setFilteredItems(filtered);
  }, [props.searchQuery, currentPatient, patients]);

  // Error handling
  if (!patients) {
    return <div>Loading...</div>;
  }

  // Create list of currently paginated items
  let paginatedPatients = paginate(filteredItems, currentPage, pageSize);

  // Set current page to one if too few items
  if (filteredItems.length <= pageSize && currentPage != 1) setCurrentPage(1);

  // Conditional rendering for showing patient detail/history screen rather than list
  if (showDetails) {
    const patient = showDetails;
    return (
      <div>
        <Grid container spacing={1}>
          <PatientListItem
            this_patient={patient}
            handleDetails={handleDetails}
            handleChange={handleChange}
            handleClose={props.handleClose}
            currentPatient={currentPatient}
            details={true}
          />
          <ResourceList patient={patient} />
        </Grid>

        <Box display="flex" justifyContent="space-between" p={1}>
          <Button
            className={classes.cancel}
            variant="contained"
            color="primary"
            onClick={() => handleBack()}
          >
            Back
          </Button>
        </Box>
      </div>
    );
  }
  // Otherwise, display patient list
  else
    return (
      <div>
        <Grid container spacing={2}>
          {paginatedPatients.map((this_patient) => (
            <PatientListItem
              this_patient={this_patient}
              handleDetails={handleDetails}
              handleChange={handleChange}
              handleClose={props.handleClose}
              currentPatient={currentPatient}
            />
          ))}
        </Grid>
        <Box display="flex" justifyContent="space-between" p={1}>
          <Pagination
            items={
              patients == filteredItems ? patients.length : filteredItems.length
            }
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={onPageChange}
          />
          <Button
            className={classes.cancel}
            variant="contained"
            color="primary"
            onClick={() => props.handleClose()}
          >
            Cancel
          </Button>
        </Box>
      </div>
    );
};

export default PatientList;

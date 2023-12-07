import { useState, useEffect } from "react";
import {
  Autocomplete,
  Typography,
  Grid,
  Container,
  TextField,
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "../../Modal";
import Searchbar from "@/components/Searchbar";
import { Block } from "@material-ui/icons";
import PatientList from "./PatientList";
import { getConditions } from "@/api/fastapiApi";

const useStyles = makeStyles((theme) => ({
  container: {
    textAlign: "center",
  },

  FormControl: {
    margin: theme.spacing(1),
    minWidth: 240,
  },

  button: {
    display: "block",
    margin: "auto",
  },

  flex: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "1em",
  },

  title: {
    paddingTop: "0.5em",
  },
}));

export default function PatientModal(props) {
  const [patient, setPatient] = useState(props.patient);
  const [searchQuery, setSearchQuery] = useState("");
  const [conditions, setConditions] = useState("");
  const [conditionValue, setConditionValue] = useState("");
  const [inputConditionValue, setInputConditionValue] = useState(null);
  const classes = useStyles();

  // // Fetch all conditions
  useEffect(() => {
    async function fetchConditions() {
      try {
        const data = await getConditions();
        setConditions(data);
      } catch (error) {
        console.error("Error fetching conditions", error);
      }
    }
    fetchConditions();
  }, []);

  let labels = { label: "loading..." };

  // Map condition names to array
  if (conditions) {
    labels = conditions.map((condition) => {
      const name = condition[0].display;
      return { label: name };
    });
  }

  // Handle searching
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle patient change
  const handleChange = (this_patient) => {
    setPatient(this_patient);
    props.onClose(this_patient);
  };

  // Handle closing modal
  const handleClose = () => {
    props.onClose(patient);
  };

  return (
    <Modal>
      <Container className={classes.container}>
        <div className={classes.flex}>
          <Typography variant="h5" className={classes.title}>
            {"Patient for: " + props.guidelineTitle}
          </Typography>

          <Autocomplete
            isOptionEqualToValue={(option, value) => option.id === value.id}
            sx={{ width: 500 }}
            disablePortal
            id="combo"
            options={labels}
            renderInput={(params) => (
              <TextField {...params} label="Condition" />
            )}
            value={conditionValue || ""}
            inputValue={inputConditionValue}
            onChange={(event, newValue) => {
              setConditionValue(newValue);
            }}
            onInputChange={(event, newInputValue) => {
              setInputConditionValue(newInputValue);
            }}
          />
          <Searchbar
            value={searchQuery}
            onChange={handleSearchChange}
            label={"Search by name"}
          />
        </div>
        <PatientList
          searchQuery={searchQuery}
          condition={conditionValue}
          handleChange={handleChange}
          patient={patient}
          handleClose={handleClose}
        />
      </Container>
    </Modal>
  );
}

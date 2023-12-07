import React, { useState, useEffect } from "react";
import { Container, Typography, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import InputLine from "./InputLine";
import PatientInfo from "./PatientInfo";
import DecisionButtons from "../UI/DecisionButtons";
import MenuButtons from "../UI/MenuButtons";
import { useRouter } from "next/router";
import Encender from "@/components/Encender";
import { updateGuidelineMetadata } from "@/api/fastapiApi";

const useStyles = makeStyles((theme) => ({
  container: {
    margin: "auto",
    marginTop: "1rem",
  },
  inputs: {
    border: "solid 1px",
    borderRadius: 6,
    margin: "0 4rem 0 0",
    padding: "2rem",
    textAlign: "center",
  },
}));

export default function TestMenu(props) {
  const router = useRouter();
  const { item_key } = router.query;
  const patient = props.patient;
  const patientId = patient.resource?.id;
  const [newStatus, setNewStatus] = useState(null);
  const [error, setError] = useState(null);

  // Event handler for cancelling test
  const handleCancelClick = () => {
    router.push(`/details/${item_key}`);
  };

  // Updating guideline metadata with API
  useEffect(() => {
    async function changeItemStatus() {
      try {
        if (item_key && newStatus) {
          await updateGuidelineMetadata(item_key, newStatus);
          router.push(`/details/${item_key}`);
        }
      } catch (error) {
        setError(error);
      }
    }

    changeItemStatus();
  }, [newStatus]);
  // Event handler for submitting decision
  const handleSubmit = (selectedIndex) => {
    if (selectedIndex == 1) setNewStatus("approved");
    else setNewStatus("rejected");
  };

  const classes = useStyles();

  // Error handling
  let content = <Typography>Error</Typography>;

  // Can conditiionally render two screens
  // 1. Menu: Setup for test, choose patient then proceed
  if (props.type == "menu") {
    content = (
      <Box className={classes.inputs}>
        <InputLine
          title="Testing Guideline"
          inputType="button"
          guidelineTitle={item_key}
        ></InputLine>
        <InputLine
          title="Select Patient"
          inputType="dropdown"
          onOpen={props.onOpen}
          patient={props.patient}
        ></InputLine>
        <Typography>Patient Details</Typography>
        <PatientInfo patient={props.patient} />
        <MenuButtons
          label1="Cancel"
          label2="Test"
          ref1={handleCancelClick}
          ref2={props.showResults}
          disabled={patient["default"] ? true : false}
        />
      </Box>
    );
  }
  // 2. Results: Shows results of test and allows user to decide based on outcome
  else if (props.type == "results") {
    content = (
      <Box className={classes.inputs}>
        <Encender patientId={patientId} guideline={item_key} />

        <DecisionButtons
          label1="Back"
          label2="Continue"
          ref1={props.hideResults}
          ref2={handleSubmit}
          file_name={item_key} // Pass item_key as a prop here
        />
      </Box>
    );
  }

  // Error handling for API requests
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Container className={classes.container}>
      <Typography variant="h4">Guideline Test Sandbox</Typography>
      {content}
    </Container>
  );
}

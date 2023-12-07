import ResourceSelector from "./ResourceSelector";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { getPatientResources } from "@/api/fastapiApi";

const ResourceList = (props) => {
  const patient_id = props.patient.resource.id;
  const [category, setCategory] = useState("Condition");
  const [resources, setResources] = useState(null);
  const [rows, setRows] = useState(null);
  const [headers, setHeaders] = useState(null);

  // Fetch resources for patient
  useEffect(() => {
    async function fetchPatientResources() {
      try {
        if (category !== "") {
          const data = await getPatientResources(category, patient_id);

          setResources(data);
        }
      } catch (error) {
        console.error("Error fetching patient resources", error);
      }
    }
    fetchPatientResources();
  }, [category]);

  // Function to create row data
  function createData(one, two, three, four = null, five = null) {
    if (!four && !five) return { one, two, three };
    else if (!five) return { one, two, three, four };
    else return { one, two, three, four, five };
  }

  // Change table data based on category change
  useEffect(() => {
    if (resources) {
      if (category == "Condition") {
        setHeaders([
          "Condition",
          "System and Code",
          "Clinical Status",
          "Verification Status",
          "Onset Date",
        ]);
        setRows(
          resources.map((resource) => {
            let condition = resource.resource.code.text;
            //console.log(resource);
            let code = "";
            code += resource.resource.code.coding[0].code;
            if (resource.resource.code.coding[0].system.indexOf("snomed")) {
              code += " (SNOMED-CT)";
            }
            //condition = condition + " " + code + ")";
            const clinical_status =
              resource.resource.clinicalStatus.coding[0].code;
            const verification_status =
              resource.resource.verificationStatus.coding[0].code;
            const onset_date = new Date(
              resource.resource.onsetDateTime
            ).toLocaleString();
            return createData(
              condition,
              code,
              clinical_status,
              verification_status,
              onset_date
            );
          })
        );
      } else if (category == "Immunization") {
        setHeaders(["Type", "Status", "Date"]);
        console.log(resources);

        setRows(
          resources.map((resource) => {
            const type = resource.resource.vaccineCode.text;
            const status = resource.resource.status;
            const date = new Date(
              resource.resource.occurrenceDateTime
            ).toLocaleString();
            return createData(type, status, date);
          })
        );
      } else {
        setHeaders(["Name", "Value", "Date", "Type"]);
        setRows(
          resources.map((resource) => {
            const name = resource.resource.code.text;
            const value =
              resource.resource.valueQuantity.value +
              resource.resource.valueQuantity.unit;
            const date = new Date(resource.resource.issued).toLocaleString();
            const type = resource.resource.category[0].coding[0].code;
            return createData(name, value, date, type);
          })
        );
      }
    }
  }, [resources]);

  // Event handler for category change
  const handleChange = (event) => {
    setCategory(event.target.value);
  };

  return (
    <Paper sx={{ overflow: "hidden", margin: "auto", marginTop: "10px" }}>
      <ResourceSelector handleChange={handleChange} />
      {(!resources || !rows) && <div>Loading...</div>}
      {resources &&
        rows && ( //<div>Resources</div>
          <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
            <Table
              sx={{ minWidth: 750 }}
              aria-label="simple table"
              stickyHeader
            >
              <TableHead>
                <TableRow>
                  <TableCell>{headers[0]}</TableCell>
                  <TableCell align="right">{headers[1]}</TableCell>
                  <TableCell align="right">{headers[2]}</TableCell>
                  {headers[3] && (
                    <TableCell align="right">{headers[3]}</TableCell>
                  )}
                  {headers[4] && (
                    <TableCell align="right">{headers[4]}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {console.log(rows)}
                {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.one}
                    </TableCell>
                    <TableCell align="right">{row.two}</TableCell>
                    <TableCell align="right">{row.three}</TableCell>
                    <TableCell align="right">{row.four}</TableCell>
                    <TableCell align="right">{row.five}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
    </Paper>
  );
};

export default ResourceList;

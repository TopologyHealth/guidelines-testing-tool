import { useState } from "react";
import { Box, InputLabel, MenuItem, FormControl } from "@mui/material";

import Select from "@mui/material/Select";


const ResourceSelector = (props) => {
  const [category, setCategory] = useState("Condition");

  // Event handler for changing resource
  const handleChange = (event) => {
    setCategory(event.target.value);
    props.handleChange(event);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="category-select">Resource</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-selector"
          value={category}
          label="Category"
          onChange={handleChange}
        >
          <MenuItem value={"Condition"}>Condition</MenuItem>
          <MenuItem value={"Immunization"}>Immunization</MenuItem>
          <MenuItem value={"Observation"}>Observation</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default ResourceSelector;

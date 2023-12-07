import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Grid, Paper, Button, Typography } from "@material-ui/core";
import Alert from "@mui/material/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { getAllGuidelines } from "@/api/fastapiApi";

const useStyles = makeStyles((theme) => ({
  button: {
    marginRight: theme.spacing(2),
    height: "36px",
    backgroundColor: "#4D6D9A",
    "&:hover": {
      backgroundColor: "#4D6D9A", // Button remains the same color when hovered over
    },
  },
}));

/**
 * Public component represents a list of guidelines displayed to the public.
 * It fetches the guidelines, filters them based on a search query, and renders them.
 *
 * @param {string} searchQuery - The search query to filter the guidelines
 * @returns {JSX.Element} Rendered component
 */

export default function Public({ searchQuery }) {
  const router = useRouter();
  const [items, setItems] = useState([]); // All guidelines fetched from the API
  const [filteredItems, setFilteredItems] = useState([]); // Guidelines filtered based on search query
  const [error, setError] = useState(null); // Error message, if any
  const classes = useStyles();

  /**
   * Handle the click event when a user selects "Details" for a guideline item.
   * Redirects the user to the details page of the selected item.
   *
   * @param {string} item_key - The key of the selected item
   */
  const handleDetailsClick = (item_key) => {
    router.push(`/details/${item_key}`);
  };

  /**
   * Fetch all guidelines from the API and update the state with the fetched data.
   * Sets the items and filteredItems state variables.
   * Handles errors if any occur during the fetch.
   */

  useEffect(() => {
    async function fetchAllGuidelines() {
      try {
        const data = await getAllGuidelines();

        if (!data) {
          throw new Error("No data received");
        }

        setItems(data);
        setFilteredItems(data);
      } catch (error) {
        setError(`Error fetching guidelines: ${error.message}`);
      }
    }
    fetchAllGuidelines();
  }, []);

  /**
   * Filter the guidelines based on the search query.
   * Updates the filteredItems state variable.
   * Handles errors if any occur during the filtering process.
   */

  useEffect(() => {
    try {
      if (searchQuery === "") {
        setFilteredItems(items);
        return;
      }

      if (!items || !Array.isArray(items)) {
        throw new Error("Invalid data format");
      }

      const filtered = items.filter((item) => {
        if (
          item &&
          item.json &&
          item.json.entry &&
          item.json.entry[0] &&
          item.json.entry[0].resource &&
          item.json.entry[0].resource.title
        ) {
          const title = item.json.entry[0].resource.title.toLowerCase();
          const query = searchQuery.toLowerCase();
          return title.includes(query);
        }
        return false;
      });

      setFilteredItems(filtered);
    } catch (error) {
      setError(`Error processing guidelines: ${error.message}`);
    }
  }, [searchQuery, items]);

  /**
   * Render the component.
   * If there is an error, display an Alert with the error message.
   * Otherwise, render the list of filtered items as Paper components.
   *
   * @returns {JSX.Element} Rendered component
   */

  if (error) {
    return (
      <Alert severity="error" style={{ margin: "20px", fontSize: "20px" }}>
        {error}
      </Alert>
    );
  }

  return (
    <Grid container className={classes.root}>
      {filteredItems.map((item) => (
        <Grid item xs={12} key={item.metadata.key}>
          <Paper variant="outlined">
            {" "}
            {/* Added backgroundColor here */}
            <Grid container style={{ marginTop: "20px", marginLeft: "10px" }}>
              <Grid item xs={12} sm={2}>
                <Typography variant="body1" style={{ fontWeight: "bold" }}>
                  {item.json.entry[0].resource.title}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={9}>
                <Typography variant="body1">
                  {item.json.entry[0].resource.description}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDetailsClick(item.metadata.key)}
                  className={classes.button}
                >
                  Details
                </Button>
              </Grid>
            </Grid>
            <Grid
              container
              style={{ marginBottom: "20px", marginLeft: "10px" }}
            >
              <Grid item xs={12} sm={1}>
                <Typography variant="body2">
                  {item.json.entry[0].resource.status || "Status"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Typography variant="body2">
                  {item.metadata.version || "Version"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Typography variant="body2">
                  {item?.json?.entry?.[0]?.resource?.author?.[0]?.name ||
                    "Author"}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={1}>
                <Typography variant="body2">
                  {" "}
                  {item.json.entry[0].resource.publisher || "Publisher"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

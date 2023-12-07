import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';
import axios from "axios";
import Navbar from "../../components/Navbar";
import CardConditions from "../../components/CardConditions";
import {
  Button,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Paper,
  Box,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { json } from "react-router-dom";
import { findTokenCookie, findUserDataCookie } from "../login";
import { getGuidelineBundle } from "@/api/fastapiApi";
import { getGuidelineVersions } from "@/api/fastapiApi";
import { validateToken } from "@/api/fastapiApi";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(2),
    height: "36px",
    backgroundColor: "#4D6D9A",
    "&:hover": {
      backgroundColor: "#4D6D9A", // Button remains the same color when hovered over
    },
  },
  dropDown: {
    height: "36px",
  },
  card: {
    boxShadow: "noen",
    height: "100%",
    marginBottom: theme.spacing(2),
  },
  cardContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    minHeight: "30rem", //A minimum height for the CardContent
    border: "1px solid gray",
  },
  column: {
    display: "flex",
    flexDirection: "column",
  },
  box: {
    border: "1px solid black",
    borderRadius: "4px",
    paddingRight: "8px",
    paddingLeft: "8px",
    marginTop: "10px",
    marginBottom: "10px",
  },
  boxWrapper: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "10px",
  },
  versionsPaper: {
    flexGrow: 1,
    maxHeight: "400px", // Change to the desired height
    overflow: "auto", // Enable scrolling
  },
}));

export default function Details() {
  const router = useRouter();
  const { item_key } = router.query;
  const [item, setItem] = useState(null);
  const [versions, setVersions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedValue, setSelectedValue] = useState("copy");
  const classes = useStyles();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [libraryResource, setLibraryResource] = useState({});
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    given_name: "None",
    email: "none",
  });

  // Protecting frontend with conditional rendering, if not authenticated, redirect to hosted login

  const verifyLogin = async () => {
    // Find existing token in cookies
    const token = await findTokenCookie();
    try {
      setLoading(true);
      // If token is found and not already logged in
      if (token && !loggedIn) {
        // If token was verified
        if (await validateToken(token)) {
          // Set current user in cookies and set loggedIn state flag
          setCurrentUser(await findUserDataCookie());
          setLoggedIn(true);
        }
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // Verify login in on first load
  useEffect(() => {
    verifyLogin();
  }, []);

  if (!loggedIn && !loading) {
    //redirect to juniper login portal which will redirect to /login
    //console.log("Not authenticated");
    router.push(`${process.env.NEXT_PUBLIC_LOGIN_URL}`);
  }

  const handleOpenDialog = (title) => {
    setSelectedTitle(title);

    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const findRelatedLibrary = (title) => {
    // Find the related PlanDefinition
    const planDefinition = item.entry.find(
      (entry) =>
        entry.resource.title === title &&
        entry.resource.resourceType === "PlanDefinition"
    );

    // Find the related Library
    if (
      planDefinition.resource.library ||
      planDefinition.resource.library.length > 0
    ) {
      const relatedLibrary = item.entry.find(
        (entry) =>
          entry.resource.resourceType === "Library" &&
          entry.resource.url === planDefinition.resource.library[0]
      );
      if (relatedLibrary) {
        return relatedLibrary;
      }
      return null;
    }
  };

  const handleSelectChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleTestClick = (item_key) => {
    router.push(`/test/${item_key}`);
  };

  useEffect(() => {
    async function fetchGuidelineBundle() {
      try {
        if (item_key) {
          const data = await getGuidelineBundle(item_key);
          setItem(data);
        }
      } catch (error) {
        setError(error);
      }
    }
    fetchGuidelineBundle();
  }, [item_key]);

  useEffect(() => {
    async function fetchGuidelineVersions() {
      try {
        if (item_key) {
          const data = await getGuidelineVersions(item_key);
          setVersions(data);
        }
      } catch (error) {
        setError(error);
      }
    }
    fetchGuidelineVersions();
  }, [item_key]);

  useEffect(() => {
    if (selectedTitle) {
      setLibraryResource(findRelatedLibrary(selectedTitle));
    }
  }, [selectedTitle]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!item) {
    return <div>Loading...</div>;
  }
  const planDefinitionTitles = item.entry
    .filter(
      (entry) =>
        entry.resource.resourceType === "PlanDefinition" &&
        entry.resource.library &&
        entry.resource.library.length > 0
    )
    .map((entry) => entry.resource.title);

  return (
    <>
      <Head>
        <title>{item.entry[0].resource.title}</title>
      </Head>
      <div>
        <Navbar user={currentUser} />
        <div className={classes.root}>
          {/* Header */}
          <Box className={classes.header}>
            <Box>
              <Typography variant="h4">{item.entry[0].resource.title}</Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={() => handleTestClick(item_key)}
              >
                Test
              </Button>
              <Select
                variant="outlined"
                value={selectedValue}
                onChange={handleSelectChange}
                className={classes.dropDown}
              >
                <MenuItem value="copy">Copy</MenuItem>
                <MenuItem value="edit">Edit</MenuItem>
                <MenuItem value="retire">Retire</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Body */}
          <Grid container spacing={2}>
            {/* Guideline Cards */}
            <Grid item xs={12} sm={9}>
              <Card className={classes.card}>
                <CardContent style={{ padding: 0 }}>
                  <Grid
                    container
                    spacing={2}
                    justifyContent="flex-start"
                    alignItems="flex-start"
                  >
                    {planDefinitionTitles.map((title, index) => (
                      <Grid item key={index} xs={12} sm={6} md={4}>
                        <Box
                          style={{
                            border: "1px solid black",
                            borderRadius: "4px",
                            padding: "20px",
                            margin: "5px",
                            backgroundColor: "#86B3D1",
                            color: "white",
                            textAlign: "center",
                            fontSize: "18px",
                          }}
                          onClick={() => handleOpenDialog(title)}
                        >
                          <Typography>{title}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Column */}
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Paper sx={{ flexGrow: 1 }}>
                  <Box className={classes.column}>
                    <Typography variant="h6">About</Typography>
                    <Typography variant="body1">
                      {item.entry[0].resource.description || "Description"}
                    </Typography>
                  </Box>
                </Paper>
                <Paper>
                  <Box className={classes.boxWrapper}>
                    <Box className={classes.box}>
                      <Typography variant="body2" sx={{ mr: 5 }}>
                        {item.entry[0].resource.publisher || "Publisher"}
                      </Typography>
                    </Box>
                    <Box className={classes.box}>
                      <Typography variant="subtitle1" sx={{ ml: 5 }}>
                        {item.entry[0].resource.author[0].name || "Author"}
                      </Typography>
                    </Box>
                    <Box className={classes.box}>
                      <Typography variant="body2">
                        {" "}
                        {item.entry[0].resource.date || "Original Date"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.boxWrapper}>
                    <Box className={classes.box}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {versions[0] &&
                          versions[0].metadata &&
                          versions[0].metadata.version
                          ? versions[0].metadata.version
                          : "N/A"}
                      </Typography>
                    </Box>
                    <Box className={classes.box}>
                      <Typography variant="subtitle1" sx={{ mr: 1 }}>
                        {item.entry[0].resource.status || "Status"}
                      </Typography>
                    </Box>
                    <Box className={classes.box}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {versions[0] &&
                          versions[0].metadata &&
                          versions[0].metadata.status
                          ? versions[0].metadata.status
                          : "Test Staus"}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
                <Paper sx={{ flexGrow: 1 }} className={classes.versionsPaper}>
                  <Box className={classes.column}>
                    <Typography variant="h6">Versions</Typography>
                    {versions.map((version) => (
                      <Box
                        key={version.metadata.key}
                        style={{
                          border: "1px solid black",
                          borderRadius: "4px",
                          padding: "2px",
                          margin: "5px",
                        }}
                      >
                        <Box className={classes.boxWrapper}>
                          <Typography variant="body1">
                            {version.json.entry[0].resource.authour || "Author"}
                          </Typography>
                          <Typography variant="body1">
                            {version.metadata.version || "Version"}
                          </Typography>
                          <Typography variant="body1">
                            {(version.metadata.date &&
                              version.metadata.date.split("T")[0]) ||
                              "Test Date"}
                          </Typography>
                        </Box>
                        <Box className={classes.boxWrapper}>
                          <Typography variant="body1">
                            {version.json.entry[0].resource.status || "Status"}
                          </Typography>
                          <Typography variant="body1">
                            {version.metadata.status || "Test Status"}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </div>

        <CardConditions
          open={openDialog}
          handleClose={handleCloseDialog}
          title={selectedTitle}
          libraryResource={libraryResource}
        />
      </div>
    </>
  );
}

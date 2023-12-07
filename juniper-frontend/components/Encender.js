import { useState, useEffect } from "react";
import { getPatientBundle, getGuidelineBundle } from "../api/fastapiApi";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    marginBottom: "20px",
    border: "1px solid black",
    padding: "10px",
  },
  scrollableContent: {
    maxHeight: "400px", // can be adjusted to suit the needs
    overflowY: "auto", // this will make the content scrollable if it exceeds the height
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
    borderBottom: "1px solid black",
  },
  labelCell: {
    padding: "10px",
    fontWeight: "bold",
    width: "10%",
  },
  dataCell: {
    padding: "10px",
    width: "90%",
    textAlign: "left",
  },
  title: {
    position: "sticky",
    top: 0, // This determines at what scroll position the title will start sticking at the top
    backgroundColor: "#4D6D9A", //Dark Blue
    color: "#fff",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px", // space between title and table
    zIndex: 1, // In case there are other elements with position relative or absolute
  },
  row: {
    backgroundColor: "#99CED3", //Light Blue
  },
});

/**
 * Encender Component
 * Renders a guideline bundle and applies a plan to a patient.
 * @param {string} patientId - The identifier of the patient.
 * @param {string} guideline - The identifier of the guideline bundle.
 */

export default function Encender({ patientId, guideline }) {
  // State variables for storing the results and guideline bundle title
  const [results, setResults] = useState(null);
  const [guidelineBundleTitle, setGuidelineBundleTitle] = useState("Guideline");
  const [error, setError] = useState(null);

  /**
   * Fetches and applies a plan to the patient.
   * This function is executed when the component mounts and whenever the dependencies change.
   */

  useEffect(() => {
    const fetchAndApplyPlan = async () => {
      try {
        if (!patientId || !guideline) return;
        // Fetch the guideline bundle using the provided guideline identifier and extract resources from the bundle
        const guidelineBundle = await getGuidelineBundle(guideline);
        setGuidelineBundleTitle(guidelineBundle.entry[0].resource.title);
        const guidelineResources = guidelineBundle.entry.map(
          (entry) => entry.resource
        );

        // Fetch the patient bundle using the provided patient identifier and extract resources from the bundle
        const patientBundle = await getPatientBundle(patientId);
        const patientResources = patientBundle.entry.map(
          (entry) => entry.resource
        );

        // Filter out Library resources from the guideline bundle
        const libraries = guidelineBundle.entry.filter(
          (entry) => entry.resource.resourceType === "Library"
        );

        // Extract library URLs from the libraries
        const libraryUrls = libraries.map((library) => library.resource.url);

        // Filter out PlanDefinition resources that have an associated library resource
        let planDefinitionResources = guidelineResources.filter(
          (resource) =>
            resource.resourceType === "PlanDefinition" &&
            resource.library?.some((libraryUrl) =>
              libraryUrls.includes(libraryUrl)
            )
        );

        //Extract and decode ELM JSON from the libraries
        const elmJsonArray = libraries.flatMap((library) => {
          return library.resource.content
            .filter((content) => content.contentType === "application/elm+json")
            .map((content) => {
              const decoded = atob(content.data);
              return JSON.parse(decoded); // directly return the parsed JSON
            });
        });

        // Transform array of ELM JSONs into an object where each key is the identifier id
        const elmJsonDependencies = elmJsonArray.reduce((acc, elm) => {
          let id = elm?.library?.identifier?.id;
          if (id) {
            return {
              ...acc,
              [id]: elm,
            };
          }
          return acc;
        }, {});

        // Combine all FHIR resources into a single array
        const fhirJsonArray = [...guidelineResources, ...patientResources];

        // Specify patient reference
        const fetchedPatientId = patientResources
          .filter((r) => r.resourceType == "Patient")
          .map((p) => p.id)[0];

        const patientReference = "Patient/" + fetchedPatientId;

        // Call the API endpoint with the required parameters to apply the plan
        const response = await axios.post(
          "/api/applyPlan",
          {
            elmJsonDependencies,
            patientReferenceString: patientReference,
            planDefinitions: planDefinitionResources,
            resources: fhirJsonArray,
          },
          {
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          }
        );

        setResults(response.data);
      } catch (error) {
        console.error(error);
        setError("An error occurred while running Encender.");
      }
    };

    // Fetch and apply the plan
    fetchAndApplyPlan();
  }, []);

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <h2 className={classes.title}>{guidelineBundleTitle}</h2>
      <div className={classes.scrollableContent}>
        {error && <div className="errorMessage">{error}</div>}
        {!error &&
          results &&
          results.RequestGroups &&
          results.RequestGroups.map((result, index) => (
            <div key={index}>
              {result.action && result.action.length > 0 && (
                <table className={classes.table}>
                  <tbody>
                    <tr className={classes.row}>
                      <td className={classes.labelCell}>Card Name:</td>
                      <td className={classes.dataCell}>
                        {result.action[0].resource.title}
                      </td>
                    </tr>
                    <tr className={classes.row}>
                      <td className={classes.labelCell}>Description:</td>
                      <td className={classes.dataCell}>
                        {result.action[0].resource.description}
                      </td>
                    </tr>
                    <tr className={classes.row}>
                      <td className={classes.labelCell}>Type:</td>
                      <td className={classes.dataCell}>Type</td>
                    </tr>
                    <tr className={classes.row}>
                      <td className={classes.labelCell}>Status:</td>
                      <td className={classes.dataCell}>
                        {result.action[0].resource.status}
                      </td>
                    </tr>
                    <tr className={classes.row}>
                      <td className={classes.labelCell}>Priority:</td>
                      <td className={classes.dataCell}>
                        {result.action[0].resource.priority}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

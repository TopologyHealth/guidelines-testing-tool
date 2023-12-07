import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import CytoscapeComponent from "react-cytoscapejs";
import parseStatements from "./GraphParser.js";

// Add dagre layout extension to Cytoscape
Cytoscape.use(dagre);

/**
 * Visualizer Component:
 * This component renders a dialog box containing a visual representation of a card as a decision tree.
 * It receives a graph as input, parses it using the 'parseStatements' function,
 * and displays the graph using the Cytoscape library through the 'CytoscapeComponent'.
 * The component applies specific styles to different types of nodes for visual differentiation.
 */

const Visualizer = ({ elm, open, handleClose, title }) => {
  const statements = elm.library.statements;

  const [graph, setGraph] = useState(null);

  useEffect(() => {
    // Fetch data and parse statements to generate the graph
    async function fetchData() {
      const parsedGraph = await parseStatements(statements);

      setGraph(parsedGraph);
    }

    fetchData();
  }, [statements]);

  // Return a loading message if the graph is not ready yet
  if (!graph) {
    return <p>Loading graph...</p>;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      BackdropProps={{
        style: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
      }}
    >
      <DialogTitle>
        {title}
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <div>
        <CytoscapeComponent
          elements={CytoscapeComponent.normalizeElements({
            nodes: graph.nodes.map((n, i) => ({
              data: { id: i, label: n.label, type: n.type },
            })),
            edges: graph.edges.map((e) => ({
              data: { source: e[0], target: e[1] },
            })),
          })}
          style={{ width: "1200px", height: "1200px" }}
          layout={{ name: "dagre", rankDir: "TB" }}
          stylesheet={[
            {
              selector: "node",
              style: {
                content: "data(label)", // This line will ensure that labels are displayed
                "text-wrap": "wrap",
                "text-max-width": "150px",
                "text-valign": "center",
                "text-halign": "center",
                "font-size": "12px",
                "background-color": "#EADDCA",
                "background-fit": "cover",
                color: "#000000",
                shape: "rectangle",
                width: "label",
                height: "label",
                "text-margin": "5px",
              },
            },
            {
              selector: 'node[type = "And"]',
              style: {
                "background-color": "#2E8B57",
                "background-fit": "cover",
                color: "#FFFFFF",
                shape: "hexagon", // override shape for 'And' nodes
                width: "30px",
                height: "30px",
              },
            },
            {
              selector: 'node[type = "Or"]',
              style: {
                "background-color": "#00FFFF",
                "background-fit": "cover",
                color: "#FFFFFF",
                shape: "ellipse", // override shape for 'Or' nodes
                width: "30px",
                height: "30px",
              },
            },
            {
              selector: 'node[type = "Not"]',
              style: {
                "background-color": "#404040",
                "background-fit": "cover",
                color: "#FFFFFF",
                shape: "vee", // override shape for 'Not' nodes
                width: "60px",
                height: "60px",
              },
            },
            {
              selector: 'node[type = "IndexNode"]',
              style: {
                "background-color": "#9F2B68",
                "background-fit": "cover",
                color: "#FFFFFF",
                shape: "rectangle", // override shape 'End' node
                width: "label",
                height: "30px",
                content: title,
              },
            },
          ]}
        />
      </div>
    </Dialog>
  );
};

export default Visualizer;

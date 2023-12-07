import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
} from "@material-ui/core";
import { Dialog, DialogTitle, IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Visualizer from "./Visualizer";
import { createLabel } from "@/utils/createLabel";

/**
 * CardConditions Component
 * Displays conditions extracted from an Elm JSON file of a card.
 *
 * Props:
 * - open: boolean - Whether the dialog is open or not.
 * - handleClose: function - Handler for closing the dialog.
 * - title: string - Title of the dialog which is the Card Title.
 * - libraryResource: object - Library resource containing the Elm JSON file.
 */

const CardConditions = ({ open, handleClose, title, libraryResource }) => {
  const [graphOpen, setGraphOpen] = useState(false);

  const [elm, setElm] = useState(null);

  /**
   * Creates a node object with the specified type, label, and data.
   *
   * @param {string} type - Type of the node
   * @param {string} label - Label of the node
   * @param {object} data - Additional data associated with the node
   * @returns {object} Node object
   */

  const Node = (type, label, data) => {
    return { type, label, data };
  };

  /**
   * Handles opening the graph view.
   */
  const handleGraphOpen = () => {
    setGraphOpen(true);
  };

  /**
   * Handles closing the graph view.
   */
  const handleGraphClose = () => {
    setGraphOpen(false);
  };

  useEffect(() => {
    const elm = processLibraryResource(libraryResource);

    setElm(elm);
  }, [libraryResource]);

  /**
   * Processes the library resource to extract Elm JSON data.
   * @param {object} libraryResource - Library resource containing the Elm JSON file.
   * @returns {object} - Parsed Elm JSON object.
   */
  const processLibraryResource = (libraryResource) => {
    if (!libraryResource || !libraryResource.resource) {
      return null;
    }

    const relatedElmContent = libraryResource.resource.content.find(
      (content) => content.contentType === "application/elm+json"
    );

    const elmData = relatedElmContent.data;

    const decodedElm = Buffer.from(elmData, "base64").toString("utf-8");

    const elm = JSON.parse(decodedElm);

    return elm;
  };

  /**
   * Joins nodes and returns a new array.
   * @param {array} nodes - Array of node objects.
   * @param {object} node - New node object to be added.
   * @returns {array} - Joined array of nodes.
   */

  const joinNodes = (nodes, node) => {
    nodes = nodes.filter((g) => g);

    nodes = [node, ...nodes.map((g) => g).flat()];

    return nodes;
  };

  /**
   * Checks if a node or its children contains an 'Equivalent' type node.
   * @param {object|array} node - Node object or array of node objects.
   * @returns {boolean} - Whether an 'Equivalent' node is found or not.
   */

  const hasEquivalent = (node) => {
    if (Array.isArray(node)) {
      return node.some((item) => hasEquivalent(item));
    } else if (typeof node === "object") {
      if (node.type === "Equivalent") {
        return true;
      } else {
        return Object.values(node).some((value) => hasEquivalent(value));
      }
    }
    return false;
  };

  /**
   * Generates an array of condition strings from the given nodes.
   * @param {array} nodes - Array of node objects.
   * @returns {array} - Array of condition strings.
   */

  const generateConditionString = (nodes) => {
    let labels = [];
    let currentLabel = "";
    let isFirstEquivalent = true;

    if (!Array.isArray(nodes)) {
      return [nodes.label];
    }

    nodes.forEach((node) => {
      if (node.type !== "And" && node.type !== "Or") {
        if (node.type === "Equivalent") {
          if (!isFirstEquivalent && currentLabel) {
            labels.push(currentLabel.trim());
            currentLabel = "";
          } else {
            isFirstEquivalent = false;
          }
        }
        currentLabel += `${node.label.trim()}, `;
      }
    });

    if (currentLabel) {
      labels.push(currentLabel.trim());
    }

    return labels;
  };

  /**
   * Traverses an Elm expression and returns a node representing the expression.
   * @param {object} expression - Elm expression object.
   * @param {boolean} notFlag - Indicates whether the expression is negated.
   * @param {string} statementName - Name of the statement (optional).
   * @returns {object} - Node object representing the expression.
   */

  const traverseExpression = async (
    expression,
    notFlag = false,
    statementName = null
  ) => {
    const type = expression.type;
    const operand = expression.operand;
    let label;

    if (type === "Exists") {
      return await traverseExpression(operand);
    } else if (type === "ToList") {
      return await traverseExpression(operand);
    } else if (type === "Query") {
      return await traverseExpression(expression.where);
    } else if (type === "Not") {
      label = "Not";

      const operandNode = await traverseExpression(operand, true);

      return joinNodes([operandNode], Node(type, label, {}));
    } else if (["And", "Or"].includes(type)) {
      if (type === "And") {
        label = "And";
      } else if (type === "Or") {
        label = "Or";
      }

      const parsedOperandNodes = await Promise.all(
        operand.map((o) => traverseExpression(o))
      );

      return joinNodes(parsedOperandNodes, Node(type, label, {}));
    } else {
      label = await createLabel(expression);

      return Node(type, label, { ...expression });
    }
  };

  /**
   * Extracts conditions from the Elm JSON object.
   * @param {object} elm - Parsed Elm JSON object.
   * @returns {array} - Array of condition strings.
   */

  const extractConditions = async (elm) => {
    const conditions = [];

    let nodes = [];

    if (
      elm &&
      elm.library &&
      elm.library.statements &&
      elm.library.statements.def
    ) {
      if (elm.library.statements.def[0].expression.type == "SingletonFrom") {
        elm.library.statements.def.splice(0, 1);
      }

      nodes = await Promise.all(
        elm.library.statements.def.map((s) =>
          traverseExpression(s.expression, false, s.name)
        )
      );

      nodes = nodes.filter((node) => hasEquivalent(node));

      for (const node of nodes) {
        const labels = generateConditionString(node);

        conditions.push(...labels);
      }
    }

    return conditions;
  };

  const [conditions, setConditions] = useState([]);

  useEffect(() => {
    if (elm) {
      extractConditions(elm).then((fetchedConditions) => {
        setConditions(fetchedConditions);
      });
    } else {
      setConditions([]);
    }
  }, [elm]);

  useEffect(() => {}, [conditions]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      BackdropProps={{
        style: { backgroundColor: "rgba(0, 0, 0, 0.5)" }, // Adjust the opacity as needed
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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conditions.map((condition, index) => (
              <TableRow key={index}>
                <TableCell>{condition}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid item xs={12} container justifyContent="center">
        <Button
          variant="contained"
          onClick={handleGraphOpen}
          style={{ margin: "20px" }}
        >
          View Tree
        </Button>
      </Grid>
      {graphOpen && elm && (
        <Visualizer
          elm={elm}
          open={graphOpen}
          handleClose={handleGraphClose}
          title={title}
        />
      )}
    </Dialog>
  );
};

export default CardConditions;

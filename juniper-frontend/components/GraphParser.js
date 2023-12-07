import { createLabel } from "@/utils/createLabel";

// Creates a new node object
const Node = (type, label, data) => {
  return { type, label, data };
};

// Creates a new graph object
const Graph = (nodes, edges, indexData) => {
  let that = { nodes, edges, indexData };

  // Returns the root node of the graph
  that.root = () => that.nodes[0];

  return that;
};

// Joins multiple graphs together by connecting them with a specified node
const joinGraphs = (graphs, node) => {
  // Removes null or undefined graphs
  graphs = graphs.filter((g) => g);

  // Combines nodes from all graphs
  const nodes = [node, ...graphs.map((g) => g.nodes).flat()];

  // Determines the lengths of each graph
  const lengths = graphs.map((g) => g.nodes.length);

  let starts = [1];
  for (let i = 0; i < lengths.length - 1; i++) {
    starts.push(starts[starts.length - 1] + lengths[i]);
  }

  // Combines edges from all graphs and adjusts node indices
  const edges = [
    ...starts.map((s) => [s, 0]),
    ...graphs
      .map((g, i) => g.edges.map(([a, b]) => [a + starts[i], b + starts[i]]))
      .flat(),
  ];

  return Graph(nodes, edges);
};

// Merges multiple graphs into a single graph
const mergeGraphs = (graphs) => {
  // Combines nodes from all graphs
  const nodes = graphs.map((g) => g.nodes).flat();

  // Determines the lengths of each graph
  const lengths = graphs.map((g) => g.nodes.length);

  let starts = [0];
  for (let i = 0; i < lengths.length - 1; i++) {
    starts.push(starts[starts.length - 1] + lengths[i]);
  }

  // Combines edges from all graphs and adjusts node indices
  const edges = graphs
    .map((g, i) => g.edges.map(([a, b]) => [a + starts[i], b + starts[i]]))
    .flat();

  return Graph(nodes, edges, { roots: starts });
};

// Moves a node within a graph to a different position
const moveGraphNode = (graph, index, to) => {
  let newGraph = { ...graph };

  // Removes the node at the given index
  newGraph.nodes.splice(index, 1);

  // Adjusts the indices of the edges based on the removed node
  newGraph.edges = newGraph.edges.map((ge) =>
    ge.map((i) => {
      if (i > index) {
        return i - 1;
      } else if (i == index) {
        return to > index ? to - 1 : to;
      } else {
        return i;
      }
    })
  );

  // Adjusts the indices of the root nodes in the indexData
  if (newGraph.indexData) {
    if (newGraph.indexData.roots) {
      newGraph.indexData.roots = newGraph.indexData.roots.map((i) => {
        if (i > index) {
          return i - 1;
        } else if (i == index) {
          return null;
        } else {
          return i;
        }
      });
    }
  }

  return newGraph;
};

// Parses a graph expression recursively
const parseGraph = async (
  expression,
  notFlag = false,
  statementName = null
) => {
  const type = expression.type;
  const operand = expression.operand;
  let label;

  if (type === "Exists") {
    return await parseGraph(operand);
  } else if (type === "ToList") {
    return await parseGraph(operand);
  } else if (type === "Query") {
    return await parseGraph(expression.where);
  } else if (type === "Not") {
    label = "Not";

    const operandGraph = await parseGraph(operand, true);

    return joinGraphs([operandGraph], Node(type, label, {}));
  } else if (["And", "Or"].includes(type)) {
    if (type === "And") {
      label = "And";
    } else if (type === "Or") {
      label = "Or";
    }

    const parsedOperandGraphs = await Promise.all(
      operand.map((o) => parseGraph(o))
    );

    return joinGraphs(parsedOperandGraphs, Node(type, label, {}));
  } else {
    // Generates a label for the expression
    label = await createLabel(expression);

    return Graph([Node(type, label, { ...expression })], []);
  }
};

// Parses a list of statements and returns a merged graph
const parseStatements = async (statements) => {
  if (statements.def[0].expression.type == "SingletonFrom") {
    statements.def.splice(0, 1);
  }

  // Maps statement names to their corresponding indices
  let id2idx = Object.fromEntries(statements.def.map((s, i) => [s.name, i]));

  // Parses each statement expression and returns a graph
  let graphs = await Promise.all(
    statements.def.map((s) => parseGraph(s.expression, false, s.name))
  );

  // Creates an index node for the graph
  const indexNode = {
    label: "Index",
    type: "IndexNode",
    data: {},
  };

  // Merges the individual graphs into a single graph
  let graph = mergeGraphs(graphs);

  let rootNode;
  for (let i = 0; i < graph.nodes.length; i++) {
    // Finds the root node in the graph (a node with no outgoing edges)
    if (graph.edges.filter((e) => e[0] === i).length === 0) {
      rootNode = i;
    }
  }

  // Adds the index node to the graph
  graph.nodes.push(indexNode);

  // Connects the root node to the index node
  graph.edges.push([rootNode, graph.nodes.length - 1]);

  let i = 0;

  // Moves ExpressionRef nodes to their respective root positions
  while (i < graph.nodes.length) {
    if (graph.nodes[i].type == "ExpressionRef") {
      const graphIdx = id2idx[graph.nodes[i].data.name];

      const to = graph.indexData.roots[graphIdx];

      graph = moveGraphNode(graph, i, to);
    } else {
      i++;
    }
  }

  return graph;
};

export default parseStatements;

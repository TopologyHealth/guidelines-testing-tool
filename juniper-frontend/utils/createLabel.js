import axios from "axios";

// Function to retrieve the term for a given code
const getTermForCode = async (code) => {
  // Mapping of code prefixes to URL prefixes
  const codeToUrlPrefix = {
    [process.env.NEXT_PUBLIC_LOINC_URL]: "loinc",
    [process.env.NEXT_PUBLIC_SNOMED_URL]: "snomed",
  };

  // Find the matching prefix for the code
  const matchingPrefix = Object.keys(codeToUrlPrefix).find((prefix) =>
    code.startsWith(prefix)
  );

  if (!matchingPrefix) {
    return;
  }

  const codeType = codeToUrlPrefix[matchingPrefix];
  const actualCode = code.substring(matchingPrefix.length);

  try {
    //Fetch the term using the BioPortal API
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BIOPORTAL_BASE_URL}/${codeType}/terms/${actualCode}`,
      {
        params: {
          api_key: process.env.NEXT_PUBLIC_BIOPORTAL_API_KEY,
          include: "prefLabel",
        },
      }
    );
    return response.data.prefLabel;
  } catch (error) {
    console.error(`Failed to get term for code ${code}: `, error);
  }
};

// Function to create a label based on the operand and operator
export const createLabel = async (operand, operator = "", notFlag = false) => {
  let label = "";

  // Handle different operand types
  if (operand.type === "And") {
    const operands = operand.operand;

    for (const op of operands) {
      label += (await createLabel(op)) + ", ";
    }
  } else if (operand.type === "Or") {
    const operands = operand.operand;

    for (const op of operands) {
      label += (await createLabel(op)) + " Or ";
    }
  } else if (operand.type === "Equivalent") {
    const operands = operand.operand;

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "ToConcept") {
    const codeRef = operand.operand;

    if (codeRef && codeRef.type === "CodeRef") {
      const term = await getTermForCode(codeRef.name);

      label += term;
    }
  } else if (operand.type === "After") {
    const operands = operand.operand;

    operator = "After";

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "Before") {
    const operands = operand.operand;

    operator = "Before";

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "End") {
    operator = " End " + operator;

    label += " " + (await createLabel(operand.operand, operator));
  } else if (operand.type === "FunctionRef") {
    const operands = operand.operand;

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "As") {
    label += " " + (await createLabel(operand.operand, operator));
  } else if (operand.type === "Property") {
    if (["<", ">", "<=", ">=", "="].includes(operator)) operator = "";

    if (operand.path !== "code") label += " " + operand.path + ": " + operator;
  } else if (operand.type === "Subtract" || operand.type === "Add") {
    const operands = operand.operand;

    if (operand.type === "Subtract") operator = "-";
    else if (operand.type === "Add") operator = "+";

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "Now") {
    label += ` Now `;
  } else if (operand.type === "Quantity") {
    label += `  ${operator} ${operand.value} ${operand.unit}`;
  } else if (operand.type === "SingletonFrom") {
    label += " " + (await createLabel(operand.operand, operator));
  } else if (operand.type === "Query") {
    label += " " + (await createLabel(operand.source[0].expression, operator));

    label += " " + (await createLabel(operand.where, operator));
  } else if (operand.type === "ToDateTime") {
    label += " " + (await createLabel(operand.operand, operator));
  } else if (operand.type === "Date") {
    label += `  ${operand.day.value} - ${operand.month.value} - ${operand.year.value}`;
  } else if (operand.type === "DateTime") {
    label += `  ${operand.day.value} - ${operand.month.value} - ${operand.year.value}`;
  } else if (operand.type === "CalculateAge") {
    label += `  Age `;
  } else if (operand.type === "Literal") {
    label += ` ${operator} ${operand.value} `;
  } else if (operand.type === "ToList") {
    label += " " + (await createLabel(operand.operand, operator));
  } else if (operand.type === "Interval") {
    label += "Between";

    label += " " + (await createLabel(operand.low, operator));

    label += " And";

    label += " " + (await createLabel(operand.high, operator));
  } else if (operand.type === "Equivalent") {
    const operands = operand.operand;

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "GreaterOrEqual") {
    const operands = operand.operand;

    operator = ">=";

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "LessOrEqual") {
    const operands = operand.operand;

    operator = "<=";

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "Greater") {
    const operands = operand.operand;

    operator = ">";

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "Less") {
    const operands = operand.operand;

    operator = "<";

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "Equal") {
    const operands = operand.operand;

    operator = "=";

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  } else if (operand.type === "IsTrue") {
    label += " " + (await createLabel(operand.operand, operator));
  } else if (operand.type === "Exists") {
    label += " " + (await createLabel(operand.operand, operator));
  } else if (operand.type === "In") {
    const operands = operand.operand;

    operator = "=";

    for (const operand of operands) {
      label += " " + (await createLabel(operand, operator));
    }
  }

  return label;
};

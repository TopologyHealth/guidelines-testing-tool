import { applyPlan, simpleResolver } from "encender";
export const config = { api: { bodyParser: { sizeLimit: "25mb" } } };

export default async (req, res) => {
  // assuming elmJsonDependencies, patientReferenceString, and resources come with the request body
  const {
    elmJsonDependencies,
    patientReferenceString,
    planDefinitions,
    resources,
  } = req.body;

  const resolver = simpleResolver(resources);

  const aux = {
    elmJsonDependencies,
    valueSetJson: {}, // I might have to pdate this later. 
  };

  // console.log("planDefinition: ", planDefinition);
  // console.log("patientReferenceString: ", patientReferenceString);
  // console.log("resolver: ", resolver);
  // console.log("aux: ", aux);

  try {
    // We should use Promise.all to process all PlanDefinitions
    const results = await Promise.all(planDefinitions.map(async (planDefinition) => {
      const [CarePlan, RequestGroup, ...otherResources] = await applyPlan(
        planDefinition,
        patientReferenceString,
        resolver,
        aux
      );

      return { RequestGroup }; // return only the RequestGroup for this PlanDefinition
    }));

    res.status(200).json({ RequestGroups: results }); // return all RequestGroups as an array in a single object
  } catch (error) {
    console.error(error); // <-- for debugging
    res.status(500).json({ error: error.toString() });
  }
};

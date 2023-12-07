import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import axios from "axios";
import { getPatientEverything } from "@/api/fastapiApi";

export default function Resources() {
  const router = useRouter();
  const { patientId } = router.query;
  const [resources, setResources] = useState(null);

  useEffect(() => {
    async function fetchPatientEverything() {
      try {
        if (patientId) {
          const data = await getPatientEverything(patientId);
          setResources(data);
        }
      } catch (error) {
        console.error("Error fetching patient everything", error);
      }
    }
    fetchPatientEverything();
  }, [patientId]);

  if (!resources) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Resources Page</h1>
      <div>
        {/* Display the JSON object in a <pre> tag */}
        <pre>{JSON.stringify(resources, null, 2)}</pre>
      </div>
    </div>
  );
}

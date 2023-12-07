import { useState } from "react";

import { Tabs, Tab } from "@material-ui/core";
import Public from "./PublicTab";
import Personal from "./PersonalTab";
import Searchbar from "./Searchbar";

/**
 * Component for rendering the GuidelineList.
 */

export default function GuidelineList() {
  const [value, setValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Event handler for tab change.
   * @param {object} event - The event object.
   * @param {number} newValue - The new tab value.
   */

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  /**
   * Event handler for search input change.
   * @param {object} event - The event object.
   */

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px" }}>
        <Tabs value={value} onChange={handleChange} aria-label="tabs">
          <Tab label="Public" />
          {/* <Tab label="Personal" /> */}
        </Tabs>
        <div style={{ marginLeft: "auto" }}>
          <Searchbar
            value={searchQuery}
            onChange={handleSearchChange}
            label={"Search"}
          />
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {value === 0 && <Public searchQuery={searchQuery} />}
        {value === 1 && <Personal />}
      </div>
    </div>
  );
}

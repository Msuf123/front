import { useEffect, useState } from "react";
import "./home.css";
import logo from "../../assets/up.png"
import HomeFlow from "./SuComponent/HomeCard/HomeFlow";
import { useAtom, useSetAtom } from "jotai";
import { aiInputSearch, antibiotics, apiUrl, organismName, splitTheScreen } from "../../Atoms/atoms";
import ResultTable from "./SuComponent/ResultTable/ReslutTable";

export default function Home() {
  const setQueryAtom = useSetAtom(aiInputSearch);
  const setOrganismAtom = useSetAtom(organismName);
  const setAntibioticAtom = useSetAtom(antibiotics);
  const setSplitTheScreen = useSetAtom(splitTheScreen);
  const [API_URL]=useAtom(apiUrl)

  const [form, setForm] = useState({
    query: "",
    organism: "",
    antibiotic: "",
  });

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Keep the Jotai atoms synchronized with the form.
    if (name === "query") {
      setQueryAtom(value);
    }

    if (name === "organism") {
      setOrganismAtom(value);
    }

    if (name === "antibiotic") {
      setAntibioticAtom(value);
    }
  };

  // Called when the user presses the Go button.
  const handleGo = async (event) => {
    event?.preventDefault();

    if (loading) return;

    setError("");

    const organism = form.organism.trim();
    const antibiotic = form.antibiotic.trim();
    const query=form.query.trim();
    // Validate the required fields before making the request.
    if (!organism || !antibiotic) {
      setError(
        "Please enter both the antibacterial medicine and bacteria."
      );
      return;
    }

    setLoading(true);
    setSplitTheScreen(false);
    setReportData(null);

    try {
      const response = await fetch(`${API_URL}data/testResult`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organism,
          antibiotic,
          query
        }),
      });

      const result = await response.json();

      // Handles backend validation errors and other unsuccessful responses.
      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || "Unable to generate the report."
        );
      }
      console.log(result)

      // Save the report returned by your backend.
     setReportData(result.data);

     
    } catch (err) {
      setError(
        err.message || "Unable to connect to the server."
      );
      setSplitTheScreen(false);
    } finally {
      setLoading(false);
    }
  };
useEffect(()=>{console.log("reprot  data")},[reportData])
  return (
    <div className="home">
      <div className="home-flow-panel">
        <HomeFlow
          form={form}
          handleChange={handleChange}
          handleGo={handleGo}
          logo={logo}
          loading={loading}
        />

        {error && (
          <p className="home-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {reportData !== null && (
        <div className="home-results-panel">
          <ResultTable report={reportData} />
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import "./home.css";
import logo from "../../assets/up.png"
import HomeFlow from "./SuComponent/HomeCard/HomeFlow";
import { useAtom, useSetAtom } from "jotai";
import { aiInputSearch, antibiotics, apiUrl, dataBack, organismName, splitTheScreen } from "../../Atoms/atoms";
import ResultTable from "./SuComponent/ResultTable/ReslutTable";
const specimens = ["blood", "urine", "sputum", "wound"];

const generateRandomRow = (year, partialYear = false) => {
  const tested = Math.floor(Math.random() * 300) + 50;
  const resistant = Math.floor(Math.random() * (tested + 1));
  const susceptible = tested - resistant;
  const resistancePct = Math.round((resistant / tested) * 100);

  return {
    specimen: specimens[Math.floor(Math.random() * specimens.length)],
    year,
    tested,
    resistant,
    susceptible,
    resistancePct,
    display: `${resistancePct}%`,
    partialYear,
  };
};

const reportDatas = {
  query: {
    organism: "Escherichia coli",
    antibiotic: "Ciprofloxacin",
  },
  periods: {
    last4Weeks: {
      from: "2026-09-20",
      to: "2026-10-18",
    },
    annual: {
      from: "2022-01-01",
      to: "2026-10-18",
    },
  },
  trend: Array.from({ length: 12 }, (_, index) =>
    generateRandomRow(2021 + Math.floor(index / 2), index === 11)
  ),
  notes: [
    "This is randomly generated demonstration data and does not represent actual laboratory results.",
  ],
};
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

  const [reportData, setReportData] = useAtom(dataBack);
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
      console.log(result.data)
console.log("keys:", Object.keys(result));
console.log("data keys:", result.data && Object.keys(result.data));
console.log("summary is array:", Array.isArray(result.data?.summary));
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
useEffect(()=>{console.log("reprot ",reportData)},[reportData])
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

      </div>

      {reportData!==null?<div className="home-results-panel">
          <ResultTable report={reportData} onClose={() => setReportData(null)}/>
        </div>:null}
        
     
    </div>
  );
}

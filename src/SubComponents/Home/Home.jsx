import { useState } from "react";
import "./home.css";
import logo from "../../assets/up.png"
import HomeFlow from "./SuComponent/HomeCard/HomeCards";
import { useAtom } from "jotai";
import { aiInputSearch } from "../../Atoms/atoms";
export default function Home() {
  const [form, setForm] = useState({
    medicine: "",
    bacteria: "",
    query: "",
    date: "",
    time: "",
    gender: "",
    sex: "",
    extra: "",
  });
 const [buttonPress,setButtonPress]=useAtom(aiInputSearch)
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGo = (e) => {
    e.preventDefault();
    setButtonPress(true)
    alert("button  pressed")
    console.log(form);
  };

  return (
    <div className="home">
     
        <HomeFlow form={form} handleChange={handleChange} handleGo={handleGo} logo={logo} />
     
    </div>
  );
}
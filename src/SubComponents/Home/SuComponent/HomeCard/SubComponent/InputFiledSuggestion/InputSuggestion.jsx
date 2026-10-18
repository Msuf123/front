import React, { useState, useEffect, useRef } from "react";
import "./InputSuggestion.css";

const InputSuggestionBackend = ({
  name,
  form,
  handleChange,
  placeholder = "Type to search...",
  type = "antibiotic", // matches backend fields: 'antibiotic' or 'organism'
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const inputValue = form[name] || "";

  // Handle clicking outside the component to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debouncing when input value or type changes
  useEffect(() => {
    if (!inputValue.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [inputValue, type]);

  const fetchSuggestions = async (searchQuery) => {
    setLoading(true);
    try {
      // Updated endpoint to match backend route: /suggestions
      // Updated payload to send `field` and `query` as expected by req.body
      const response = await fetch("https://back3.scalcraft.com/data/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          field: type, // Matches req.body.field ("antibiotic" or "organism")
          query: searchQuery, // Matches req.body.query
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Matches backend response format: { success: true, field, count, suggestions }
        const rawList = data.suggestions || [];
        const formattedList = rawList.map((item) => 
          typeof item === "object" && item !== null ? item.name || Object.values(item)[0] : item
        );

        setSuggestions(formattedList);
        setIsOpen(formattedList.length > 0);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions from backend:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (value) => {
    const syntheticEvent = {
      target: {
        name: name,
        value: value,
      },
    };
    handleChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div className="input-suggestion-container nodrag" ref={wrapperRef}>
      <input
        type="text"
        className="home-input nodrag"
        name={name}
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete="off"
      />

      {loading && <span className="suggestion-loader">Loading...</span>}

      {isOpen && suggestions.length > 0 && (
        <ul className="suggestion-list nodrag">
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="suggestion-item"
              onClick={() => handleSelectSuggestion(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InputSuggestionBackend;
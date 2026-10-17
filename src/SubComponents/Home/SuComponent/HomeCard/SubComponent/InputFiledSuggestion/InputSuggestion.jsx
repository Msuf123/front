import React, { useState, useEffect, useRef } from "react";
import "./InputSuggestion.css"; // Optional custom styling

/**
 * @param {string} name - Name attribute for form state key
 * @param {object} form - Parent form state object
 * @param {function} handleChange - Callback function to update parent state e.g., onChange(e)
 * @param {string} placeholder - Input placeholder text
 * @param {string} type - 'medicine' | 'backteria'
 */
const InputSuggestionBackend = ({
  name,
  form,
  handleChange,
  placeholder = "Type to search...",
  type = "medicine",
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
      const response = await fetch("https://back3.scalcraft.com/data/getSuggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          type: type, // 'medicine' or 'backteria'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setIsOpen(data.suggestions && data.suggestions.length > 0);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions from backend:", error);
    } finally {
      setLoading(false);
    }
  };

  // Select item from suggestions list
  const handleSelectSuggestion = (value) => {
    // Create a synthetic event object to maintain compatibility with standard handleChange handlers
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
    <div className="input-suggestion-container" ref={wrapperRef}>
      <input
        className="home-input nodrag"
        type="text"
        name={name}
        value={inputValue}
        onChange={handleChange}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
      />

      {loading && <div className="suggestion-loader">Loading...</div>}

      {isOpen && suggestions.length > 0 && (
        <ul className="suggestion-list">
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
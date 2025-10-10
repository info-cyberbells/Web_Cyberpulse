
import React, { useState } from 'react';
import Select from 'react-select';
import '../styles/ProjectForm.css';

const SingleSelectDropdown = ({ name, value, onChange, options, placeholder }) => {
  const formattedOptions = options.map(option => ({ value: option.value, label: option.label }));
  console.log(options)
    const handleSingleChange = (selectedOption) => {
      onChange({
        target: {
          name,
          value: selectedOption ? selectedOption.value : '',
        },
      });
    };
  
    return (
        <div style={{ marginBottom: '1rem' }}>
        <Select
          name={name}
          value={formattedOptions.find(option => option.value === value)}
          onChange={handleSingleChange}
          options={formattedOptions}
          placeholder={placeholder}
          classNamePrefix="custom-single-select__control"
        />
      </div>
    );
  };

  export default SingleSelectDropdown
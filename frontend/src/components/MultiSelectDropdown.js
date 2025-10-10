import React from 'react';
import Select from 'react-select';

const MultiSelectDropdown = ({ name, value, onChange, options, placeholder }) => {
  const handleMultiSelectChange = (selectedOptions) => {
    // Extract values from selectedOptions and trigger the onChange with the value array
    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
    onChange({
      target: {
        name,
        value: selectedValues,
      },
    });
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Select
        name={name}
        value={options.filter(option => value.includes(option.value))} // Match selected values
        onChange={handleMultiSelectChange}
        options={options} // Options are directly passed in correct format [{ label, value }, ...]
        isMulti
        placeholder={placeholder}
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default MultiSelectDropdown;

import React from 'react';
import { TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from "@material-ui/icons/Search";

export default function Searchbar(props) {
    
  const { value, onChange, label } = props;
    return (
        <TextField
      label={label}
      value={value}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
    );
}
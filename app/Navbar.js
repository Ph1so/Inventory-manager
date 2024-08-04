import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

const Navbar = ({ onAddItemClick }) => {
  return (
    <AppBar position="static" sx={{ bgcolor: "#405D72" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Inventory Management
        </Typography>
        <Button color="inherit" onClick={onAddItemClick}>
          Add New Item
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

import React from "react";
import Chip from "@material-ui/core/Chip";
import { emphasize } from "@material-ui/core/styles/colorManipulator";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import IconButton from "@mui/material/IconButton";
const options = ["Edit", "Delete"];

const ITEM_HEIGHT = 48;

const useChipStyles = (color, backgroundColor, hoverBackgroundColor) => ({
  chip: {
    color: color,
    backgroundColor: backgroundColor,
    "&:hover, &:focus": {
      backgroundColor: hoverBackgroundColor
        ? hoverBackgroundColor
        : emphasize(backgroundColor, 0.08),
    },
    "&:active": {
      backgroundColor: emphasize(
        hoverBackgroundColor ? hoverBackgroundColor : backgroundColor,
        0.12
      ),
    },
  },
});
const CustomChip = ({
  hoverBackgroundColor,
  onEditChip,
  onDeleteChip,
  ...rest
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleCLickIcon = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleItem = (item) => {
    setAnchorEl(null);
    if (item == "Edit") {
      onEditChip();
      return;
    }
    onDeleteChip();
  };
  return (
    <>
      <Chip
        className="custom-chip "
        {...rest}
        deleteIcon={
          <IconButton aria-label="more" aria-haspopup="true">
            {" "}
            <MoreVertIcon />
          </IconButton>
        }
        onDelete={handleCLickIcon}
      />
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: "20ch",
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} onClick={() => handleItem(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
export default CustomChip;

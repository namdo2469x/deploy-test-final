const { Box } = require("@mui/material");
const { styled } = require("@mui/system");

const FlexCenter = styled(Box)({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
});

export default FlexCenter;
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useEffect, useContext } from "react";
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";
import { Search } from "@mui/icons-material";
import {
  Box,
  Backdrop,
  IconButton,
  useTheme,
  useMediaQuery,
  InputBase,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { AlertContext } from "../../components/AlertProvider";
// table
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import { BarChart } from "components/BarChart";
import {
  getAllProject,
  getProjectByLead,
  getTaskByProjectId,
} from "store/projectStore";
import { useDispatch, useSelector } from "react-redux";

import moment from "moment";
import {
  defaultPagination,
  getStatusName,
  getRowNumber,
  globalConstant,
} from "services/util";
import projectService from "services/project";
import { DataGrid } from "@mui/x-data-grid";
import { getUserByProject } from "store/userStore";

function Rows(props) {
  const { rows, rowSelected } = props;
  const [isActiveRow, setIsActiveRow] = useState(false);
  return rows.map((data) => {
    let row = data;
    return (
      <TableRow
        key={row.no}
        onClick={() => {
          setIsActiveRow(row.projectId);
          rowSelected(row);
        }}
        hover
        sx={{
          "& > *": { borderBottom: "unset" },
          "&:last-child td,&:last-child th": { border: 0 },
          background:
            isActiveRow === row.projectId ? "rgba(0, 0, 0, 0.04);" : " ",
        }}
      >
        <TableCell component="th" scope="row">
          {row.no}
        </TableCell>
        <TableCell>{row.projectName}</TableCell>
        <TableCell>{row.description}</TableCell>
        <TableCell>
          {moment(row.createDate).format(globalConstant.dateFormat)}
        </TableCell>
        <TableCell>{row.lead.username}</TableCell>
        <TableCell>{getStatusName(row.status)}</TableCell>
      </TableRow>
    );
  });
}

function Rows2(props) {
  const { rows } = props;
  return rows.map((data) => {
    let row = data;
    return (
      <TableRow
        key={row.code}
        hover
        sx={{
          "& > *": { borderBottom: "unset" },
          "&:last-child td,&:last-child th": { border: 0 },
        }}
      >
        <TableCell component="th" scope="row"></TableCell>
        <TableCell>{row.code}</TableCell>
        <TableCell>{row.summary}</TableCell>
      </TableRow>
    );
  });
}

function Rows3(props) {
  const { rows } = props;
  return rows.map((data) => {
    let row = data;
    return (
      <TableRow
        key={row.userId}
        hover
        sx={{
          "& > *": { borderBottom: "unset" },
          "&:last-child td,&:last-child th": { border: 0 },
        }}
      >
        <TableCell>{row.no}</TableCell>
        <TableCell>{row.fullName}</TableCell>
        <TableCell>{row.username}</TableCell>
        <TableCell>{row.emailAddress}</TableCell>
      </TableRow>
    );
  });
}

const Dashboard = () => {
  const theme = useTheme();
  const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");
  const [searchText, setSearchText] = useState("");
  const { actions } = useContext(AlertContext);

  const [projectList, setProjectList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState(defaultPagination);
  const [pagination2, setPagination2] = useState(defaultPagination);
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState([]);
  const [datasets, setdatasets] = useState([]);
  const [listTask, setListTask] = useState([]);
  const dispatch = useDispatch();
  const [userByProjectList, setUserByProjectList] = useState([]);
  const [isloading, setIsLoading] = useState(false);

  const getProjectList = useCallback(
    (pagination) => {
      const params = {
        limit: pagination.pageSize,
        page: pagination.currentPage,
        status: 3,
      };
      setLoading(true);
      dispatch(
        role === "ADMIN" ? getAllProject(params) : getProjectByLead(params)
      )
        .then((response) => {
          if (response.payload) {
            if (response.payload.data.length === 0) {
              actions.addAlert({
                text: "There is no active project",
                type: "info",
                id: Date.now(),
              });
            } else {
              const data = response.payload.data.map((item, index) => {
                return {
                  no: getRowNumber(
                    pagination.currentPage,
                    pagination.pageSize,
                    index
                  ),
                  ...item,
                };
              });
              setProjectList(data);
              setTotalItems(response.payload.total);
            }
          }
        })
        .catch((e) => {})
        .finally(() => setLoading(false));
    },
    [dispatch]
  );

  useEffect(() => {
    getProjectList(pagination);
  }, [getProjectList, pagination]);

  const filteredData = projectList.filter((item) =>
    item.projectName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPagination((prevState) => ({
      ...prevState,
      currentPage: newPage + 1,
    }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination((prevState) => ({
      ...prevState,
      pageSize: event.target.value,
    }));
  };
  const userColumns = [
    {
      field: "no",
      headerName: "No",
      key: "id",
      flex: 0.3,
    },
    {
      field: "fullName",
      headerName: "Full Name",
      key: "fullName",
      flex: 1,
    },
    {
      field: "username",
      headerName: "User Name",
      key: "username",
      flex: 1,
    },
    {
      field: "emailAddress",
      headerName: "Email",
      key: "emailAddress",
      flex: 1,
    },
  ];

  const getUserByProjectId = useCallback(
    (pagination, projectId) => {
      const params = {
        limit: pagination.pageSize,
        page: pagination.currentPage,
        projectId: projectId,
      };
      setIsLoading(true);
      dispatch(getUserByProject(params))
        .then((response) => {
          if (response.payload) {
            const data = response.payload.data.map((item, index) => {
              return {
                no: getRowNumber(
                  pagination.currentPage,
                  pagination.pageSize,
                  index
                ),
                ...item,
              };
            });
            setUserByProjectList(data);
          }
        })
        .catch((e) => {})
        .finally(() => setIsLoading(false));
    },
    [dispatch]
  );

  const rowSelected = async (row) => {
    setLoading(true);
    let { data } = await projectService.getStatisticTask(row.projectId);
    setLabels(data.map((item) => item.name));
    setdatasets(data.map((item) => item.numberTask));
    projectService.getTaskByProjectId(row.projectId).then((data) => {
      const sortedData = data.data.sort((a, b) => b.taskId - a.taskId);
      setListTask(sortedData);
      setLoading(false);
    });
    getUserByProjectId(pagination2, row.projectId);
  };

  return (
    <Box sx={{ width: "auto" }} m="0.5rem 2.5rem">
      <FlexBetween>
        <Box>
          <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        </Box>
      </FlexBetween>
      <Grid
        container
        rowSpacing={1}
        columnSpacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{ height: "100%" }}
      >
        <Grid item xs={7}>
          <FlexBetween>
            <Box>
              <FlexBetween
                backgroundColor={theme.palette.background.alt}
                borderRadius="9px"
                gap="3rem"
                p="0.1rem 1.5rem"
                sx={{
                  mt: "20px",
                }}
              >
                <InputBase
                  placeholder="Search By Project Name"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <IconButton>
                  <Search />
                </IconButton>
              </FlexBetween>
            </Box>
          </FlexBetween>
          <Box
            mt="20px"
            display="grid"
            gridTemplateColumns="repeat(12, 1fr)"
            gridAutoRows="230px"
            gap="20px"
            sx={{
              "& > div": {
                gridColumn: isNonMediumScreens ? undefined : "span 12",
              },
            }}
          >
            <Box
              gridColumn="span 12"
              sx={{
                "& .MuiPaper-root": {
                  border: "none",
                  borderRadius: ".5rem",
                  minHeight: "33vh",
                  backgroundColor: theme.palette.background.alt,
                },
                "& .MuiTableCell-root": {
                  borderBottom: "none",
                  fontSize: "14px",
                  "&:hover": {
                    cursor: "pointer",
                  },
                },
                "& .MuiTableCell-head": {
                  backgroundColor: theme.palette.background.alt,
                  color: theme.palette.secondary[100],
                  borderBottom: "none",
                },
                "& .MuiPaper-virtualScroller": {
                  backgroundColor: theme.palette.background.alt,
                },
                "& .MuiPaper-footerContainer": {
                  backgroundColor: theme.palette.background.alt,
                  color: theme.palette.secondary[100],
                  borderTop: "none",
                },
                "& .MuiPaper-toolbarContainer .MuiButton-text": {
                  color: `${theme.palette.secondary[200]} !important`,
                },
              }}
            >
              <Typography
                style={{ textAlign: "center", background: "#f0f0f0" }}
                variant="h5"
                gutterBottom
              >
                ACTIVE PROJECT OF COMPANY
              </Typography>
              <TableContainer component={Paper}>
                <Table
                  aria-label="collapsible table"
                  sx={{
                    background: theme.palette.background.alt,
                    height: "max-content",
                  }}
                >
                  <TableHead
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    <TableRow>
                      <TableCell>No</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Created At</TableCell>
                      <TableCell>Manager</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <Rows rows={filteredData} rowSelected={rowSelected} />
                  </TableBody>
                </Table>
              </TableContainer>
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={loading}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={5}>
          <Box
            sx={{
              paddingTop: "79px",
              "& .MuiPaper-root": {
                border: "none",
                borderRadius: ".5rem",
                height: "33vh",
                backgroundColor: theme.palette.background.alt,
              },
              "& .MuiTableCell-root": {
                borderBottom: "none",
                fontSize: "14px",
                "&:hover": {
                  cursor: "pointer",
                },
              },
              "& .MuiTableCell-head": {
                backgroundColor: theme.palette.background.alt,
                color: theme.palette.secondary[100],
                borderBottom: "none",
                fontSize: "14px",
              },
              "& .MuiPaper-virtualScroller": {
                backgroundColor: theme.palette.background.alt,
              },
              "& .MuiPaper-footerContainer": {
                backgroundColor: theme.palette.background.alt,
                color: theme.palette.secondary[100],
                borderTop: "none",
              },
              "& .MuiPaper-toolbarContainer .MuiButton-text": {
                color: `${theme.palette.secondary[200]} !important`,
              },
            }}
          >
            <Typography
              style={{ textAlign: "center", background: "#f0f0f0" }}
              variant="h5"
              gutterBottom
            >
              LIST TASK OF PROJECT
            </Typography>
            <TableContainer component={Paper}>
              <Table
                aria-label="collapsible table"
                sx={{
                  background: theme.palette.background.alt,
                }}
              >
                <TableHead
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <TableRow>
                    <TableCell />
                    <TableCell>Code</TableCell>
                    <TableCell>Summary</TableCell>
                    <TableCell>Priority</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <Rows2 rows={listTask} />
                </TableBody>
              </Table>
            </TableContainer>
            <Backdrop
              sx={{
                color: "#fff",
                zIndex: (theme) => theme.zIndex.drawer + 1,
              }}
              open={loading}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </Box>
        </Grid>
        <Grid item xs={7}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: 1,
              marginTop: 10,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 240,
              }}
            >
              <BarChart labels={labels} datasets={datasets} />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={5}>
          <Box
            sx={{
              height: "300px",
              marginTop: "30px",
              "& .MuiPaper-root": {
                border: "none",
                borderRadius: ".5rem",
                minHeight: "33vh",
                backgroundColor: theme.palette.background.alt,
              },
            }}
          >
            <Typography
              style={{ textAlign: "center", background: "#f0f0f0" }}
              variant="h5"
              gutterBottom
            >
              MEMBER OF PROJECT
            </Typography>
            <TableContainer component={Paper}>
              <Table
                sx={{
                  background: theme.palette.background.alt,
                  height: "max-content",
                }}
              >
                <TableHead
                  sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Full Name</TableCell>
                    <TableCell>User Name</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <Rows3 rows={userByProjectList} />
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

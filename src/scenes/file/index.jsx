/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useContext } from "react";
import {
  Box,
  useTheme,
  IconButton,
  InputBase,
  Button,
  Modal,
  Stack,
  Chip,
  Menu,
  MenuItem,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { DataGrid } from "@mui/x-data-grid";
import { Search } from "@mui/icons-material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import { useDispatch } from "react-redux";
import { getAllProject, getProjectByLead } from "store/projectStore";
import { getListFile, addFile, removeFile } from "store/fileStore";
import Notification from "components/Notification";
import { AlertContext } from "../../components/AlertProvider";
import { defaultPagination, getStatusName, getRowNumber } from "services/util";
import axios from "axios";
import dayjs from "dayjs";
import FlexCenter from "components/FlexCenter";

const File = () => {
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");
  const { actions } = useContext(AlertContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  const handleClick = (event) => setAnchorEl(event.currentTarget);

  const [open, setOpen] = useState(false);
  const [modalNote, setModalNote] = useState(false);
  const [modalEditNote, setModalEditNote] = useState(false);
  const [modalDeleteFile, setModalDeleteFile] = useState(false);
  const [modalTitle, setModalTitle] = useState(false);
  const [modalDownload, setModalDownload] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [documentList, setDocumentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const role = localStorage.getItem("role");
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState(defaultPagination);

  const dispatch = useDispatch();

  const getProjectList = useCallback(
    (pagination) => {
      const params = {
        limit: pagination.pageSize,
        page: pagination.currentPage,
      };
      setLoading(true);
      dispatch(
        role === "ADMIN" ? getAllProject(params) : getProjectByLead(params)
      )
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
            setProjectList(data);
            setTotalItems(response.payload.total);
          }
        })
        .catch((e) => {})
        .finally(() => setLoading(false));
    },
    [dispatch, role]
  );

  const getAllFile = useCallback(
    (id, pagination) => {
      const params = {
        projectId: id,
        limit: pagination.pageSize,
        page: pagination.currentPage,
      };
      setLoading1(true);
      dispatch(getListFile(params))
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
            setDocumentList(data);
            setTotalItems(response.payload.total);
          }
        })
        .catch((e) => {})
        .finally(() => setLoading1(false));
    },
    [dispatch, modalDeleteFile]
  );

  useEffect(() => {
    getProjectList(pagination);
  }, [getProjectList, pagination]);

  const handleChangePage = (newPage) => {
    setPagination((prevState) => ({
      ...prevState,
      currentPage: newPage + 1,
    }));
  };

  const handleChangePageSize = (pageSize) => {
    setPagination((prevState) => ({
      ...prevState,
      pageSize: pageSize,
    }));
  };

  const handleUploadFile = (event) => {
    const file = event.target.files;
    const formData = new FormData();
    for (let i = 0; i < file.length; i++) {
      formData.append("files", file[i]);
    }

    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "form-data",
      },
    };
    axios
      .post(
        `http://103.200.20.117:8080/document/create-document?projectId=${selectedItem}`,
        formData,
        config
      )
      .then((response) => {
        if (response.data) {
          actions.addAlert({
            text: "Upload successfully",
            type: "success",
            id: Date.now(),
          });
        }
      })
      .catch((error) => {
        actions.addAlert({
          text: "Upload fail. Please select appropriate file",
          type: "error",
          id: Date.now(),
        });
      })
      .finally(() => {
        getAllFile(selectedItem, pagination);
      });

    event.target.value = "";
  };

  const renderActionsButton = (params) => {
    return (
      <Stack>
        <FlexBetween>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() => {
              setOpen(true);
              setSelectedItem(params.row.projectId);
              getAllFile(params.row.projectId, pagination);
              setSelectedProject("");
            }}
          >
            VIEW FILE
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            style={{ marginLeft: 16 }}
            onClick={() => {
              setModalNote(true);
              setSelectedItem(params.row.projectId);
              setSelectedProject(params.row.projectId);
            }}
          >
            VIEW DOC
          </Button>
        </FlexBetween>
      </Stack>
    );
  };

  const renderButton = (params) => {
    return (
      <FlexBetween>
        <Button
          onClick={handleClick}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textTransform: "none",
            gap: "1rem",
          }}
        >
          <MoreVertIcon
            sx={{ color: theme.palette.secondary[300], fontSize: "25px" }}
          />
        </Button>
        {selectedProject === "" ? (
          <Menu
            anchorEl={anchorEl}
            open={isOpen}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <MenuItem
              onClick={() => {
                setModalDeleteFile(true);
                setSelectedFile(params.row.documentId);
                handleClose();
              }}
            >
              DELETE
            </MenuItem>
            <MenuItem
              onClick={() => {
                setModalDownload(true);
                setSelectedFile(params.row.url);
                handleClose();
                setSelectedFileName(params.row.fileName);
              }}
            >
              DOWNLOAD
            </MenuItem>
          </Menu>
        ) : (
          <Menu
            anchorEl={anchorEl}
            open={isOpen}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <MenuItem
              onClick={() => {
                setModalEditNote(true);
                handleClose();
              }}
            >
              EDIT
            </MenuItem>
            <MenuItem
              onClick={() => {
                setModalDeleteFile(true);
                handleClose();
              }}
            >
              DELETE
            </MenuItem>
          </Menu>
        )}
      </FlexBetween>
    );
  };

  const columns = [
    {
      field: "no",
      headerName: "NO",
      flex: 0.3,
    },
    {
      field: "projectId",
      headerName: "ID",
      flex: 0.3,
    },
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1,
    },
    {
      field: "shortName",
      headerName: "Short Name",
      flex: 0.5,
    },
    {
      field: "lead",
      headerName: "Project Manager",
      flex: 1,
      renderCell: (lead) => (
        <>
          <div>
            {lead.value.username} - {lead.value.fullName}
          </div>
          <div>
            <Stack direction="row" spacing={1}>
              <p></p>
              {lead.value.roles.map((item, index) => (
                <Chip key={index} size="small" label={item.name} />
              ))}
            </Stack>
          </div>
        </>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.5,
      renderCell: (value) => getStatusName(value.value),
    },
    {
      field: "0",
      headerName: "Actions",
      flex: 1,
      renderCell: renderActionsButton,
      disableClickEventBubbling: true,
      sortable: false,
    },
  ];

  const fileColumn = [
    {
      field: "no",
      headerName: "NO",
      flex: 0.3,
    },
    {
      field: "documentId",
      headerName: "ID",
      flex: 0.3,
    },
    {
      field: "fileName",
      headerName: "File Name",
      flex: 0.3,
    },
    {
      field: "createUser",
      headerName: "Created User",
      flex: 0.3,
      renderCell: (value) => {
        return "atryuo";
      },
    },
    {
      field: "createDate",
      headerName: "Created Date",
      flex: 0.3,
      renderCell: (item) => {
        return dayjs(item.createDate).format("DD-MM-YYYY");
      },
    },
    {
      field: "0",
      headerName: "",
      flex: 0.1,
      renderCell: renderButton,
      disableClickEventBubbling: true,
      sortable: false,
    },
  ];

  const noteColumn = [
    {
      field: "no",
      headerName: "NO",
      flex: 0.3,
    },
    {
      field: "noteId",
      headerName: "ID",
      flex: 0.3,
    },
    {
      field: "noteTitle",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "noteDescription",
      headerName: "Description",
      flex: 3,
    },
    {
      field: "0",
      headerName: "",
      flex: 0.1,
      renderCell: renderButton,
      disableClickEventBubbling: true,
      sortable: false,
    },
  ];

  const note = [
    {
      no: 1,
      noteId: 1,
      noteTitle: "First Note",
      noteDescription:
        "Alias massa reiciendis, dolorem, nam volutpat? Proin. Reiciendis, lorem litora ducimus scelerisque numquam veritatis porttitor, quod nobis mi itaque ab! Odio platea! Odit, facere sint montes?Possimus aenean? Interdum integer! Odio, quisquam morbi architecto inceptos necessitatibus eget arcu autem fusce nostra quis, nullam ratione fugiat facilisi scelerisque aliquid. Inceptos",
    },
  ];

  const filterModel = {
    items: [
      {
        columnField: "projectName",
        operatorValue: "contains",
        value: searchText,
      },
    ],
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Box>
        <FlexBetween>
          <Box>
            <Header title="FILE" subtitle={"Managing file of project"} />
            <FlexBetween
              backgroundColor={theme.palette.background.alt}
              borderRadius="9px"
              gap="3rem"
              p="0.1rem 1.5rem"
              sx={{
                mt: "20px",
                width: "319.562px",
              }}
            >
              <InputBase
                placeholder="Search by project name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <IconButton>
                <Search />
              </IconButton>
            </FlexBetween>
          </Box>
        </FlexBetween>
      </Box>

      <Box
        mt="40px"
        height="68vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
            fontSize: "14px",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[100],
            borderTop: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.secondary[200]} !important`,
          },
        }}
      >
        {/* File Modal */}
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1000,
              height: 600,
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: "10px",
            }}
          >
            <Box sx={{ height: 500 }}>
              <DataGrid
                paginationMode={"server"}
                loading={loading1}
                getRowId={(row) => row.documentId}
                rowCount={totalItems}
                rows={documentList}
                columns={fileColumn}
                page={pagination.currentPage - 1}
                pageSize={pagination.pageSize}
                rowsPerPageOptions={[10, 20, 30]}
                onPageChange={handleChangePage}
                onPageSizeChange={handleChangePageSize}
              />
              <Box>
                <input
                  id="raise-upload"
                  type="file"
                  style={{ display: "none" }}
                  accept=".xlsx, .xls, .doc, .pdf"
                  multiple
                  onChange={handleUploadFile}
                />
                <label htmlFor="raise-upload">
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ marginTop: "10px" }}
                    component="span"
                  >
                    <FileUploadIcon sx={{ mr: "10px" }} />
                    UPLOAD FILES
                  </Button>
                </label>
              </Box>
            </Box>
          </Box>
        </Modal>

        {/* Edit note modal */}
        <Modal open={modalEditNote} onClose={() => setModalEditNote(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: "10px",
            }}
          >
            <FlexCenter>
              <Typography variant="h3" sx={{ marginBottom: "20px" }}>
                Edit
              </Typography>
              <form style={{ width: "100%" }}>
                <Grid container>
                  <Grid item sm={12}>
                    <TextField
                      label="Doc Title"
                      name="docTitle"
                      required
                      fullWidth
                    />
                    <TextField
                      style={{ marginTop: "5px" }}
                      label="Doc Description"
                      name="docDescription"
                      multiline
                      rows={5}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Box>
                  <Stack spacing={2} direction="row" justifyContent="center">
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      style={{
                        width: "100px",
                        fontSize: "15px",
                        marginTop: "50px",
                      }}
                      onClick={() => {}}
                    >
                      SAVE
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      style={{
                        width: "100px",
                        fontSize: "15px",
                        marginTop: "50px",
                      }}
                      onClick={() => {
                        setModalEditNote(false);
                      }}
                    >
                      CANCEL
                    </Button>
                  </Stack>
                </Box>
              </form>
            </FlexCenter>
          </Box>
        </Modal>

        {/* Delete file modal */}
        <Modal open={modalDeleteFile} onClose={() => setModalDeleteFile(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: "10px",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Are you sure you want to delete this file?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={(e) => setModalDeleteFile(false)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  setLoading1(true);
                  dispatch(removeFile(selectedFile))
                    .then()
                    .finally(() => {
                      getAllFile(selectedItem, pagination);
                      setModalDeleteFile(false);
                      actions.addAlert({
                        text: "Delete file successfully",
                        type: "success",
                        id: Date.now(),
                      });
                      setSelectedFile(null);
                    });
                }}
              >
                DELETE
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal download */}
        <Modal open={modalDownload} onClose={() => setModalDownload(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: "10px",
            }}
          >
            <Typography variant="h5" gutterBottom>
              Are you sure you want to download this file?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={(e) => setModalDownload(false)}
                sx={{ mr: 1 }}
              >
                NO
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  fetch(selectedFile)
                    .then((response) => response.blob())
                    .then((blob) => {
                      const url = window.URL.createObjectURL(new Blob([blob]));
                      const link = document.createElement("a");
                      link.href = url;
                      link.setAttribute("download", selectedFileName);
                      document.body.appendChild(link);
                      link.click();
                      link.parentNode.removeChild(link);
                    })
                    .finally(() => {
                      actions.addAlert({
                        text: "Download file successfully",
                        type: "success",
                        id: Date.now(),
                      });
                      setModalDownload(false);
                    });
                }}
              >
                YES
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Note Modal */}
        <Modal
          open={modalNote}
          onClose={() => {
            setModalNote(false);
            setSelectedProject("");
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1000,
              height: 600,
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: "10px",
            }}
          >
            <Box sx={{ height: 500 }}>
              <DataGrid
                getRowId={(row) => row.noteId}
                rows={note}
                columns={noteColumn}
                rowsPerPageOptions={[20]}
              />
              <Button
                variant="contained"
                color="secondary"
                sx={{ marginTop: "10px" }}
              >
                ADD NOTE
              </Button>
            </Box>
          </Box>
        </Modal>

        <DataGrid
          paginationMode={"server"}
          loading={loading}
          getRowId={(row) => row.projectId}
          rows={projectList}
          rowCount={totalItems}
          columns={columns}
          filterModel={filterModel}
          page={pagination.currentPage - 1}
          pageSize={pagination.pageSize}
          rowsPerPageOptions={[10, 20, 30]}
          onPageChange={handleChangePage}
          onPageSizeChange={handleChangePageSize}
        />
      </Box>
      <Notification />
    </Box>
  );
};

export default File;

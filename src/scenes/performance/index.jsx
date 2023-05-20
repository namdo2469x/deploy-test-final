/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import {
  Box,
  useTheme,
  IconButton,
  InputBase,
  Button,
  TextField,
  Modal,
  Typography,
  Stack,
  Chip,
  Menu,
  MenuItem,
  OutlinedInput,
  FormControl,
  ListItemText,
  Select,
  Checkbox,
  InputLabel,
  makeStyles,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { Grid } from "@material-ui/core";
import FlexCenter from "components/FlexCenter";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useDispatch } from "react-redux";
import { DataGrid } from "@mui/x-data-grid";
import { Search } from "@mui/icons-material";
import dayjs from "dayjs";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import { DropzoneArea } from "material-ui-dropzone";
import {
  createProject,
  getAllProject,
  getProjectByLead,
  updateProject,
  addUserToProject,
  removeUserInProject,
} from "store/projectStore";
import {
  getUserByProject,
  getAllUser,
  getUserNotProject,
} from "store/userStore";
import {
  getListFile,
  removeFile,
  getListDoc,
  createDoc,
  updateDoc,
} from "store/fileStore";
import Notification from "components/Notification";
import { AlertContext } from "../../components/AlertProvider";
import { defaultPagination, getStatusName, getRowNumber } from "services/util";
import axios from "axios";
import saveAs from "file-saver";
import * as XLSX from "xlsx";

const defaultProject = {
  projectId: 0,
  projectName: "",
  shortName: "",
  lead: "",
  deadLine: "",
  description: "",
  status: 1,
};

const defaultDoc = {
  noteId: 0,
  content: "",
  status: 1,
  title: "",
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const Performance = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { actions } = useContext(AlertContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const downloadLinkRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [searchFile, setSearchFile] = useState("");
  const [modalUploadFile, setModalUploadFile] = useState("");
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [searchDoc, setSearchDoc] = useState("");
  const [searchMember, setSearchMember] = useState("");

  const [openAddUserModal, setAddUserModal] = useState(false);
  const [openDeleteModal, setDeleteModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [dataModal, setDataModal] = useState(false);
  const [project, setProject] = useState(defaultProject);

  const [open1, setOpen1] = useState(false);
  const [modalNote, setModalNote] = useState(false);
  const [modalEditNote, setModalEditNote] = useState(false);
  const [modalDeleteFile, setModalDeleteFile] = useState(false);
  const [modalDownload, setModalDownload] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileURL, setSelectedFileURL] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [loading1, setLoading1] = useState(false);
  const [documentList, setDocumentList] = useState([]);

  const [docList, setDocList] = useState([]);
  const [document, setDocument] = useState(defaultDoc);
  const [docType, setDocType] = useState("");
  const [loading2, setLoading2] = useState(false);

  const [projectList, setProjectList] = useState([]);
  const [userByProjectList, setUserByProjectList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [modalDeactive, setModalDeactive] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ id: "", name: "" });
  const [userNotInProject, setUserNotInProject] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(false);
  const [isloading, setIsLoading] = useState(false);
  const [personName, setPersonName] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [statuss, setStatuss] = useState("");
  const role = localStorage.getItem("role");
  const [value, setValue] = useState(dayjs(defaultProject.deadLine));
  const [modalView, setModalView] = useState(false);
  const [seLectedRowTable, setSeLectedRowTable] = useState({});

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

  const getUserNotInProject = useCallback(() => {
    const params = {
      limit: 30,
      page: 1,
    };

    dispatch(getUserNotProject(params))
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
          setUserNotInProject(data);
        }
      })
      .catch((e) => {});
  }, [dispatch]);

  const getAllFile = useCallback(
    (id) => {
      const params = {
        projectId: id,
        limit: 99,
        page: 1,
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
          }
        })
        .catch((e) => {})
        .finally(() => setLoading1(false));
    },
    [modalDeleteFile]
  );

  const getAllDoc = useCallback((id) => {
    const params = {
      projectId: id,
      limit: 99,
      page: 1,
      status: 1,
    };
    setLoading2(true);
    dispatch(getListDoc(params))
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
          setDocList(data);
        }
      })
      .catch((e) => {})
      .finally(() => setLoading2(false));
  }, []);

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

  const getUsers = useCallback(() => {
    dispatch(getAllUser())
      .then((response) => {
        if (response.payload) {
          const data = response.payload.map((item, index) => {
            return { no: index + 1, ...item };
          });
          setUserList(data);
        }
      })
      .catch((e) => {});
  }, [dispatch]);

  useEffect(() => {
    getUsers();
    getProjectList(pagination);
  }, [getProjectList, pagination]);

  const handleInputChange = (event) => {
    setProject((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

  const handleInputChangeDoc = (event) => {
    setDocument((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  };

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

  const hideModal = () => {
    setOpen(false);
    setProject(defaultProject);
    setValue(dayjs(defaultProject.deadLine));
  };

  const handleAddOrEditProject = (event) => {
    event.preventDefault();
    setLoading(true);
    if (project.projectId === 0) {
      addProject();
    } else {
      editProject();
    }
    hideModal();
  };

  const handleAddOrEditDoc = (event) => {
    event.preventDefault();
    setLoading2(true);
    if (docType === "add") {
      addDoc();
    } else editDoc();
  };

  const handleChangeUser = (event, child) => {
    const { value: id, name: label } = child.props;

    let newLabel;
    let newUserIds;
    if (!personName.length) {
      newLabel = [label];
      newUserIds = [id];
    } else {
      newUserIds = [...userIds];
      newLabel = [...personName];

      const isExist = userIds.some((oldId) => oldId === id);
      if (isExist) {
        newLabel = newLabel.filter((value) => value !== label);
        newUserIds = newUserIds.filter((value) => value !== id);
      } else {
        newLabel.push(label);
        newUserIds.push(id);
      }
    }
    setPersonName(newLabel);
    setUserIds(newUserIds);
  };

  const handleCloseAddUserModal = () => {
    setPersonName([]);
    setUserIds([]);
    setAddUserModal(false);
  };

  const renderActionsButton = (item) => {
    setStatuss(item.row.status);
    return (
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => {
            setModalView(true);
            setProject(item.row);
            setSelectedItem(item.row.projectId);
            getUserByProjectId(pagination, item.row.projectId);
          }}
        >
          VIEW PROJECT
        </Button>

        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => onEditProject(item.row)}
        >
          UPDATE PROJECT
        </Button>
        {item.row.status === 3 && (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => {
              setProject(item.row);
              setDeleteModal(true);
            }}
          >
            Deactive
          </Button>
        )}
        {item.row.status === 0 && (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => {
              setProject(item.row);
              setDeleteModal(true);
            }}
          >
            Active
          </Button>
        )}
      </Stack>
    );
  };

  // #region project CRUD project
  const addProject = () => {
    const model = {
      ...project,
      priorityId: 1,
      deadLine: value,
      lead: {
        id: project.lead,
      },
    };
    setLoading(true);
    dispatch(createProject(model))
      .then((response) => {
        if (response.payload?.status === 1) {
          actions.addAlert({
            text: "Add new Project successfully",
            type: "success",
            id: Date.now(),
          });
          setPagination((prevState) => ({
            ...prevState,
            currentPage: 1,
          }));
        } else {
          actions.addAlert({
            text: "Something wrong! Try again.",
            type: "error",
            id: Date.now(),
          });
        }
      })
      .catch((e) => {})
      .finally(() => setLoading(false));
  };

  const addDoc = () => {
    const model = {
      ...document,
      projectId: selectedItem,
    };
    dispatch(createDoc(model))
      .then((response) => {
        if (response.payload?.status === 1) {
          actions.addAlert({
            text: "Create new doc(note) successfully",
            type: "success",
            id: Date.now(),
          });
        } else {
          actions.addAlert({
            text: "Something wrong! Try again.",
            type: "error",
            id: Date.now(),
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        setModalEditNote(false);
        getAllDoc(selectedItem);
        setDocument({ noteId: 0, title: "", content: "" });
      });
  };

  const editDoc = () => {
    const model = {
      ...document,
      projectId: selectedItem,
      status: 1,
    };
    setLoading2(true);
    dispatch(updateDoc(model))
      .then((response) => {
        if (response) {
          actions.addAlert({
            text: "Edit doc(note) successfully",
            type: "success",
            id: Date.now(),
          });
        } else {
          actions.addAlert({
            text: "Something wrong! Try again.",
            type: "error",
            id: Date.now(),
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        getAllDoc(selectedItem);
        setModalEditNote(false);
        setDocument({ noteId: 0, title: "", content: "" });
      });
  };

  const onEditDoc = (item) => {
    const doc = {
      noteId: item.noteId,
      content: item.content,
      title: item.title,
    };
    setDocument(doc);
    setModalEditNote(true);
  };

  const onEditProject = (item) => {
    const project = {
      ...item,
      lead: item.lead.id,
    };
    setValue(dayjs(item.deadLine));
    setProject(project);
    setOpen(true);
  };

  const editProject = () => {
    const model = {
      ...project,
      deadLine: value,
      priorityId: 1,
    };
    dispatch(updateProject(model))
      .then((response) => {
        if (response.payload?.status === 200) {
          actions.addAlert({
            text: "Update Project successfully",
            type: "success",
            id: Date.now(),
          });
          setPagination((prevState) => ({
            ...prevState,
            currentPage: 1,
          }));
        } else {
          actions.addAlert({
            text: "Something wrong! Try again.",
            type: "error",
            id: Date.now(),
          });
        }
      })
      .catch((e) => {})
      .finally(() => setLoading(false));
  };

  const deleteProject = () => {
    const model = {
      ...project,
      lead: project.lead.id,
      status: statuss === 1 ? 3 : 1,
    };
    setLoading(true);
    dispatch(updateProject(model))
      .then((response) => {
        if (response.payload?.status === 200) {
          actions.addAlert({
            text:
              statuss === 1
                ? "Deactive Project successfully"
                : "Active Project successfully",
            type: "success",
            id: Date.now(),
          });
          setPagination((prevState) => ({
            ...prevState,
            currentPage: 1,
          }));
        } else {
          actions.addAlert({
            text: "Something wrong! Try again.",
            type: "error",
            id: Date.now(),
          });
        }
      })
      .catch((e) => {})
      .finally(() => {
        setLoading(false);
        setDeleteModal(false);
        setProject(defaultProject);
      });
  };
  // #endregion

  const addUsersToProject = async (addUserIds) => {
    const model = {
      projectId: project.projectId,
      userId: addUserIds || userIds,
    };
    setLoading(true);
    await dispatch(addUserToProject(model))
      .then((response) => {
        if (response.payload?.status === 200) {
          getUserByProjectId(pagination, project.projectId);
          actions.addAlert({
            text: response.payload.data,
            type: "success",
            id: Date.now(),
          });
        } else {
          actions.addAlert({
            text: "Something wrong! Try again.",
            type: "error",
            id: Date.now(),
          });
        }
      })
      .catch((e) => {})
      .finally(() => {
        setLoading(false);
        handleCloseAddUserModal();
      });
  };

  const newHandleUploadFile = () => {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    const config = {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "form-data",
      },
    };
    axios
      .post(
        `http://103.176.110.28:8080/document/create-document?projectId=${selectedItem}&description=${description}`,
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
        getAllFile(selectedItem);
        setModalUploadFile(false);
        setDescription("");
      });
  };

  const handleFileChange = (newFiles) => {
    setFiles(newFiles);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const removeUser = (userId) => {
    const model = {
      projectId: project.projectId,
      userId: [userId],
    };
    setIsLoading(true);
    dispatch(removeUserInProject(model))
      .then((response) => {
        if (response.payload?.status === 200) {
          getUserByProjectId(pagination, project.projectId);
          actions.addAlert({
            text: "Remove Member Successfully!",
            type: "success",
            id: Date.now(),
          });
        } else {
          actions.addAlert({
            text: "Something wrong! Try again.",
            type: "error",
            id: Date.now(),
          });
        }
      })
      .catch((e) => {})
      .finally(() => {
        setIsLoading(false);
        setModalDeactive(false);
      });
  };
  // endregion

  const renderDeleteUser = (item) => {
    if (role === "ADMIN") {
      return (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => {
            setModalDeactive(true);
            setSelectedUser({ id: item.row.id, name: item.row.username });
          }}
        >
          DEACTIVE
        </Button>
      );
    } else <></>;
  };

  const renderButton = (params) => {
    return (
      <FlexBetween>
        <Button
          onClick={(event) => {
            handleClick(event);
            setSelectedFile(params.row.documentId);
            setSelectedFileURL(params.row.url);
            setSelectedFileName(params.row.fileName);
            setSeLectedRowTable(params.row);
          }}
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
                handleClose();
              }}
            >
              DELETE
            </MenuItem>
            <MenuItem
              onClick={() => {
                setModalDownload(true);
                handleClose();
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
                onEditDoc(seLectedRowTable);
                handleClose();
                setDocType("edit");
              }}
            >
              EDIT
            </MenuItem>
            <MenuItem
              onClick={() => {
                setModalDeleteFile(true);
                handleClose();
                const doc = {
                  noteId: params.row.noteId,
                  content: params.row.content,
                  title: params.row.title,
                };
                setDocument(doc);
              }}
            >
              DELETE
            </MenuItem>
          </Menu>
        )}
      </FlexBetween>
    );
  };
  const handleUploadFileMember = (event) => {
    let files = event.target.files,
      f = files[0];
    var reader = new FileReader();
    reader.onload = async (e) => {
      let data = e.target.result;
      let readedData = XLSX.read(data, { type: "binary" });
      const wsname = readedData.SheetNames[0];
      const ws = readedData.Sheets[wsname];
      let dataParse = XLSX.utils.sheet_to_json(ws, { header: 1 });

      dataParse = dataParse
        .map((item) => item[0])
        .filter((data, i) => !!data && i > 0);
      const dataUpload = userNotInProject
        .filter((item) => dataParse.includes(item.id.toString()))
        .map((data) => data.id);
      await addUsersToProject(dataUpload);
    };
    reader.readAsBinaryString(f);
    event.target.value = "";
  };

  const downloadTemplateOfMember = async () => {
    const token = localStorage.getItem("access_token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob",
    };
    axios
      .get(
        "http://103.176.110.28:8080/profile/download-template?fileName=template_users.xlsx",
        config
      )
      .then((response) => {
        const filename = "template-user.xlsx";
        saveAs(response.data, filename);
      })
      .catch((error) => {});
  };

  const HandleDownloadFile = () => {
    fetch(selectedFileURL)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        downloadLinkRef.current.href = url;
        downloadLinkRef.current.setAttribute("download", selectedFileName);
        downloadLinkRef.current.click();
      })
      .finally(() => {
        actions.addAlert({
          text: "Download file successfully",
          type: "success",
          id: Date.now(),
        });
        setModalDownload(false);
      });
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
    {
      field: "action",
      headerName: "Action",
      key: "userAction",
      flex: 1,
      renderCell: renderDeleteUser,
      disableClickEventBubbling: true,
    },
  ];

  const columns = [
    {
      field: "no",
      headerName: "NO",
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
      flex: 1.5,
      renderCell: renderActionsButton,
      disableClickEventBubbling: true,
      sortable: false,
    },
  ];

  const fileColumn = [
    {
      field: "no",
      headerName: "NO",
      flex: 0.1,
    },
    {
      field: "fileName",
      headerName: "File Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
    },
    {
      field: "createUser",
      headerName: "Created User",
      flex: 0.3,
      disableClickEventBubbling: true,
      renderCell: (item) => {
        return item.row.createUser?.username;
      },
    },
    {
      field: "createDate",
      headerName: "Created Date",
      flex: 0.3,
      renderCell: (item) => {
        return dayjs(item.row.createDate).format("DD-MM-YYYY");
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
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "content",
      headerName: "Content",
      flex: 3,
    },
    {
      field: "createDate",
      headerName: "Created Date",
      flex: 0.5,
      renderCell: (item) => {
        return dayjs(item.row.createDate).format("DD-MM-YYYY");
      },
    },
    {
      field: "updateDate",
      headerName: "Updated Date",
      flex: 0.5,
      renderCell: (item) => {
        if (item.row.updateDate === null) {
          return "";
        } else return dayjs(item.row.updateDate).format("DD-MM-YYYY");
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

  const filterModel = {
    items: [
      {
        columnField: "projectName",
        operatorValue: "contains",
        value: searchText,
      },
    ],
  };

  const filterModelDoc = {
    items: [
      {
        columnField: "title",
        operatorValue: "contains",
        value: searchDoc,
      },
    ],
  };

  const filterModelFile = {
    items: [
      {
        columnField: "fileName",
        operatorValue: "contains",
        value: searchFile,
      },
    ],
  };

  const filterModelMember = {
    items: [
      {
        columnField: "fullName",
        operatorValue: "contains",
        value: searchMember,
      },
    ],
  };

  return (
    <Box m="1.5rem 2.5rem">
      <Box>
        <FlexBetween>
          <Box>
            <Header
              title="PROJECT"
              subtitle={
                role === "ADMIN"
                  ? "Managing project of company"
                  : "Managing project of manager"
              }
            />
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

          {role === "ADMIN" ? (
            <Box>
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  padding: "10px 20px",
                }}
                onClick={() => setOpen(true)}
              >
                <AddCircleOutlineIcon sx={{ mr: "10px" }} />
                Create New Project
              </Button>
            </Box>
          ) : (
            <></>
          )}
        </FlexBetween>
      </Box>

      {/* View project modal */}
      <Modal
        open={modalView}
        onClose={() => {
          setModalView(false);
          setProject(defaultProject);
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
          }}
        >
          <FlexCenter>
            <Typography variant="h2" sx={{ marginBottom: "20px" }}>
              View Project
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6}>
                <InputLabel>ID</InputLabel>
                <span>{project.projectId}</span>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>Project Name</InputLabel>
                <span>{project.projectName}</span>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>Short Name</InputLabel>
                <span>{project.shortName}</span>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>Project manager</InputLabel>
                <span>{`${project.lead.username} - ${project.lead.fullName}`}</span>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>Created Date</InputLabel>
                <span>{dayjs(project.createDate).format("DD/MM/YYYY")}</span>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>End date</InputLabel>
                <span>
                  {project.deadLine
                    ? dayjs(project.deadLine).format("DD/MM/YYYY")
                    : ""}
                </span>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>Description</InputLabel>
                <span>{project.description}</span>
              </Grid>
              <Grid item xs={12} sm={6}>
                <InputLabel>Status</InputLabel>
                <span>{project.status === 1 ? "Active" : "Deactive"}</span>
              </Grid>
            </Grid>
            <Box>
              <FlexBetween>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  style={{
                    width: "150px",
                    fontSize: "15px",
                    marginTop: "50px",
                  }}
                  onClick={() => {
                    setOpen1(true);
                    getAllFile(selectedItem);
                    setSelectedProject("");
                  }}
                >
                  VIEW FILE
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  style={{
                    width: "150px",
                    fontSize: "15px",
                    marginTop: "50px",
                    marginLeft: "10px",
                    marginRight: "10px",
                  }}
                  onClick={() => {
                    setModalNote(true);
                    setSelectedProject("document");
                    getAllDoc(selectedItem);
                  }}
                >
                  VIEW DOC
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  style={{
                    width: "150px",
                    fontSize: "15px",
                    marginTop: "50px",
                    marginRight: "10px",
                  }}
                  onClick={() => {
                    setDataModal(true);
                    getUserNotInProject();
                  }}
                >
                  VIEW MEMBER
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  style={{
                    width: "150px",
                    fontSize: "15px",
                    marginTop: "50px",
                  }}
                  onClick={() => {
                    setModalView(false);
                    setProject(defaultProject);
                  }}
                >
                  CLOSE
                </Button>
              </FlexBetween>
            </Box>
          </FlexCenter>
        </Box>
      </Modal>

      {/* Edit + Add modal */}
      <Modal open={open} onClose={hideModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            bgcolor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
          }}
        >
          <FlexCenter>
            <Typography variant="h2" sx={{ marginBottom: "20px" }}>
              {project.projectId === 0
                ? "Create new project"
                : `Update project ${project.projectName}`}
            </Typography>
            <form onSubmit={handleAddOrEditProject}>
              <Grid container spacing={4}>
                <Grid item xs={8} sm={6}>
                  <TextField
                    label="Project Name"
                    name="projectName"
                    required
                    value={project.projectName}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Short Name"
                    name="shortName"
                    required
                    value={project.shortName}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Project manager"
                    name="lead"
                    required
                    value={project.lead}
                    onChange={handleInputChange}
                    fullWidth
                    autoComplete="false"
                    disabled={project.projectId !== 0}
                  >
                    {userList.map((user) => {
                      const name = `${user.username} - ${user.fullName}`;
                      const role = user.roles.map((item) => item.id);
                      if (role.includes(2)) {
                        return (
                          <MenuItem key={name} value={user.id}>
                            {name}
                          </MenuItem>
                        );
                      } else return <></>;
                    })}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      className="fullwidth"
                      label="Deadline"
                      required
                      value={value}
                      onChange={(newValue) => setValue(newValue)}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={project.description}
                    onChange={handleInputChange}
                    multiline
                    rows={2}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Box>
                <Stack spacing={2} direction="row">
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    style={{
                      width: "150px",
                      fontSize: "15px",
                      marginTop: "50px",
                    }}
                  >
                    {project.projectId === 0 ? "CREATE" : "SAVE"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    style={{
                      width: "150px",
                      fontSize: "15px",
                      marginTop: "50px",
                    }}
                    onClick={hideModal}
                  >
                    CANCEL
                  </Button>
                </Stack>
              </Box>
            </form>
          </FlexCenter>
        </Box>
      </Modal>

      {/* Delete project modal */}
      <Modal
        open={openDeleteModal}
        onClose={() => {
          setDeleteModal(false);
          setProject(defaultProject);
        }}
      >
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
            Are you sure you want to {statuss === 1 ? "deactive" : "active"}{" "}
            project {project?.shortName}?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDeleteModal(false)}
              sx={{ mr: 1 }}
            >
              No
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => deleteProject()}
            >
              Yes
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Download file modal */}
      <Modal
        open={modalDownload}
        onClose={() => {
          setModalDownload(false);
        }}
      >
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
            Are you sure you want to download file {selectedFileName}?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setModalDownload(false)}
              sx={{ mr: 1 }}
            >
              No
            </Button>
            <a ref={downloadLinkRef} style={{ display: "none" }} />
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                HandleDownloadFile();
              }}
            >
              Yes
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* File modal */}
      <Modal open={open1} onClose={() => setOpen1(false)}>
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
          <Box sx={{ height: 400 }}>
            <Typography
              variant="h2"
              sx={{ color: "#000", marginBottom: "10px" }}
            >
              List File Of Project {project.projectName}
            </Typography>
            <FlexBetween
              backgroundColor={theme.palette.background.alt}
              borderRadius="9px"
              gap="3rem"
              p="0.1rem 1.5rem"
              sx={{
                mb: "10px",
                width: "319.562px",
              }}
            >
              <InputBase
                placeholder="Search by file name..."
                value={searchFile}
                onChange={(e) => setSearchFile(e.target.value)}
              />
              <IconButton>
                <Search />
              </IconButton>
            </FlexBetween>
            <DataGrid
              loading={loading1}
              getRowId={(row) => row.documentId}
              rows={documentList}
              columns={fileColumn}
              filterModel={filterModelFile}
              rowsPerPageOptions={[100]}
            />
            <Box>
              <Button
                variant="contained"
                color="secondary"
                sx={{ marginTop: "10px" }}
                component="span"
                onClick={() => setModalUploadFile(true)}
              >
                <FileUploadIcon sx={{ mr: "10px" }} />
                ADD FILES
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setOpen1(false)}
                sx={{
                  marginTop: "10px",
                  marginLeft: "10px",
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Delete file & doc modal */}
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
            Are you sure you want to delete{" "}
            {selectedProject === "document" ? "document" : "file"}{" "}
            {selectedFileName}?
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
                if (selectedProject === "document") {
                  const doc = {
                    projectId: selectedItem,
                    ...document,
                    status: 0,
                  };
                  dispatch(updateDoc(doc))
                    .then()
                    .finally(() => {
                      getAllDoc(selectedItem);
                      setModalDeleteFile(false);
                      actions.addAlert({
                        text: "Delete successfully",
                        type: "success",
                        id: Date.now(),
                      });
                    });
                } else {
                  dispatch(removeFile(selectedFile))
                    .then()
                    .finally(() => {
                      getAllFile(selectedItem);
                      setModalDeleteFile(false);
                      actions.addAlert({
                        text: "Delete successfully",
                        type: "success",
                        id: Date.now(),
                      });
                      setSelectedFile(null);
                    });
                }
              }}
            >
              DELETE
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Deactive user in project */}
      <Modal open={modalDeactive} onClose={() => setModalDeactive(false)}>
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
            Are you sure you want to deactive member {selectedUser.name}?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={(e) => setModalDeactive(false)}
              sx={{ mr: 1 }}
            >
              No
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                removeUser(selectedUser.id);
              }}
            >
              YES
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Doc Modal */}
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
          <Box sx={{ height: 400 }}>
            <Typography
              variant="h2"
              sx={{ color: "#000", marginBottom: "10px" }}
            >
              List Document Of Project {project.projectName}
            </Typography>
            <FlexBetween
              backgroundColor={theme.palette.background.alt}
              borderRadius="9px"
              gap="3rem"
              p="0.1rem 1.5rem"
              sx={{
                mb: "10px",
                width: "319.562px",
              }}
            >
              <InputBase
                placeholder="Search by title..."
                value={searchDoc}
                onChange={(e) => setSearchDoc(e.target.value)}
              />
              <IconButton>
                <Search />
              </IconButton>
            </FlexBetween>
            <DataGrid
              loading={loading2}
              getRowId={(row) => row.noteId}
              rows={docList}
              columns={noteColumn}
              rowsPerPageOptions={[100]}
              filterModel={filterModelDoc}
            />
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              sx={{ marginTop: "10px" }}
              onClick={() => {
                setDocType("add");
                setModalEditNote(true);
              }}
            >
              Add Doc(Note)
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setModalNote(false)}
              sx={{
                marginTop: "10px",
                marginLeft: "10px",
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={modalEditNote}
        onClose={() => {
          setModalEditNote(false);
          setDocType("edit");
          setDocument({ noteId: 0, title: "", content: "" });
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 400,
            bgcolor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
          }}
        >
          <Typography variant="h2" sx={{ color: "#000", marginBottom: "20px" }}>
            {docType === "edit" ? "Edit " : "Add New "} Document
          </Typography>
          <form onSubmit={handleAddOrEditDoc}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={12}>
                <TextField
                  label="Title"
                  name="title"
                  required
                  value={document.title}
                  onChange={handleInputChangeDoc}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  label="Content"
                  name="content"
                  value={document.content}
                  onChange={handleInputChangeDoc}
                  multiline
                  rows={5}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", mt: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                type="submit"
                sx={{ marginTop: "10px" }}
              >
                SAVE
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                sx={{ ml: "10px", marginTop: "10px" }}
                onClick={() => {
                  setModalEditNote(false);
                  setDocType("edit");
                  setDocument({ noteId: 0, title: "", content: "" });
                }}
              >
                CANCEL
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Modal upload file */}
      <Modal
        open={modalUploadFile}
        onClose={() => {
          setModalUploadFile(false);
          setDescription("");
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 700,
            height: 520,
            bgcolor: "white",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
            "& .MuiDropzoneArea-root": {
              height: "150px !important",
            },
          }}
        >
          <DropzoneArea
            acceptedFiles={[".xlsx", ".xls", ".doc", ".pdf", ".jpg", ".png"]}
            files={files}
            onChange={handleFileChange}
            maxFileSize={5000000000}
            dropzoneText="Drag and drop files here or click"
          />
          <TextField
            style={{ marginTop: "10px" }}
            label="Description"
            value={description}
            onChange={handleDescriptionChange}
            multiline
            rows={5}
            fullWidth
          />
          <Box sx={{ display: "flex", mt: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              sx={{ marginTop: "10px" }}
              onClick={newHandleUploadFile}
            >
              SAVE
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ ml: "10px", marginTop: "10px" }}
              onClick={() => {
                setModalUploadFile(false);
                setDescription("");
              }}
            >
              CANCEL
            </Button>
          </Box>
        </Box>
      </Modal>

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
        <Modal open={dataModal} onClose={() => setDataModal(false)}>
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
              "& .MuiLoadingButton-root": {
                color: "#000",
              },
            }}
          >
            <Box>
              <Typography
                variant="h2"
                sx={{ color: "#000", marginBottom: "10px" }}
              >
                List Member Of Project {project.projectName}
              </Typography>
            </Box>
            <FlexBetween
              backgroundColor={theme.palette.background.alt}
              borderRadius="9px"
              gap="3rem"
              p="0.1rem 1.5rem"
              sx={{
                mb: "10px",
                width: "319.562px",
              }}
            >
              <InputBase
                placeholder="Search by full name..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
              />
              <IconButton>
                <Search />
              </IconButton>
            </FlexBetween>
            <Box sx={{ height: 400 }}>
              <DataGrid
                loading={isloading}
                getRowId={(row) => row.id}
                rows={userByProjectList}
                columns={userColumns}
                rowsPerPageOptions={[100]}
                filterModel={filterModelMember}
              />
            </Box>
            <Box sx={{ mt: "10px" }}>
              {role === "ADMIN" ? (
                <>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    style={{
                      marginRight: "10px",
                    }}
                    onClick={() => {
                      setAddUserModal(true);
                    }}
                  >
                    ADD MEMBER
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={downloadTemplateOfMember}
                    style={{
                      marginRight: "10px",
                    }}
                  >
                    <DownloadIcon sx={{ mr: "10px" }} />
                    Download Template Excel
                  </Button>

                  <input
                    accept=".xlsx, .xls"
                    style={{ display: "none" }}
                    id="raised-button-file"
                    type="file"
                    onChange={handleUploadFileMember}
                  />
                  <label htmlFor="raised-button-file">
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={{
                        marginRight: "10px",
                      }}
                      component="span"
                    >
                      <FileUploadIcon sx={{ mr: "10px" }} />
                      Import Member by Excel
                    </Button>
                  </label>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      setDataModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <></>
              )}
              <Modal
                open={openAddUserModal}
                onClose={handleCloseAddUserModal}
                aria-labelledby="child-modal-title"
                aria-describedby="child-modal-description"
              >
                <Box sx={{ ...style, width: 500 }}>
                  <h2 id="child-modal-title">Add User To Project</h2>
                  <p id="child-modal-description">Select user</p>
                  <FormControl
                    sx={{ marginTop: 1, marginBottom: 2, width: 400 }}
                  >
                    <Select
                      multiple
                      value={personName}
                      onChange={(event, item) => handleChangeUser(event, item)}
                      input={<OutlinedInput />}
                      renderValue={(selected) => selected.join(", ")}
                      MenuProps={MenuProps}
                    >
                      {userNotInProject.map((user) => {
                        const name = `${user.username} - ${user.fullName}`;
                        return (
                          <MenuItem
                            name={name}
                            key={name}
                            value={user.id}
                            style={getStyles(name, personName, theme)}
                          >
                            <Checkbox checked={personName.indexOf(name) > -1} />
                            <ListItemText primary={name} />
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ marginRight: "10px" }}
                    onClick={() => {
                      addUsersToProject();
                      getUserNotInProject();
                    }}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCloseAddUserModal}
                  >
                    Close
                  </Button>
                </Box>
              </Modal>
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

export default Performance;

export function getStatusName(status) {
    switch (status) {
        case 0:
            return "Inactive";
        case 1:
            return "Not Start";
        case 2:
            return "Closed"
        default:
            return "Active";
    }
}

export function getRowNumber(pageIndex, pageSize, index) {
    return (pageIndex - 1) * pageSize + index + 1;
};

export const globalConstant = {
    pageSize: 10,
    statusDefault: 1,
    dateFormat: "DD-MM-YYYY",
};

export const defaultPagination = {
    pageSize: globalConstant.pageSize,
    currentPage: 1,
};
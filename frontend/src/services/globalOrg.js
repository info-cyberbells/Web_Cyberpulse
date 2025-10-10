export const getUserType = () => {
    const storedData = localStorage.getItem("user");
    const userData = JSON.parse(storedData);
    return userData?.employee?.type;
};

export const getOrganizationId = () => {
    const storedData = localStorage.getItem("user");
    const userData = JSON.parse(storedData);
    return userData?.employee?.organizationId;
};

export const getUserDepartment = () => {
    const storedData = localStorage.getItem("user");
    const userData = JSON.parse(storedData);
    return userData?.employee?.department;
}

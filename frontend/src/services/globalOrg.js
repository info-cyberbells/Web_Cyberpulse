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
    const type = userData?.employee?.type;
    if (type === 4 || type === 5) return null;
    return userData?.employee?.department;
}
